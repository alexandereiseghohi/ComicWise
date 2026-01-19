# Email Queue System Documentation

## Overview

The ComicWise email queue system uses **BullMQ** with **Redis** to process
emails asynchronously in the background. This ensures that email sending doesn't
block the main application and provides automatic retry logic for failed emails.

## Architecture

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│                 │      │              │      │             │      │              │
│  Application    ├─────►│  Email Queue ├─────►│  Redis DB   ├─────►│  Worker      │
│  (workflow.ts)  │      │  (queue.ts)  │      │             │      │  (queue.ts)  │
│                 │      │              │      │             │      │              │
└─────────────────┘      └──────────────┘      └─────────────┘      └──────────────┘
                                                                            │
                                                                            ▼
                                                                     ┌──────────────┐
                                                                     │   SMTP       │
                                                                     │   Server     │
                                                                     └──────────────┘
```

## Features

### ✅ Implemented Features

1. **Automatic Retry Logic**
   - Failed emails are retried up to 3 times
   - Exponential backoff: 1s, 2s, 4s between retries
   - Failed jobs are kept for 7 days for debugging

2. **Priority Queue**
   - Urgent emails (priority 0): Password resets, security alerts
   - Normal emails (priority 5): Welcome emails, chapter notifications
   - Low priority (priority 10): Marketing, bulk notifications

3. **Concurrency Control**
   - Processes up to 5 emails concurrently
   - Prevents overwhelming SMTP server
   - Configurable via worker options

4. **Job Retention**
   - Completed jobs kept for 24 hours
   - Failed jobs kept for 7 days
   - Max 1000 completed jobs in history

5. **Monitoring & Logging**
   - Console logging for all email events
   - Job completion/failure tracking
   - Queue statistics (waiting, active, completed, failed)

6. **Graceful Shutdown**
   - Handles SIGTERM and SIGINT signals
   - Closes workers and queues properly
   - Disconnects from Redis cleanly

## Setup

### 1. Prerequisites

- Redis server running locally or remotely
- Node.js 18+ with pnpm

### 2. Install Dependencies

```bash
pnpm install
```

Dependencies installed:

- `bullmq@5.65.1` - Queue management
- `ioredis@5.8.2` - Redis client (required by BullMQ)

### 3. Environment Variables

Add to `.env.local`:

```env
# Redis Configuration (for BullMQ Email Queue)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""  # Optional: leave empty for local dev
```

For production (Upstash Redis Cloud):

```env
REDIS_HOST="your-redis-instance.upstash.io"
REDIS_PORT="6379"
REDIS_PASSWORD="your-redis-password"
```

### 4. Start Redis Locally (Development)

**Windows (with Docker):**

```powershell
docker run -d -p 6379:6379 --name redis redis:latest
```

**macOS/Linux:**

```bash
# With Docker
docker run -d -p 6379:6379 --name redis redis:latest

# With Homebrew (macOS)
brew install redis
brew services start redis
```

### 5. Start the Application

The email worker starts automatically when the application starts (server
component).

```bash
pnpm dev
```

## Usage

### Adding Emails to Queue

#### From Workflow System

The workflow system automatically uses direct email sending. To enable queueing,
update `workflow.ts`:

```typescript
import { queueEmail, queueUrgentEmail, queueNormalEmail } from "./queue";

// Instead of:
const result = await sendEmail({ to, subject, html });

// Use:
const result = await queueEmail({ to, subject, html }, priority);
// Or use convenience functions:
await queueUrgentEmail({ to, subject, html }); // Priority 0
await queueNormalEmail({ to, subject, html }); // Priority 5
```

#### Priority Levels

```typescript
// Urgent (Priority 0) - Highest priority
await queueUrgentEmail({
  to: "user@example.com",
  subject: "Password Reset Request",
  html: "<html>...</html>",
});

// Normal (Priority 5) - Default priority
await queueNormalEmail({
  to: "user@example.com",
  subject: "Welcome to ComicWise!",
  html: "<html>...</html>",
});

// Low Priority (Priority 10) - Lowest priority
await queueLowPriorityEmail({
  to: "user@example.com",
  subject: "Weekly Newsletter",
  html: "<html>...</html>",
});
```

## Monitoring

### Get Queue Statistics

```typescript
import { getQueueStats } from "@/lib/queue";

const stats = await getQueueStats();
console.log(stats);
/*
{
  waiting: 12,    // Emails waiting to be processed
  active: 3,      // Emails currently being sent
  completed: 45,  // Successfully sent emails
  failed: 2,      // Failed emails (will retry)
  delayed: 0,     // Delayed/scheduled emails
  total: 62
}
*/
```

### Clear Old Jobs

```typescript
import { clearCompletedJobs, clearFailedJobs } from "@/lib/queue";

