import os
import cv2
import numpy as np
import random

random.seed(42)
np.random.seed(42)

SOURCE_DIR = r'e:\VIBANVONGTAY\anhtrain'
DATASET_DIR = r'e:\VIBANVONGTAY\ai_wrist_pipeline\dataset'
TRAIN_IMG_DIR = os.path.join(DATASET_DIR, 'images', 'train')
VAL_IMG_DIR = os.path.join(DATASET_DIR, 'images', 'val')
TRAIN_LBL_DIR = os.path.join(DATASET_DIR, 'labels', 'train')
VAL_LBL_DIR = os.path.join(DATASET_DIR, 'labels', 'val')
PREVIEW_DIR = os.path.join(DATASET_DIR, 'user_preview')

for p in [TRAIN_IMG_DIR, VAL_IMG_DIR, TRAIN_LBL_DIR, VAL_LBL_DIR, PREVIEW_DIR]:
    os.makedirs(p, exist_ok=True)

# 11 Ground-truth annotations on the user's actual wrist photos
ANNOTATIONS = [
    {
        'idx': 0,
        'radial': (0.41, 0.41), 'center': (0.52, 0.44), 'ulnar': (0.66, 0.47),
        'palm': (0.58, 0.25), 'forearm': (0.45, 0.65),
        'bbox': (0.15, 0.05, 0.80, 0.98)
    },
    {
        'idx': 1,
        'radial': (0.46, 0.60), 'center': (0.52, 0.60), 'ulnar': (0.60, 0.59),
        'palm': (0.49, 0.35), 'forearm': (0.50, 0.80),
        'bbox': (0.30, 0.08, 0.68, 0.98)
    },
    {
        'idx': 2,
        'radial': (0.42, 0.52), 'center': (0.51, 0.53), 'ulnar': (0.60, 0.53),
        'palm': (0.51, 0.44), 'forearm': (0.51, 0.75),
        'bbox': (0.32, 0.18, 0.65, 0.98)
    },
    {
        'idx': 3,
        'radial': (0.26, 0.60), 'center': (0.38, 0.60), 'ulnar': (0.50, 0.60),
        'palm': (0.37, 0.73), 'forearm': (0.30, 0.35),
        'bbox': (0.05, 0.05, 0.55, 0.92)
    },
    {
        'idx': 4,
        'radial': (0.34, 0.52), 'center': (0.45, 0.52), 'ulnar': (0.57, 0.52),
        'palm': (0.46, 0.65), 'forearm': (0.43, 0.25),
        'bbox': (0.15, 0.05, 0.70, 0.88)
    },
    {
        'idx': 5,
        'radial': (0.55, 0.43), 'center': (0.55, 0.54), 'ulnar': (0.55, 0.67),
        'palm': (0.70, 0.55), 'forearm': (0.30, 0.56),
        'bbox': (0.05, 0.38, 0.98, 0.75)
    },
    {
        'idx': 6,
        'radial': (0.36, 0.42), 'center': (0.49, 0.45), 'ulnar': (0.63, 0.46),
        'palm': (0.50, 0.30), 'forearm': (0.42, 0.70),
        'bbox': (0.05, 0.05, 0.70, 0.98)
    },
    {
        'idx': 7,
        'radial': (0.05, 0.38), 'center': (0.20, 0.38), 'ulnar': (0.34, 0.38),
        'palm': (0.20, 0.20), 'forearm': (0.24, 0.65),
        'bbox': (0.01, 0.02, 0.40, 0.98)
    },
    {
        'idx': 8,
        'radial': (0.37, 0.51), 'center': (0.50, 0.52), 'ulnar': (0.65, 0.54),
        'palm': (0.55, 0.35), 'forearm': (0.36, 0.72),
        'bbox': (0.05, 0.05, 0.88, 0.98)
    },
    {
        'idx': 9,
        'radial': (0.20, 0.48), 'center': (0.35, 0.48), 'ulnar': (0.50, 0.48),
        'palm': (0.35, 0.38), 'forearm': (0.30, 0.72),
        'bbox': (0.08, 0.10, 0.60, 0.98)
    },
    {
        'idx': 10,
        'radial': (0.35, 0.51), 'center': (0.49, 0.52), 'ulnar': (0.64, 0.52),
        'palm': (0.55, 0.35), 'forearm': (0.30, 0.75),
        'bbox': (0.05, 0.18, 0.95, 0.98)
    }
]

