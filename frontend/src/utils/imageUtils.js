/**
 * Tiện ích nén và tối ưu hóa hình ảnh trước khi gửi lên máy chủ
 * Giúp tránh lỗi HTTP 413 Payload Too Large và tăng tốc độ tải trang
 */

export const compressImage = (fileOrDataUrl, maxDimension = 1200, quality = 0.82) => {
  return new Promise((resolve) => {
    if (!fileOrDataUrl) {
      return resolve('');
    }

    // Nếu là URL bình thường (không phải base64), giữ nguyên
    if (typeof fileOrDataUrl === 'string' && !fileOrDataUrl.startsWith('data:image/')) {
      return resolve(fileOrDataUrl);
    }

    const processDataUrl = (dataUrl) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        
        // Nếu ảnh đã nhỏ và nhẹ, không cần nén sâu
        if (width <= maxDimension && height <= maxDimension && dataUrl.length < 300000) {
          return resolve(dataUrl);
        }

        // Tính toán tỷ lệ khung hình
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          // Khử răng cưa và vẽ mượt mà
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Xuất ảnh JPEG chất lượng tối ưu (khoảng 100KB - 250KB)
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (e) {
          console.warn('Không thể nén ảnh qua canvas, dùng ảnh gốc:', e);
          resolve(dataUrl);
        }
      };

      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };

    // Nếu là File hoặc Blob
    if (typeof File !== 'undefined' && fileOrDataUrl instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => processDataUrl(e.target?.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(fileOrDataUrl);
    } else if (typeof fileOrDataUrl === 'string') {
      processDataUrl(fileOrDataUrl);
    } else {
      resolve(fileOrDataUrl);
    }
  });
};

export const compressMultipleImages = async (imagesList, maxDimension = 1200, quality = 0.82) => {
  if (!Array.isArray(imagesList) || imagesList.length === 0) return [];
  const promises = imagesList.map(img => compressImage(img, maxDimension, quality));
  const results = await Promise.all(promises);
  return results.filter(Boolean);
};
