
# ===== base =====
FROM node:18-alpine AS base

# ===== deps: install JS deps with Yarn 4 (node_modules linker) =====
FROM base AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare yarn@4.5.0 --activate

# Copy only manifests to leverage cache
COPY app/package.json ./
COPY app/yarn.lock ./

# Configure Yarn inside the project (requires package.json)
RUN yarn config set nodeLinker node-modules

# Install deps
RUN yarn install --immutable

# ===== builder: compile the app & generate Prisma client =====
FROM base AS builder
WORKDIR /app
RUN corepack enable && corepack prepare yarn@4.5.0 --activate

# Bring deps first, then full source (so prisma/schema.prisma exists)
COPY --from=deps /app/node_modules ./node_modules
COPY app/ .

# Ensure a public dir exists so later COPY never fails (even if repo has none)
RUN mkdir -p public

# Ensure Prisma client goes to default path (remove any custom `output = "..."`)
RUN sed -i 's|^\s*output\s*=\s*".*"||' prisma/schema.prisma || true

# Prisma needs a URL to generate; it won't actually connect
ENV DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"

# Generate Prisma client with the SAME version as @prisma/client
RUN VER=$(node -p "require('./package.json').dependencies['@prisma/client'] || (require('./package.json').devDependencies && require('./package.json').devDependencies['@prisma/client'])")  && echo "Using Prisma CLI ${VER}"  && npx --yes prisma@${VER} generate  && ls -la node_modules/@prisma/client || (echo 'Prisma client missing' && exit 1)

# Build Next.js (non-standalone; runtime uses `next start`)
ENV NODE_ENV=production
RUN yarn build

# ===== runner: run with `next start` (no standalone required) =====
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user
RUN addgroup --system --gid 1001 nodejs  && adduser  --system --uid 1001 nextjs

# Bring build output, deps, and runtime bits
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=deps    --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Prisma engines + client at runtime
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000

# Run the Next server
CMD ["node_modules/.bin/next", "start", "-p", "3000"]

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1
