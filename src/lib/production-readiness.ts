/**
 * Production Readiness Configuration
 * Comprehensive checklist and configuration for production deployment
 */

export const PRODUCTION_READINESS_CHECKLIST = {
  // Database & Data
  database: {
    title: "Database Configuration",
    items: [
      {
        id: "db.url",
        name: "Production DATABASE_URL configured",
        description: "Ensure DATABASE_URL points to production PostgreSQL instance",
        category: "Critical",
        status: "pending",
      },
      {
        id: "db.backups",
        name: "Database backups configured",
        description: "Set up automated daily backups to secure storage",
        category: "Critical",
        status: "pending",
      },
      {
        id: "db.migrations",
        name: "All migrations applied",
        description: "Verify all Drizzle migrations have run successfully",
        category: "Critical",
        status: "pending",
      },
      {
        id: "db.indexes",
        name: "Database indexes optimized",
        description: "Verify all indexes are created and performance is acceptable",
        category: "Important",
        status: "pending",
      },
    ],
  },

  // Security
  security: {
    title: "Security Configuration",
    items: [
      {
        id: "sec.auth.secret",
        name: "AUTH_SECRET strong and secure",
        description: "Generate 32+ character random secret (openssl rand -base64 32)",
        category: "Critical",
        status: "pending",
      },
      {
        id: "sec.https",
        name: "HTTPS enabled",
        description: "All traffic must be encrypted with TLS 1.2+",
        category: "Critical",
        status: "pending",
      },
      {
        id: "sec.headers",
        name: "Security headers configured",
        description: "Content-Security-Policy, X-Frame-Options, X-Content-Type-Options set",
        category: "Important",
        status: "pending",
      },
      {
        id: "sec.cors",
        name: "CORS properly configured",
        description: "Only allow trusted origins",
        category: "Important",
        status: "pending",
      },
      {
        id: "sec.oauth",
        name: "OAuth credentials secure",
        description: "All OAuth secrets stored in secure environment variables",
        category: "Critical",
        status: "pending",
      },
      {
        id: "sec.rate.limit",
        name: "Rate limiting enabled",
        description: "API rate limiting configured to prevent abuse",
        category: "Important",
        status: "pending",
      },
    ],
  },

  // Caching & Performance
  performance: {
    title: "Performance & Caching",
    items: [
      {
        id: "perf.redis",
        name: "Redis caching configured",
        description: "UPSTASH_REDIS_REST_URL configured or local Redis running",
        category: "Important",
        status: "pending",
      },
      {
        id: "perf.cdn",
        name: "CDN configured for static assets",
        description: "Images and static files served from CDN with proper caching",
        category: "Important",
        status: "pending",
      },
      {
        id: "perf.compression",
        name: "Gzip/Brotli compression enabled",
        description: "Server configured to compress responses",
        category: "Important",
        status: "pending",
      },
      {
        id: "perf.image.opt",
        name: "Image optimization enabled",
        description: "next/image configured with proper optimization",
        category: "Important",
        status: "pending",
      },
    ],
  },

  // Monitoring & Observability
  monitoring: {
    title: "Monitoring & Observability",
    items: [
      {
        id: "mon.sentry",
        name: "Sentry error tracking configured",
        description: "SENTRY_DSN configured for error monitoring",
        category: "Important",
        status: "pending",
      },
      {
        id: "mon.logging",
        name: "Structured logging configured",
        description: "Production logging sends to centralized service (e.g., Datadog)",
        category: "Important",
        status: "pending",
      },
      {
        id: "mon.health",
        name: "Health check endpoint configured",
        description: "/api/health endpoint responds correctly",
        category: "Important",
        status: "pending",
      },
      {
        id: "mon.metrics",
        name: "Metrics collection enabled",
        description: "Performance metrics tracked (response times, error rates)",
        category: "Important",
        status: "pending",
      },
      {
        id: "mon.alerts",
        name: "Alerting configured",
        description: "Alerts set up for critical issues (errors, slow responses, downtime)",
        category: "Important",
        status: "pending",
      },
    ],
  },

  // Deployment & DevOps
  deployment: {
    title: "Deployment & DevOps",
    items: [
      {
        id: "deploy.ci",
        name: "CI/CD pipeline automated",
        description: "GitHub Actions runs tests, builds, and deploys on commit",
        category: "Critical",
        status: "pending",
      },
      {
        id: "deploy.env",
        name: "Environment variables managed securely",
        description: "All secrets stored in secure environment variable management",
        category: "Critical",
        status: "pending",
      },
      {
        id: "deploy.rollback",
        name: "Rollback procedure documented",
        description: "Clear steps to rollback to previous version if needed",
        category: "Important",
        status: "pending",
      },
      {
        id: "deploy.downtime",
        name: "Zero-downtime deployment verified",
        description: "Tested that deployments don't cause service interruption",
        category: "Important",
        status: "pending",
      },
      {
        id: "deploy.scaling",
        name: "Auto-scaling configured",
        description: "Application scales automatically based on load",
        category: "Important",
        status: "pending",
      },
    ],
  },

  // Testing & Quality
  quality: {
    title: "Testing & Quality Assurance",
    items: [
      {
        id: "qa.unit.tests",
        name: "Unit test coverage >80%",
        description: "Run pnpm test:unit to verify coverage",
        category: "Important",
        status: "pending",
      },
      {
        id: "qa.e2e.tests",
        name: "E2E tests passing",
        description: "Run pnpm test to verify critical user flows work",
        category: "Important",
        status: "pending",
      },
      {
        id: "qa.load.test",
        name: "Load testing completed",
        description: "Application tested under expected production load",
        category: "Important",
        status: "pending",
      },
      {
        id: "qa.security.scan",
        name: "Security scanning completed",
        description: "SAST and dependency scanning run with no critical issues",
        category: "Critical",
        status: "pending",
      },
    ],
  },

  // Documentation
  documentation: {
    title: "Documentation",
    items: [
      {
        id: "doc.runbook",
        name: "Runbook for common operations",
        description: "Documented procedures for deployment, troubleshooting, rollback",
        category: "Important",
        status: "pending",
      },
      {
        id: "doc.incident",
        name: "Incident response plan documented",
        description: "Clear procedure for handling outages and critical issues",
        category: "Important",
        status: "pending",
      },
      {
        id: "doc.architecture",
        name: "System architecture documented",
        description: "Diagrams and descriptions of system components",
        category: "Important",
        status: "pending",
      },
      {
        id: "doc.api",
        name: "API documentation complete",
        description: "All endpoints documented with examples",
        category: "Important",
        status: "pending",
      },
    ],
  },

  // Email & Notifications
  communications: {
    title: "Email & Notifications",
    items: [
      {
        id: "comm.email",
        name: "Production email service configured",
        description: "EMAIL_* variables point to production SMTP service",
        category: "Important",
        status: "pending",
      },
      {
        id: "comm.test",
        name: "Email templates tested",
        description: "Verify welcome, password reset, notification emails work",
        category: "Important",
        status: "pending",
      },
    ],
  },

  // Compliance
  compliance: {
    title: "Compliance & Legal",
    items: [
      {
        id: "comp.privacy",
        name: "Privacy policy published",
        description: "Privacy policy available and linked from footer",
        category: "Important",
        status: "pending",
      },
      {
        id: "comp.terms",
        name: "Terms of service available",
        description: "Terms of service published and accessible",
        category: "Important",
        status: "pending",
      },
      {
        id: "comp.gdpr",
        name: "GDPR compliance verified",
        description: "User data handling complies with GDPR requirements",
        category: "Important",
        status: "pending",
      },
      {
        id: "comp.cookies",
        name: "Cookie consent implemented",
        description: "Cookie banner shows and respects user preferences",
        category: "Important",
        status: "pending",
      },
    ],
  },
};

