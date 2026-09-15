"""
=============================================================================
XÂY DỰNG DATASET 100% CỔ TAY NGƯỜI THẬT (PURE REAL HUMAN WRIST DATASET BUILDER)
Dự án: Xưởng Vòng Tay - Ướm Vòng AR & Tự Phối 3D
=============================================================================
Tính năng:
- 100% hình ảnh cánh tay, cổ tay, bàn tay người thật.
- Loại bỏ tuyệt đối: Nhà cửa, cảnh vật, sơ đồ giải phẫu, xương khớp, bầm tím, ma-nơ-canh.
- Gắn nhãn 5 keypoints chuẩn xác:
  0: Wrist Center (Tâm nếp gấp cổ tay)
  1: Radial Styloid (Mép ngoài cổ tay phía ngón cái)
  2: Ulnar Styloid (Mắt cá cổ tay phía ngón út)
  3: Forearm Axis (Trục cẳng tay)
  4: Palm Base (Gốc mu bàn tay)
- Tự động sinh Data Augmentation chân thực (lật ngang tay trái/phải, góc xoay, đổi sáng).
=============================================================================
"""

import os
import sys
import io
import math
import random
import shutil
import cv2
import numpy as np
from pathlib import Path
from ultralytics import YOLO

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

PIPELINE_DIR = Path(__file__).parent
DATASET_DIR = PIPELINE_DIR / "dataset"
IMAGES_TRAIN = DATASET_DIR / "images" / "train"
IMAGES_VAL = DATASET_DIR / "images" / "val"
LABELS_TRAIN = DATASET_DIR / "labels" / "train"
LABELS_VAL = DATASET_DIR / "labels" / "val"
PREVIEW_DIR = DATASET_DIR / "pure_preview"

