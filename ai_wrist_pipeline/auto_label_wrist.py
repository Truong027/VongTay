"""
=============================================================================
BỘ TỰ ĐỘNG GÁN NHÃN CỔ TAY (AUTO-LABELING PIPELINE FOR YOLOV8-POSE)
Dự án: Xưởng Vòng Tay - Tự Phối 3D & Ướm Cổ Tay Thật
=============================================================================
Tính năng:
- Đọc tất cả ảnh trong dataset/raw_images/
- Sử dụng Computer Vision & MediaPipe để tự động nhận diện:
    1. Hộp bao quanh cổ tay (Bounding Box: cx, cy, w, h)
    2. Keypoint 1: Tâm cổ tay (Wrist Center Landmark)
    3. Keypoint 2: Mỏm trâm quay - ngón cái (Radial Styloid)
    4. Keypoint 3: Mỏm trâm trụ - ngón út (Ulnar Styloid)
- Xuất file nhãn chuẩn YOLOv8-Pose (.txt):
    <class_id> <cx> <cy> <w> <h> <kp1_x> <kp1_y> <v1> <kp2_x> <kp2_y> <v2> <kp3_x> <kp3_y> <v3>
- Tự động phân chia tập Train (80%) và Validation (20%)
- Tạo file cấu hình `wrist_dataset.yaml` sẵn sàng cho YOLOv8 huấn luyện
- Vẽ ảnh xem trước vào `dataset/labeled_preview/` để kiểm tra trực quan
=============================================================================
"""

import os
import sys
import cv2
import yaml
import shutil
import random
import numpy as np
from pathlib import Path
from tqdm import tqdm

PIPELINE_DIR = Path(__file__).parent
DATASET_DIR = PIPELINE_DIR / "dataset"
RAW_DIR = DATASET_DIR / "raw_images"
PREVIEW_DIR = DATASET_DIR / "labeled_preview"

# Thư mục đích cho YOLO
IMAGES_TRAIN = DATASET_DIR / "images" / "train"
IMAGES_VAL = DATASET_DIR / "images" / "val"
LABELS_TRAIN = DATASET_DIR / "labels" / "train"
LABELS_VAL = DATASET_DIR / "labels" / "val"

for p in [PREVIEW_DIR, IMAGES_TRAIN, IMAGES_VAL, LABELS_TRAIN, LABELS_VAL]:
    p.mkdir(parents=True, exist_ok=True)

# Khởi tạo MediaPipe Hands nếu có sẵn
HAS_MEDIAPIPE = False
try:
    import mediapipe as mp
    mp_hands = mp.solutions.hands
    hands_detector = mp_hands.Hands(
        static_image_mode=True,
        max_num_hands=2,
        min_detection_confidence=0.45
    )
    HAS_MEDIAPIPE = True
    print("✅ Đã kích hoạt MediaPipe AI Landmark Detector!")
except Exception as e:
    print(f"ℹ️ Không có mediapipe hoặc lỗi khởi tạo ({e}). Sẽ dùng Computer Vision Skin Contour làm giải thuật gán nhãn dự phòng!")

