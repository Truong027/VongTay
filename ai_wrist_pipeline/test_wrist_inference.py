"""
=============================================================================
KIỂM THỬ ƯỚM VÒNG TAY AR 3D SIÊU THỰC (REALISTIC 3D WRIST AR INFERENCE)
Dự án: Xưởng Vòng Tay - Tự Phối 3D & Ướm Cổ Tay Thật (AR Try-On)
=============================================================================
Tính năng nâng cấp:
1. Thuật toán Cylindrical Wrist Wrapping & Occlusion Culling:
   - Vòng ôm sát cổ tay theo không gian 3D thực tế
   - Chỉ vẽ cung hạt phía trước ôm lên bề mặt da
   - Cung hạt phía sau luồn qua sau cẳng tay và bị che khuất tự nhiên (không còn lỗi dán elip đè lên da)
2. Đổ bóng tiếp xúc (Contact Shadow):
   - Dải bóng mềm in lên da cổ tay bên dưới chuỗi hạt giúp vòng tỳ thật lên tay
3. Mô phỏng hạt 3D & Charm Hoa Hồng 5 Cánh (chuẩn 100% theo ảnh mẫu):
   - Hoa 5 cánh màu hồng phấn xinh xắn với nhụy hoa vàng ánh kim
   - Hạt ngọc trai trắng bóng (Lustrous Pearl) có ánh xà cừ
   - Hạt thạch anh dâu trong suốt (Translucent Strawberry Quartz)
4. Hỗ trợ phím tắt:
   - 'b': Đổi giữa các mẫu vòng (Mẫu Hoa Hồng, Thạch Anh Dâu, Tóc Vàng, Ngọc Bích, Chỉ Đỏ)
   - 'q': Thoát
=============================================================================
"""

import sys
import io
import math
import cv2
import numpy as np
from pathlib import Path

# Đảm bảo in UTF-8 không lỗi charmap trên Windows
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

PIPELINE_DIR = Path(__file__).parent
BEST_PT = PIPELINE_DIR / "weights" / "wrist_yolov8_best.pt"

# Danh sách mẫu vòng AR (Preset #1 là mẫu hoa hồng 5 cánh & ngọc trai giống ảnh của khách)
BRACELET_PRESETS = [
    {
        "id": "pink-floral-pearl",
        "name": "Hoa Hồng Pha Lê & Ngọc Trai (Ảnh Mẫu)",
        "cord_color": (230, 240, 250), # Dây tơ ngọc trai sáng
        "has_flower_charm": True,
        "bead_sequence": [
            {"type": "pearl", "color": (245, 245, 252), "highlight": (255, 255, 255), "radius": 7.5},
            {"type": "flower", "color": (205, 175, 245), "center": (80, 210, 255), "radius": 13.0}, # Hoa hồng 5 cánh
            {"type": "crystal", "color": (240, 225, 250), "highlight": (255, 255, 255), "radius": 6.8},
            {"type": "pearl", "color": (245, 245, 252), "highlight": (255, 255, 255), "radius": 7.2},
            {"type": "rose_quartz", "color": (210, 195, 245), "highlight": (255, 255, 255), "radius": 8.0},
            {"type": "pearl", "color": (245, 245, 252), "highlight": (255, 255, 255), "radius": 7.5},
            {"type": "crystal", "color": (240, 225, 250), "highlight": (255, 255, 255), "radius": 6.8},
            {"type": "pearl", "color": (245, 245, 252), "highlight": (255, 255, 255), "radius": 7.2},
            {"type": "gold_spacer", "color": (80, 190, 240), "highlight": (200, 245, 255), "radius": 4.5},
            {"type": "rose_quartz", "color": (210, 195, 245), "highlight": (255, 255, 255), "radius": 8.0},
            {"type": "pearl", "color": (245, 245, 252), "highlight": (255, 255, 255), "radius": 7.5},
        ]
    },
    {
        "id": "strawberry-quartz",
        "name": "Thạch Anh Dâu Hồng Pastel",
        "cord_color": (155, 130, 217),
        "has_flower_charm": False,
        "bead_sequence": [
            {"type": "rose_quartz", "color": (205, 185, 245), "highlight": (255, 255, 255), "radius": 8.0}
        ] * 12
    },
    {
        "id": "gold-rutile",
        "name": "Thạch Anh Tóc Vàng Tài Lộc",
        "cord_color": (50, 120, 170),
        "has_flower_charm": False,
        "bead_sequence": [
            {"type": "gold", "color": (95, 195, 235), "highlight": (200, 245, 255), "radius": 8.0}
        ] * 12
    },
    {
        "id": "green-jade",
        "name": "Ngọc Bích Sơn Thủy Bình An",
        "cord_color": (60, 90, 60),
        "has_flower_charm": False,
        "bead_sequence": [
            {"type": "jade", "color": (120, 168, 115), "highlight": (210, 245, 210), "radius": 8.0}
        ] * 12
    },
    {
        "id": "red-thread",
        "name": "Chỉ Đỏ May Mắn Bình An",
        "cord_color": (30, 30, 200),
        "has_flower_charm": False,
        "bead_sequence": [
            {"type": "red_coral", "color": (45, 45, 215), "highlight": (160, 160, 255), "radius": 7.0}
        ] * 12
    }
]

