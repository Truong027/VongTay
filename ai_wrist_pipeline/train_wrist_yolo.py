"""
=============================================================================
KỊCH BẢN HUẤN LUYỆN YOLOV8-POSE CHO CỔ TAY (YOLOV8 WRIST POSE TRAINER)
Dự án: Xưởng Vòng Tay - Ướm Vòng AR & Tự Phối 3D
=============================================================================
Tính năng:
- Tải mô hình nền tảng YOLOv8n-pose (siêu nhẹ, tối ưu real-time trên Web & Mobile)
- Huấn luyện nhận diện cổ tay & 3 điểm neo (Anchor Points) để ướm vòng
- Tự động lưu checkpoint tốt nhất: best.pt
- Tự động xuất định dạng ONNX (best.onnx) để nhúng trực tiếp vào Web/Browser qua ONNX Runtime Web
=============================================================================
"""

import sys
import shutil
from pathlib import Path

PIPELINE_DIR = Path(__file__).parent
DATASET_YAML = PIPELINE_DIR / "dataset" / "wrist_dataset.yaml"
OUTPUT_WEIGHTS_DIR = PIPELINE_DIR / "weights"
OUTPUT_WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)

def train_wrist_model(epochs: int = 50, batch_size: int = 16, imgsz: int = 640):
    print("=" * 65)
    print("🔥 KHỞI ĐỘNG HUẤN LUYỆN YOLOV8-POSE WRIST DETECTION")
    print("=" * 65)

    if not DATASET_YAML.exists():
        print(f"❌ Không tìm thấy file cấu hình: {DATASET_YAML}")
        print("👉 Vui lòng chạy `python auto_label_wrist.py` trước để tạo dataset và file YAML!")
        return

    try:
        from ultralytics import YOLO
    except ImportError:
        print("❌ Chưa cài đặt thư viện ultralytics!")
        print("👉 Hãy chạy: pip install ultralytics")
        return

    # Tải mô hình nền tảng yolov8n-pose.pt (nano: nhanh & nhẹ nhất)
    print("📦 Đang nạp mô hình pretrained YOLOv8n-pose...")
    model = YOLO("yolov8n-pose.pt")

    print(f"⚙️ Cấu hình huấn luyện:")
    print(f"   - Dataset: {DATASET_YAML}")
    print(f"   - Epochs: {epochs}")
    print(f"   - Batch Size: {batch_size}")
    print(f"   - Image Size: {imgsz}")
    print("⏳ Đang bắt đầu quá trình huấn luyện...")

    # Bắt đầu Train
    results = model.train(
        data=str(DATASET_YAML),
        epochs=epochs,
        batch=batch_size,
        imgsz=imgsz,
        name="wrist_yolo_run",
        project=str(PIPELINE_DIR / "runs"),
        save=True,
        verbose=True
    )

    print("=" * 65)
    print("🎉 HUẤN LUYỆN HOÀN TẤT THÀNH CÔNG!")
    
    # Tìm file weights tốt nhất
    run_dir = PIPELINE_DIR / "runs" / "wrist_yolo_run"
    best_pt = run_dir / "weights" / "best.pt"
    if not best_pt.exists():
        # Fallback nếu ultralytics thêm số thứ tự (e.g. wrist_yolo_run1)
        subdirs = sorted(list((PIPELINE_DIR / "runs").glob("wrist_yolo_run*")), reverse=True)
        if subdirs:
            best_pt = subdirs[0] / "weights" / "best.pt"

    if best_pt.exists():
        dest_pt = OUTPUT_WEIGHTS_DIR / "wrist_yolov8_best.pt"
        shutil.copy(best_pt, dest_pt)
        print(f"💾 Đã lưu mô hình PyTorch: {dest_pt}")

        # Tự động xuất ONNX cho Web & Edge Inference
        print("🚀 Đang xuất mô hình sang chuẩn ONNX cho Web AR...")
        try:
            trained_model = YOLO(str(dest_pt))
            onnx_file = trained_model.export(format="onnx", imgsz=imgsz, simplify=True)
            dest_onnx = OUTPUT_WEIGHTS_DIR / "wrist_yolov8_best.onnx"
            if Path(onnx_file).exists() and Path(onnx_file) != dest_onnx:
                shutil.copy(onnx_file, dest_onnx)
            print(f"🌐 Đã xuất ONNX thành công: {dest_onnx}")
            print("👉 Bạn có thể nạp file ONNX này trực tiếp vào trình duyệt với ONNX Runtime Web!")
        except Exception as e:
            print(f"⚠️ Không thể tự động xuất ONNX ({e}). Vẫn có thể dùng file .pt với Python.")
    
    print("=" * 65)
    print("👉 Bước tiếp theo: Chạy `python test_wrist_inference.py` để test webcam trực tiếp với vòng tay ảo!")
    print("=" * 65)

if __name__ == "__main__":
    epochs = 30
    if len(sys.argv) > 1:
        try:
            epochs = int(sys.argv[1])
        except ValueError:
            pass
    train_wrist_model(epochs=epochs)
