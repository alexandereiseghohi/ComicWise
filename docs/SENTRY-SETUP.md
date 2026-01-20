# Sentry Monitoring Setup Guide

Complete guide for configuring Sentry error tracking and performance monitoring
in ComicWise.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Configuration](#configuration)
- [Error Tracking](#error-tracking)
- [Performance Monitoring](#performance-monitoring)
- [Source Maps](#source-maps)
- [User Context](#user-context)
- [Custom Events](#custom-events)
- [Alerts](#alerts)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Sentry provides:

- Real-time error tracking
- Performance monitoring
- Release tracking
- User session replay
- Custom alerts and notifications

**Current Status:** Dependencies installed (10.34.0), needs configuration

## Installation

Already installed in `package.json`:

```json
{
  "dependencies": {
    "@sentry/nextjs": "^10.34.0"
  }
}
```

## Configuration

### 1. Create Sentry Account

```bash
# Visit Sentry
https://sentry.io/signup/

# Or use GitHub OAuth
```

### 2. Create New Project

```
Dashboard → Create Project
- Platform: Next.js
- Project name: comicwise
- Team: Your team name
```

### 3. Get DSN (Data Source Name)

```
Settings → Projects → comicwise → Client Keys (DSN)

Copy the DSN URL:
https://[key]@[organization].ingest.sentry.io/[project-id]
```

### 4. Configure Environment Variables

Add to `.env.production`:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://[key]@[organization].ingest.sentry.io/[project-id]
SENTRY_ORG=your-organization
SENTRY_PROJECT=comicwise
SENTRY_AUTH_TOKEN=your-auth-token  # For source maps upload

# Environment
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production

# Performance
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% of transactions
SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1  # 10% of sessions
SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1.0  # 100% of error sessions
```

Add to `.env.local` (development):

```bash
NEXT_PUBLIC_SENTRY_DSN=https://[key]@[organization].ingest.sentry.io/[project-id]
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=1.0  # 100% in dev
```

### 5. Create Sentry Configuration Files

Create `sentry.client.config.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "development",

  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || "development",

  // Performance monitoring
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1"),

  // Session Replay
  replaysSessionSampleRate: parseFloat(
    process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE || "0.1"
  ),
  replaysOnErrorSampleRate: parseFloat(
    process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || "1.0"
  ),

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Filtering
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    "chrome-extension://",
    "moz-extension://",

    // Network errors
    "NetworkError",
    "Failed to fetch",

    // Third-party scripts
    "gtag",
    "google-analytics",
  ],

  // Before sending
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }

    // Don't send errors in development
    if (process.env.NODE_ENV === "development") {
      console.error(hint.originalException || hint.syntheticException);
      return null;
    }

    return event;
  },
});
```

Create `sentry.server.config.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "development",
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || "development",

  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1"),

  // Server-specific integrations
  integrations: [
    Sentry.httpIntegration(),
    Sentry.prismaIntegration(), // If using Prisma
  ],

  beforeSend(event) {
    // Filter sensitive server data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.["authorization"];
      delete event.request.headers?.["cookie"];
    }

    if (process.env.NODE_ENV === "development") {
      return null;
    }

    return event;
  },
});
```

Create `sentry.edge.config.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || "development",
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1"),
});
```

### 6. Configure Next.js

Update `next.config.ts`:

```typescript
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig = {
  // ... your existing config
};

export default withSentryConfig(
  nextConfig,
  {
    // Sentry Webpack Plugin Options
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,

    // Authentication token for uploading source maps
    authToken: process.env.SENTRY_AUTH_TOKEN,

    // Upload source maps
    silent: true, // Suppresses source map upload logs

    // Automatically annotate React components
    autoInstrumentServerFunctions: true,

    // Hides source maps from being publicly accessible
    hideSourceMaps: true,

    // Disables Sentry CLI release creation
    disableLogger: true,
  },
  {
    // Sentry SDK Options

    // Automatically tree-shake Sentry logger statements
    widenClientFileUpload: true,

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Disable client-side Sentry in development
    disableClientWebpackPlugin: process.env.NODE_ENV === "development",
    disableServerWebpackPlugin: process.env.NODE_ENV === "development",
  }
);
```

## Error Tracking

### Automatic Error Capture

Errors are automatically captured:

```typescript
// This error will be automatically sent to Sentry
throw new Error("Something went wrong!");
```

### Manual Error Capture

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  // risky operation
  await dangerousFunction();
} catch (error) {
  Sentry.captureException(error, {
    level: "error",
    tags: {
      section: "payment",
      user_action: "checkout",
    },
    extra: {
      orderId: order.id,
      amount: order.total,
    },
  });
}
```

