import os
import sys
import io
import requests
import hashlib
from pathlib import Path
from PIL import Image
from io import BytesIO

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

RAW_DIR = Path(__file__).parent / "dataset" / "raw_images"
RAW_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": "VIBANVONGTAY_AI_Research/1.0 (https://github.com/Truong027/VongTay; contact: ai@vibanvongtay.vn)"
}

QUERIES = [
    "Wrist",
    "Human wrist",
    "Hand wrist",
    "Wrist joint",
    "Wrist flexion",
    "Wrist watch",
    "Arm wrist",
    "Bare wrist"
]

def save_image(img_bytes, prefix="real_wrist"):
    try:
        img = Image.open(BytesIO(img_bytes)).convert("RGB")
        w, h = img.size
        if w < 240 or h < 240:
            return None
        max_dim = 800
        if max(w, h) > max_dim:
            if w > h:
                new_w, new_h = max_dim, int(h * max_dim / w)
            else:
                new_w, new_h = int(w * max_dim / h), max_dim
            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        fhash = hashlib.md5(img_bytes).hexdigest()[:10]
        out_path = RAW_DIR / f"{prefix}_{fhash}.jpg"
        img.save(out_path, "JPEG", quality=92)
        return out_path
    except Exception as e:
        return None

def fetch_wikimedia(query, limit=15):
    url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": query,
        "gsrnamespace": 6,
        "gsrlimit": limit,
        "prop": "imageinfo",
        "iiprop": "url|size|mime"
    }
    count = 0
    try:
        r = requests.get(url, params=params, headers=HEADERS, timeout=12)
        if r.status_code != 200:
            return 0
        pages = r.json().get("query", {}).get("pages", {})
        for p in pages.values():
            infos = p.get("imageinfo", [])
            if not infos:
                continue
            img_url = infos[0].get("url", "")
            if not img_url:
                continue
            clean_url = img_url.split('?')[0]
            if not any(clean_url.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png"]):
                continue
            if "diagram" in clean_url.lower() or "icon" in clean_url.lower() or "schema" in clean_url.lower():
                continue
            try:
                ir = requests.get(img_url, headers=HEADERS, timeout=12)
                if ir.status_code == 200:
                    sp = save_image(ir.content, prefix=f"real_{query.replace(' ', '_').lower()}")
                    if sp:
                        count += 1
                        print(f"  [+] Đã tải ảnh thật: {sp.name}")
            except Exception:
                pass
    except Exception as e:
        print(f"Lỗi truy vấn '{query}': {e}")
    return count

print("=" * 60)
print("[DOWNLOAD] BẮT ĐẦU TẢI ẢNH CỔ TAY NGƯỜI THẬT")
print("=" * 60)

total_new = 0
for q in QUERIES:
    c = fetch_wikimedia(q, limit=10)
    total_new += c
    print(f"-> Truy vấn '{q}': đã lưu {c} ảnh.")

# Tích hợp ảnh người dùng thực tế
import glob
user_uploads = glob.glob(r"C:\Users\ongth\.gemini\antigravity-ide\brain\a8f84a6d-50ab-4f10-8247-aa23e231d57e\.user_uploaded\*.*")
for uf in user_uploads:
    try:
        with open(uf, "rb") as f:
            b = f.read()
            sp = save_image(b, prefix="user_real_wrist")
            if sp:
                print(f"  [+] Đã tích hợp ảnh chụp thực tế của bạn: {sp.name}")
                total_new += 1
    except Exception as e:
        pass

print("=" * 60)
print(f"[DONE] Tổng cộng đã nạp thêm {total_new} ảnh cổ tay người thật!")
print("=" * 60)
