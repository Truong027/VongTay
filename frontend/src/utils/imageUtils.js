/**
 * Tiện ích nén và tối ưu hóa hình ảnh trước khi gửi lên máy chủ
 * Giúp tránh lỗi HTTP 413 Payload Too Large và tăng tốc độ tải trang
 */

export const compressImage = (fileOrDataUrl, maxDimension = 1000, quality = 0.78) => {
  return new Promise((resolve) => {
    if (!fileOrDataUrl) {
      return resolve('');
    }

    // Nếu là URL tĩnh (ví dụ /images/products/...), giữ nguyên không cần nén
    if (typeof fileOrDataUrl === 'string' && !fileOrDataUrl.startsWith('data:image/')) {
      return resolve(fileOrDataUrl);
    }

    const processDataUrl = (dataUrl) => {
      if (!dataUrl || typeof dataUrl !== 'string') return resolve(dataUrl);

      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (!width || !height) return resolve(dataUrl);

        // Nếu ảnh đã rất nhẹ (< 150KB base64) và kích thước nhỏ hơn giới hạn, giữ nguyên
        if (width <= maxDimension && height <= maxDimension && dataUrl.length < 200000) {
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
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          
          // Vẽ nền trắng để chuyển PNG trong suốt sang JPEG không bị đen nền
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Khử răng cưa và vẽ mượt mà
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Xuất ảnh JPEG chất lượng tối ưu (khoảng 60KB - 150KB)
          const compressed = canvas.toDataURL('image/jpeg', quality);
          if (compressed && compressed.length > 100) {
            resolve(compressed);
          } else {
            resolve(dataUrl);
          }
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

export const compressMultipleImages = async (imagesList, maxDimension = 1000, quality = 0.78) => {
  if (!Array.isArray(imagesList) || imagesList.length === 0) return [];
  const promises = imagesList.map(img => compressImage(img, maxDimension, quality));
  const results = await Promise.all(promises);
  return results.filter(Boolean);
};
