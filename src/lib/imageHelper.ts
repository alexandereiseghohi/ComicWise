import { seedLogger } from "@/lib/logger";
import crypto from "crypto";
import fs from "fs-extra";
import pLimit from "p-limit";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";

const streamPipeline = promisify(pipeline);

const DEFAULT_CONCURRENCY = parseInt(
  process.env["SEED_IMAGE_CONCURRENCY"] || process.env["SEED_DOWNLOAD_CONCURRENCY"] || "5",
  10
);
const MAX_SIZE = parseInt(process.env["SEED_MAX_IMAGE_SIZE_BYTES"] || "5242880", 10);
const allowedExt = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const SAVE_IMAGES = (process.env["SEED_SAVE_IMAGES"] || "true").toLowerCase() !== "false";
const DEFAULT_FETCH_TIMEOUT = parseInt(process.env["SEED_FETCH_TIMEOUT_MS"] || "10000", 10);
const DEFAULT_FETCH_RETRIES = parseInt(process.env["SEED_FETCH_RETRIES"] || "2", 10);

export function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export function normalizeImageUrl(url?: string) {
  if (!url) return undefined;
  const t = url.trim();
  if (isAbsoluteUrl(t)) return t;
  return t.startsWith("/") ? t : `/${t}`;
}

export function computeImageFilename(url: string) {
  const hash = crypto.createHash("sha256").update(url).digest("hex");
  try {
    const parsed = new URL(url);
    const base = path.basename(parsed.pathname);
    const ext = path.extname(base).toLowerCase() || ".jpg";
    return { filename: `${hash}${ext}`, hash, ext };
  } catch {
    const ext = path.extname(url).toLowerCase() || ".jpg";
    return { filename: `${hash}${ext}`, hash, ext };
  }
}

export async function ensureSavedImageForUrl(
  url: string | undefined,
  destDir: string,
  fallback: string,
  options?: { dryRun?: boolean }
) {
  if (!url) return fallback;
  // If we've previously detected disk full, avoid repeated attempts
  if ((ensureSavedImageForUrl as any)._downloadsDisabled) {
    seedLogger.warn({ msg: `Skipping image download (previous ENOSPC detected)`, url });
    return fallback;
  }
  // Respect explicit toggle to avoid saving any images (useful when disk is constrained)
  if (!SAVE_IMAGES) {
    seedLogger.info({ msg: `Image saving disabled via SEED_SAVE_IMAGES=false`, url });
    return fallback;
  }
  // if it's a relative path (starts with /) assume file exists under public
  if (!isAbsoluteUrl(url)) {
    const localPath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
    if (await fs.pathExists(localPath)) return url;
    // if not exists, fallback
    return fallback;
  }

  // Absolute URL: download and save
  try {
    await fs.ensureDir(destDir);
    const hash = crypto.createHash("sha256").update(url).digest("hex");
    const parsed = new URL(url);
    const base = path.basename(parsed.pathname);
    const ext = path.extname(base).toLowerCase();
    if (!allowedExt.has(ext)) {
      // prefer jpg extension if unknown
      return fallback;
    }

    const filename = `${hash}${ext}`;
    const outPath = path.join(destDir, filename);
    const relPath =
      "/" + path.relative(path.join(process.cwd(), "public"), outPath).replaceAll('\\', "/");

    if (await fs.pathExists(outPath)) return relPath;

    if (options?.dryRun) {
      seedLogger.info({ msg: `Dry-run: would download ${url} -> ${outPath}` });
      return relPath;
    }

    // fetch with retries and timeout
    async function fetchWithRetries(
      retries = DEFAULT_FETCH_RETRIES,
      timeout = DEFAULT_FETCH_TIMEOUT
    ) {
      let attempt = 0;
      let lastErr: any = null;
      while (attempt <= retries) {
        attempt += 1;
        const controller = new AbortController();
        const signal = controller.signal;
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
          const targetUrl = url as string;
          const res = await fetch(targetUrl, { signal });
          clearTimeout(timer);
          if (!res.ok) {
            // don't retry on 404
            if (res.status === 404) {
              seedLogger.warn({ msg: `Image 404`, url });
              return { ok: false, res } as any;
            }
            // retry on 5xx and 429
            if (res.status >= 500 || res.status === 429) {
              lastErr = new Error(`HTTP ${res.status}`);
              seedLogger.warn({
                msg: `Transient HTTP status, will retry`,
                url,
                status: res.status,
                attempt,
              });
              // exponential backoff
              await new Promise((r) => setTimeout(r, 200 * Math.pow(2, attempt)));
              continue;
            }
            return { ok: false, res } as any;
          }
          return { ok: true, res } as any;
        } catch (error) {
          clearTimeout(timer);
          lastErr = error;
          // abort errors or network glitches - retry
          seedLogger.warn({ msg: `Fetch attempt failed`, url, attempt, err: error });
          await new Promise((r) => setTimeout(r, 200 * Math.pow(2, attempt)));
          continue;
        }
      }
      throw lastErr;
    }

    const result = await fetchWithRetries();
    if (!result.ok) {
      // if we have a response that is non-ok (like 404), just fallback
      if (result.res)
        seedLogger.warn({ msg: `Image download failed`, url, status: result.res.status });
      return fallback;
    }

    const res = result.res;
    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_SIZE) {
      seedLogger.warn({ msg: `Image exceeds max size`, url });
      return fallback;
    }

    const destStream = fs.createWriteStream(outPath);
    await streamPipeline(res.body, destStream as any);
    return relPath;
  } catch (error) {
    // If disk is full, set a module-level flag to avoid repeated attempts
    // err.code may be 'ENOSPC' on low-disk situations
    try {
      const e: any = error;
      if (e && e.code === "ENOSPC") {
        (ensureSavedImageForUrl as any)._downloadsDisabled = true;
        seedLogger.error({ msg: `Disk full: disabling further image downloads`, url, err: error });
        return fallback;
      }
    } catch {
      // ignore
    }
    seedLogger.error({ msg: `Failed to save image`, url, err: error });
    return fallback;
  }
}

export const downloadImages = (concurrency = DEFAULT_CONCURRENCY) => {
  const limit = pLimit(concurrency);
  return async (tasks: Array<() => Promise<any>>) => {
    return Promise.all(tasks.map((t) => limit(() => t())));
  };
};
