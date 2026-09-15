"""
=============================================================================
BỘ TỰ ĐỘNG GÁN NHÃN CỔ TAY 5 KEYPOINTS (ANATOMICAL WRIST AUTO-LABELING)
Dự án: Xưởng Vòng Tay - Tự Phối 3D & Ướm Cổ Tay Thật (AR Try-On)
=============================================================================
Tính năng nâng cấp:
1. Gán nhãn 5 Keypoints giải phẫu chuẩn cho YOLOv8-Pose:
   - KP0 (Wrist Center): Tâm nếp gấp cổ tay
   - KP1 (Radial Styloid): Mỏm trâm xương quay (phía ngón cái)
   - KP2 (Ulnar Styloid): Mỏm trâm xương trụ (phía ngón út)
   - KP3 (Forearm Anchor): Trục cẳng tay / Vị trí rơi tự nhiên của vòng tay
   - KP4 (Palm Base Anchor): Gốc lòng bàn tay / mu bàn tay (xác định hướng)
2. Nhận diện góc nghiêng 3D, độ rộng cổ tay và trục cẳng tay
3. Bộ sinh dữ liệu tổng hợp (Synthetic Data Generator) tăng cường đa dạng màu da,
   góc nghiêng 30-50 độ như ảnh chụp thực tế
4. Xuất file nhãn chuẩn YOLOv8-Pose và cấu hình wrist_dataset.yaml
=============================================================================
"""

import os
import sys
import io

# Đảm bảo in UTF-8 không bị lỗi charmap trên Windows PowerShell / CMD
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import cv2
import yaml
import shutil
import random
import math
import numpy as np
from pathlib import Path
try:
    from tqdm import tqdm
except ImportError:
    tqdm = lambda x, **kwargs: x

PIPELINE_DIR = Path(__file__).parent
DATASET_DIR = PIPELINE_DIR / "dataset"
RAW_DIR = DATASET_DIR / "raw_images"
PREVIEW_DIR = DATASET_DIR / "labeled_preview"

# Thư mục đích cho YOLO
IMAGES_TRAIN = DATASET_DIR / "images" / "train"
IMAGES_VAL = DATASET_DIR / "images" / "val"
LABELS_TRAIN = DATASET_DIR / "labels" / "train"
LABELS_VAL = DATASET_DIR / "labels" / "val"

for p in [PREVIEW_DIR, IMAGES_TRAIN, IMAGES_VAL, LABELS_TRAIN, LABELS_VAL, RAW_DIR]:
    p.mkdir(parents=True, exist_ok=True)

# Khởi tạo MediaPipe Hands nếu có
HAS_MEDIAPIPE = False
hands_detector = None
try:
    import mediapipe as mp
    mp_hands = mp.solutions.hands
    hands_detector = mp_hands.Hands(
        static_image_mode=True,
        max_num_hands=2,
        min_detection_confidence=0.40
    )
    HAS_MEDIAPIPE = True
    print("[AI] Đã kích hoạt MediaPipe AI Landmark Detector!")
except Exception as e:
    print("[AI] Sử dụng Computer Vision Contour Analysis làm bộ nhận diện giải phẫu cổ tay!")