def draw_5petal_flower(frame, cx, cy, radius, scale, angle_deg):
    """
    Vẽ charm Bông Hoa 5 Cánh Hồng Phấn siêu thực như trong ảnh mẫu:
    - 5 cánh hoa mềm mại bo tròn màu hồng pastel
    - Viền cánh hoa chuyển sắc
    - Nhụy hoa vàng kem ở giữa
    """
    petal_len = int(radius * 0.95 * scale)
    petal_w = int(radius * 0.65 * scale)
    base_ang = math.radians(angle_deg)

    # 1. Vẽ 5 cánh hoa
    for i in range(5):
        ang = base_ang + (i / 5.0) * math.pi * 2.0
        # Tâm của cánh hoa
        dist = radius * 0.72 * scale
        px = int(cx + math.cos(ang) * dist)
        py = int(cy + math.sin(ang) * dist)

        # Góc xoay cánh hoa theo trục hướng tâm
        rot_deg = math.degrees(ang)

        # Lớp bóng nhẹ cánh hoa
        cv2.ellipse(frame, (px + 1, py + 2), (petal_len, petal_w), rot_deg, 0, 360, (140, 110, 180), -1, cv2.LINE_AA)
        # Thân cánh hoa màu hồng phấn
        cv2.ellipse(frame, (px, py), (petal_len, petal_w), rot_deg, 0, 360, (215, 185, 248), -1, cv2.LINE_AA)
        # Lõi cánh hoa sáng
        cv2.ellipse(frame, (px, py), (int(petal_len * 0.7), int(petal_w * 0.6)), rot_deg, 0, 360, (235, 210, 255), -1, cv2.LINE_AA)

    # 2. Nhụy hoa trung tâm (Golden pistil)
    center_r = max(2, int(radius * 0.42 * scale))
    # Viền nhụy
    cv2.circle(frame, (int(cx), int(cy)), center_r + 1, (80, 160, 210), -1, cv2.LINE_AA)
    # Lòng nhụy vàng ánh kim
    cv2.circle(frame, (int(cx), int(cy)), center_r, (120, 215, 255), -1, cv2.LINE_AA)
    # Điểm sáng phản quang trên nhụy
    shine_pt = (int(cx - center_r * 0.35), int(cy - center_r * 0.35))
    cv2.circle(frame, shine_pt, max(1, int(center_r * 0.3)), (255, 255, 255), -1, cv2.LINE_AA)