/**
 * Production environment configuration template
 */
export const PRODUCTION_ENV_TEMPLATE = {
  // Application
  NODE_ENV: "production",
  PORT: "3000",
  NEXT_PUBLIC_APP_URL: "https://your-domain.com",

  // Database
  DATABASE_URL: "postgresql://user:pass@prod-db.example.com:5432/comicwise",

  // Authentication
  AUTH_SECRET: "<%- GENERATE: openssl rand -base64 32 -%>",
  AUTH_URL: "https://your-domain.com",
  AUTH_GOOGLE_CLIENT_ID: "<%- SETUP: Google Cloud Console -%>",
  AUTH_GOOGLE_CLIENT_SECRET: "<%- SECURE: Store in secret manager -%>",
  AUTH_GITHUB_CLIENT_ID: "<%- SETUP: GitHub Settings -%>",
  AUTH_GITHUB_CLIENT_SECRET: "<%- SECURE: Store in secret manager -%>",

  // Email
  EMAIL_SERVER_HOST: "smtp.sendgrid.net",
  EMAIL_SERVER_PORT: "587",
  EMAIL_SERVER_USER: "apikey",
  EMAIL_SERVER_PASSWORD: "<%- SECURE: SendGrid API key -%>",
  EMAIL_FROM: "noreply@your-domain.com",

  // Redis Caching
  UPSTASH_REDIS_REST_URL: "<%- SETUP: Upstash account -%>",
  UPSTASH_REDIS_REST_TOKEN: "<%- SECURE: Store in secret manager -%>",

  // Sentry Error Tracking
  SENTRY_DSN: "<%- SETUP: Sentry project -%>",

  // File Uploads
  UPLOAD_PROVIDER: "imagekit",
  IMAGEKIT_PUBLIC_KEY: "<%- SETUP: ImageKit account -%>",
  IMAGEKIT_PRIVATE_KEY: "<%- SECURE: Store in secret manager -%>",
  IMAGEKIT_URL_ENDPOINT: "https://your-imagekit-endpoint.imagekit.io",
};

