"""
=============================================================================
KIỂM THỬ THỜI GIAN THỰC QUA WEBCAM (REAL-TIME WEBCAM WRIST AR INFERENCE)
Dự án: Xưởng Vòng Tay - Tự Phối 3D & Ướm Cổ Tay Thật
=============================================================================
Tính năng:
- Mở webcam máy tính, nhận diện cổ tay bằng mô hình YOLOv8 vừa train
- Tự động khóa vị trí (Auto-Snap) và vẽ vòng tay đá quý ảo 3D ôm khít cổ tay
- Tự co giãn kích thước hạt & góc nghiêng theo chuyển động cổ tay thật
- Phím tắt: 'q' để thoát, 'b' để đổi mẫu vòng tay (Thạch Anh Dâu / Tóc Vàng / Mắt Hổ / Chỉ Đỏ)
=============================================================================
"""

import sys
import math
import cv2
import numpy as np
from pathlib import Path

PIPELINE_DIR = Path(__file__).parent
BEST_PT = PIPELINE_DIR / "weights" / "wrist_yolov8_best.pt"

# Danh sách bảng màu các mẫu vòng mẫu
BRACELET_PRESETS = [
    {"name": "Thạch Anh Dâu Hồng", "bead_color": (208, 198, 247), "cord_color": (155, 130, 217), "charm": "Hoa Sen Bạc"},
    {"name": "Thạch Anh Tóc Vàng", "bead_color": (101, 194, 230), "cord_color": (40, 104, 140), "charm": "Đồng Xu Vàng"},
    {"name": "Ngọc Bích Bình An", "bead_color": (133, 168, 120), "cord_color": (69, 92, 58), "charm": "Cỏ 4 Lá"},
    {"name": "Chỉ Đỏ Ngũ Sắc", "bead_color": (61, 61, 196), "cord_color": (27, 27, 158), "charm": "Chuông Bạc 925"}
]

def draw_virtual_bracelet(frame, center_x, center_y, width, angle_deg, preset):
    """Vẽ vòng tay ảo theo phối cảnh 3D elip ôm quanh cổ tay."""
    scale = max(0.5, min(2.0, width / 90.0))
    rx = int(width * 0.72)
    ry = int(rx * 0.48)
    cx = int(center_x)
    cy = int(center_y)

    total_beads = 18
    bead_items = []
    angle_rad = math.radians(angle_deg)
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)

    for i in range(total_beads):
        theta = (i / total_beads) * 2 * math.pi
        raw_x = rx * math.cos(theta)
        raw_y = ry * math.sin(theta)

        # Xoay theo góc nghiêng cánh tay
        rot_x = raw_x * cos_a - raw_y * sin_a
        rot_y = raw_x * sin_a + raw_y * cos_a

        bx = cx + rot_x
        by = cy + rot_y

        depth = 0.8 + 0.35 * math.sin(theta)
        bead_r = int(8.0 * scale * depth)
        bead_items.append((bx, by, bead_r, depth, raw_y))

    # Sắp xếp hạt từ sau ra trước (hạt ở trên vẽ trước, hạt ở dưới/phía trước vẽ sau)
    bead_items.sort(key=lambda item: item[4])

    # 1. Vẽ dây luồn elip
    cv2.ellipse(frame, (cx, cy), (rx, ry), angle_deg, 0, 360, preset["cord_color"], 3, cv2.LINE_AA)

    # 2. Vẽ từng viên đá quý với hiệu ứng bóng sáng
    for bx, by, br, depth, _ in bead_items:
        pt = (int(bx), int(by))
        # Màu chính của hạt
        cv2.circle(frame, pt, br, preset["bead_color"], -1, cv2.LINE_AA)
        # Viền hạt
        cv2.circle(frame, pt, br, (255, 255, 255), 1, cv2.LINE_AA)
        # Điểm sáng phản quang (Specular Highlight)
        shine_pt = (int(bx - br * 0.3), int(by - br * 0.3))
        shine_r = max(1, int(br * 0.28))
        cv2.circle(frame, shine_pt, shine_r, (255, 255, 255), -1, cv2.LINE_AA)

    # 3. Vẽ Charm lủng lẳng ở đáy vòng
    charm_offset_x = -ry * sin_a * 1.08
    charm_offset_y = ry * cos_a * 1.08
    charm_cx = int(cx + charm_offset_x)
    charm_cy = int(cy + charm_offset_y)

    cv2.circle(frame, (charm_cx, charm_cy), int(11 * scale), (235, 225, 210), -1, cv2.LINE_AA)
    cv2.circle(frame, (charm_cx, charm_cy), int(11 * scale), (68, 98, 184), 2, cv2.LINE_AA)
    cv2.putText(frame, "925", (charm_cx - int(9 * scale), charm_cy + int(4 * scale)),
                cv2.FONT_HERSHEY_SIMPLEX, 0.35 * scale, (28, 33, 38), 1, cv2.LINE_AA)