for d in [IMAGES_TRAIN, IMAGES_VAL, LABELS_TRAIN, LABELS_VAL, PREVIEW_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Danh sách 100% cổ tay người thật trần (bare skin, không đeo phụ kiện, không đồng hồ/vòng tay, không sơ đồ)
CORE_PRISTINE_SOURCES = [
    {"path": PIPELINE_DIR / "dataset" / "raw_images" / "clean_user_wrist_pink_tree.jpg", "name": "user_wrist_pink"},
    {"path": PIPELINE_DIR / "dataset" / "raw_images" / "real_hand_wrist_02cab2135e.jpg", "name": "real_bare_hand_01"},
    {"path": PIPELINE_DIR / "dataset" / "raw_images" / "real_hand_wrist_e5c7cd3827.jpg", "name": "real_bare_hand_02"},
    {"path": PIPELINE_DIR / "dataset" / "raw_images" / "curated_wrist_2bee7fa62297.jpg", "name": "real_bare_wrist_03"},
    {"path": PIPELINE_DIR / "dataset" / "raw_images" / "user_real_wrist_9700388020.jpg", "name": "real_bare_wrist_04"},
    {"path": PIPELINE_DIR / "dataset" / "raw_images_clean" / "clean_real_wrist_002.jpg", "name": "bare_wrist_clean_02"},
    {"path": PIPELINE_DIR / "dataset" / "raw_images_clean" / "clean_real_wrist_004.jpg", "name": "bare_wrist_clean_04"},
    {"path": PIPELINE_DIR / "dataset" / "raw_images_clean" / "clean_real_wrist_014.jpg", "name": "bare_wrist_clean_14"},
    {"path": PIPELINE_DIR / "dataset" / "raw_images_clean" / "clean_real_wrist_016.jpg", "name": "bare_wrist_clean_16"},
    {"path": PIPELINE_DIR / "dataset" / "raw_images_clean" / "clean_real_wrist_018.jpg", "name": "bare_wrist_clean_18"},
    {"path": PIPELINE_DIR / "dataset" / "raw_images_clean" / "clean_real_wrist_022.jpg", "name": "bare_wrist_clean_22"},
    {"path": PIPELINE_DIR / "dataset" / "raw_images_clean" / "clean_real_wrist_023.jpg", "name": "bare_wrist_clean_23"},
    {"path": PIPELINE_DIR / "dataset" / "raw_images_clean" / "clean_real_wrist_024.jpg", "name": "bare_wrist_clean_24"},
]

def extract_5_keypoints_from_pose(img, kpts_17):
    """
    Từ 17 keypoints cơ thể của yolov8n-pose, trích xuất chuẩn xác 5 điểm cổ tay:
    kpts_17[9] = left wrist, kpts_17[7] = left elbow
    kpts_17[10] = right wrist, kpts_17[8] = right elbow
    """
    h, w = img.shape[:2]
    lw, le = kpts_17[9], kpts_17[7]
    rw, re = kpts_17[10], kpts_17[8]

    # Chọn cổ tay có độ tin cậy hoặc vị trí rõ ràng hơn
    left_valid = lw[0] > 0 and lw[1] > 0
    right_valid = rw[0] > 0 and rw[1] > 0

    if left_valid and right_valid:
        # Chọn cổ tay gần tâm ảnh hơn
        dist_l = math.hypot(lw[0] - w/2, lw[1] - h/2)
        dist_r = math.hypot(rw[0] - w/2, rw[1] - h/2)
        use_left = dist_l < dist_r
    elif left_valid:
        use_left = True
    elif right_valid:
        use_left = False
    else:
        return None, None

    wrist_pt = lw if use_left else rw
    elbow_pt = le if use_left else re

    wx, wy = float(wrist_pt[0]), float(wrist_pt[1])
    
    # Vector từ cẳng tay tới cổ tay
    if elbow_pt[0] > 0 and elbow_pt[1] > 0:
        ex, ey = float(elbow_pt[0]), float(elbow_pt[1])
        dir_x, dir_y = wx - ex, wy - ey
        arm_len = math.hypot(dir_x, dir_y)
        if arm_len > 10:
            ux, uy = dir_x / arm_len, dir_y / arm_len
        else:
            ux, uy = 0.0, -1.0
    else:
        # Mặc định cẳng tay hướng từ dưới lên
        ux, uy = 0.0, -1.0

    # Vector pháp tuyến vuông góc với trục cẳng tay (chỉ hướng radial - ulnar)
    perp_x, perp_y = -uy, ux

    # Ước tính bán kính cổ tay dựa trên kích thước ảnh
    wrist_r = max(22.0, min(65.0, min(w, h) * 0.08))

    # 5 Keypoints
    center = (wx, wy)
    radial = (wx + perp_x * wrist_r, wy + perp_y * wrist_r)
    ulnar = (wx - perp_x * wrist_r, wy - perp_y * wrist_r)
    forearm = (wx - ux * wrist_r * 1.5, wy - uy * wrist_r * 1.5)
    palm = (wx + ux * wrist_r * 1.3, wy + uy * wrist_r * 1.3)

    # Bounding box
    pad = wrist_r * 1.8
    x1 = max(0, int(wx - pad))
    y1 = max(0, int(wy - pad))
    x2 = min(w, int(wx + pad))
    y2 = min(h, int(wy + pad))

    return [center, radial, ulnar, forearm, palm], (x1, y1, x2, y2)

def transform_kpts_and_box(kpts, box, M, w, h):
    """Biến đổi affine cho keypoints và bounding box khi xoay/lật/phóng to ảnh"""
    new_kpts = []
    for (x, y) in kpts:
        pt = np.array([x, y, 1.0])
        new_pt = M.dot(pt)
        nx = max(0.0, min(float(w), float(new_pt[0])))
        ny = max(0.0, min(float(h), float(new_pt[1])))
        new_kpts.append((nx, ny))

    # Biến đổi 4 góc của bounding box
    x1, y1, x2, y2 = box
    corners = np.array([
        [x1, y1, 1.0],
        [x2, y1, 1.0],
        [x2, y2, 1.0],
        [x1, y2, 1.0]
    ])
    trans_corners = corners.dot(M.T)
    min_x = max(0.0, float(np.min(trans_corners[:, 0])))
    min_y = max(0.0, float(np.min(trans_corners[:, 1])))
    max_x = min(float(w), float(np.max(trans_corners[:, 0])))
    max_y = min(float(h), float(np.max(trans_corners[:, 1])))

    return new_kpts, (min_x, min_y, max_x, max_y)

def save_yolo_label(label_path, box, kpts, img_w, img_h):
    """Lưu nhãn theo chuẩn YOLOv8-pose (class cx cy w h kx ky v ...)"""
    x1, y1, x2, y2 = box
    bw = (x2 - x1) / img_w
    bh = (y2 - y1) / img_h
    cx = (x1 + x2) / (2.0 * img_w)
    cy = (y1 + y2) / (2.0 * img_h)

    # Clamping
    cx = max(0.001, min(0.999, cx))
    cy = max(0.001, min(0.999, cy))
    bw = max(0.005, min(0.999, bw))
    bh = max(0.005, min(0.999, bh))

    parts = [f"0 {cx:.6f} {cy:.6f} {bw:.6f} {bh:.6f}"]
    for (kx, ky) in kpts:
        norm_kx = max(0.0, min(1.0, kx / img_w))
        norm_ky = max(0.0, min(1.0, ky / img_h))
        # v = 2: Điểm nhìn thấy rõ (visible & labeled)
        parts.append(f"{norm_kx:.6f} {norm_ky:.6f} 2")

    with open(label_path, "w", encoding="utf-8") as f:
        f.write(" ".join(parts) + "\n")

def draw_labeled_preview(img, box, kpts, title):
    """Vẽ ảnh kiểm tra trực quan nhãn cổ tay 100%"""
    vis = img.copy()
    x1, y1, x2, y2 = [int(v) for v in box]
    cv2.rectangle(vis, (x1, y1), (x2, y2), (0, 230, 115), 2)

    # Nối đường cổ tay: Radial (1) <-> Center (0) <-> Ulnar (2)
    p0 = (int(kpts[0][0]), int(kpts[0][1]))
    p1 = (int(kpts[1][0]), int(kpts[1][1]))
    p2 = (int(kpts[2][0]), int(kpts[2][1]))
    p3 = (int(kpts[3][0]), int(kpts[3][1]))
    p4 = (int(kpts[4][0]), int(kpts[4][1]))

    cv2.line(vis, p1, p2, (255, 105, 180), 3) # Đường nếp gấp cổ tay (đeo vòng)
    cv2.line(vis, p3, p0, (80, 200, 255), 2)  # Trục cẳng tay
    cv2.line(vis, p0, p4, (255, 215, 0), 2)   # Hướng mu bàn tay

    colors = [
        (0, 255, 255),   # 0: Center (Vàng chanh)
        (255, 0, 255),   # 1: Radial (Hồng tím)
        (0, 255, 0),     # 2: Ulnar (Xanh lá)
        (255, 120, 0),   # 3: Forearm (Cam)
        (0, 140, 255)    # 4: Palm (Đỏ cam)
    ]
    labels = ["Center", "Radial", "Ulnar", "Forearm", "Palm"]

    for idx, (pt, c, l) in enumerate(zip([p0, p1, p2, p3, p4], colors, labels)):
        cv2.circle(vis, pt, 6, c, -1)
        cv2.circle(vis, pt, 7, (255, 255, 255), 1)
        cv2.putText(vis, l, (pt[0] + 7, pt[1] - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 2)
        cv2.putText(vis, l, (pt[0] + 7, pt[1] - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.45, c, 1)

    # Header badge
    cv2.rectangle(vis, (10, 10), (380, 48), (20, 20, 20), -1)
    cv2.rectangle(vis, (10, 10), (380, 48), (0, 230, 115), 2)
    cv2.putText(vis, f"100% REAL WRIST: {title[:25]}", (18, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)

    return vis

def build_pure_dataset():
    print("=" * 68)
    print("🚀 BẮT ĐẦU XÂY DỰNG DATASET 100% CỔ TAY NGƯỜI THẬT CHUẨN XÁC")
    print("=" * 68)

    # 1. Xóa sạch dữ liệu cũ trong images và labels
    for folder in [IMAGES_TRAIN, IMAGES_VAL, LABELS_TRAIN, LABELS_VAL, PREVIEW_DIR]:
        for f in folder.glob("*.*"):
            try:
                f.unlink()
            except Exception:
                pass
    print("🧹 Đã làm sạch toàn bộ ảnh rác/sơ đồ/cảnh vật cũ!")

    pose_model = YOLO("yolov8n-pose.pt")
    
    total_generated = 0
    all_samples = []

    # 2. Xử lý từng ảnh nguồn chuẩn mực
    for src_info in CORE_PRISTINE_SOURCES:
        src_path = Path(src_info["path"])
        if not src_path.exists():
            print(f"⚠️ Bỏ qua không tìm thấy: {src_path.name}")
            continue

        img = cv2.imread(str(src_path))
        if img is None:
            continue

        h, w = img.shape[:2]

        if "custom_kpts" in src_info:
            base_kpts = src_info["custom_kpts"]
            base_box = src_info["custom_box"]
        else:
            # Dùng YOLO pose dự đoán
            res = pose_model.predict(img, conf=0.15, verbose=False)
            found = False
            for r in res:
                if r.keypoints is not None and len(r.keypoints) > 0:
                    k17 = r.keypoints.xy[0].cpu().numpy()
                    k5, box = extract_5_keypoints_from_pose(img, k17)
                    if k5 is not None:
                        base_kpts = k5
                        base_box = box
                        found = True
                        break
            if not found:
                continue

        # Thêm mẫu gốc (Base Original)
        all_samples.append({
            "img": img,
            "box": base_box,
            "kpts": base_kpts,
            "name": f"{src_info['name']}_orig"
        })

        # Augmentation 1: Lật ngang (Horizontal Flip: tay trái <-> tay phải)
        img_flip = cv2.flip(img, 1)
        # Flip keypoints: x -> w - 1 - x. Đổi chỗ Radial (1) và Ulnar (2)
        kpts_flip = []
        for (x, y) in base_kpts:
            kpts_flip.append((w - 1.0 - x, y))
        # Đổi chỗ 1 và 2
        kpts_flip[1], kpts_flip[2] = kpts_flip[2], kpts_flip[1]
        x1, y1, x2, y2 = base_box
        box_flip = (w - 1.0 - x2, y1, w - 1.0 - x1, y2)
        all_samples.append({
            "img": img_flip,
            "box": box_flip,
            "kpts": kpts_flip,
            "name": f"{src_info['name']}_flip"
        })

        # Augmentation 2 & 3: Xoay góc tự nhiên (-15 độ và +15 độ)
        for angle in [-14.0, 14.0]:
            M_rot = cv2.getRotationMatrix2D((w / 2.0, h / 2.0), angle, 1.0)
            img_rot = cv2.warpAffine(img, M_rot, (w, h), borderMode=cv2.BORDER_REFLECT_101)
            kpts_rot, box_rot = transform_kpts_and_box(base_kpts, base_box, M_rot, w, h)
            all_samples.append({
                "img": img_rot,
                "box": box_rot,
                "kpts": kpts_rot,
                "name": f"{src_info['name']}_rot{int(angle)}"
            })

        # Augmentation 4 & 5: Độ sáng/tương phản (phòng tối, đèn flash, nắng tự nhiên)
        bright_plus = cv2.convertScaleAbs(img, alpha=1.15, beta=20)
        all_samples.append({
            "img": bright_plus,
            "box": base_box,
            "kpts": base_kpts,
            "name": f"{src_info['name']}_bright"
        })

        bright_warm = cv2.convertScaleAbs(img, alpha=0.92, beta=-15)
        all_samples.append({
            "img": bright_warm,
            "box": base_box,
            "kpts": base_kpts,
            "name": f"{src_info['name']}_dim"
        })

        # Augmentation 6: Crop & Zoom nhẹ vùng cổ tay (1.12x)
        M_zoom = cv2.getRotationMatrix2D((base_kpts[0][0], base_kpts[0][1]), 0.0, 1.12)
        img_zoom = cv2.warpAffine(img, M_zoom, (w, h), borderMode=cv2.BORDER_REFLECT_101)
        kpts_zoom, box_zoom = transform_kpts_and_box(base_kpts, base_box, M_zoom, w, h)
        all_samples.append({
            "img": img_zoom,
            "box": box_zoom,
            "kpts": kpts_zoom,
            "name": f"{src_info['name']}_zoom"
        })

    # 3. Phân chia Train (80%) và Val (20%)
    random.seed(42)
    random.shuffle(all_samples)
    val_count = max(4, int(len(all_samples) * 0.22))
    val_samples = all_samples[:val_count]
    train_samples = all_samples[val_count:]

    print(f"📊 Tổng số ảnh cổ tay thật sinh ra: {len(all_samples)} mẫu")
    print(f"   - Tập Train: {len(train_samples)} mẫu")
    print(f"   - Tập Val: {len(val_samples)} mẫu")

    def write_dataset_split(sample_list, img_dir, lbl_dir, prefix="pure"):
        for i, s in enumerate(sample_list):
            fname = f"{prefix}_{i:04d}"
            img_path = img_dir / f"{fname}.jpg"
            lbl_path = lbl_dir / f"{fname}.txt"
            cv2.imwrite(str(img_path), s["img"])
            h, w = s["img"].shape[:2]
            save_yolo_label(lbl_path, s["box"], s["kpts"], w, h)

            # Lưu ảnh preview kiểm tra
            if i < 8:
                prev_vis = draw_labeled_preview(s["img"], s["box"], s["kpts"], s["name"])
                cv2.imwrite(str(PREVIEW_DIR / f"{prefix}_preview_{i:02d}.jpg"), prev_vis)

    write_dataset_split(train_samples, IMAGES_TRAIN, LABELS_TRAIN, prefix="train_wrist")
    write_dataset_split(val_samples, IMAGES_VAL, LABELS_VAL, prefix="val_wrist")

    # Cập nhật wrist_dataset.yaml
    yaml_content = f"""path: {DATASET_DIR.as_posix()}
train: images/train
val: images/val
names:
  0: wrist
kpt_shape: [5, 3]
flip_idx: [0, 2, 1, 3, 4]
"""
    with open(DATASET_DIR / "wrist_dataset.yaml", "w", encoding="utf-8") as f:
        f.write(yaml_content)

    print("=" * 68)
    print("✅ ĐÃ HOÀN TẤT XÂY DỰNG DATASET CỔ TAY NGƯỜI THẬT 100%!")
    print(f"📁 Kiểm tra nhãn trực quan tại: {PREVIEW_DIR}")
    print("=" * 68)

if __name__ == "__main__":
    build_pure_dataset()