def detect_wrist_mediapipe(img_bgr):
    """
    Nhận diện 5 Keypoints giải phẫu cổ tay bằng MediaPipe Hands:
    - LM0: Wrist joint
    - LM1: Thumb CMC
    - LM5: Index MCP
    - LM17: Pinky MCP
    """
    h, w, _ = img_bgr.shape
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    results = hands_detector.process(img_rgb)

    if not results.multi_hand_landmarks:
        return None

    annotations = []
    for hand_lms in results.multi_hand_landmarks:
        lm0 = hand_lms.landmark[0]   # Wrist
        lm1 = hand_lms.landmark[1]   # Thumb base
        lm5 = hand_lms.landmark[5]   # Index MCP
        lm17 = hand_lms.landmark[17] # Pinky MCP

        cx_w = lm0.x * w
        cy_w = lm0.y * h

        # Vector hướng từ cổ tay lên lòng bàn tay
        palm_cx = (lm5.x + lm17.x) / 2.0 * w
        palm_cy = (lm5.y + lm17.y) / 2.0 * h
        dir_x = palm_cx - cx_w
        dir_y = palm_cy - cy_w
        hand_len = max(20.0, np.hypot(dir_x, dir_y))

        # Đơn vị hóa vector hướng bàn tay
        u_palm_x = dir_x / hand_len
        u_palm_y = dir_y / hand_len

        # Vector vuông góc (bề ngang cổ tay, từ ngón út sang ngón cái)
        perp_x = -u_palm_y
        perp_y = u_palm_x

        # Đoạn rộng cổ tay ~ 65% khoảng cách gốc ngón cái - ngón út
        wrist_half_width = np.hypot((lm17.x - lm1.x) * w, (lm17.y - lm1.y) * h) * 0.42
        wrist_half_width = max(22.0, min(140.0, wrist_half_width))

        # KP0: Tâm cổ tay
        kp0 = (cx_w, cy_w)
        # KP1: Mỏm trâm quay (Radial styloid - mé ngón cái)
        kp1 = (cx_w - perp_x * wrist_half_width, cy_w - perp_y * wrist_half_width)
        # KP2: Mỏm trâm trụ (Ulnar styloid - mé ngón út)
        kp2 = (cx_w + perp_x * wrist_half_width, cy_w + perp_y * wrist_half_width)
        # KP3: Trục cẳng tay (lùi xuống dọc theo cẳng tay 1.6 * wrist_half_width - điểm rơi vòng tay tự nhiên)
        kp3 = (cx_w - u_palm_x * (wrist_half_width * 1.5), cy_w - u_palm_y * (wrist_half_width * 1.5))
        # KP4: Gốc lòng bàn tay / mu bàn tay (tiến lên phía bàn tay)
        kp4 = (cx_w + u_palm_x * (wrist_half_width * 0.9), cy_w + u_palm_y * (wrist_half_width * 0.9))

        # Bounding box bao trọn vùng cổ tay và vị trí đeo vòng
        box_w = wrist_half_width * 3.2
        box_h = wrist_half_width * 3.6
        box_cx = (kp0[0] + kp3[0]) / 2.0
        box_cy = (kp0[1] + kp3[1]) / 2.0

        annotations.append({
            "bbox": (box_cx, box_cy, box_w, box_h),
            "keypoints": [kp0, kp1, kp2, kp3, kp4]
        })

    return annotations

def detect_wrist_cv_contour(img_bgr):
    """
    Thuật toán nhận diện cổ tay dựa trên sắc thái da, PCA phân tích trục chính
    cẳng tay (Major axis) và trục ngang cổ tay (Minor axis).
    """
    h, w, _ = img_bgr.shape
    ycrcb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YCrCb)
    # Mask màu da người
    mask = cv2.inRange(ycrcb, np.array([0, 133, 77]), np.array([255, 173, 127]))
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None

    # Lọc contour lớn nhất (bàn tay & cánh tay)
    valid_contours = [c for c in contours if cv2.contourArea(c) > (w * h * 0.04)]
    if not valid_contours:
        return None
    largest = max(valid_contours, key=cv2.contourArea)

    pts = largest.reshape(-1, 2).astype(np.float32)
    mean, eig = cv2.PCACompute(pts, mean=None)
    arm_dir = eig[0]
    perp_dir = eig[1]

    proj_arm = np.dot(pts - mean, arm_dir)
    proj_perp = np.dot(pts - mean, perp_dir)

    # Quét độ rộng dọc trục cánh tay để tìm điểm thắt hẹp cổ tay (wrist inflection neck)
    bins = np.linspace(np.percentile(proj_arm, 10), np.percentile(proj_arm, 90), 22)
    widths, centers = [], []
    for i in range(len(bins) - 1):
        sub = proj_perp[(proj_arm >= bins[i]) & (proj_arm < bins[i + 1])]
        if len(sub) > 2:
            widths.append(float(np.max(sub) - np.min(sub)))
            centers.append(float((bins[i] + bins[i + 1]) / 2.0))

    if widths:
        min_idx = int(np.argmin(widths))
        wrist_center = mean[0] + arm_dir * centers[min_idx]
        wrist_w = max(45.0, min(140.0, widths[min_idx]))
    else:
        wrist_center = mean[0]
        wrist_w = 80.0

    cx_w = float(wrist_center[0])
    cy_w = float(wrist_center[1])
    half_w = wrist_w * 0.5

    dir_x, dir_y = float(arm_dir[0]), float(arm_dir[1])
    perp_x, perp_y = float(perp_dir[0]), float(perp_dir[1])

    # Đảm bảo dir_y âm hoặc hướng lên bàn tay
    if dir_y > 0:
        dir_x, dir_y = -dir_x, -dir_y

    kp0 = (cx_w, cy_w) # Tâm nếp gấp cổ tay
    kp1 = (cx_w - perp_x * half_w, cy_w - perp_y * half_w) # Mỏm quay (ngón cái)
    kp2 = (cx_w + perp_x * half_w, cy_w + perp_y * half_w) # Mỏm trụ (ngón út)
    kp3 = (cx_w - dir_x * (wrist_w * 0.85), cy_w - dir_y * (wrist_w * 0.85)) # Trục cẳng tay lùi sau
    kp4 = (cx_w + dir_x * (wrist_w * 0.65), cy_w + dir_y * (wrist_w * 0.65)) # Gốc bàn tay

    return [{
        "bbox": (cx_w, cy_w, wrist_w * 2.6, wrist_w * 2.8),
        "keypoints": [kp0, kp1, kp2, kp3, kp4]
    }]

