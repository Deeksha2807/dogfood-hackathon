# ==========================================
# Stage 1: Builder
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies required for native compilation (argon2) and Prisma
RUN apk add --no-cache openssl libc6-compat python3 make g++

# Copy package manifests and install all dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy application source and build configuration
COPY tsconfig.json ./
COPY src ./src/

# Compile TypeScript
RUN npm run build

# Remove development dependencies to keep runtime footprint minimal
RUN npm prune --omit=dev

# Ensure Prisma client is pristine in pruned production node_modules
RUN npx prisma generate

# ==========================================
# Stage 2: Production Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime libraries required by Prisma engine and native modules (argon2)
RUN apk add --no-cache openssl libc6-compat libstdc++

ENV NODE_ENV=production
ENV PORT=5000

# Copy production dependencies, build outputs, and database definitions
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 5000

# Run migrations, apply idempotent seed fixtures, and launch backend server
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && exec node dist/index.js"]
