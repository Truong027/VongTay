# KHÁNHVYMADE - HỆ THỐNG WEB & APP BÁN VÒNG TAY THỦ CÔNG MỸ NGHỆ QUỐC TẾ

Dự án thương mại điện tử chuyên biệt cho trang sức vòng tay handmade, vòng macrame thắt nút pastel vintage, charm gốm cá voi, hoa cúc mint, bướm hologram cánh tiên, đá phong thủy tự nhiên và xưởng tự phối vòng tay độc bản (Custom Bracelet Studio).

---

## 📁 Cấu Trúc Dự Án (Chia Thư Mục Rõ Ràng BE và FE)

```
e:\VIBANVONGTAY\
├── backend/                     # BACKEND API (BE - Node.js Express)
│   ├── src/
│   │   ├── controllers/         # Xử lý logic sản phẩm, đơn hàng, customizer, admin
│   │   ├── routes/              # Định tuyến REST API (/api/products, /api/orders, /api/customizer, /api/admin)
│   │   ├── data/seedData.js     # Dữ liệu hạt đá, charm, dây đan, vòng tay mẫu
│   │   └── server.js            # Entry point máy chủ Express (Port 5000)
│   └── package.json
│
├── frontend/                    # FRONTEND WEB & MOBILE APP (FE - React Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          # Navbar, Footer, AnnouncementBar
│   │   │   ├── home/            # HeroSection thẩm mỹ cao cấp, giá trị thủ công
│   │   │   ├── product/         # ProductCard, ProductFilter (lọc Mệnh, Giá), ProductModal, WristSizeModal (đo size tay)
│   │   │   ├── customizer/      # BraceletStudio (Tự phối vòng tay 2D trực quan thời gian thực)
│   │   │   ├── cart/            # CartDrawer (Giỏ hàng trượt, tiến trình freeship, voucher)
│   │   │   ├── checkout/        # CheckoutModal (Đặt hàng, mã VietQR ngân hàng tự động, COD)
│   │   │   ├── tracking/        # OrderTrackingModal (Tra cứu hành trình & tiến độ xâu vòng)
│   │   │   └── admin/           # Web Admin Dashboard (Quản lý đơn, cập nhật tiến độ, thống kê doanh số)
│   │   ├── context/             # CartContext (Quản lý giỏ hàng, yêu thích, lưu LocalStorage)
│   │   ├── services/api.js      # REST Client kết nối Backend
│   │   ├── index.css            # Tailwind CSS v4, Google Fonts Cormorant Garamond & Plus Jakarta Sans
│   │   └── App.jsx
│   ├── public/images/products/  # Ảnh chụp vòng tay thủ công độ phân giải cao
│   └── package.json
│
├── desktop_app/                 # DESKTOP SHOP OWNER APP (CustomTkinter)
│   ├── app.py                   # Ứng dụng Desktop Dark/Light mode cho chủ xưởng
│   ├── requirements.txt         # customtkinter, requests, pillow
│   └── README.md
│
└── README.md                    # Tài liệu hướng dẫn toàn bộ hệ thống
```

---

## ✨ Tính Năng Nổi Bật

### 1. Trải Nghiệm Mua Sắm Chuẩn Boutique Thủ Công (Frontend)
- **Thiết kế Artisanal Warm Boutique**: Tone màu gốm sứ mộc, be linen, cam đất nung terracotta, xanh xô thơm sage green và vàng đồng cổ điển.
- **Xưởng Tự Phối Vòng Tay Độc Bản (Bracelet Studio)**: Khách hàng tự chọn loại dây (dây sáp chống nước, dây chỉ may mắn Tây Tạng, dây chỉ sáp Macrame), chọn charm & phụ kiện thủ công (Gốm hoa pastel, Men sứ phong cảnh, Thẻ gỗ khắc tên, Nút thắt cát tường...). Vòng tay được mô phỏng đồ họa 2D xoay vòng thời gian thực kèm tính giá linh kiện tự động.
- **Bộ lọc thông minh**: Lọc theo danh mục, theo Ngũ Hành Cung Mệnh (Kim, Mộc, Thủy, Hỏa, Thổ), sắp xếp theo mức độ phổ biến / giá.
- **Bảng Đo Size Cổ Tay Trực Quan**: Hướng dẫn đo bằng thước dây hoặc giấy, bảng đối chiếu size XS - XL và số lượng hạt chuẩn tương ứng.
- **Giỏ hàng & Thanh toán thông minh**: Giỏ trượt bên phải, áp dụng mã giảm giá (`MAYMAN` hoặc `ANYEN`), tích hợp tạo mã **VietQR** ngân hàng tự động kèm nội dung chuyển khoản mã đơn.
- **Tra cứu hành trình đơn hàng**: Khách nhập mã đơn hoặc số điện thoại để xem timeline nghệ nhân đang xâu hạt -> hoàn thiện -> bàn giao bưu tá.

### 2. Quản Trị Đơn Hàng Song Song (Web Admin & Desktop App)
- **Web Admin Dashboard**: Xem thống kê doanh thu thực tế, tổng đơn, đơn đang xâu, thay đổi trạng thái đơn hàng trực tiếp trên trình duyệt.
- **Desktop App (CustomTkinter)**: Dành riêng cho nghệ nhân đặt tại bàn xâu hạt, xem chi tiết kích thước và linh kiện khách yêu cầu để kết vòng chuẩn xác.

---

## 🚀 Hướng Dẫn Khởi Chạy

### 1. Khởi Chạy Backend (Cổng 5000)
Mở terminal tại thư mục `backend`:
```powershell
cd backend
npm install
npm start
```
*API hoạt động tại: `http://localhost:5000`*

### 2. Khởi Chạy Frontend (Cổng 3000)
Mở terminal tại thư mục `frontend`:
```powershell
cd frontend
npm install
npm run dev
```
*Truy cập cửa hàng tại: `http://localhost:3000`*

### 3. Khởi Chạy Desktop App (Nếu muốn dùng ứng dụng bàn xâu vòng)
Mở terminal tại thư mục `desktop_app`:
```powershell
cd desktop_app
pip install -r requirements.txt
python app.py
```
*(Bạn cũng có thể quản lý trực tiếp trên Web tại `http://localhost:3000` qua nút **Quản Trị**).*
