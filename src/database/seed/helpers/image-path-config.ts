import path from "path";

/**
 * Returns the public URL path used by Next.js for a stored comic image.
 * Example: /comics/<filename>
 */
export function publicImagePath(fileName: string): string {
  return path.posix.join("/comics", fileName);
}

/**
 * Returns the local filesystem path under the project's `public/comics` folder.
 */
export function localImagePath(fileName: string): string {
  return path.join(process.cwd(), "public", "comics", fileName);
}