def draw_realistic_3d_bead(frame, bx, by, radius, scale, bead_info):
    """
    Vẽ viên hạt 3D chân thực với độ sâu khối cầu, chuyển sắc và ánh phản quang (specular).
    """
    r = int(max(3.0, radius * scale))
    pt = (int(bx), int(by))
    b_color = bead_info.get("color", (245, 245, 252))
    b_type = bead_info.get("type", "pearl")

    # 1. Đáy bóng đổ của hạt
    shadow_col = (max(0, b_color[0] - 50), max(0, b_color[1] - 45), max(0, b_color[2] - 40))
    cv2.circle(frame, (pt[0] + 1, pt[1] + 1), r, shadow_col, -1, cv2.LINE_AA)

    # 2. Thân hạt chính
    cv2.circle(frame, pt, r, b_color, -1, cv2.LINE_AA)

    # 3. Hiệu ứng riêng theo loại hạt
    if b_type == "pearl":
        # Ánh xà cừ ngọc trai
        inner_r = max(1, int(r * 0.68))
        inner_col = (min(255, b_color[0] + 15), min(255, b_color[1] + 15), min(255, b_color[2] + 10))
        cv2.circle(frame, (int(bx - r * 0.15), int(by - r * 0.15)), inner_r, inner_col, -1, cv2.LINE_AA)
    elif b_type == "crystal" or b_type == "rose_quartz":
        # Ánh phản xạ trong suốt
        inner_r = max(1, int(r * 0.55))
        cv2.circle(frame, (int(bx + r * 0.1), int(by + r * 0.1)), inner_r, (255, 245, 255), 1, cv2.LINE_AA)

    # 4. Viền mờ tinh tế
    cv2.circle(frame, pt, r, (255, 255, 255), 1, cv2.LINE_AA)

    # 5. Điểm phản xạ ánh sáng (Specular Highlight)
    shine_r = max(1, int(r * 0.32))
    shine_pt = (int(bx - r * 0.32), int(by - r * 0.32))
    cv2.circle(frame, shine_pt, shine_r, (255, 255, 255), -1, cv2.LINE_AA)

