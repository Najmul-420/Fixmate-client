/**
 * Local image selection for forms.
 *
 * Images are read into a data URL so the user gets an instant preview without
 * uploading anything. Nothing leaves the browser.
 *
 * TODO: Connect API — once NEXT_PUBLIC_IMGBB_API_KEY is configured, upload the
 * selected file to ImgBB and store the hosted URL instead of the data URL.
 */

export const MAX_IMAGE_MB = 5;

/** Returns an error message, or `null` when the file is a valid image. */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Please choose an image file (JPG, PNG, WebP…).";
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return `Image must be ${MAX_IMAGE_MB} MB or smaller.`;
  }
  return null;
}

/** Reads a local file into a data URL for preview. */
export function readImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
