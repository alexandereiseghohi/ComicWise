import { env as envFromT3 } from "@/lib/env";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ComicWise Application Configuration Module (Enhanced v2.1.0)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Purpose:
 *   - Centralized environment variable validation using Zod & T3 Env
 *   - Type-safe configuration management for all environments
 *   - Flexible feature flags and conditional settings
 *   - Cross-platform support (Windows, Linux, macOS)
 *
 * Framework: Next.js 16 | Runtime: Node.js 20+ | Package Manager: pnpm
 *
 * Features:
 *   ✅ Comprehensive Zod schema validation (via @t3-oss/env-nextjs)
 *   ✅ Environment-aware configuration
 *   ✅ Helper functions for type-safe access
 *   ✅ Production-ready security defaults
 *
 * Usage:
 *   import { env, appConfig, isDevelopment } from "@/appConfig"
 *
 * Note: Primary validation via src/lib/env.ts (T3 Env)
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Environment validation is handled by @t3-oss/env-nextjs in src/lib/env.ts
 * This file re-exports the validated environment and provides app-specific configuration.
 */

// ═══════════════════════════════════════════════════
// VALIDATED ENVIRONMENT (from T3 Env)
// ═══════════════════════════════════════════════════

/**
 * Primary environment export from @t3-oss/env-nextjs
 * Provides type-safe access to all validated environment variables
 */
export const env = envFromT3;

// ═══════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════

/**
 * Check if a specific environment variable is set
 * @param key
 */
export function hasEnvironment<K extends keyof typeof env>(key: K): boolean {
  return !!env[key];
}

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === "production";

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === "development";

/**
 * Check if running in test
 */
export const isTest = env.NODE_ENV === "test";

// (dotenv loading is handled externally for all environments)
// ═══════════════════════════════════════════════════
// APP CONFIGURATION (Next.js 16 Optimized)
// ═══════════════════════════════════════════════════

// ═══════════════════════════════════════════════════
// APPLICATION CONFIGURATION
// ═══════════════════════════════════════════════════