### Server Action Errors

```typescript
"use server";

import * as Sentry from "@sentry/nextjs";

export async function updateUserProfile(data: FormData) {
  try {
    // ... update logic
  } catch (error) {
    Sentry.captureException(error, {
      tags: { action: "updateUserProfile" },
      user: { id: userId },
    });

    return { success: false, error: "Failed to update profile" };
  }
}
```

### API Route Errors

```typescript
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: Request) {
  try {
    // ... API logic
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## Performance Monitoring

### Transaction Tracking

```typescript
import * as Sentry from "@sentry/nextjs";

// Automatic transaction for page loads
// Named after the route: "GET /comics/[id]"

// Manual transaction
const transaction = Sentry.startTransaction({
  name: "Process Payment",
  op: "payment",
});

try {
  const result = await processPayment(paymentData);
  transaction.setStatus("ok");
} catch (error) {
  transaction.setStatus("internal_error");
  throw error;
} finally {
  transaction.finish();
}
```

### Custom Spans

```typescript
import * as Sentry from "@sentry/nextjs";

async function fetchComicData(id: number) {
  return await Sentry.startSpan(
    {
      name: "fetchComicData",
      op: "db.query",
      attributes: { comicId: id },
    },
    async () => {
      // Database query
      const comic = await db.query.comic.findFirst({
        where: eq(comic.id, id),
      });

      return comic;
    }
  );
}
```

### Database Query Monitoring

```typescript
import * as Sentry from "@sentry/nextjs";

// Wrap database calls
async function getComics() {
  return await Sentry.startSpan(
    { name: "Get Comics", op: "db.query" },
    async () => {
      return await db.query.comic.findMany({
        limit: 20,
      });
    }
  );
}
```

## Source Maps

### Enable Source Maps Upload

Source maps help Sentry show the original source code in error stack traces.

1. **Install Sentry CLI:**

   ```bash
   pnpm add -D @sentry/cli
   ```

2. **Create Auth Token:**

   ```
   Sentry → Settings → Auth Tokens → Create New Token

   Scopes:
   - project:read
   - project:releases
   - org:read
   ```

3. **Add to Environment:**

   ```bash
   SENTRY_AUTH_TOKEN=your-token-here
   ```

4. **Build with Source Maps:**

   ```bash
   # Production build automatically uploads source maps
   pnpm run build
   ```

5. **Verify Upload:**
   ```
   Sentry → Project → Releases → Select Release → Source Maps
   ```

## User Context

### Set User Information

```typescript
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export function SentryUserContext() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      Sentry.setUser({
        id: session.user.id,
        email: session.user.email,
        username: session.user.name,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [session]);

  return null;
}

// Add to app layout
<SentryUserContext />
```

### Clear User Context on Logout

```typescript
import * as Sentry from "@sentry/nextjs";
import { signOut } from "next-auth/react";

async function handleLogout() {
  Sentry.setUser(null);
  await signOut();
}
```

## Custom Events

### Breadcrumbs

```typescript
import * as Sentry from "@sentry/nextjs";

// Add context before errors occur
Sentry.addBreadcrumb({
  category: "auth",
  message: "User logged in",
  level: "info",
});

Sentry.addBreadcrumb({
  category: "navigation",
  message: "Navigated to comic details",
  data: { comicId: 123 },
  level: "info",
});
```

### Custom Messages

```typescript
import * as Sentry from "@sentry/nextjs";

// Send informational message
Sentry.captureMessage("Payment threshold exceeded", {
  level: "warning",
  tags: { feature: "payments" },
  extra: { amount: 10000 },
});
```

### Tags and Context

```typescript
import * as Sentry from "@sentry/nextjs";

// Set global tags
Sentry.setTag("page_locale", "en-US");
Sentry.setTag("user_role", "admin");

