# 📿 PIPELINE CÀO ẢNH, GÁN NHÃN & HUẤN LUYỆN YOLO CHO CỔ TAY NGƯỜI THẬT
> **Dự án**: Xưởng Phối Vòng Tay Phong Thủy 3D & Ướm Cổ Tay AR (AR Live Try-On)  
> **Thư mục**: `ai_wrist_pipeline/`

---

## 🌟 1. CÔNG NGHỆ ƯỚM VÒNG 3D NHƯ ĐEO THẬT (REALISTIC TRY-ON)

Khác với các hệ thống AR thông thường vẽ một hình elip phẳng 2D dán đè lên da, hệ thống phiên bản mới áp dụng công nghệ **Cylindrical 3D Wrist Wrapping & Occlusion Culling**:

1. **Chuẩn 5 Điểm Giải Phẫu Cổ Tay (Anatomical 5 Keypoints)**:
   - **KP0 (Wrist Center)**: Tâm nếp gấp khớp cổ tay.
   - **KP1 (Radial Styloid)**: Mỏm trâm xương quay (phía ngón cái).
   - **KP2 (Ulnar Styloid)**: Mỏm trâm xương trụ (phía ngón út).
   - **KP3 (Forearm Anchor)**: Trục cẳng tay / Vị trí rơi tự nhiên của vòng tay (lùi xuống dọc theo cẳng tay 1.5 - 2cm).
   - **KP4 (Palm Base Anchor)**: Gốc lòng bàn tay / mu bàn tay (xác định hướng úp/ngửa 3D của tay).

2. **Che Khuất Tự Nhiên (Occlusion Culling)**:
   - Cổ tay là một khối trụ đặc. Khi đeo vòng, **chỉ có cung hạt phía trước (Visible Front Arc)** ôm lên bề mặt da.
   - Dây và các hạt phía sau luồn qua mặt sau cổ tay và **bị cánh tay che khuất hoàn toàn**.
   - Khi tiến ra 2 mép sườn cổ tay, các hạt tự động thu hẹp khoảng cách (foreshortening) và xoay nghiêng theo phối cảnh 3D.

3. **Bóng Đổ Tiếp Xúc Trực Tiếp Lên Da (Contact Shadow)**:
   - Dải bóng mờ mềm (ambient contact shadow) in trực tiếp lên da cổ tay ngay bên dưới chuỗi hạt, tạo độ tỳ vật lý chân thực.

4. **Charm Hoa Hồng 5 Cánh & Hạt Ngọc Trai 3D (Đúng theo ảnh mẫu)**:
   - Charm bông hoa 5 cánh màu hồng phấn xinh xắn với nhụy hoa vàng ánh kim.
   - Hạt ngọc trai trắng bóng (Lustrous Pearls) có ánh xà cừ và đốm sáng phản quang (specular highlight).
   - Hạt thạch anh dâu trong suốt (Translucent Quartz).

---

## 📂 2. CẤU TRÚC THƯ MỤC PIPELINE

```text
ai_wrist_pipeline/
├── requirements.txt           # Danh sách thư viện Python cần thiết
├── scrape_wrist_dataset.py    # Script cào ảnh cổ tay đeo vòng, hoa hạt pastel
├── auto_label_wrist.py        # Script tự động gán nhãn 5 keypoints giải phẫu cổ tay
├── train_wrist_yolo.py        # Script train mô hình YOLOv8-pose 5-KP & xuất ONNX
├── test_wrist_inference.py    # Script chạy thử nghiệm webcam 3D chân thực
├── README.md                  # Hướng dẫn chi tiết bằng Tiếng Việt
├── dataset/                   # Thư mục chứa dữ liệu
│   ├── raw_images/            # Ảnh thô & ảnh mô phỏng giải phẫu đa góc độ
│   ├── labeled_preview/       # Ảnh preview 5 keypoints và đường ôm vòng tay
│   ├── images/train & val     # Ảnh đã chia tập train/val cho YOLO
│   ├── labels/train & val     # File nhãn tọa độ (.txt) 5-KP theo chuẩn YOLOv8-Pose
│   └── wrist_dataset.yaml     # File cấu hình dataset với kpt_shape [5, 3]
└── weights/                   # Nơi chứa file mô hình sau khi train (best.pt, best.onnx)
```

---

## 🚀 3. HƯỚNG DẪN THỰC THI TỪNG BƯỚC

### Bước 1: Cài Đặt Môi Trường
Mở Terminal hoặc PowerShell tại thư mục này:
```bash
cd e:\VIBANVONGTAY\ai_wrist_pipeline
pip install -r requirements.txt
```

### Bước 2: Chuẩn Bị Dữ Liệu & Gán Nhãn 5 Keypoints
```bash
python auto_label_wrist.py
```
- Hệ thống sẽ tự động quét ảnh hoặc sinh 35+ mẫu ảnh mô phỏng giải phẫu đa góc độ (nghiêng 35° - 55° như ảnh mẫu của bạn).
- Tự động gán nhãn 5 Keypoints chuẩn xác và lưu ảnh xem trước vào `dataset/labeled_preview/`.

### Bước 3: Huấn Luyện Mô Hình YOLOv8-Pose
```bash
python train_wrist_yolo.py 40 16
```
- Mô hình YOLOv8n-pose sẽ học 5 keypoints với loss tối ưu.
- Kết thúc huấn luyện, mô hình được lưu vào `weights/wrist_yolov8_best.pt` và `weights/wrist_yolov8_best.onnx`.

### Bước 4: Chạy Thử Nghiệm Webcam Ướm Vòng Trực Tiếp
```bash
python test_wrist_inference.py
```
- Camera máy tính sẽ bật lên.
- Khi bạn đưa cổ tay vào, mẫu vòng **Hoa Hồng Pha Lê & Ngọc Trai** sẽ ôm sát vào cổ tay như đeo thật!
- Nhấn phím `b` để đổi các mẫu vòng khác.
- Nhấn phím `q` để tắt.
