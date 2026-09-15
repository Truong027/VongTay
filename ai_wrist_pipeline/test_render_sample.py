import os
import cv2
import numpy as np
from test_wrist_inference import render_realistic_wrist_tryon, BRACELET_PRESETS

cur_dir = os.path.dirname(os.path.abspath(__file__))
img_path = os.path.join(cur_dir, 'dataset', 'raw_images', 'synthetic_wrist_0000.jpg')
img = cv2.imread(img_path)
h, w, _ = img.shape
preset = BRACELET_PRESETS[0] # Hoa Hồng Pha Lê & Ngọc Trai (Ảnh Mẫu)

# Tọa độ cổ tay mẫu (giống góc nghiêng ảnh khách gửi ~42 độ)
wrist_cx = 390.0
wrist_cy = 385.0
wrist_w = 95.0
angle_deg = 42.0

render_realistic_wrist_tryon(img, wrist_cx, wrist_cy, wrist_w, angle_deg, 0, preset)

out_path = os.path.join(cur_dir, 'dataset', 'test_render_result.jpg')
cv2.imwrite(out_path, img)
print(f'Saved test render to {out_path}')
