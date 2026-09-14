# 📿 PIPELINE CÀO ẢNH, GÁN NHÃN & HUẤN LUYỆN YOLO CHO CỔ TAY NGƯỜI THẬT
> **Dự án**: Xưởng Phối Vòng Tay Phong Thủy 3D & Ướm Cổ Tay AR (AR Live Try-On)  
> **Thư mục**: `ai_wrist_pipeline/`

---

## 🌟 1. TỔNG QUAN HỆ THỐNG (ARCHITECTURE OVERVIEW)

Hệ thống kết hợp 2 tầng công nghệ tiên tiến:

1. **Tầng Web AR Trực Tiếp (Frontend React + Canvas Vision Tracker)**:
   - Chạy trực tiếp 100% trên trình duyệt Web (Chrome, Safari, Cốc Cốc trên cả iPhone và Android) không cần cài thêm app.
   - Kết nối trực tiếp chiếc vòng bạn vừa tự phối trong **Xưởng 3D** (từng viên đá Thạch Anh, Lam Ngọc, Charm Bạc 925) sang camera để ướm thử lên cổ tay ngay tức thì.
   - Tự động nhận diện góc xoay, chu vi vòng (14 - 19 cm) và co giãn theo cử động thực tế.

2. **Tầng AI YOLO Training Pipeline (Python Backend)**:
   - Cung cấp bộ công cụ tự động cào hàng trăm ảnh cổ tay người thật.
   - Tự động gán nhãn (Auto-labeling) tọa độ mỏm xương cổ tay và tâm cổ tay mà **không cần ngồi chấm tay thủ công**.
   - Huấn luyện mô hình **YOLOv8-Pose** để đạt độ chính xác tối ưu trên mọi màu da và điều kiện ánh sáng.
   - Xuất file mô hình `best.onnx` để tích hợp vào WebAssembly / ONNX Runtime Web.

---

## 📂 2. CẤU TRÚC THƯ MỤC PIPELINE

```text
ai_wrist_pipeline/
├── requirements.txt           # Danh sách thư viện Python cần thiết
├── scrape_wrist_dataset.py    # Script tự động cào ảnh cổ tay đa dạng
├── auto_label_wrist.py        # Script tự động gán nhãn keypoints cổ tay
├── train_wrist_yolo.py        # Script train mô hình YOLOv8-pose & xuất ONNX
├── test_wrist_inference.py    # Script chạy thử nghiệm webcam thời gian thực
├── README.md                  # Hướng dẫn chi tiết bằng Tiếng Việt
├── dataset/                   # Thư mục chứa dữ liệu
│   ├── raw_images/            # Ảnh thô tải về
│   ├── labeled_preview/       # Ảnh preview đã vẽ keypoint để kiểm tra
│   ├── images/train & val     # Ảnh đã chia tập train/val cho YOLO
│   ├── labels/train & val     # File nhãn tọa độ (.txt) theo chuẩn YOLO
│   └── wrist_dataset.yaml     # File cấu hình dataset
└── weights/                   # Nơi chứa file mô hình sau khi train (best.pt, best.onnx)
```

---

## 🚀 3. HƯỚNG DẪN THỰC THI TỪNG BƯỚC (STEP-BY-STEP)

### Bước 1: Cài Đặt Môi Trường
Mở Terminal hoặc PowerShell tại thư mục này và chạy:
```bash
cd e:\VIBANVONGTAY\ai_wrist_pipeline
pip install -r requirements.txt
```

### Bước 2: Cào Ảnh Cổ Tay Tự Động (Dataset Scraping)
Chạy script để tải ảnh cổ tay từ các nguồn mở chất lượng cao:
```bash
python scrape_wrist_dataset.py 40
```
- Script sẽ tự động tải các góc chụp cổ tay, tay đeo trang sức, tay người thật với nhiều màu da và độ sáng khác nhau.
- Ảnh được lưu tự động vào `dataset/raw_images/`.

### Bước 3: Tự Động Gán Nhãn Tọa Độ Cổ Tay (Auto-Labeling)
Chạy script để hệ thống tự phân tích giải phẫu cổ tay và sinh nhãn:
```bash
python auto_label_wrist.py
```
- Hệ thống sử dụng AI Landmark Detector nhận diện:
  - **Keypoint 1 (Xanh lá)**: Tâm điểm khớp cổ tay (Wrist Center Anchor).
  - **Keypoint 2 (Xanh dương)**: Mỏm trâm xương quay (Radial Styloid - mé ngón cái).
  - **Keypoint 3 (Đỏ)**: Mỏm trâm xương trụ (Ulnar Styloid - mé ngón út).
- Tự động chia tỉ lệ 80% Train / 20% Val.
- Bạn có thể vào thư mục `dataset/labeled_preview/` để xem ngay các ảnh đã được AI vẽ khung và điểm neo vòng tay.

### Bước 4: Huấn Luyện Mô Hình YOLOv8-Pose (Training)
Bắt đầu huấn luyện mô hình YOLO:
```bash
python train_wrist_yolo.py 30
```
- Quá trình huấn luyện sử dụng kiến trúc nano (`yolov8n-pose.pt`) để đạt tốc độ xử lý trên 60 FPS.
- Kết thúc huấn luyện, mô hình tốt nhất sẽ được lưu vào:
  - `weights/wrist_yolov8_best.pt` (Mô hình PyTorch)
  - `weights/wrist_yolov8_best.onnx` (Mô hình chuẩn mở ONNX dùng cho Web)

### Bước 5: Chạy Thử Nghiệm Webcam Trực Tiếp (Live Webcam Demo)
Kiểm tra hiệu quả nhận diện trên chính cổ tay của bạn:
```bash
python test_wrist_inference.py
```
- Camera máy tính sẽ bật lên.
- Khi bạn giơ cổ tay vào camera, chiếc vòng tay đá quý tự phối sẽ **tự động bám dính (Auto-Snap)** theo cổ tay của bạn.
- Nhấn phím `b` để đổi giữa các mẫu vòng (Thạch Anh Dâu, Tóc Vàng, Ngọc Bích, Chỉ Đỏ).
- Nhấn phím `q` để tắt camera.

---

## 💎 4. CÁCH KẾT NỐI VỚI WEBSITE FRONTEND HIỆN TẠI

1. **Trải nghiệm trên Website**:
   - Khách hàng vào trang web -> Click **Xưởng Tự Phối Vòng**.
   - Tự chọn loại dây đan, từng viên hạt phong thủy và charm bạc 925 theo sở thích.
   - Nhấn nút **"Ướm Cổ Tay Thật (AR)"** có biểu tượng máy ảnh phát sáng.
   - Trình duyệt sẽ mở camera và hiển thị đúng mẫu vòng khách vừa thiết kế ôm vừa khít cổ tay khách theo thời gian thực!
   - Khách chỉ cần nhấn **"Thêm Vòng Này Vào Giỏ"** là toàn bộ chi tiết hạt, charm và kích thước cổ tay sẽ được chuyển thẳng vào giỏ hàng và đơn đặt hàng.