def generate_synthetic_wrist_samples(count: int = 35):
    """
    Tạo các mẫu ảnh cổ tay đa góc độ (bao gồm góc nghiêng 40-50 độ như ảnh mẫu)
    với nhiều tone màu da thật, bối cảnh bokeh thẩm mỹ và nhãn chuẩn 5 keypoints.
    """
    print(f"[DATA] Đang tạo {count} mẫu ảnh cổ tay mô phỏng giải phẫu đa góc độ (Synthetic Realistic Wrists)...")
    
    # Bảng màu da tự nhiên phong phú (Trắng hồng, vàng Á Đông, nâu nhẹ)
    SKIN_TONES = [
        (225, 210, 245), # Da trắng hồng
        (205, 218, 248), # Da vàng sáng
        (185, 202, 238), # Da trung bình Á Đông
        (165, 185, 222), # Da bánh mật nhẹ
        (215, 225, 252), # Da sáng ngọc
    ]

    for i in range(count):
        w, h = 640, 640
        # Nền gradient bokeh mềm mại như phòng khách/cây thông Noel
        bg = np.zeros((h, w, 3), dtype=np.uint8)
        c1 = (random.randint(190, 235), random.randint(180, 220), random.randint(200, 240))
        c2 = (random.randint(150, 190), random.randint(140, 180), random.randint(170, 210))
        for row in range(h):
            alpha = row / h
            bg[row, :] = [int(c1[ch] * (1 - alpha) + c2[ch] * alpha) for ch in range(3)]

        # Thêm các đốm sáng bokeh
        for _ in range(12):
            bx = random.randint(0, w)
            by = random.randint(0, h)
            br = random.randint(30, 90)
            cv2.circle(bg, (bx, by), br, (random.randint(210, 255), random.randint(200, 240), random.randint(220, 255)), -1)
        bg = cv2.GaussianBlur(bg, (45, 45), 0)

        # Góc nghiêng cổ tay: 30 đến 55 độ (giống ảnh mẫu của khách)
        angle_deg = random.choice([random.uniform(35, 55), random.uniform(-55, -35), random.uniform(75, 105)])
        angle_rad = math.radians(angle_deg)
        cos_a = math.cos(angle_rad)
        sin_a = math.sin(angle_rad)

        # Tọa độ tâm cổ tay
        cx_w = w * random.uniform(0.42, 0.58)
        cy_w = h * random.uniform(0.42, 0.58)
        wrist_width = random.uniform(90, 130)

        skin_color = random.choice(SKIN_TONES)
        shadow_color = (max(0, skin_color[0] - 40), max(0, skin_color[1] - 35), max(0, skin_color[2] - 30))

        # Vẽ cẳng tay (hình trụ có góc nghiêng)
        arm_len = 320
        perp_x = -sin_a
        perp_y = cos_a

        half_w = wrist_width * 0.5
        forearm_half_w = half_w * 1.18

        p1 = (int(cx_w - perp_x * half_w), int(cy_w - perp_y * half_w))
        p2 = (int(cx_w + perp_x * half_w), int(cy_w + perp_y * half_w))
        p3 = (int(cx_w + perp_x * forearm_half_w - cos_a * arm_len), int(cy_w + perp_y * forearm_half_w - sin_a * arm_len))
        p4 = (int(cx_w - perp_x * forearm_half_w - cos_a * arm_len), int(cy_w - perp_y * forearm_half_w - sin_a * arm_len))

        pts_arm = np.array([p1, p2, p3, p4], dtype=np.int32)
        cv2.fillConvexPoly(bg, pts_arm, skin_color, cv2.LINE_AA)

        # Vẽ bàn tay phía trên cổ tay
        hand_len = 160
        hp1 = p1
        hp2 = p2
        hp3 = (int(cx_w + perp_x * half_w * 1.1 + cos_a * hand_len), int(cy_w + perp_y * half_w * 1.1 + sin_a * hand_len))
        hp4 = (int(cx_w - perp_x * half_w * 1.1 + cos_a * hand_len), int(cy_w - perp_y * half_w * 1.1 + sin_a * hand_len))
        pts_hand = np.array([hp1, hp2, hp3, hp4], dtype=np.int32)
        cv2.fillConvexPoly(bg, pts_hand, skin_color, cv2.LINE_AA)

        # Đổ bóng viền tay cho mềm mại tự nhiên
        cv2.polylines(bg, [pts_arm], isClosed=False, color=shadow_color, thickness=4, lineType=cv2.LINE_AA)
        cv2.polylines(bg, [pts_hand], isClosed=False, color=shadow_color, thickness=4, lineType=cv2.LINE_AA)
        bg = cv2.GaussianBlur(bg, (3, 3), 0)

        # 5 Keypoints chính xác
        kp0 = (cx_w, cy_w)
        kp1 = (cx_w - perp_x * half_w, cy_w - perp_y * half_w)
        kp2 = (cx_w + perp_x * half_w, cy_w + perp_y * half_w)
        kp3 = (cx_w - cos_a * (wrist_width * 0.75), cy_w - sin_a * (wrist_width * 0.75)) # Forearm anchor
        kp4 = (cx_w + cos_a * (wrist_width * 0.65), cy_w + sin_a * (wrist_width * 0.65)) # Palm base

        # Lưu vào raw images
        out_name = f"synthetic_wrist_{i:04d}.jpg"
        cv2.imwrite(str(RAW_DIR / out_name), bg)

        # Lưu ground truth chính xác 100%
        box_w = wrist_width * 2.8
        box_h = wrist_width * 3.2
        SYNTHETIC_GROUND_TRUTH[out_name] = [{
            "bbox": (cx_w, cy_w, box_w, box_h),
            "keypoints": [kp0, kp1, kp2, kp3, kp4]
        }]

    print(f"[DATA] Đã tạo thành công {count} ảnh cổ tay chất lượng cao vào {RAW_DIR}")

