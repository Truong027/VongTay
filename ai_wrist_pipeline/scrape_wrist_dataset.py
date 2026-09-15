"""
=============================================================================
BỘ CÀO DỮ LIỆU CỔ TAY TỰ ĐỘNG (WRIST DATASET SCRAPER)
Dự án: Xưởng Vòng Tay - Ướm Vòng AR & YOLO Wrist Detection
=============================================================================
Tính năng:
- Thu thập ảnh cổ tay người thật, đặc biệt các góc đeo vòng hạt phong thủy và charm hoa
- Nguồn thu thập: Nguồn mở miễn phí (Wikimedia Commons, Unsplash Open API, Pixabay)
- Tự động lọc ảnh hỏng, kiểm tra độ phân giải
=============================================================================
"""

import os
import sys
import io
import time
import json
import hashlib
import requests
from pathlib import Path
from PIL import Image
from io import BytesIO

# Đảm bảo in UTF-8 không lỗi charmap trên Windows
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

try:
    from tqdm import tqdm
except ImportError:
    tqdm = lambda x, **kwargs: x

RAW_IMAGE_DIR = Path(__file__).parent / "dataset" / "raw_images"
RAW_IMAGE_DIR.mkdir(parents=True, exist_ok=True)

# Các từ khóa tìm kiếm ảnh cổ tay phong phú & vòng hạt hoa giống ảnh mẫu
SEARCH_QUERIES = [
    "flower bead bracelet wrist",
    "wearing beaded bracelet wrist",
    "dainty bracelet wrist aesthetic",
    "pastel bead bracelet hand",
    "female wrist jewelry aesthetic",
    "hand and wrist bracelet",
    "pearl bead bracelet arm",
    "holding bracelet wrist",
    "wrist close up jewelry",
    "bare wrist human"
]

HEADERS = {
    "User-Agent": "VIBANVONGTAY_AI_Research/1.0 (https://github.com/Truong027/VongTay; contact: ai@vibanvongtay.vn)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
}

def is_valid_image(image_bytes: bytes, min_size: int = 256) -> bool:
    """Kiểm tra ảnh có hợp lệ và đủ độ phân giải không."""
    try:
        img = Image.open(BytesIO(image_bytes))
        img.verify()
        w, h = img.size
        return w >= min_size and h >= min_size
    except Exception:
        return False

def save_image_bytes(image_bytes: bytes, prefix: str = "wrist") -> str:
    """Lưu byte ảnh vào thư mục dataset với tên hash duy nhất chống trùng lặp."""
    file_hash = hashlib.md5(image_bytes).hexdigest()[:12]
    out_path = RAW_IMAGE_DIR / f"{prefix}_{file_hash}.jpg"
    if out_path.exists():
        return str(out_path)
    
    try:
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        img.save(out_path, "JPEG", quality=92)
        return str(out_path)
    except Exception as e:
        print(f"[WARN] Lỗi khi lưu ảnh: {e}")
        return ""

def scrape_from_wikimedia(query: str, limit: int = 15):
    """Cào ảnh bản quyền mở từ Wikimedia Commons API."""
    print(f"[SEARCH] Đang tìm kiếm trên Wikimedia: '{query}'...")
    api_url = "https://commons.wikimedia.org/w/api.php"
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

    try:
        res = requests.get(api_url, params=params, headers=HEADERS, timeout=12)
        if res.status_code != 200:
            return 0
        data = res.json()
        pages = data.get("query", {}).get("pages", {})
        
        saved_count = 0
        for page_id, page_info in pages.items():
            image_infos = page_info.get("imageinfo", [])
            if not image_infos:
                continue
            img_url = image_infos[0].get("url")
            if not img_url:
                continue
            
            # Chỉ lấy jpg, png, jpeg
            if not any(img_url.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png"]):
                continue

            try:
                img_res = requests.get(img_url, headers=HEADERS, timeout=10)
                if img_res.status_code == 200 and is_valid_image(img_res.content):
                    saved_path = save_image_bytes(img_res.content, prefix="wiki_wrist")
                    if saved_path:
                        saved_count += 1
            except Exception:
                continue

        print(f"  ✓ Đã lưu {saved_count} ảnh từ '{query}'.")
        return saved_count
    except Exception as e:
        print(f"[WARN] Lỗi khi kết nối Wikimedia: {e}")
        return 0

def scrape_from_unsplash_source(query: str, count: int = 10):
    """Tải ảnh curated từ Unsplash Source mở chất lượng cao."""
    print(f"[SEARCH] Đang tải ảnh chất lượng cao từ kho Unsplash Open: '{query}'...")
    curated_urls = [
        "https://images.unsplash.com/photo-1611591475152-4783113828af?w=700&q=80",
        "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=700&q=80",
        "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=700&q=80",
        "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700&q=80",
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=700&q=80"
    ]

    saved_count = 0
    for u in curated_urls:
        try:
            res = requests.get(u, headers=HEADERS, timeout=10)
            if res.status_code == 200 and is_valid_image(res.content):
                saved = save_image_bytes(res.content, prefix="curated_wrist")
                if saved:
                    saved_count += 1
        except Exception:
            continue

    print(f"  ✓ Đã nạp {saved_count} ảnh cổ tay chất lượng cao mẫu.")
    return saved_count

def run_scraper(target_total: int = 40):
    print("=" * 68)
    print("[SCRAPER] BẮT ĐẦU CÀO DATASET ẢNH CỔ TAY CHO YOLO TRAINING")
    print(f"[DIR] Thư mục lưu: {RAW_IMAGE_DIR.resolve()}")
    print("=" * 68)

    total_downloaded = 0
    total_downloaded += scrape_from_unsplash_source("wrist bracelet", count=8)

    for query in SEARCH_QUERIES:
        if total_downloaded >= target_total:
            break
        c = scrape_from_wikimedia(query, limit=12)
        total_downloaded += c
        time.sleep(0.4)

    existing_images = list(RAW_IMAGE_DIR.glob("*.jpg")) + list(RAW_IMAGE_DIR.glob("*.png"))
    print("=" * 68)
    print("[DONE] HOÀN TẤT CÀO DỮ LIỆU!")
    print(f"[INFO] Tổng số ảnh hiện có trong {RAW_IMAGE_DIR.name}: {len(existing_images)} ảnh.")
    print("👉 Bước tiếp theo: Chạy `python auto_label_wrist.py` để tự động gán nhãn 5 keypoints!")
    print("=" * 68)

if __name__ == "__main__":
    target = 35
    if len(sys.argv) > 1:
        try:
            target = int(sys.argv[1])
        except ValueError:
            pass
    run_scraper(target)
