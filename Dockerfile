
# Multi-stage Docker build for Next.js app
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

# Copy package files
COPY app/package.json ./
# Handle yarn.lock - copy if exists, create if symlink
COPY app/yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY app/ .

# Fix Prisma schema configuration
RUN sed -i 's|output = ".*"|output = "../node_modules/.prisma/client"|g' prisma/schema.prisma || true

# Generate Prisma client (requires DATABASE_URL but doesn't need real DB)
ENV DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"
RUN npx prisma generate

# Configure Next.js for standalone output
ENV NEXT_OUTPUT_MODE=standalone
ENV NODE_ENV=production

# Build the Next.js application
RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public

# Copy standalone build (for Next.js standalone output)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files for runtime
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy package.json and install only Prisma CLI for runtime
COPY --from=builder /app/package.json ./package.json
RUN yarn install --production --ignore-scripts --prefer-offline --frozen-lockfile

# Create startup script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000

# Use proper ENV format
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["./docker-entrypoint.sh"]
