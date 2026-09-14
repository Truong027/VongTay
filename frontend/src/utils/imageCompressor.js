/**
 * Client-side Image Compressor using HTML5 Canvas
 * Reduces 3MB - 8MB high-res camera photos down to 100KB - 250KB WebP/JPEG in milliseconds.
 * Prevents Vercel 4.5MB payload overflow and speeds up AI Camera / uploads dramatically.
 */

export async function compressImage(source, options = {}) {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.82,
    outputFormat = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    // If source is a File or Blob, read as dataURL
    if (source instanceof Blob || source instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        processImage(e.target.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    } else if (typeof source === 'string') {
      processImage(source);
    } else {
      reject(new Error('Invalid image source'));
    }

    function processImage(dataUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate proportional scale
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl); // Fallback to original
          return;
        }

        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to dataUrl
        const compressedDataUrl = canvas.toDataURL(outputFormat, quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => {
        console.warn('Image load error during compression, using original source', err);
        resolve(source); // Fallback
      };
      img.src = dataUrl;
    }
  });
}