def render_realistic_wrist_tryon(frame, wrist_cx, wrist_cy, wrist_w, angle_deg, forearm_dir, preset):
    """
    Thuật toán 3D Cylindrical Wrist Wrapping & Occlusion Culling:
    - Bám theo đường cong cổ tay
    - Chỉ vẽ cung hạt phía trước (Visible Front Arc) ôm lên da
    - Che khuất cung hạt phía sau luồn sau cẳng tay
    - Đổ bóng tiếp xúc (Contact Shadow) mềm mại in lên da
    """
    scale = max(0.5, min(1.8, wrist_w / 95.0))
    
    # Bán kính elip thiết diện cổ tay người thật (ôm trọn bề ngang cẳng tay)
    rx = wrist_w * 0.50
    ry = rx * 0.32

    # Vị trí rơi tự nhiên của vòng tay:
    # Lùi nhẹ về phía cẳng tay khoảng 0.12 * wrist_w
    rad = math.radians(angle_deg)
    cos_a = math.cos(rad)
    sin_a = math.sin(rad)

    # Hướng vuông góc với bề ngang cổ tay (hướng dọc cẳng tay)
    perp_x = -sin_a
    perp_y = cos_a

    # Tâm vòng tay rơi lùi nhẹ dọc theo cẳng tay
    cx = wrist_cx - perp_x * (wrist_w * 0.12)
    cy = wrist_cy - perp_y * (wrist_w * 0.12)

    bead_seq = preset["bead_sequence"]
    # Chuẩn hóa 11 hạt nhìn thấy trên cung trước (hạt hoa/charm ở vị trí số 5 - chính giữa)
    if len(bead_seq) > 11:
        center_idx = len(bead_seq) // 2
        bead_seq = bead_seq[center_idx - 5 : center_idx + 6]
    total_beads = len(bead_seq)

    # 1. VẼ LỚP BÓNG ĐỔ TIẾP XÚC LÊN DA CỔ TAY (Ambient Contact Shadow)
    # Lớp shadow mô phỏng độ tỳ của chuỗi hạt ôm sát lên da thịt
    shadow_overlay = frame.copy()
    shadow_pts = []
    # Cung trước nhìn thấy (từ -85 độ sang +85 độ)
    for deg in range(-85, 90, 5):
        th = math.radians(deg)
        raw_x = rx * math.sin(th)
        raw_y = ry * math.cos(th)
        rot_x = raw_x * cos_a - raw_y * sin_a
        rot_y = raw_x * sin_a + raw_y * cos_a
        shadow_pts.append([int(cx + rot_x + 1), int(cy + rot_y + 2)])

    if len(shadow_pts) > 2:
        shadow_arr = np.array(shadow_pts, dtype=np.int32)
        cv2.polylines(shadow_overlay, [shadow_arr], isClosed=False, color=(15, 15, 15), thickness=max(4, int(7.5 * scale)), lineType=cv2.LINE_AA)
        cv2.addWeighted(shadow_overlay, 0.45, frame, 0.55, 0, frame)

    # 2. VẼ DÂY NỐI CUNG TRƯỚC (Front Arc Cord)
    cord_pts = []
    for deg in range(-90, 95, 4):
        th = math.radians(deg)
        raw_x = rx * math.sin(th)
        raw_y = ry * math.cos(th)
        rot_x = raw_x * cos_a - raw_y * sin_a
        rot_y = raw_x * sin_a + raw_y * cos_a
        cord_pts.append([int(cx + rot_x), int(cy + rot_y)])

    if len(cord_pts) > 2:
        cord_arr = np.array(cord_pts, dtype=np.int32)
        cv2.polylines(frame, [cord_arr], isClosed=False, color=preset["cord_color"], thickness=max(2, int(2.0 * scale)), lineType=cv2.LINE_AA)

    # 3. PHÂN BỔ & VẼ CÁC VIÊN HẠT TRÊN CUNG NHÌN THẤY (Front Arc Beads)
    front_items = []
    for i in range(total_beads):
        t = (i / (total_beads - 1)) if total_beads > 1 else 0.5
        # Góc từ -84 độ đến +84 độ ôm trọn hai bên sườn cổ tay
        theta = (-math.pi * 0.47) + t * (math.pi * 0.94)

        raw_x = rx * math.sin(theta)
        raw_y = ry * math.cos(theta)

        rot_x = raw_x * cos_a - raw_y * sin_a
        rot_y = raw_x * sin_a + raw_y * cos_a

        bx = cx + rot_x
        by = cy + rot_y

        # Chiều sâu 3D (hạt ở giữa cổ tay gần camera hơn hạt ở 2 mép sườn)
        depth = 0.85 + 0.25 * math.cos(theta)
        bead_info = bead_seq[i]
        front_items.append((bx, by, depth, bead_info, raw_y))

    # Sắp xếp hạt theo chiều sâu z (hạt ở mép vẽ trước, hạt nổi ở giữa vẽ sau cùng)
    front_items.sort(key=lambda item: item[4])

    for bx, by, depth, bead_info, _ in front_items:
        b_type = bead_info.get("type", "pearl")
        eff_scale = scale * depth
        if b_type == "flower":
            # Vẽ bông hoa 5 cánh nổi bật
            draw_5petal_flower(frame, bx, by, bead_info.get("radius", 13.0), eff_scale, angle_deg)
        else:
            draw_realistic_3d_bead(frame, bx, by, bead_info.get("radius", 7.5), eff_scale, bead_info)

