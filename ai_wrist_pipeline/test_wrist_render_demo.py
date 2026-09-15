import cv2
import math
import numpy as np
from test_wrist_inference import render_realistic_wrist_tryon, BRACELET_PRESETS

img = cv2.imread('dataset/raw_images/synthetic_wrist_0000.jpg')
preset = BRACELET_PRESETS[0] # Hoa Hồng 5 Cánh & Ngọc Trai Trắng

# Tọa độ chính xác của nếp gấp cổ tay trong ảnh synthetic_wrist_0000:
# (383, 471) đến (458, 381)
p1 = np.array([383.0, 471.0])
p2 = np.array([458.0, 381.0])
wrist_center = (p1 + p2) / 2.0
wrist_w = np.linalg.norm(p2 - p1)
angle_deg = math.degrees(math.atan2(p2[1] - p1[1], p2[0] - p1[0]))

print(f"Wrist center: {wrist_center}, Width: {wrist_w:.1f}, Angle: {angle_deg:.1f}")
render_realistic_wrist_tryon(img, wrist_center[0], wrist_center[1], wrist_w, angle_deg, 0, preset)

cv2.imwrite('dataset/test_render_exact.jpg', img)
print("Saved dataset/test_render_exact.jpg successfully!")