def run_live_inference():
    print("=" * 65)
    print("🎥 BẮT ĐẦU CHẠY THỬ NGHIỆM ƯỚM VÒNG QUA WEBCAM")
    print("=" * 65)

    try:
        from ultralytics import YOLO
    except ImportError:
        print("❌ Vui lòng cài đặt ultralytics: pip install ultralytics")
        return

    # Tải mô hình đã train, nếu chưa có thì dùng tạm pretrained
    if BEST_PT.exists():
        print(f"✅ Đang dùng mô hình tự train: {BEST_PT}")
        model = YOLO(str(BEST_PT))
    else:
        print("ℹ️ Chưa có mô hình riêng đã train. Đang nạp tạm mô hình nền tảng 'yolov8n-pose.pt'...")
        model = YOLO("yolov8n-pose.pt")

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Không mở được Webcam! Kiểm tra camera của bạn.")
        return

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

    selected_preset_idx = 0
    print("🟢 Webcam đã sẵn sàng!")
    print("👉 Hướng dẫn:")
    print("   - Giơ cổ tay vào trước ống kính camera.")
    print("   - Nhấn phím 'b' để chuyển đổi các mẫu vòng tay.")
    print("   - Nhấn phím 'q' để thoát.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)  # Lật gương cho tự nhiên
        h, w, _ = frame.shape

        # Dự đoán với YOLO
        results = model(frame, verbose=False, conf=0.35)
        preset = BRACELET_PRESETS[selected_preset_idx]

        detected_wrist = False

        if results and len(results) > 0:
            res = results[0]
            if res.keypoints is not None and len(res.keypoints) > 0:
                kpts = res.keypoints.data[0].cpu().numpy()  # [N_kpts, 3]

                if len(kpts) >= 3:
                    kp1 = kpts[0]  # Tâm cổ tay
                    kp2 = kpts[1]  # Mỏm trâm quay
                    kp3 = kpts[2]  # Mỏm trâm trụ

                    if kp1[2] > 0.35 and kp2[2] > 0.35 and kp3[2] > 0.35:
                        cx, cy = kp1[0], kp1[1]
                        wrist_w = np.hypot(kp3[0] - kp2[0], kp3[1] - kp2[1])
                        angle_rad = math.atan2(kp3[1] - kp2[1], kp3[0] - kp2[0])
                        angle_deg = math.degrees(angle_rad)

                        draw_virtual_bracelet(frame, cx, cy, wrist_w, angle_deg, preset)

                        # Vẽ khung chỉ báo AI Auto-Lock
                        cv2.circle(frame, (int(cx), int(cy)), 5, (50, 220, 50), -1)
                        cv2.putText(frame, f"AI Auto-Snap: {preset['name']}",
                                    (int(cx - 80), int(cy - wrist_w * 0.6)),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (50, 220, 50), 2)
                        detected_wrist = True

        # HUD Thông tin trên màn hình
        cv2.rectangle(frame, (10, 10), (450, 85), (20, 20, 20), -1)
        cv2.putText(frame, "AR BRACELET VIRTUAL TRY-ON (YOLOv8)", (20, 35),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 215, 0), 2)
        cv2.putText(frame, f"Mau vong: {preset['name']} (Phim 'b' de doi)", (20, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (220, 220, 220), 1)
        status_text = "Trang thai: Da khoa co tay" if detected_wrist else "Trang thai: Dat co tay vao khung"
        status_color = (50, 220, 50) if detected_wrist else (0, 140, 255)
        cv2.putText(frame, status_text, (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.45, status_color, 1)

        cv2.imshow("AR Bracelet Try-On - Xuong Vong Tay", frame)
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('b'):
            selected_preset_idx = (selected_preset_idx + 1) % len(BRACELET_PRESETS)

    cap.release()
    cv2.destroyAllWindows()
    print("👋 Đã tắt kiểm thử webcam.")

if __name__ == "__main__":
    run_live_inference()
