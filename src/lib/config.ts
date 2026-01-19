// ═══════════════════════════════════════════════════
// CONFIGURATION MANAGEMENT - Using dotenv & convict
// ═══════════════════════════════════════════════════

import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenvConfig({ path: resolve(process.cwd(), ".env.local") });
dotenvConfig({ path: resolve(process.cwd(), ".env") });

// ═══════════════════════════════════════════════════
// CONFIGURATION SCHEMA
// ═══════════════════════════════════════════════════

export const config = {
  // Application
  app: {
    name: "ComicWise",
    url: process.env["NEXT_PUBLIC_APP_URL"] || "http://localhost:3000",
    port: Number.parseInt(process.env["PORT"] || "3000", 10),
    env: process.env["NODE_ENV"] || "development",
  },

  // Database
  database: {
    url: process.env["DATABASE_URL"] || "",
    poolMin: 2,
    poolMax: 10,
  },

  // Authentication
  auth: {
    secret: process.env["AUTH_SECRET"] || "",
    trustHost: process.env["AUTH_TRUST_HOST"] === "true",
    sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // OAuth
  oauth: {
    google: {
      clientId: process.env["GOOGLE_CLIENT_ID"] || "",
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"] || "",
    },
    github: {
      clientId: process.env["GITHUB_CLIENT_ID"] || "",
      clientSecret: process.env["GITHUB_CLIENT_SECRET"] || "",
    },
  },

  // Email
  email: {
    from: process.env["EMAIL_FROM"] || "noreplycomicwise.local",
    smtp: {
      host: process.env["SMTP_HOST"] || "localhost",
      port: Number.parseInt(process.env["SMTP_PORT"] || "1025", 10),
      user: process.env["SMTP_USER"] || "",
      password: process.env["SMTP_PASSWORD"] || "",
    },
    resend: {
      apiKey: process.env["RESEND_API_KEY"] || "",
    },
  },

  // Redis
  redis: {
    url: process.env["REDIS_URL"] || "",
    host: process.env["REDIS_HOST"] || "localhost",
    port: Number.parseInt(process.env["REDIS_PORT"] || "6379", 10),
    password: process.env["REDIS_PASSWORD"] || "",
    db: Number.parseInt(process.env["REDIS_DB"] || "0", 10),
  },

  // Upstash Redis
  upstash: {
    redis: {
      url: process.env["UPSTASH_REDIS_REST_URL"] || "",
      token: process.env["UPSTASH_REDIS_REST_TOKEN"] || "",
    },
    qstash: {
      token: process.env["QSTASH_TOKEN"] || "",
      currentSigningKey: process.env["QSTASH_CURRENT_SIGNING_KEY"] || "",
      nextSigningKey: process.env["QSTASH_NEXT_SIGNING_KEY"] || "",
    },
  },

  // Upload providers
  upload: {
    provider: (process.env["UPLOAD_PROVIDER"] || "local") as
      | "local"
      | "imagekit"
      | "cloudinary"
      | "aws",
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],

    imagekit: {
      publicKey: process.env["IMAGEKIT_PUBLIC_KEY"] || "",
      privateKey: process.env["IMAGEKIT_PRIVATE_KEY"] || "",
      urlEndpoint: process.env["IMAGEKIT_URL_ENDPOINT"] || "",
    },

    cloudinary: {
      cloudName: process.env["CLOUDINARY_CLOUD_NAME"] || "",
      apiKey: process.env["CLOUDINARY_API_KEY"] || "",
      apiSecret: process.env["CLOUDINARY_API_SECRET"] || "",
    },

    aws: {
      region: process.env["AWS_REGION"] || "us-east-1",
      accessKeyId: process.env["AWS_ACCESS_KEY_ID"] || "",
      secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"] || "",
      bucket: process.env["AWS_S3_BUCKET_NAME"] || "",
    },
  },

  // Cache
  cache: {
    enabled: process.env["CACHE_ENABLED"] !== "false",
    ttl: Number.parseInt(process.env["CACHE_TTL"] || "3600", 10),
    prefix: process.env["CACHE_PREFIX"] || "comicwise:",
  },

  // Queue
  queue: {
    enabled: process.env["QUEUE_ENABLED"] !== "false",
    concurrency: Number.parseInt(process.env["QUEUE_CONCURRENCY"] || "5", 10),
    maxRetries: Number.parseInt(process.env["QUEUE_MAX_RETRIES"] || "3", 10),
  },

  // Logging
  logging: {
    level: process.env["LOG_LEVEL"] || "info",
    enabled: true,
  },

  // Rate limiting
  rateLimit: {
    enabled: process.env["RATE_LIMIT_ENABLED"] !== "false",
    maxRequests: Number.parseInt(process.env["RATE_LIMIT_MAX_REQUESTS"] || "100", 10),
    windowMs: Number.parseInt(process.env["RATE_LIMIT_WINDOW_MS"] || "60000", 10),
  },

  // Features
  features: {
    oauth: !!(process.env["GOOGLE_CLIENT_ID"] || process.env["GITHUB_CLIENT_ID"]),
    email: !!(process.env["SMTP_HOST"] || process.env["RESEND_API_KEY"]),
    redis: !!(process.env["REDIS_URL"] || process.env["UPSTASH_REDIS_REST_URL"]),
    upload: process.env["UPLOAD_PROVIDER"] !== "local",
  },
} as const;

export type Config = typeof config;

export default config;