// Main application configuration object
const appConfig = {
  // ═══════════════════════════════════════════════════
  // App Metadata
  // ═══════════════════════════════════════════════════
  name: "ComicWise",
  description: "Modern comic reading platform with Next.js 16",
  url: env.NEXT_PUBLIC_APP_URL,
  version: "1.0.0",

  // ═══════════════════════════════════════════════════
  // Environment Flags
  // ═══════════════════════════════════════════════════
  // Environment flags
  env: {
    isProduction: isProduction,
    isDevelopment: isDevelopment,
    isTest: isTest,
    current: env.NODE_ENV,
  },

  // ═══════════════════════════════════════════════════
  // Database Configuration
  // ═══════════════════════════════════════════════════
  // Database configuration
  database: {
    url: env.DATABASE_URL,
    pooling: isProduction,
  },

  // ═══════════════════════════════════════════════════
  // Authentication Configuration
  // ═══════════════════════════════════════════════════
  // Authentication configuration
  auth: {
    secret: env.AUTH_SECRET,
    trustHost: env.AUTH_TRUST_HOST,
    sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
    providers: {
      credentials: true,
      google: hasEnvironment("GOOGLE_CLIENT_ID"),
      github: hasEnvironment("GITHUB_CLIENT_ID"),
    },
  },

  // ═══════════════════════════════════════════════════
  // Pagination Configuration
  // ═══════════════════════════════════════════════════
  // Pagination configuration
  pagination: {
    defaultLimit: 12,
    maxLimit: 100,
    comicsPerPage: 12,
    chaptersPerPage: 20,
    commentsPerPage: 10,
  },

  // ═══════════════════════════════════════════════════
  // Session Configuration
  // ═══════════════════════════════════════════════════
  // Session configuration
  session: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 1 day
    strategy: "jwt" as const,
  },

  // ═══════════════════════════════════════════════════
  // Rate Limiting Configuration
  // ═══════════════════════════════════════════════════
  // Rate limiting configuration
  rateLimit: {
    default: { requests: 10, window: 10 }, // 10 requests per 10 seconds
    auth: { requests: 5, window: 15 * 60 }, // 5 requests per 15 minutes
    email: { requests: 3, window: 60 * 60 }, // 3 requests per hour
    api: { requests: 100, window: 60 }, // 100 requests per minute
    upload: { requests: 10, window: 60 * 60 }, // 10 uploads per hour
  },

  // ═══════════════════════════════════════════════════
  // Email Configuration
  // ═══════════════════════════════════════════════════
  // Email configuration
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER ?? "",
    password: env.SMTP_PASSWORD ?? "",
    from: env.EMAIL_FROM,
    enabled: !!(env.SMTP_USER && env.SMTP_PASSWORD),
  },

  // ═══════════════════════════════════════════════════
  // Upload Configuration
  // ═══════════════════════════════════════════════════
  // Upload configuration
  upload: {
    provider: env.UPLOAD_PROVIDER,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
    imageKit: {
      publicKey: env.IMAGEKIT_PUBLIC_KEY ?? "",
      privateKey: env.IMAGEKIT_PRIVATE_KEY ?? "",
      urlEndpoint: env.IMAGEKIT_URL_ENDPOINT ?? "",
      enabled: hasEnvironment("IMAGEKIT_PUBLIC_KEY"),
    },
    cloudinary: {
      cloudName: env.CLOUDINARY_CLOUD_NAME ?? "",
      apiKey: env.CLOUDINARY_API_KEY ?? "",
      apiSecret: env.CLOUDINARY_API_SECRET ?? "",
      enabled: hasEnvironment("CLOUDINARY_CLOUD_NAME"),
    },
  },

  // ═══════════════════════════════════════════════════
  // Background Jobs Configuration (QStash)
  // ═══════════════════════════════════════════════════
  // QStash configuration
  qstash: {
    token: env.QSTASH_TOKEN ?? "",
    currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY ?? "",
    nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY ?? "",
    url: env.QSTASH_URL ?? "",
    enabled: hasEnvironment("QSTASH_TOKEN"),
  },

  // ═══════════════════════════════════════════════════
  // Redis Configuration (Upstash)
  // ═══════════════════════════════════════════════════
  // Redis configuration (ioredis + Upstash)
  redis: {
    // ioredis connection
    host: env.REDIS_HOST ?? "",
    port: env.REDIS_PORT ?? "",
    password: env.REDIS_PASSWORD ?? "",
    db: env.REDIS_DB ?? "0",
    tls: env.REDIS_TLS_ENABLED === "true",
    url: env.REDIS_URL ?? "",
    // Upstash REST API
    upstashUrl: env.UPSTASH_REDIS_REST_URL ?? "",
    upstashToken: env.UPSTASH_REDIS_REST_TOKEN ?? "",
    enabled: hasEnvironment("REDIS_URL") || hasEnvironment("UPSTASH_REDIS_REST_URL"),
  },

  // ═══════════════════════════════════════════════════
  // Security Configuration
  // ═══════════════════════════════════════════════════
  // Security configuration
  security: {
    bcryptRounds: isProduction ? 12 : 10,
    customPassword: env.CUSTOM_PASSWORD ?? "",
    tokenExpiry: {
      passwordReset: 60 * 60 * 1000, // 1 hour
      emailVerification: 24 * 60 * 60 * 1000, // 24 hours
    },
  },

  // Cache configuration
  cache: {
    enabled: env.CACHE_ENABLED === "true",
    ttl: Number.parseInt(env.CACHE_TTL ?? "3600", 10),
    maxSize: Number.parseInt(env.CACHE_MAX_SIZE ?? "100", 10),
    prefix: env.CACHE_PREFIX ?? "comicwise:",
  },

  // Queue configuration
  queue: {
    enabled: env.QUEUE_ENABLED === "true",
    concurrency: Number.parseInt(env.QUEUE_CONCURRENCY ?? "5", 10),
    maxRetries: Number.parseInt(env.QUEUE_MAX_RETRIES ?? "3", 10),
    retryDelay: Number.parseInt(env.QUEUE_RETRY_DELAY ?? "60000", 10),
  },

  // Monitoring configuration
  monitoring: {
    healthCheckEnabled: env.HEALTH_CHECK_ENABLED === "true",
    healthCheckInterval: Number.parseInt(env.HEALTH_CHECK_INTERVAL ?? "300000", 10),
    metricsEnabled: env.ENABLE_METRICS === "true",
    tracingEnabled: env.ENABLE_TRACING === "true",
  },

  // ═══════════════════════════════════════════════════
  // Feature Flags
  // ═══════════════════════════════════════════════════
  // Feature flags
  features: {
    comments: true,
    bookmarks: true,
    ratings: true,
    email: !!(env.SMTP_USER && env.SMTP_PASSWORD),
    emailVerification: true,
    oauth: hasEnvironment("GOOGLE_CLIENT_ID") || hasEnvironment("GITHUB_CLIENT_ID"),
    backgroundJobs: hasEnvironment("QSTASH_TOKEN"),
    rateLimiting: hasEnvironment("UPSTASH_REDIS_REST_URL"),
    imageUpload: hasEnvironment("IMAGEKIT_PUBLIC_KEY") || hasEnvironment("CLOUDINARY_CLOUD_NAME"),
  },
  ci: (env.MYCI === "true" ||  "false"),

} as const;

// ═══════════════════════════════════════════════════
// HELPER EXPORTS
// ═══════════════════════════════════════════════════

export default appConfig;

// Note: Rate limiting utilities moved to separate import
// import { checkRateLimit, clearRateLimit, getRateLimitStatus } from "@/lib/ratelimit";