files = sorted([f for f in os.listdir(SOURCE_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])

def transform_pt(M, pt):
    px, py = pt
    rx = M[0, 0] * px + M[0, 1] * py + M[0, 2]
    ry = M[1, 0] * px + M[1, 1] * py + M[1, 2]
    return (rx, ry)

def augment_sample(img, ann, rot_angle, scale_factor, flip_h, brightness_factor, tx_pct=0, ty_pct=0):
    h, w = img.shape[:2]
    
    # 1. Flip horizontally if requested (swaps radial and ulnar for mirror hand)
    if flip_h:
        img_work = cv2.flip(img, 1)
        r = (1.0 - ann['radial'][0], ann['radial'][1])
        u = (1.0 - ann['ulnar'][0], ann['ulnar'][1])
        c = (1.0 - ann['center'][0], ann['center'][1])
        p = (1.0 - ann['palm'][0], ann['palm'][1])
        fa = (1.0 - ann['forearm'][0], ann['forearm'][1])
        bx1 = 1.0 - ann['bbox'][2]
        bx2 = 1.0 - ann['bbox'][0]
        bbox = (bx1, ann['bbox'][1], bx2, ann['bbox'][3])
        # Note: when flipped, radial and ulnar anatomical sides switch
        kpts = [u, c, r, p, fa]
    else:
        img_work = img.copy()
        kpts = [ann['radial'], ann['center'], ann['ulnar'], ann['palm'], ann['forearm']]
        bbox = ann['bbox']

    # Convert normalized to pixel coords
    kpts_px = [(pt[0] * w, pt[1] * h) for pt in kpts]
    bx1, by1, bx2, by2 = bbox[0]*w, bbox[1]*h, bbox[2]*w, bbox[3]*h
    box_pts = [(bx1, by1), (bx2, by1), (bx2, by2), (bx1, by2)]

    # 2. Affine rotation + scale + translation
    center_pt = (w / 2.0, h / 2.0)
    M = cv2.getRotationMatrix2D(center_pt, rot_angle, scale_factor)
    M[0, 2] += tx_pct * w
    M[1, 2] += ty_pct * h

    aug_img = cv2.warpAffine(img_work, M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

    # Transform keypoints
    aug_kpts = [transform_pt(M, pt) for pt in kpts_px]
    aug_box_pts = [transform_pt(M, pt) for pt in box_pts]

    # Recompute bounding box
    xs = [pt[0] for pt in aug_box_pts]
    ys = [pt[1] for pt in aug_box_pts]
    new_bx1 = max(0, min(xs))
    new_by1 = max(0, min(ys))
    new_bx2 = min(w - 1, max(xs))
    new_by2 = min(h - 1, max(ys))

    # 3. Adjust brightness & contrast
    if brightness_factor != 1.0:
        aug_img = np.clip(aug_img.astype(np.float32) * brightness_factor, 0, 255).astype(np.uint8)

    # 4. Normalize keypoints and bbox for YOLO
    norm_kpts = []
    for kx, ky in aug_kpts:
        nx = max(0.001, min(0.999, kx / float(w)))
        ny = max(0.001, min(0.999, ky / float(h)))
        norm_kpts.append((nx, ny, 2.0)) # 2 = visible

    bw = (new_bx2 - new_bx1) / float(w)
    bh = (new_by2 - new_by1) / float(h)
    bcx = (new_bx1 + new_bx2) / (2.0 * w)
    bcy = (new_by1 + new_by2) / (2.0 * h)
    
    bw = max(0.05, min(0.99, bw))
    bh = max(0.05, min(0.99, bh))
    bcx = max(0.01, min(0.99, bcx))
    bcy = max(0.01, min(0.99, bcy))

    # YOLO pose format line:
    # 0 bcx bcy bw bh k1_x k1_y 2 k2_x k2_y 2 ... k5_x k5_y 2
    kpts_str = " ".join([f"{nx:.5f} {ny:.5f} 2" for nx, ny, _ in norm_kpts])
    yolo_line = f"0 {bcx:.5f} {bcy:.5f} {bw:.5f} {bh:.5f} {kpts_str}\n"

    return aug_img, yolo_line, (new_bx1, new_by1, new_bx2, new_by2), aug_kpts

# Generate comprehensive augmentations
sample_counter = 0
train_count = 0
val_count = 0

angles = [-25, -15, -8, 0, 8, 15, 25]
scales = [0.90, 1.00, 1.10]
flips = [False, True]
brightness_list = [0.88, 1.00, 1.15]

# Resize images to 640x640 for fast, high-resolution training
TARGET_SIZE = 640

for ann in ANNOTATIONS:
    idx = ann['idx']
    fname = files[idx]
    orig_img = cv2.imread(os.path.join(SOURCE_DIR, fname))
    if orig_img is None:
        continue
    
    # 1. Base unaugmented version
    for flip in flips:
        for rot in angles:
            for sc in [1.0]:
                for br in [0.92, 1.08]:
                    aug_img, yolo_line, bbox_px, kpts_px = augment_sample(
                        orig_img, ann, rot_angle=rot, scale_factor=sc, flip_h=flip, brightness_factor=br
                    )
                    
                    # Resize to target size for training
                    h, w = aug_img.shape[:2]
                    resized_img = cv2.resize(aug_img, (TARGET_SIZE, TARGET_SIZE))

                    # 80/20 train/val split
                    is_val = (sample_counter % 5 == 0)
                    split_dir = VAL_IMG_DIR if is_val else TRAIN_IMG_DIR
                    lbl_dir = VAL_LBL_DIR if is_val else TRAIN_LBL_DIR
                    prefix = 'val' if is_val else 'train'
                    
                    img_name = f"{prefix}_user_wrist_{sample_counter:04d}.jpg"
                    lbl_name = f"{prefix}_user_wrist_{sample_counter:04d}.txt"

                    cv2.imwrite(os.path.join(split_dir, img_name), resized_img, [cv2.IMWRITE_JPEG_QUALITY, 95])
                    with open(os.path.join(lbl_dir, lbl_name), 'w') as f:
                        f.write(yolo_line)

                    # Save first 8 previews
                    if sample_counter < 8:
                        pv = resized_img.copy()
                        # Draw keypoints on preview
                        parts = yolo_line.strip().split()
                        bcx, bcy, bw, bh = [float(x) for x in parts[1:5]]
                        bx1 = int((bcx - bw/2) * TARGET_SIZE)
                        by1 = int((bcy - bh/2) * TARGET_SIZE)
                        bx2 = int((bcx + bw/2) * TARGET_SIZE)
                        by2 = int((bcy + bh/2) * TARGET_SIZE)
                        cv2.rectangle(pv, (bx1, by1), (bx2, by2), (255, 255, 0), 2)
                        
                        kpts = []
                        for ki in range(5):
                            kx = int(float(parts[5 + ki*3]) * TARGET_SIZE)
                            ky = int(float(parts[6 + ki*3]) * TARGET_SIZE)
                            kpts.append((kx, ky))
                            cv2.circle(pv, (kx, ky), 7, (0, 255, 255), -1)
                        # Draw wrist line
                        cv2.line(pv, kpts[0], kpts[2], (0, 0, 255), 3)
                        # Draw arm axis
                        cv2.line(pv, kpts[3], kpts[4], (0, 255, 0), 2)
                        cv2.imwrite(os.path.join(PREVIEW_DIR, f"preview_{sample_counter:02d}.jpg"), pv)

                    if is_val:
                        val_count += 1
                    else:
                        train_count += 1
                    sample_counter += 1

print(f"Dataset generated successfully!")
print(f"Total samples: {sample_counter} (Train: {train_count}, Val: {val_count})")
