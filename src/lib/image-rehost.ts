import { put } from "@vercel/blob";
import { validateUrl } from "@/lib/url-safety";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB, matching the upload limit

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/**
 * Downloads an externally hosted recipe image into our own Blob store so the
 * recipe stops depending on the source site keeping the file around (or not
 * blocking hotlinks).
 *
 * Best-effort by design: returns null if anything goes wrong, and callers keep
 * the original URL. A failed re-host should never fail an import.
 */
export async function rehostImage(imageUrl: string): Promise<string | null> {
  try {
    // Already ours — nothing to do.
    if (imageUrl.includes(".public.blob.vercel-storage.com")) {
      return imageUrl;
    }

    const validated = validateUrl(imageUrl);

    const response = await fetch(validated.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RecipeManager/1.0; +personal-use)",
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) return null;

    const contentType = (response.headers.get("content-type") || "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    const ext = EXTENSION_BY_TYPE[contentType];
    if (!ext) return null;

    const declaredLength = response.headers.get("content-length");
    if (declaredLength && Number(declaredLength) > MAX_IMAGE_SIZE) return null;

    const bytes = await response.arrayBuffer();
    // Re-check: content-length is advisory and may be absent or wrong.
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_IMAGE_SIZE) return null;

    const blob = await put(`recipes/imported.${ext}`, bytes, {
      access: "public",
      contentType,
      addRandomSuffix: true,
    });

    return blob.url;
  } catch {
    return null;
  }
}