SYNTHETIC_GROUND_TRUTH = {}

def process_and_label_dataset(train_ratio: float = 0.8):
    print("=" * 68)
    print("[LABEL] BẮT ĐẦU TỰ ĐỘNG GÁN NHÃN CỔ TAY 5 KEYPOINTS CHO YOLOV8-POSE")
    print(f"[DIR] Thư mục ảnh: {RAW_DIR.resolve()}")
    print("=" * 68)

    # Tự động khởi chạy bộ sinh ảnh cổ tay mô phỏng chính xác
    generate_synthetic_wrist_samples(count=40)
    image_files = list(RAW_DIR.glob("*.jpg")) + list(RAW_DIR.glob("*.png")) + list(RAW_DIR.glob("*.jpeg"))

    random.seed(42)
    random.shuffle(image_files)

    labeled_count = 0
    preview_limit = 12

    for idx, img_path in enumerate(tqdm(image_files, desc="Gán nhãn 5 keypoints")):
        img = cv2.imread(str(img_path))
        if img is None:
            continue

        h, w, _ = img.shape
        annotations = None

        # 1. Nếu có ground truth mô phỏng chính xác
        if img_path.name in SYNTHETIC_GROUND_TRUTH:
            annotations = SYNTHETIC_GROUND_TRUTH[img_path.name]
        # 2. Hoặc nhận diện bằng MediaPipe / CV
        elif HAS_MEDIAPIPE:
            annotations = detect_wrist_mediapipe(img)
        if not annotations:
            annotations = detect_wrist_cv_contour(img)

        if not annotations:
            continue

        is_train = (random.random() < train_ratio)
        target_img_dir = IMAGES_TRAIN if is_train else IMAGES_VAL
        target_lbl_dir = LABELS_TRAIN if is_train else LABELS_VAL

        out_img_name = f"wrist_{idx:05d}.jpg"
        out_lbl_name = f"wrist_{idx:05d}.txt"
        cv2.imwrite(str(target_img_dir / out_img_name), img)

        lines = []
        preview_img = img.copy() if labeled_count < preview_limit else None

        for ann in annotations:
            cx, cy, bw, bh = ann["bbox"]
            norm_cx = max(0.0, min(1.0, cx / w))
            norm_cy = max(0.0, min(1.0, cy / h))
            norm_bw = max(0.01, min(1.0, bw / w))
            norm_bh = max(0.01, min(1.0, bh / h))

            kp_parts = []
            for kx, ky in ann["keypoints"]:
                norm_kx = max(0.0, min(1.0, kx / w))
                norm_ky = max(0.0, min(1.0, ky / h))
                visibility = 2  # 2: Visible and labeled
                kp_parts.extend([f"{norm_kx:.6f}", f"{norm_ky:.6f}", str(visibility)])

            # Chuẩn YOLOv8-pose: 0 cx cy w h kp0_x kp0_y kp0_v ... kp4_x kp4_y kp4_v
            line = f"0 {norm_cx:.6f} {norm_cy:.6f} {norm_bw:.6f} {norm_bh:.6f} " + " ".join(kp_parts)
            lines.append(line)

            # Vẽ ảnh xem trước trực quan
            if preview_img is not None:
                kp0, kp1, kp2, kp3, kp4 = ann["keypoints"]

                # 1. Bounding Box vàng Gold
                x1 = int(max(0, cx - bw / 2))
                y1 = int(max(0, cy - bh / 2))
                x2 = int(min(w - 1, cx + bw / 2))
                y2 = int(min(h - 1, cy + bh / 2))
                cv2.rectangle(preview_img, (x1, y1), (x2, y2), (0, 215, 255), 2)

                # 2. Trục cẳng tay (Forearm Cylinder Axis)
                cv2.line(preview_img, (int(kp3[0]), int(kp3[1])), (int(kp4[0]), int(kp4[1])), (255, 120, 0), 2, cv2.LINE_AA)

                # 3. Chuỗi cung vòng tay tự nhiên (Natural Bracelet Curve)
                cv2.line(preview_img, (int(kp1[0]), int(kp1[1])), (int(kp2[0]), int(kp2[1])), (0, 255, 255), 2, cv2.LINE_AA)

                # 4. 5 Keypoints giải phẫu
                cv2.circle(preview_img, (int(kp0[0]), int(kp0[1])), 6, (0, 255, 0), -1)   # KP0: Tâm (Xanh lá)
                cv2.circle(preview_img, (int(kp1[0]), int(kp1[1])), 6, (255, 0, 0), -1)   # KP1: Quay (Xanh dương)
                cv2.circle(preview_img, (int(kp2[0]), int(kp2[1])), 6, (0, 0, 255), -1)   # KP2: Trụ (Đỏ)
                cv2.circle(preview_img, (int(kp3[0]), int(kp3[1])), 6, (255, 0, 255), -1) # KP3: Cẳng tay (Hồng tím)
                cv2.circle(preview_img, (int(kp4[0]), int(kp4[1])), 6, (0, 200, 255), -1) # KP4: Bàn tay (Vàng)

                # Nhãn HUD
                cv2.putText(preview_img, "YOLOv8-Pose: 5-KP Wrist & Arm Anchor", (x1, max(20, y1 - 8)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 215, 255), 1, cv2.LINE_AA)

        with open(target_lbl_dir / out_lbl_name, "w", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")

        if preview_img is not None:
            cv2.imwrite(str(PREVIEW_DIR / f"preview_{idx:05d}.jpg"), preview_img)

        labeled_count += 1

    # Tạo file cấu hình dataset YOLOv8 Pose chuẩn 5 keypoints
    yaml_config = {
        "path": str(DATASET_DIR.resolve()).replace("\\", "/"),
        "train": "images/train",
        "val": "images/val",
        "kpt_shape": [5, 3],  # 5 keypoints, mỗi keypoint gồm (x, y, visibility)
        "flip_idx": [0, 2, 1, 3, 4],  # Đổi chỗ KP1 (Radial) <-> KP2 (Ulnar) khi lật ảnh ngang
        "names": {
            0: "wrist"
        }
    }

    yaml_path = DATASET_DIR / "wrist_dataset.yaml"
    with open(yaml_path, "w", encoding="utf-8") as f:
        yaml.dump(yaml_config, f, default_flow_style=False)

    print("=" * 68)
    print(f"[DONE] GÁN NHÃN 5 KEYPOINTS HOÀN TẤT!")
    print(f"[OK] Đã gán nhãn: {labeled_count} ảnh")
    print(f"   - Tập Train: {len(list(IMAGES_TRAIN.glob('*')))} ảnh")
    print(f"   - Tập Val:   {len(list(IMAGES_VAL.glob('*')))} ảnh")
    print(f"[CONFIG] Cấu hình dataset: {yaml_path.resolve()}")
    print(f"[PREVIEW] Ảnh preview 5-KP: {PREVIEW_DIR.resolve()}")
    print("[NEXT] Bước tiếp theo: Chạy `python train_wrist_yolo.py` để huấn luyện mô hình!")
    print("=" * 68)

if __name__ == "__main__":
    process_and_label_dataset()
