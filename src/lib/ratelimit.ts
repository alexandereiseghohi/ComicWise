import appConfig from "@/appConfig";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export interface RateLimitConfig {
  limit?: number;
  window?: string | number; // Support both string format and numeric seconds
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): Promise<{
  allowed: boolean;
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const requests =
    config.limit ??
    (typeof appConfig.rateLimit.default === "number"
      ? appConfig.rateLimit.default
      : (appConfig.rateLimit.default as any)?.requests) ??
    10;
  const windowSeconds = config.window
    ? typeof config.window === "string"
      ? parseWindow(config.window)
      : config.window
    : 60;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    return {
      allowed: true,
      success: true,
      limit: requests,
      remaining: requests - 1,
      reset: resetTime,
    };
  }

  if (record.count >= requests) {
    return {
      allowed: false,
      success: false,
      limit: requests,
      remaining: 0,
      reset: record.resetTime,
    };
  }

  record.count++;
  return {
    allowed: true,
    success: true,
    limit: requests,
    remaining: requests - record.count,
    reset: record.resetTime,
  };
}

function parseWindow(window: string): number {
  const match = window.match(/^(\d+)([dhms])$/);
  if (!match) return 60;

  const value = Number.parseInt(match[1]!);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 3600;
    case "d":
      return value * 86400;
    default:
      return 60;
  }
}

export function clearRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier);
}

export function getRateLimitStatus(identifier: string): {
  exists: boolean;
  count?: number;
  resetAt?: number;
} {
  const record = rateLimitMap.get(identifier);
  if (!record) {
    return { exists: false };
  }

  const now = Date.now();
  if (now > record.resetTime) {
    rateLimitMap.delete(identifier);
    return { exists: false };
  }

  return {
    exists: true,
    count: record.count,
    resetAt: record.resetTime,
  };
}

// Cleanup expired entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 60000); // Clean up every minute
}
