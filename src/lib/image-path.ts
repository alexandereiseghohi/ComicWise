/**
 * Utilities to normalize image paths for Next/Image and seed data.
 */
export function normalizeImagePath(input?: string | null): string | undefined {
  if (!input) return input as undefined;

  const s = String(input).trim();
  if (!s) return undefined;

  // Data URLs and absolute HTTP URLs should be returned unchanged
  if (/^data:/i.test(s)) return s;
  if (/^https?:\/\//i.test(s)) return s;

  // Normalize backslashes to forward slashes
  let normalized = s.replace(/\\+/g, "/");

  // If path includes a leading "public/", strip it so it becomes "/..."
  if (normalized.startsWith("public/")) {
    normalized = normalized.slice("public".length);
  }

  // If it does not start with a slash, add one
  if (!normalized.startsWith("/")) {
    normalized = "/" + normalized;
  }

  return normalized;
}

export function isImageFileName(name?: string | null): boolean {
  if (!name) return false;
  return /\.(png|jpe?g|webp|gif|svg|avif|bmp)(\?.*)?$/i.test(name);
}
