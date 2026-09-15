import cv2
import numpy as np
from test_wrist_inference import render_realistic_wrist_tryon, BRACELET_PRESETS

img = cv2.imread('dataset/raw_images/synthetic_wrist_0000.jpg')
h, w, _ = img.shape
preset = BRACELET_PRESETS[0] # Hoa Hồng Pha Lê & Ngọc Trai (Ảnh Mẫu)

# Tọa độ cổ tay mẫu (giống góc nghiêng ảnh khách gửi ~42 độ)
wrist_cx = 390.0
wrist_cy = 385.0
wrist_w = 95.0
angle_deg = 42.0

render_realistic_wrist_tryon(img, wrist_cx, wrist_cy, wrist_w, angle_deg, 0, preset)

cv2.imwrite('dataset/test_render_result.jpg', img)
print('Saved test render to dataset/test_render_result.jpg')
