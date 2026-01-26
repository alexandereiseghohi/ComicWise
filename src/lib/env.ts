import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Database
    DATABASE_URL: z.string().min(1).optional(),
    NEON_DATABASE_URL: z.string().min(1).optional(),

    // Auth
    AUTH_SECRET: z.string().min(32).optional(),
    AUTH_TRUST_HOST: z.string().optional(),

    // OAuth Providers
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),

    // Email
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().email().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),

    // Redis (ioredis)
    REDIS_URL: z.string().optional(),
    REDIS_HOST: z.string().optional(),
    REDIS_PORT: z.string().optional(),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_DB: z.string().optional(),
    REDIS_TLS_ENABLED: z.string().optional(),

    // Upstash Redis
    UPSTASH_REDIS_REST_URL: z.string().min(1).optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),

    // Storage/CDN
    UPLOAD_PROVIDER: z.enum(["imagekit", "cloudinary", "local", "aws"]).optional().default("local"),
    IMAGEKIT_PUBLIC_KEY: z.string().min(1).optional(),
    IMAGEKIT_PRIVATE_KEY: z.string().min(1).optional(),
    IMAGEKIT_URL_ENDPOINT: z.string().min(1).optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    AWS_REGION: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_S3_BUCKET_NAME: z.string().optional(),

    // QStash
    QSTASH_TOKEN: z.string().optional(),
    QSTASH_CURRENT_SIGNING_KEY: z.string().optional(),
    QSTASH_NEXT_SIGNING_KEY: z.string().optional(),
    QSTASH_URL: z.string().optional(),

    // Seed Data
    CUSTOM_PASSWORD: z.string().optional(),

    // Environment & Config
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.string().optional(),
    LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
    DEBUG: z.string().optional(),
    VERBOSE_LOGGING: z.string().optional(),

    // Cache Configuration
    CACHE_ENABLED: z.string().optional(),
    CACHE_TTL: z.string().optional(),
    CACHE_MAX_SIZE: z.string().optional(),
    CACHE_PREFIX: z.string().optional(),

    // Queue Configuration
    QUEUE_ENABLED: z.string().optional(),
    QUEUE_CONCURRENCY: z.string().optional(),
    QUEUE_MAX_RETRIES: z.string().optional(),
    QUEUE_RETRY_DELAY: z.string().optional(),

    // Monitoring & Health
    HEALTH_CHECK_ENABLED: z.string().optional(),
    HEALTH_CHECK_INTERVAL: z.string().optional(),
    ENABLE_METRICS: z.string().optional(),
    ENABLE_TRACING: z.string().optional(),

    // Theme
    DEFAULT_THEME: z.string().optional(),
    ENABLE_THEME_SWITCHING: z.string().optional(),

    // Rate Limiting
    RATE_LIMIT_ENABLED: z.string().optional(),
    RATE_LIMIT_MAX_REQUESTS: z.string().optional(),
    RATE_LIMIT_WINDOW_MS: z.string().optional(),

    // Sentry (Error Monitoring)
    SENTRY_DSN: z.string().min(1).optional(),
    SENTRY_ORG: z.string().min(1).optional(),
    SENTRY_PROJECT: z.string().min(1).optional(),
    SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
    SENTRY_ENABLE_TRACING: z.string().optional(),
    SENTRY_TRACES_SAMPLE_RATE: z.string().optional(),
    SENTRY_REPLAY_SESSION_SAMPLE_RATE: z.string().optional(),
    SENTRY_REPLAY_ERROR_SAMPLE_RATE: z.string().optional(),
    MYCI: z.string().optional(),
  },

  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1).optional(),
    NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: z.string().min(1).optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().min(1).optional(),
  },

  runtimeEnv: {
    // Server - Database
    DATABASE_URL: process.env["DATABASE_URL"],
    NEON_DATABASE_URL: process.env["NEON_DATABASE_URL"],

    // Server - Auth
    AUTH_SECRET: process.env["AUTH_SECRET"],
    AUTH_TRUST_HOST: process.env["AUTH_TRUST_HOST"],

    // Server - OAuth
    GOOGLE_CLIENT_ID: process.env["GOOGLE_CLIENT_ID"],
    GOOGLE_CLIENT_SECRET: process.env["GOOGLE_CLIENT_SECRET"],
    GITHUB_CLIENT_ID: process.env["GITHUB_CLIENT_ID"],
    GITHUB_CLIENT_SECRET: process.env["GITHUB_CLIENT_SECRET"],

    // Server - Email
    RESEND_API_KEY: process.env["RESEND_API_KEY"],
    EMAIL_FROM: process.env["EMAIL_FROM"],
    SMTP_HOST: process.env["SMTP_HOST"],
    SMTP_PORT: process.env["SMTP_PORT"],
    SMTP_USER: process.env["SMTP_USER"],
    SMTP_PASSWORD: process.env["SMTP_PASSWORD"],

    // Server - Redis
    REDIS_URL: process.env["REDIS_URL"],
    REDIS_HOST: process.env["REDIS_HOST"],
    REDIS_PORT: process.env["REDIS_PORT"],
    REDIS_PASSWORD: process.env["REDIS_PASSWORD"],
    REDIS_DB: process.env["REDIS_DB"],
    REDIS_TLS_ENABLED: process.env["REDIS_TLS_ENABLED"],

    // Server - Upstash
    UPSTASH_REDIS_REST_URL: process.env["UPSTASH_REDIS_REST_URL"],
    UPSTASH_REDIS_REST_TOKEN: process.env["UPSTASH_REDIS_REST_TOKEN"],

    // Server - Upload
    UPLOAD_PROVIDER: process.env["UPLOAD_PROVIDER"],
    IMAGEKIT_PUBLIC_KEY: process.env["IMAGEKIT_PUBLIC_KEY"],
    IMAGEKIT_PRIVATE_KEY: process.env["IMAGEKIT_PRIVATE_KEY"],
    IMAGEKIT_URL_ENDPOINT: process.env["IMAGEKIT_URL_ENDPOINT"],
    CLOUDINARY_CLOUD_NAME: process.env["CLOUDINARY_CLOUD_NAME"],
    CLOUDINARY_API_KEY: process.env["CLOUDINARY_API_KEY"],
    CLOUDINARY_API_SECRET: process.env["CLOUDINARY_API_SECRET"],
    AWS_REGION: process.env["AWS_REGION"],
    AWS_ACCESS_KEY_ID: process.env["AWS_ACCESS_KEY_ID"],
    AWS_SECRET_ACCESS_KEY: process.env["AWS_SECRET_ACCESS_KEY"],
    AWS_S3_BUCKET_NAME: process.env["AWS_S3_BUCKET_NAME"],

    // Server - QStash
    QSTASH_TOKEN: process.env["QSTASH_TOKEN"],
    QSTASH_CURRENT_SIGNING_KEY: process.env["QSTASH_CURRENT_SIGNING_KEY"],
    QSTASH_NEXT_SIGNING_KEY: process.env["QSTASH_NEXT_SIGNING_KEY"],
    QSTASH_URL: process.env["QSTASH_URL"],

    // Server - Seed
    CUSTOM_PASSWORD: process.env["CUSTOM_PASSWORD"],

    // Server - Environment
    NODE_ENV: process.env["NODE_ENV"],
    PORT: process.env["PORT"],
    LOG_LEVEL: process.env["LOG_LEVEL"],
    DEBUG: process.env["DEBUG"],
    VERBOSE_LOGGING: process.env["VERBOSE_LOGGING"],

    // Server - Cache
    CACHE_ENABLED: process.env["CACHE_ENABLED"],
    CACHE_TTL: process.env["CACHE_TTL"],
    CACHE_MAX_SIZE: process.env["CACHE_MAX_SIZE"],
    CACHE_PREFIX: process.env["CACHE_PREFIX"],

    // Server - Queue
    QUEUE_ENABLED: process.env["QUEUE_ENABLED"],
    QUEUE_CONCURRENCY: process.env["QUEUE_CONCURRENCY"],
    QUEUE_MAX_RETRIES: process.env["QUEUE_MAX_RETRIES"],
    QUEUE_RETRY_DELAY: process.env["QUEUE_RETRY_DELAY"],

    // Server - Monitoring
    HEALTH_CHECK_ENABLED: process.env["HEALTH_CHECK_ENABLED"],
    HEALTH_CHECK_INTERVAL: process.env["HEALTH_CHECK_INTERVAL"],
    ENABLE_METRICS: process.env["ENABLE_METRICS"],
    ENABLE_TRACING: process.env["ENABLE_TRACING"],

    // Server - Theme
    DEFAULT_THEME: process.env["DEFAULT_THEME"],
    ENABLE_THEME_SWITCHING: process.env["ENABLE_THEME_SWITCHING"],

    // Server - Rate Limiting
    RATE_LIMIT_ENABLED: process.env["RATE_LIMIT_ENABLED"],
    RATE_LIMIT_MAX_REQUESTS: process.env["RATE_LIMIT_MAX_REQUESTS"],
    RATE_LIMIT_WINDOW_MS: process.env["RATE_LIMIT_WINDOW_MS"],

    // Server - Sentry
    SENTRY_DSN: process.env["SENTRY_DSN"],
    SENTRY_ORG: process.env["SENTRY_ORG"],
    SENTRY_PROJECT: process.env["SENTRY_PROJECT"],
    SENTRY_AUTH_TOKEN: process.env["SENTRY_AUTH_TOKEN"],
    SENTRY_ENABLE_TRACING: process.env["SENTRY_ENABLE_TRACING"],
    SENTRY_TRACES_SAMPLE_RATE: process.env["SENTRY_TRACES_SAMPLE_RATE"],
    SENTRY_REPLAY_SESSION_SAMPLE_RATE: process.env["SENTRY_REPLAY_SESSION_SAMPLE_RATE"],
    SENTRY_REPLAY_ERROR_SAMPLE_RATE: process.env["SENTRY_REPLAY_ERROR_SAMPLE_RATE"],

    // Client
    NEXT_PUBLIC_APP_URL: process.env["NEXT_PUBLIC_APP_URL"],
    NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: process.env["NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY"],
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: process.env["NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT"],
    NEXT_PUBLIC_SENTRY_DSN: process.env["NEXT_PUBLIC_SENTRY_DSN"],
    MYCI: process.env["MYCI"],
  },

  // Allow skipping validation in CI or test environments to make tests and CI runs resilient
  skipValidation:
    process.env["SKIP_ENV_VALIDATION"] === "true" ||
    process.env["NODE_ENV"] === "test" ||
    !!process.env["CI"],
  emptyStringAsUndefined: true,
});
