/**
 * Uploads an image file to ImgBB and returns the hosted URL.
 * Configure NEXT_PUBLIC_IMGBB_API_KEY in .env (get a free key at
 * https://api.imgbb.com). Returns `null` on any failure — callers show
 * an error instead of a fake success.
 */
export async function uploadToImgbb(file: File): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    console.warn("[FixMate] NEXT_PUBLIC_IMGBB_API_KEY is not set.");
    return null;
  }
  try {
    const base64 = await fileToBase64(file);
    const body = new FormData();
    body.set("key", apiKey);
    body.set("image", base64);

    const res = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;

    const payload: unknown = await res.json();
    const url = (payload as { data?: { url?: unknown } } | null)?.data?.url;
    return typeof url === "string" && url.startsWith("http") ? url : null;
  } catch (error) {
    console.warn("[FixMate] ImgBB upload failed:", error);
    return null;
  }
}

/** ImgBB accepts the raw file as base64 (without the data: prefix). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