def detect_wrist_mediapipe(img_bgr):
    """
    Nhận diện cổ tay bằng MediaPipe:
    - Landmark 0: Tâm cổ tay (Wrist Center)
    - Landmark 1: Gốc ngón cái (Thumb CMC)
    - Landmark 17: Gốc ngón út (Pinky MCP)
    Từ đó tính toán 2 mỏm xương cổ tay (Radial & Ulnar Styloid)
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
        palm_cx = (lm5.x + lm17.x) / 2 * w
        palm_cy = (lm5.y + lm17.y) / 2 * h
        dir_x = palm_cx - cx_w
        dir_y = palm_cy - cy_w
        hand_len = max(20.0, np.hypot(dir_x, dir_y))

        # Vector vuông góc với hướng bàn tay (bề ngang cổ tay)
        perp_x = -dir_y / hand_len
        perp_y = dir_x / hand_len

        # Khoảng cách 2 mỏm xương cổ tay ~ 65% độ rộng lòng bàn tay
        wrist_half_width = np.hypot((lm17.x - lm1.x) * w, (lm17.y - lm1.y) * h) * 0.38
        wrist_half_width = max(18.0, min(120.0, wrist_half_width))

        # Keypoint 1: Tâm cổ tay
        kp1 = (cx_w, cy_w)
        # Keypoint 2: Phía ngón cái (Radial styloid)
        kp2 = (cx_w - perp_x * wrist_half_width, cy_w - perp_y * wrist_half_width)
        # Keypoint 3: Phía ngón út (Ulnar styloid)
        kp3 = (cx_w + perp_x * wrist_half_width, cy_w + perp_y * wrist_half_width)

        # Bounding box bao quanh cổ tay và vùng đeo vòng
        box_w = wrist_half_width * 2.8
        box_h = wrist_half_width * 2.2
        bbox = (cx_w, cy_w, box_w, box_h)

        annotations.append({
            "bbox": bbox,
            "keypoints": [kp1, kp2, kp3]
        })

    return annotations

def detect_wrist_contour_fallback(img_bgr):
    """Giải thuật Computer Vision dựa trên sắc thái da & hình học cẳng tay/cổ tay."""
    h, w, _ = img_bgr.shape
    ycrcb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2YCrCb)
    # Ngưỡng màu da người
    mask = cv2.inRange(ycrcb, np.array([0, 133, 77]), np.array([255, 173, 127]))
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return None

    # Lấy contour lớn nhất (bàn tay / cẳng tay)
    largest = max(contours, key=cv2.contourArea)
    if cv2.contourArea(largest) < (w * h * 0.05):
        return None

    bx, by, bw, bh = cv2.boundingRect(largest)
    # Giả định cổ tay nằm ở 1/3 phía dưới của vùng bàn tay/cẳng tay
    cx = bx + bw / 2.0
    cy = by + bh * 0.65
    ww = bw * 0.65
    wh = bh * 0.35

    kp1 = (cx, cy)
    kp2 = (cx - ww * 0.45, cy)
    kp3 = (cx + ww * 0.45, cy)

    return [{
        "bbox": (cx, cy, ww, wh),
        "keypoints": [kp1, kp2, kp3]
    }]

def process_and_label_dataset(train_ratio: float = 0.8):
    print("=" * 65)
    print("🏷️ BẮT ĐẦU TỰ ĐỘNG GÁN NHÃN DỮ LIỆU CỔ TAY CHO YOLOV8-POSE")
    print(f"📂 Thư mục ảnh gốc: {RAW_DIR.resolve()}")
    print("=" * 65)

    image_files = list(RAW_DIR.glob("*.jpg")) + list(RAW_DIR.glob("*.png")) + list(RAW_DIR.glob("*.jpeg"))
    if not image_files:
        print(f"⚠️ Không tìm thấy ảnh nào trong {RAW_DIR}!")
        print("💡 Hãy chạy `python scrape_wrist_dataset.py` trước để cào ảnh về.")
        return

    random.seed(42)
    random.shuffle(image_files)

    labeled_count = 0
    preview_limit = 10

    for idx, img_path in enumerate(tqdm(image_files, desc="Đang gán nhãn")):
        img = cv2.imread(str(img_path))
        if img is None:
            continue

        h, w, _ = img.shape
        # Thử nhận diện bằng MediaPipe, nếu không có fallback
        annotations = None
        if HAS_MEDIAPIPE:
            annotations = detect_wrist_mediapipe(img)
        if not annotations:
            annotations = detect_wrist_contour_fallback(img)

        if not annotations:
            continue

        # Chọn phân bổ tập Train hay Val
        is_train = (random.random() < train_ratio)
        target_img_dir = IMAGES_TRAIN if is_train else IMAGES_VAL
        target_lbl_dir = LABELS_TRAIN if is_train else LABELS_VAL

        # Copy ảnh vào thư mục YOLO
        out_img_name = f"wrist_{idx:05d}.jpg"
        out_lbl_name = f"wrist_{idx:05d}.txt"
        cv2.imwrite(str(target_img_dir / out_img_name), img)

        # Ghi file nhãn YOLO Pose:
        # format: <class> <cx> <cy> <w> <h> <kp1_x> <kp1_y> <kp1_v> <kp2_x> <kp2_y> <kp2_v> <kp3_x> <kp3_y> <kp3_v>
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
                visibility = 2  # 2: visible and labeled
                kp_parts.extend([f"{norm_kx:.6f}", f"{norm_ky:.6f}", str(visibility)])

            line = f"0 {norm_cx:.6f} {norm_cy:.6f} {norm_bw:.6f} {norm_bh:.6f} " + " ".join(kp_parts)
            lines.append(line)

            # Vẽ xem trước cho các ảnh đầu tiên
            if preview_img is not None:
                x1 = int(max(0, cx - bw / 2))
                y1 = int(max(0, cy - bh / 2))
                x2 = int(min(w - 1, cx + bw / 2))
                y2 = int(min(h - 1, cy + bh / 2))
                cv2.rectangle(preview_img, (x1, y1), (x2, y2), (0, 215, 255), 2)

                # Vẽ 3 keypoints và đường nối vòng tay
                kp1, kp2, kp3 = ann["keypoints"]
                cv2.circle(preview_img, (int(kp1[0]), int(kp1[1])), 6, (0, 255, 0), -1)    # Tâm: Xanh lá
                cv2.circle(preview_img, (int(kp2[0]), int(kp2[1])), 6, (255, 0, 0), -1)    # Quay: Xanh dương
                cv2.circle(preview_img, (int(kp3[0]), int(kp3[1])), 6, (0, 0, 255), -1)    # Trụ: Đỏ
                # Vẽ đường cong chu vi đeo vòng ước tính
                cv2.line(preview_img, (int(kp2[0]), int(kp2[1])), (int(kp3[0]), int(kp3[1])), (0, 255, 255), 2)
                cv2.putText(preview_img, "AI YOLO Wrist Anchor", (x1, max(15, y1 - 8)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 215, 255), 2)

        with open(target_lbl_dir / out_lbl_name, "w", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")

        if preview_img is not None:
            cv2.imwrite(str(PREVIEW_DIR / f"preview_{idx:05d}.jpg"), preview_img)

        labeled_count += 1

    # Tạo file cấu hình dataset YOLOv8 Pose
    yaml_config = {
        "path": str(DATASET_DIR.resolve()).replace("\\", "/"),
        "train": "images/train",
        "val": "images/val",
        "kpt_shape": [3, 3],  # 3 keypoints, mỗi keypoint có (x, y, visibility)
        "names": {
            0: "wrist"
        }
    }

    yaml_path = DATASET_DIR / "wrist_dataset.yaml"
    with open(yaml_path, "w", encoding="utf-8") as f:
        yaml.dump(yaml_config, f, default_flow_style=False)

    print("=" * 65)
    print(f"🎉 GÁN NHÃN HOÀN TẤT THÀNH CÔNG!")
    print(f"✅ Đã gán nhãn: {labeled_count} ảnh")
    print(f"   - Tập Train: {len(list(IMAGES_TRAIN.glob('*')))} ảnh")
    print(f"   - Tập Val:   {len(list(IMAGES_VAL.glob('*')))} ảnh")
    print(f"📄 File cấu hình YOLO: {yaml_path.resolve()}")
    print(f"🖼️ Ảnh preview gán nhãn: {PREVIEW_DIR.resolve()}")
    print("👉 Bước tiếp theo: Chạy `python train_wrist_yolo.py` để bắt đầu huấn luyện!")
    print("=" * 65)

if __name__ == "__main__":
    process_and_label_dataset()