// Set global context
Sentry.setContext("character", {
  name: "Spider-Man",
  publisher: "Marvel",
});

// Clear context
Sentry.setContext("character", null);
```

## Alerts

### Configure Alert Rules

1. **Go to Alerts:**

   ```
   Sentry → Alerts → Create Alert Rule
   ```

2. **Issue Alerts:**
   - **New Issue:** Alert when a new error occurs
   - **Regression:** Alert when a resolved issue reoccurs
   - **Frequency:** Alert when error frequency exceeds threshold

3. **Metric Alerts:**
   - **Error Rate:** Alert when error rate > 1%
   - **Response Time:** Alert when p95 > 3 seconds
   - **Throughput:** Alert when requests/min drops

4. **Configure Actions:**
   - Email notification
   - Slack webhook
   - GitHub issue creation
   - PagerDuty incident

### Example Alert Configuration

```yaml
# .sentry/alerts/high-error-rate.yaml
name: High Error Rate
conditions:
  - id: sentry.rules.conditions.event_frequency.EventFrequencyCondition
    interval: 1h
    value: 100
actions:
  - id: sentry.mail.actions.NotifyEmailAction
    targetType: IssueOwners
  - id: sentry.integrations.slack.notify_action.SlackNotifyServiceAction
    workspace: your-workspace
    channel: #alerts
```

## Best Practices

### 1. Environment Separation

```typescript
// Don't send development errors to Sentry
if (process.env.NODE_ENV === "development") {
  console.error(error);
  return;
}

Sentry.captureException(error);
```

### 2. Sensitive Data Filtering

```typescript
Sentry.init({
  beforeSend(event) {
    // Remove passwords
    if (event.request?.data?.password) {
      delete event.request.data.password;
    }

    // Remove tokens
    if (event.request?.headers?.authorization) {
      delete event.request.headers.authorization;
    }

    return event;
  },
});
```

### 3. Error Grouping

```typescript
// Use fingerprints to group similar errors
Sentry.captureException(error, {
  fingerprint: ["database-connection-error", databaseName],
});
```

### 4. Sample Rates

```typescript
// Production
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% of transactions

// Staging
SENTRY_TRACES_SAMPLE_RATE=0.5  # 50% of transactions

// Development
SENTRY_TRACES_SAMPLE_RATE=1.0  # 100% of transactions
```

### 5. Performance Budget

```typescript
// Set performance thresholds
Sentry.setTag("expected_duration", "< 1s");

if (duration > 1000) {
  Sentry.captureMessage("Slow operation detected", {
    level: "warning",
    extra: { duration },
  });
}
```

## Troubleshooting

### Issue: Errors not appearing in Sentry

**Solution:**

```bash
# Verify DSN is set
echo $NEXT_PUBLIC_SENTRY_DSN

# Check Sentry configuration files exist
ls -la sentry.*.config.ts

# Test error capture
curl -X POST https://[key]@[org].ingest.sentry.io/api/[project]/store/ \
  -H 'Content-Type: application/json' \
  -d '{"message":"Test error"}'
```

### Issue: Source maps not uploaded

**Solution:**

```bash
# Verify auth token
echo $SENTRY_AUTH_TOKEN

# Manual upload
pnpm exec sentry-cli sourcemaps upload \
  --org your-org \
  --project comicwise \
  .next/static/chunks/
```

### Issue: Too many events

**Solution:**

```typescript
// Reduce sample rates
SENTRY_TRACES_SAMPLE_RATE=0.01  # 1%

// Add ignore patterns
Sentry.init({
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection",
  ],
});
```

### Issue: Missing user context

**Solution:**

```typescript
// Ensure user context is set in app
useEffect(() => {
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email });
  }
}, [user]);
```

## Monitoring Checklist

- [ ] Sentry account created
- [ ] Project created with DSN
- [ ] Environment variables configured
- [ ] Configuration files created
- [ ] Source maps uploading
- [ ] User context tracking
- [ ] Alert rules configured
- [ ] Slack integration setup
- [ ] Performance monitoring enabled
- [ ] Sample rates adjusted

## Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Error Tracking](https://docs.sentry.io/product/issues/)
- [Alerts](https://docs.sentry.io/product/alerts/)