def run_live_inference():
    print("=" * 68)
    print("[AI AR] BẮT ĐẦU ƯỚM VÒNG TAY THỜI GIAN THỰC QUA CAMERA")
    print("=" * 68)

    model = None
    try:
        from ultralytics import YOLO
        if BEST_PT.exists():
            print(f"[MODEL] Đang tải mô hình tự train: {BEST_PT}")
            model = YOLO(str(BEST_PT))
        else:
            print("[INFO] Chưa có mô hình riêng đã train. Đang nạp tạm mô hình nền tảng 'yolov8n-pose.pt'...")
            model = YOLO("yolov8n-pose.pt")
    except Exception as e:
        print(f"[INFO] Chạy ở chế độ Computer Vision Skin Contour Real-time ({e})")

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[ERROR] Không thể mở webcam. Hãy kiểm tra lại camera thiết bị!")
        return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    selected_preset_idx = 0
    print("[OK] Camera đã mở sẵn sàng!")
    print("👉 Hướng dẫn trải nghiệm:")
    print("   - Đưa cổ tay vào trước ống kính (nghiêng tự nhiên như ảnh bạn gửi).")
    print("   - Nhấn phím 'b' để chuyển đổi các mẫu vòng tay.")
    print("   - Nhấn phím 'q' để thoát.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1) # Lật gương tự nhiên
        h, w, _ = frame.shape
        preset = BRACELET_PRESETS[selected_preset_idx]

        detected_wrist = False
        wrist_cx = 0
        wrist_cy = 0
        wrist_w = 0
        wrist_ang = 0

        # 1. Thử nhận diện bằng YOLO nếu có
        if model is not None:
            try:
                results = model(frame, verbose=False, conf=0.32)
                if results and len(results) > 0 and results[0].keypoints is not None:
                    kpts = results[0].keypoints.data[0].cpu().numpy()
                    if len(kpts) >= 3:
                        kp0 = kpts[0] # Center
                        kp1 = kpts[1] # Radial
                        kp2 = kpts[2] # Ulnar
                        if kp0[2] > 0.3 and kp1[2] > 0.3 and kp2[2] > 0.3:
                            wrist_cx = kp0[0]
                            wrist_cy = kp0[1]
                            wrist_w = np.hypot(kp2[0] - kp1[0], kp2[1] - kp1[1])
                            wrist_ang = math.degrees(math.atan2(kp2[1] - kp1[1], kp2[0] - kp1[0]))
                            detected_wrist = True
            except Exception:
                pass

        # 2. Thuật toán Computer Vision Skin Tracker dự phòng / bổ trợ cực nhạy
        if not detected_wrist:
            ycrcb = cv2.cvtColor(frame, cv2.COLOR_BGR2YCrCb)
            mask = cv2.inRange(ycrcb, np.array([0, 133, 77]), np.array([255, 173, 127]))
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if contours:
                valid = [c for c in contours if cv2.contourArea(c) > (w * h * 0.05)]
                if valid:
                    largest = max(valid, key=cv2.contourArea)
                    if len(largest) >= 5:
                        ellipse = cv2.fitEllipse(largest)
                        (ecx, ecy), (ew, eh), e_ang = ellipse
                        wrist_w = max(55.0, min(ew, eh) * 0.72)
                        wrist_cx = ecx
                        wrist_cy = ecy + max(ew, eh) * 0.08
                        wrist_ang = e_ang - 90
                        detected_wrist = True

        # Render vòng tay nếu phát hiện cổ tay
        if detected_wrist and wrist_w > 40:
            render_realistic_wrist_tryon(frame, wrist_cx, wrist_cy, wrist_w, wrist_ang, 0, preset)

            # Khung chỉ báo Auto-Snap
            cv2.circle(frame, (int(wrist_cx), int(wrist_cy)), 4, (50, 220, 50), -1)
            cv2.putText(frame, f"AI Wrist Snap: {preset['name']}",
                        (int(wrist_cx - 100), int(wrist_cy - wrist_w * 0.65)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.48, (50, 220, 50), 2, cv2.LINE_AA)

        # HUD Bảng điều khiển thời gian thực
        cv2.rectangle(frame, (15, 15), (520, 95), (18, 18, 18), -1)
        cv2.rectangle(frame, (15, 15), (520, 95), (212, 175, 55), 1)
        cv2.putText(frame, "AR VIRTUAL TRY-ON - XUONG VONG TAY 3D", (25, 42),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.62, (255, 215, 0), 2, cv2.LINE_AA)
        cv2.putText(frame, f"Mau vong: {preset['name']} [Phim 'b' de doi]", (25, 68),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.48, (225, 225, 225), 1, cv2.LINE_AA)
        st_text = "Trang thai: Da khoa co tay & Om sat 3D" if detected_wrist else "Trang thai: Dua co tay vao giua khung camera..."
        st_col = (50, 220, 50) if detected_wrist else (0, 165, 255)
        cv2.putText(frame, st_text, (25, 88), cv2.FONT_HERSHEY_SIMPLEX, 0.42, st_col, 1, cv2.LINE_AA)

        cv2.imshow("AR Bracelet Try-On (Nhu Deo That) - Xuong Vong Tay", frame)
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('b'):
            selected_preset_idx = (selected_preset_idx + 1) % len(BRACELET_PRESETS)

    cap.release()
    cv2.destroyAllWindows()
    print("[AI AR] Đã tắt trải nghiệm webcam.")

if __name__ == "__main__":
    run_live_inference()