// Clear completed jobs (older than retention period)
await clearCompletedJobs();

// Clear failed jobs (after debugging)
await clearFailedJobs();
```

## Production Deployment

### Recommended Redis Providers

1. **Upstash Redis** (Recommended)
   - Serverless Redis with REST API
   - Pay-per-request pricing
   - Global edge locations
   - https://upstash.com/

2. **Railway Redis**
   - Traditional Redis instance
   - Simple deployment
   - https://railway.app/

3. **AWS ElastiCache**
   - Enterprise-grade Redis
   - VPC isolation
   - Automated backups

### Environment Variables (Production)

```env
REDIS_HOST="your-production-redis.upstash.io"
REDIS_PORT="6379"
REDIS_PASSWORD="your-secure-password"
```

### Worker Scaling

For high-volume email sending, run multiple worker instances:

```typescript
// In queue.ts, increase concurrency:
const emailWorker = new Worker(
  "emails",
  async (job: Job<SendEmailParams>) => {
    // ... job processing
  },
  {
    connection,
    concurrency: 10, // Process 10 emails concurrently
  }
);
```

Or run separate worker processes:

```bash
# Start multiple workers
NODE_ENV=production node --env-file=.env.local workers/email-worker.js &
NODE_ENV=production node --env-file=.env.local workers/email-worker.js &
```

## Troubleshooting

### Issue: Emails not sending

**Check:**

1. Redis connection: `redis-cli ping` should return `PONG`
2. Email service configured: Check `.env.local` for `EMAIL_SERVER_*` variables
3. Worker running: Check console for `[EmailWorker]` logs

### Issue: Redis connection error

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:**

- Ensure Redis is running: `docker ps` or `brew services list`
- Start Redis: `docker start redis` or `brew services start redis`

### Issue: High failed job count

**Check:**

1. SMTP credentials correct
2. Email rate limits not exceeded
3. View failed job details in Redis or BullBoard (optional UI)

## Optional: BullBoard UI

Install BullBoard for a visual queue management dashboard:

```bash
pnpm add @bull-board/api @bull-board/ui @bull-board/express
```

Create `src/app/api/admin/queue/route.ts`:

```typescript
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { emailQueue } from "@/lib/queue";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/api/admin/queue");

createBullBoard({
  queues: [new BullMQAdapter(emailQueue)],
  serverAdapter,
});

export { serverAdapter };
```

Access at: `http://localhost:3000/api/admin/queue`

## Testing

### Test Queue Functionality

Create `src/tests/queue.test.ts`:

```typescript
import { queueEmail, getQueueStats } from "@/lib/queue";

// Test email queueing
const result = await queueEmail({
  to: "test@example.com",
  subject: "Test Email",
  html: "<p>This is a test</p>",
});

console.log("Job ID:", result.jobId);

// Wait a few seconds for processing
await new Promise((resolve) => setTimeout(resolve, 5000));

// Check stats
const stats = await getQueueStats();
console.log("Queue Stats:", stats);
```

Run: `tsx src/tests/queue.test.ts`

## Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "queue:stats": "tsx --env-file=.env.local scripts/queue-stats.ts",
    "queue:clear": "tsx --env-file=.env.local scripts/queue-clear.ts",
    "worker:start": "tsx --env-file=.env.local src/lib/queue.ts"
  }
}
```

## Performance Metrics

Expected performance (with 5 concurrent workers):

- **Throughput**: ~300-500 emails/minute
- **Latency**: 1-3 seconds per email
- **Memory**: ~50-100 MB per worker

For higher throughput, increase concurrency or add more worker processes.

## Security Best Practices

1. **Secure Redis**
   - Use strong password
   - Enable TLS for production
   - Restrict network access

2. **Rate Limiting**
   - Email service already has rate limiting
   - Consider additional queue-level rate limiting

3. **Input Validation**
   - Email addresses validated by Zod
   - HTML content sanitized
   - Subject length limits enforced

## Next Steps

- [ ] Add BullBoard UI for queue visualization
- [ ] Implement email templates with React Email
- [ ] Add scheduled/delayed emails
- [ ] Set up monitoring alerts (queue depth, failure rate)
- [ ] Implement dead letter queue for permanently failed emails
- [ ] Add email analytics (open rates, click rates)

## References

- [BullMQ Documentation](https://docs.bullmq.io/)
- [ioredis Documentation](https://github.com/redis/ioredis)
- [Redis Documentation](https://redis.io/docs/)
- [Upstash Redis](https://docs.upstash.com/redis)
