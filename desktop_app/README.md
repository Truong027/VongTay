# Ứng Dụng Desktop Quản Lý Xưởng Vòng Tay (CustomTkinter)

Ứng dụng chuyên dụng cho chủ shop và nghệ nhân tại xưởng đan vòng tay thủ công **KhánhVyMade**.

## Tính Năng:
- Giao diện Dark/Light Mode hiện đại bằng **CustomTkinter**.
- Kết nối trực tiếp tới Backend API (`http://localhost:5000/api/orders`).
- Hiển thị chi tiết từng đơn hàng:
  - Thông số xâu hạt: Loại dây, loại đá, số lượng hạt, charm bạc 925, chữ cái khắc riêng, kích thước cổ tay.
- Nút bấm nhanh thay đổi tiến độ đan vòng:
  - *Bắt đầu kết hạt thủ công*
  - *Hoàn thiện vòng (Chuẩn bị giao)*
  - *Bàn giao bưu tá (Đang giao)*

## Hướng Dẫn Chạy:
1. Đảm bảo Backend API đang chạy tại cổng 5000 (`node src/server.js`).
2. Cài đặt thư viện:
   ```bash
   pip install -r requirements.txt
   ```
3. Khởi động ứng dụng:
   ```bash
   python app.py
   ```

*Lưu ý: Nếu máy tính chưa cài gói Tkinter của Python, bạn cũng có thể sử dụng cổng Web Admin trực quan với đầy đủ tính năng tương đương tại trình duyệt: `http://localhost:3000` (nhấn vào nút **Quản Trị** ở góc trên).*