/**
 * Pre-deployment checklist function
 */
export function generatePreDeploymentChecklist(): {
  total: number;
  completed: number;
  percentage: number;
  categories: Record<string, { items: number; completed: number }>;
  blockers: Array<{ id: string; name: string }>;
} {
  let totalItems = 0;
  let completedItems = 0;
  const categories: Record<string, { items: number; completed: number }> = {};
  const blockers: Array<{ id: string; name: string }> = [];

  for (const [categoryKey, category] of Object.entries(PRODUCTION_READINESS_CHECKLIST)) {
    const items = category.items;
    const completed = items.filter((item) => item.status === "complete").length;

    categories[categoryKey] = {
      items: items.length,
      completed,
    };

    totalItems += items.length;
    completedItems += completed;

    // Collect critical blockers
    for (const item of items) {
      if (item.category === "Critical" && item.status !== "complete") {
        blockers.push({ id: item.id, name: item.name });
      }
    }
  }

  return {
    total: totalItems,
    completed: completedItems,
    percentage: Math.round((completedItems / totalItems) * 100),
    categories,
    blockers,
  };
}

/**
 * Security headers for Next.js
 */
export const PRODUCTION_SECURITY_HEADERS = {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

/**
 * Performance budgets for production
 */
export const PERFORMANCE_BUDGETS = {
  // Page load times (ms)
  firstContentfulPaint: 1800,
  largestContentfulPaint: 2500,
  cumulativeLayoutShift: 0.1,
  firstInputDelay: 100,

  // Bundle size (KB)
  mainBundle: 250,
  nextBundle: 150,
  totalPageSize: 1000,

  // Database
  queryTimeout: 5000,
  connectionPoolSize: 20,

  // API
  apiResponseTime: 200,
  apiErrorRate: 0.01, // 1%
  apiErrorRateThreshold: 0.05, // 5%
};
