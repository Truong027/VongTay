"""
=============================================================================
KỊCH BẢN HUẤN LUYỆN YOLOV8-POSE CHO CỔ TAY (5-KEYPOINT WRIST AR TRAINER)
Dự án: Xưởng Vòng Tay - Ướm Vòng AR & Tự Phối 3D
=============================================================================
Tính năng:
- Huấn luyện nhận diện cổ tay & 5 điểm neo giải phẫu (Wrist Center, Radial, Ulnar, Forearm Axis, Palm Base)
- Data Augmentation tối ưu cho tư thế cổ tay & bàn tay đeo vòng
- Xuất mô hình PyTorch (wrist_yolov8_best.pt)
- Tự động xuất chuẩn mở ONNX (wrist_yolov8_best.onnx) cho WebAssembly / ONNX Runtime Web
=============================================================================
"""

import os
import sys
import io
import shutil
from pathlib import Path

# Đảm bảo in UTF-8 không lỗi charmap trên Windows
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

PIPELINE_DIR = Path(__file__).parent
DATASET_YAML = PIPELINE_DIR / "dataset" / "wrist_dataset.yaml"
OUTPUT_WEIGHTS_DIR = PIPELINE_DIR / "weights"
OUTPUT_WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)

def train_wrist_model(epochs: int = 40, batch_size: int = 16, imgsz: int = 640, device: str = ""):
    print("=" * 68)
    print("[TRAIN] KHỞI ĐỘNG HUẤN LUYỆN YOLOV8-POSE WRIST 5-KEYPOINTS")
    print("=" * 68)

    if not DATASET_YAML.exists():
        print(f"[ERROR] Không tìm thấy file cấu hình: {DATASET_YAML}")
        print("👉 Vui lòng chạy `python auto_label_wrist.py` trước để tạo dataset!")
        return

    try:
        from ultralytics import YOLO
    except ImportError:
        print("[ERROR] Chưa cài đặt thư viện ultralytics!")
        print("👉 Hãy chạy: pip install ultralytics")
        return

    # Tải mô hình nền tảng yolov8n-pose.pt (nano: nhanh & nhẹ nhất, ~6MB)
    print("[INFO] Đang nạp mô hình pretrained YOLOv8n-pose...")
    model = YOLO("yolov8n-pose.pt")

    print(f"[CONFIG] Cấu hình huấn luyện:")
    print(f"   - Dataset: {DATASET_YAML}")
    print(f"   - Epochs: {epochs}")
    print(f"   - Batch Size: {batch_size}")
    print(f"   - Image Size: {imgsz}")
    if device:
        print(f"   - Device: {device}")
    print("⏳ Đang bắt đầu quá trình huấn luyện...")

    train_kwargs = {
        "data": str(DATASET_YAML),
        "epochs": epochs,
        "batch": batch_size,
        "imgsz": imgsz,
        "name": "wrist_yolo_run",
        "project": str(PIPELINE_DIR / "runs"),
        "save": True,
        "verbose": True,
        # Tăng cường độ chính xác cho Keypoints cổ tay
        "pose": 12.0,       # Trọng số loss cho keypoint vị trí
        "box": 7.5,         # Trọng số loss cho bounding box
        # Data Augmentations tối ưu cho cổ tay
        "degrees": 30.0,    # Cổ tay xoay các hướng nghiêng tự nhiên
        "translate": 0.1,
        "scale": 0.25,
        "shear": 6.0,
        "perspective": 0.0004,
        "fliplr": 0.5,      # Lật ngang cổ tay trái <-> phải
        "flipud": 0.0,      # Không lật ngược chúc đầu
        "mosaic": 0.4
    }
    if device:
        train_kwargs["device"] = device

    # Bắt đầu Train
    results = model.train(**train_kwargs)

    print("=" * 68)
    print("[SUCCESS] HUẤN LUYỆN HOÀN TẤT THÀNH CÔNG!")
    
    # Tìm file weights tốt nhất
    run_dir = PIPELINE_DIR / "runs" / "wrist_yolo_run"
    best_pt = run_dir / "weights" / "best.pt"
    if not best_pt.exists():
        subdirs = sorted(list((PIPELINE_DIR / "runs").glob("wrist_yolo_run*")), reverse=True)
        if subdirs:
            best_pt = subdirs[0] / "weights" / "best.pt"

    if best_pt.exists():
        dest_pt = OUTPUT_WEIGHTS_DIR / "wrist_yolov8_best.pt"
        shutil.copy(best_pt, dest_pt)
        print(f"[SAVE] Đã lưu mô hình PyTorch: {dest_pt}")

        # Tự động xuất ONNX cho Web & Edge Inference
        print("[EXPORT] Đang xuất mô hình sang chuẩn ONNX cho Web AR...")
        try:
            trained_model = YOLO(str(dest_pt))
            onnx_file = trained_model.export(format="onnx", imgsz=imgsz, simplify=True)
            dest_onnx = OUTPUT_WEIGHTS_DIR / "wrist_yolov8_best.onnx"
            if Path(onnx_file).exists() and Path(onnx_file) != dest_onnx:
                shutil.copy(onnx_file, dest_onnx)
            print(f"[EXPORT] Đã xuất ONNX thành công: {dest_onnx}")
            print("👉 File ONNX này sẵn sàng nạp trực tiếp vào Web với ONNX Runtime Web!")
        except Exception as e:
            print(f"[WARN] Không thể tự động xuất ONNX ({e}). Vẫn dùng tốt file .pt với Python.")
    
    print("=" * 68)
    print("👉 Bước tiếp theo: Chạy `python test_wrist_inference.py` để xem vòng tay hoa ôm sát cổ tay qua webcam!")
    print("=" * 68)

if __name__ == "__main__":
    epochs = 40
    batch = 16
    if len(sys.argv) > 1:
        try:
            epochs = int(sys.argv[1])
        except ValueError:
            pass
    if len(sys.argv) > 2:
        try:
            batch = int(sys.argv[2])
        except ValueError:
            pass
    train_wrist_model(epochs=epochs, batch_size=batch)
