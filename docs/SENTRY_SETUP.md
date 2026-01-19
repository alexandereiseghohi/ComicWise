# 🔍 Sentry Error Monitoring - Setup Guide

**Purpose**: Configure Sentry for error tracking, performance monitoring, and
session replay in ComicWise.

---

## 📋 Quick Setup (5 minutes)

### Step 1: Create Sentry Account

1. Go to [https://sentry.io](https://sentry.io)
2. Sign up for a free account
3. Create a new project:
   - **Platform**: Next.js
   - **Project Name**: comicwise
   - **Alert Frequency**: Default (or customize)

### Step 2: Get Your DSN

After creating the project, Sentry will display your DSN. It looks like:

```
https://[public_key]@[org].ingest.sentry.io/[project_id]
```

Example:

```
https://abc123def456@o123456.ingest.sentry.io/789012
```

### Step 3: Install Sentry

```bash
pnpm add @sentry/nextjs
```

### Step 4: Configure Environment Variables

Open `.env.local` and add your Sentry DSN:

```env
# ═══════════════════════════════════════════════════════════════════════════
# ERROR MONITORING & ANALYTICS (Sentry)
# ═══════════════════════════════════════════════════════════════════════════

# Server-side error tracking
SENTRY_DSN="https://abc123def456@o123456.ingest.sentry.io/789012"

# Client-side error tracking (same as server DSN)
NEXT_PUBLIC_SENTRY_DSN="https://abc123def456@o123456.ingest.sentry.io/789012"

# Optional: Sentry organization and project (for releases)
SENTRY_ORG="your-org-name"
SENTRY_PROJECT="comicwise"

# Optional: Auth token (for source maps upload)
# Get from: https://sentry.io/settings/account/api/auth-tokens/
SENTRY_AUTH_TOKEN=""

# Sentry features (already configured with good defaults)
SENTRY_ENABLE_TRACING=true
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_REPLAY_SESSION_SAMPLE_RATE=0.1
SENTRY_REPLAY_ERROR_SAMPLE_RATE=1.0
```

### Step 5: Verify Configuration

The following files are already configured:

- ✅ `sentry.client.config.ts` - Browser error tracking
- ✅ `sentry.server.config.ts` - Server error tracking
- ✅ `sentry.edge.config.ts` - Edge runtime error tracking
- ✅ `src/app/global-error.tsx` - Global error boundary
- ✅ `src/lib/env.ts` - Environment variable validation

### Step 6: Test Sentry

1. Start the development server:

   ```bash
   pnpm dev
   ```

2. Trigger a test error:

   ```bash
   # Visit: http://localhost:3000/sentry-example-page
   # Or add this to any page:
   throw new Error("Sentry test error");
   ```

3. Check Sentry dashboard:
   - Go to [https://sentry.io](https://sentry.io)
   - Navigate to your project
   - Look for the test error in the Issues tab

---

## 🎯 Features Enabled

### Error Tracking ✅

- **Client-side errors**: JavaScript errors in the browser
- **Server-side errors**: Node.js errors on the server
- **Edge runtime errors**: Errors in middleware and edge functions
- **Error boundaries**: Graceful error handling with user-friendly messages

### Performance Monitoring ✅

- **Sample Rate**: 10% (configurable via `SENTRY_TRACES_SAMPLE_RATE`)
- **Tracks**:
  - Page load times
  - API response times
  - Database query performance
  - Third-party API calls

### Session Replay ✅

- **Session Sample Rate**: 10% of all sessions
- **Error Sample Rate**: 100% of sessions with errors
- **Features**:
  - Video-like replay of user sessions
  - See exactly what the user saw when an error occurred
  - Privacy-focused (masks sensitive data)

### Error Filtering ✅

Automatically filters out known non-critical errors:

- ResizeObserver errors
- Non-Error promise rejections
- Network errors from browser extensions

---

## 📊 Sentry Dashboard Features

### Issues Tab

- View all errors grouped by type
- See error frequency and affected users
- Stack traces with source maps
- Browser and OS information

### Performance Tab

- Transaction monitoring
- Slow API endpoints
- Database query performance
- Frontend performance metrics

### Releases Tab

- Track errors by deployment
- Compare error rates between releases
- Source map integration

### Alerts

- Email/Slack notifications for new errors
- Threshold-based alerts (e.g., error spike)
- Customizable alert rules

---

## 🔧 Advanced Configuration

### Source Maps (Recommended for Production)

Source maps help Sentry show readable stack traces. Configure in
`next.config.ts`:

```typescript
// Already configured in next.config.ts
const nextConfig = {
  // ... other config

  // Sentry webpack plugin
  webpack: (config, options) => {
    if (!options.dev && !options.isServer) {
      config.plugins.push(
        new SentryWebpackPlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
          include: ".next",
          ignore: ["node_modules"],
        })
      );
    }
    return config;
  },
};
```

Get auth token from:
[https://sentry.io/settings/account/api/auth-tokens/](https://sentry.io/settings/account/api/auth-tokens/)

### Custom Error Tracking

Add custom context to errors:

```typescript
import * as Sentry from "@sentry/nextjs";

// Set user context
Sentry.setUser({
  id: user.id,
  email: user.email,
});

// Add custom context
Sentry.setContext("comic", {
  id: comic.id,
  title: comic.title,
});

// Capture custom error
Sentry.captureException(new Error("Something went wrong"));

// Capture message
Sentry.captureMessage("User performed important action", "info");
```

### Performance Monitoring

Track custom transactions:

```typescript
import * as Sentry from "@sentry/nextjs";

const transaction = Sentry.startTransaction({
  name: "Fetch Comics",
  op: "database.query",
});

try {
  const comics = await db.query.comics.findMany();
  transaction.setStatus("ok");
} catch (error) {
  transaction.setStatus("error");
  throw error;
} finally {
  transaction.finish();
}
```

### Environment-Specific Configuration

```env
# Development
SENTRY_DSN="https://dev@dev.ingest.sentry.io/1"
SENTRY_TRACES_SAMPLE_RATE=1.0  # 100% in development

# Staging
SENTRY_DSN="https://staging@staging.ingest.sentry.io/2"
SENTRY_TRACES_SAMPLE_RATE=0.5  # 50% in staging

# Production
SENTRY_DSN="https://prod@prod.ingest.sentry.io/3"
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% in production
```

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Sentry DSN configured in production environment
- [ ] Source maps enabled and uploading
- [ ] Performance monitoring configured (10% sample rate)
- [ ] Session replay enabled
- [ ] Alert rules configured
- [ ] Team members invited to Sentry project
- [ ] Integration tested (trigger test error)
- [ ] Sensitive data filtering verified

---

## 📈 Monitoring Best Practices

### 1. Set Up Alerts

- Critical errors: Immediate Slack/email
- Error spikes: >10% increase alert
- Performance degradation: >2s response time

### 2. Regular Review

- Weekly: Review new error types
- Monthly: Analyze performance trends
- Quarterly: Review and clean up old issues

### 3. Error Triage

- **High Priority**: Affects >100 users or critical feature
- **Medium Priority**: Affects <100 users
- **Low Priority**: Edge cases or known issues

### 4. Use Releases

Tag deployments in Sentry:

```bash
# After deployment
npx @sentry/cli releases new "comicwise@1.0.0"
npx @sentry/cli releases finalize "comicwise@1.0.0"
```

---

## 🔒 Privacy & Security

### Data Scrubbing

Sentry automatically scrubs:

- Passwords
- Credit card numbers
- API keys
- Social security numbers

### Session Replay Privacy

- All text is masked by default
- Images are blocked
- User input is sanitized
- Configure in `sentry.client.config.ts`

### GDPR Compliance

- Data stored in EU (select EU region in project settings)
- User data deletion available
- Data retention: 90 days (configurable)

---

## 📞 Support & Resources

- **Sentry Docs**:
  [https://docs.sentry.io/platforms/javascript/guides/nextjs/](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- **Sentry Community**: [https://discord.gg/sentry](https://discord.gg/sentry)
- **Status Page**: [https://status.sentry.io/](https://status.sentry.io/)

---

## ✅ Verification Steps

After setup, verify Sentry is working:

```bash
# 1. Start development server
pnpm dev

# 2. Trigger test error (create test page or add to existing page)
# pages/test-sentry.tsx
export default function TestSentry() {
  return (
    <button onClick={() => {
      throw new Error("Test Sentry Error");
    }}>
      Trigger Error
    </button>
  );
}

# 3. Click the button
# 4. Check Sentry dashboard for the error
# 5. Verify stack trace is readable
# 6. Confirm source location is correct
```

---

**✨ Sentry is now configured and ready to track errors in ComicWise!**

For questions or issues, refer to the Sentry documentation or contact the
development team.
