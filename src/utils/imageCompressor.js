/**
 * Client-Side HTML5 Canvas Image Compression Utility
 * Resizes and compresses images locally in the browser to maintain < 1MB limit.
 */

/**
 * Compresses an image file using HTML5 Canvas.
 * @param {File} file - Original file from input / dropzone
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Max width in pixels (default: 1600)
 * @param {number} options.maxHeight - Max height in pixels (default: 1600)
 * @param {number} options.quality - JPEG compression quality (0.1 to 1.0, default: 0.75)
 * @returns {Promise<{ originalSize: number, compressedSize: number, compressionRatio: number, dataUrl: string, file: File }>}
 */
export async function compressImage(file, options = {}) {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.75 } = options;

  // If it's a PDF, bypass canvas compression and return base64
  if (file.type === 'application/pdf') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          originalSize: file.size,
          compressedSize: file.size,
          compressionRatio: 0,
          dataUrl: reader.result,
          file,
          isPdf: true,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio-preserved scaled dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Clean white background for transparent PNG conversions
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Export compressed JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Calculate compressed size from base64
        const head = 'data:image/jpeg;base64,';
        const base64Length = dataUrl.length - head.length;
        const compressedSize = Math.round((base64Length * 3) / 4);

        const ratio = Math.max(
          0,
          Math.round(((file.size - compressedSize) / file.size) * 100)
        );

        resolve({
          originalSize: file.size,
          compressedSize,
          compressionRatio: ratio,
          dataUrl,
          file,
          isPdf: false,
        });
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}

/**
 * Formats bytes into a human-readable string (e.g. 1.2 MB, 450 KB).
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
