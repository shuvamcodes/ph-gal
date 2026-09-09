export function stripExifFromImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error("Failed to strip metadata"));
            return;
          }
          const cleanFile = new File([blob], file.name, {
            type: file.type === "image/png" ? "image/png" : "image/jpeg"
          });
          resolve(cleanFile);
        },
        file.type === "image/png" ? "image/png" : "image/jpeg",
        0.92
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for metadata stripping"));
    };

    img.src = url;
  });
}   