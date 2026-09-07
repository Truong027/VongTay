"""
KHÁNHVYMADE - ỨNG DỤNG DESKTOP QUẢN LÝ XƯỞNG & ĐƠN HÀNG VÒNG TAY
Giao diện hiện đại sử dụng CustomTkinter kết nối Backend API.
"""

import sys
import json
import threading

API_BASE_URL = "http://localhost:5000/api"

try:
    import customtkinter as ctk
    import requests
    from PIL import Image
except ImportError as e:
    print("\n" + "="*70)
    print("THÔNG BÁO KHỞI CHẠY DESKTOP APP (CustomTkinter):")
    print(f"Lỗi thiếu thư viện: {e}")
    print("Vui lòng cài đặt các gói cần thiết bằng lệnh:")
    print("   pip install customtkinter requests pillow")
    print("Lưu ý: Trên Windows, hãy chắc chắn rằng tùy chọn 'tcl/tk and IDLE' đã được chọn khi cài Python.")
    print(f"Hoặc sử dụng ngay cổng Quản Trị Web trực tiếp tại: http://localhost:3000 (nhấn nút 'Quản Trị')")
    print("="*70 + "\n")
    sys.exit(0)

# Cấu hình CustomTkinter
ctk.set_appearance_mode("Dark")  # Options: "System", "Dark", "Light"
ctk.set_default_color_theme("blue")  # Themes: "blue", "green", "dark-blue"

class BraceletWorkshopApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("KhánhVyMade - Quản Lý Xưởng Vòng Tay & Đơn Hàng")
        self.geometry("1100x700")
        self.minsize(950, 600)

        self.orders = []
        self.selected_order = None

        # Cấu hình layout chính 2 cột (Sidebar bên trái, Content bên phải)
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        self._create_sidebar()
        self._create_main_content()

        # Tải dữ liệu ban đầu
        self.refresh_orders()

    def _create_sidebar(self):
        self.sidebar_frame = ctk.CTkFrame(self, width=220, corner_radius=0)
        self.sidebar_frame.grid(row=0, column=0, sticky="nsew")
        self.sidebar_frame.grid_rowconfigure(5, weight=1)

        # Logo & Tên Xưởng
        self.logo_label = ctk.CTkLabel(
            self.sidebar_frame, 
            text="📿 KHÁNHVYMADE", 
            font=ctk.CTkFont(size=20, weight="bold")
        )
        self.logo_label.grid(row=0, column=0, padx=20, pady=(20, 5))

        self.sub_label = ctk.CTkLabel(
            self.sidebar_frame, 
            text="Artisan Workbench POS", 
            font=ctk.CTkFont(size=12)
        )
        self.sub_label.grid(row=1, column=0, padx=20, pady=(0, 20))

        # Nút chức năng
        self.btn_refresh = ctk.CTkButton(
            self.sidebar_frame, 
            text="🔄 Làm Mới Đơn Hàng", 
            command=self.refresh_orders,
            fg_color="#B86244",
            hover_color="#A05237"
        )
        self.btn_refresh.grid(row=2, column=0, padx=20, pady=10)

        # Theme Switcher
        self.appearance_label = ctk.CTkLabel(self.sidebar_frame, text="Giao diện hiển thị:", anchor="w")
        self.appearance_label.grid(row=6, column=0, padx=20, pady=(10, 0))

        self.appearance_mode_menu = ctk.CTkOptionMenu(
            self.sidebar_frame, 
            values=["Dark", "Light", "System"],
            command=self.change_appearance_mode
        )
        self.appearance_mode_menu.grid(row=7, column=0, padx=20, pady=(5, 20))

    def _create_main_content(self):
        self.main_frame = ctk.CTkFrame(self, corner_radius=10)
        self.main_frame.grid(row=0, column=1, sticky="nsew", padx=15, pady=15)
        self.main_frame.grid_columnconfigure(0, weight=3)
        self.main_frame.grid_columnconfigure(1, weight=2)
        self.main_frame.grid_rowconfigure(1, weight=1)

        # Header bar
        self.header_label = ctk.CTkLabel(
            self.main_frame, 
            text="Danh Sách Đơn Hàng Cần Chế Tác", 
            font=ctk.CTkFont(size=18, weight="bold")
        )
        self.header_label.grid(row=0, column=0, columnspan=2, padx=15, pady=(15, 10), sticky="w")

        # Cột trái: Bảng danh sách đơn hàng
        self.orders_scroll = ctk.CTkScrollableFrame(self.main_frame, label_text="Đơn hàng gần đây")
        self.orders_scroll.grid(row=1, column=0, sticky="nsew", padx=(15, 7), pady=(0, 15))

        # Cột phải: Chi tiết đơn hàng & Điều phối nghệ nhân
        self.detail_frame = ctk.CTkFrame(self.main_frame)
        self.detail_frame.grid(row=1, column=1, sticky="nsew", padx=(7, 15), pady=(0, 15))
        self._setup_detail_panel()

    def _setup_detail_panel(self):
        self.detail_title = ctk.CTkLabel(
            self.detail_frame, 
            text="Chi Tiết Đơn Hàng", 
            font=ctk.CTkFont(size=16, weight="bold")
        )
        self.detail_title.pack(anchor="w", padx=15, pady=(15, 10))

        self.detail_text = ctk.CTkTextbox(self.detail_frame, wrap="word", height=320)
        self.detail_text.pack(fill="both", expand=True, padx=15, pady=5)
        self.detail_text.insert("1.0", "Chọn một đơn hàng từ danh sách bên trái để xem thông số xâu hạt của khách.")
        self.detail_text.configure(state="disabled")

        # Nút chuyển trạng thái nhanh
        self.btn_crafting = ctk.CTkButton(
            self.detail_frame,
            text="🔨 Bắt Đầu Kết Hạt Thủ Công",
            fg_color="#D97706",
            hover_color="#B45309",
            command=lambda: self.update_status("Đang kết hạt thủ công")
        )
        self.btn_crafting.pack(fill="x", padx=15, pady=(10, 5))

        self.btn_completed = ctk.CTkButton(
            self.detail_frame,
            text="✓ Hoàn Thiện Vòng (Chuẩn Bị Giao)",
            fg_color="#059669",
            hover_color="#047857",
            command=lambda: self.update_status("Đã hoàn thiện, chuẩn bị giao")
        )
        self.btn_completed.pack(fill="x", padx=15, pady=5)

        self.btn_shipping = ctk.CTkButton(
            self.detail_frame,
            text="🚚 Bàn Giao Bưu Tá (Đang Giao)",
            fg_color="#2563EB",
            hover_color="#1D4ED8",
            command=lambda: self.update_status("Đang giao hàng")
        )
        self.btn_shipping.pack(fill="x", padx=15, pady=(5, 15))

    def refresh_orders(self):
        def fetch():
            try:
                res = requests.get(f"{API_BASE_URL}/orders", timeout=5)
                if res.status_code == 200:
                    data = res.json()
                    self.orders = data.get("data", [])
                    self.after(0, self._render_orders)
                else:
                    print("Lỗi tải đơn hàng:", res.status_code)
            except Exception as ex:
                print("Lỗi kết nối Backend:", ex)

        threading.Thread(target=fetch, daemon=True).start()

    def _render_orders(self):
        # Xóa các widget cũ trong scroll frame
        for widget in self.orders_scroll.winfo_children():
            widget.destroy()

        if not self.orders:
            lbl = ctk.CTkLabel(self.orders_scroll, text="Chưa có đơn hàng nào hoặc backend chưa khởi động.")
            lbl.pack(pady=20)
            return

        for order in self.orders:
            card = ctk.CTkFrame(self.orders_scroll)
            card.pack(fill="x", pady=5, padx=5)

            header_text = f"#{order.get('id')} - {order.get('customerName')} ({order.get('phone')})"
            header = ctk.CTkLabel(card, text=header_text, font=ctk.CTkFont(weight="bold"))
            header.pack(anchor="w", padx=10, pady=(8, 2))

            status_text = f"Trạng thái: {order.get('orderStatus')} | Tiền: {order.get('totalAmount', 0):,}₫"
            sub = ctk.CTkLabel(card, text=status_text, font=ctk.CTkFont(size=11), text_color="#A3A3A3")
            sub.pack(anchor="w", padx=10, pady=(0, 5))

            btn_view = ctk.CTkButton(
                card, 
                text="Xem Chi Tiết Mẫu Vòng", 
                height=26, 
                font=ctk.CTkFont(size=11),
                command=lambda o=order: self.show_order_detail(o)
            )
            btn_view.pack(anchor="e", padx=10, pady=(0, 8))

    def show_order_detail(self, order):
        self.selected_order = order
        self.detail_text.configure(state="normal")
        self.detail_text.delete("1.0", "end")

        content = []
        content.append(f"MÃ ĐƠN HÀNG: #{order.get('id')}")
        content.append(f"Khách hàng: {order.get('customerName')}")
        content.append(f"Điện thoại: {order.get('phone')}")
        content.append(f"Địa chỉ: {order.get('address')}")
        content.append(f"Hình thức TT: {order.get('paymentMethod')} ({order.get('paymentStatus')})")
        content.append(f"Trạng thái hiện tại: {order.get('orderStatus')}\n")
        content.append("="*40)
        content.append("DANH SÁCH VÒNG TAY CẦN ĐAN:")

        for idx, item in enumerate(order.get("items", []), start=1):
            content.append(f"\n{idx}. {item.get('name')} x {item.get('quantity', 1)}")
            if item.get("isCustom") and item.get("customDetails"):
                cd = item.get("customDetails")
                content.append(f"   • DÂY: {cd.get('cord')}")
                content.append(f"   • ĐÁ CHÍNH: {cd.get('mainBead')} (Tổng: {cd.get('beadCount')} hạt)")
                if cd.get("secondaryBead") and cd.get("secondaryBead") != "Không xen kẽ":
                    content.append(f"   • ĐÁ PHỐI: {cd.get('secondaryBead')}")
                content.append(f"   • CHARM BẠC: {cd.get('charm')}")
                if cd.get("letter"):
                    content.append(f"   • CHỮ KHẮC RIÊNG: [{cd.get('letter')}]")
                content.append(f"   • SIZE CỔ TAY: {cd.get('size')}")
            else:
                content.append(f"   • Size cổ tay: {item.get('wristSize')}")

            if item.get("note"):
                content.append(f"   • Ghi chú riêng: {item.get('note')}")

        content.append("\n" + "="*40)
        content.append(f"TỔNG THANH TOÁN: {order.get('totalAmount', 0):,}₫")

        self.detail_text.insert("1.0", "\n".join(content))
        self.detail_text.configure(state="disabled")

    def update_status(self, new_status):
        if not self.selected_order:
            return

        order_id = self.selected_order.get("id")

        def task():
            try:
                res = requests.patch(
                    f"{API_BASE_URL}/orders/{order_id}/status",
                    json={"orderStatus": new_status},
                    timeout=5
                )
                if res.status_code == 200:
                    updated = res.json().get("data", {})
                    self.selected_order = updated
                    self.after(0, lambda: self.show_order_detail(updated))
                    self.after(0, self.refresh_orders)
            except Exception as ex:
                print("Lỗi cập nhật trạng thái:", ex)

        threading.Thread(target=task, daemon=True).start()

    def change_appearance_mode(self, mode: str):
        ctk.set_appearance_mode(mode)

if __name__ == "__main__":
    app = BraceletWorkshopApp()
    app.mainloop()
