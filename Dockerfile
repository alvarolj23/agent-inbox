# Build stage for dependencies
FROM node:18-alpine AS deps

WORKDIR /app

# Install dependencies needed for node-gyp
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json yarn.lock ./

# Install production dependencies only
RUN yarn config set network-timeout 600000 && \
    yarn install --production --frozen-lockfile --network-timeout 300000

# Builder stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install all dependencies (including dev deps) for build
RUN yarn install --frozen-lockfile --network-timeout 300000

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
RUN yarn build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

# Start the application
CMD ["node", "server.js"] 