# syntax=docker/dockerfile:1.7

# ============================================
# Base stage - Common dependencies (Next.js 16 optimized)
# ============================================
FROM node:22-alpine AS base

# Install system dependencies and security updates
RUN apk add --no-cache \
    libc6-compat \
    dumb-init \
    tini \
    && apk upgrade --no-cache

# Enable Corepack for pnpm
RUN corepack enable && \
    corepack prepare pnpm@latest --activate

WORKDIR /app

# Configure pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PNPM_STORE_DIR="/pnpm/store"

# ============================================
# Dependencies stage (with layer caching)
# ============================================
FROM base AS deps

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# Install dependencies with optimal caching
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    --mount=type=cache,id=pnpm-metadata,target=/root/.local/share/pnpm \
    pnpm install --frozen-lockfile --prefer-frozen-lockfile

# ============================================
# Builder stage (with build cache)
# ============================================
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source files
COPY . .

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    SKIP_ENV_VALIDATION=1

# Generate Drizzle types if needed
RUN --mount=type=cache,id=drizzle,target=/app/.drizzle \
    pnpm db:generate 2>/dev/null || echo "✓ No database generation needed"

# Build Next.js with standalone output and caching
RUN --mount=type=cache,id=next-build,target=/app/.next/cache \
    --mount=type=secret,id=env,target=/app/.env.production \
    pnpm build

# ============================================
# Runner stage - Production image (minimal)
# ============================================
FROM base AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Create non-root user with specific UID/GID for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nextjs

# Copy only production files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Security: Remove unnecessary files
RUN rm -rf /tmp/* /var/tmp/* /var/cache/apk/*

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check with proper timeout
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Use tini as PID 1 for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "server.js"]
