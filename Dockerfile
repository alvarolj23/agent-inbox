# Build stage
FROM node:18-alpine AS deps
WORKDIR /app

# Print architecture information
RUN uname -a && arch

# Install dependencies only when needed
COPY package.json yarn.lock ./

# Add network retry settings
ARG YARN_NETWORK_TIMEOUT=100000
ARG YARN_NETWORK_CONCURRENCY=1

RUN yarn config set network-timeout ${YARN_NETWORK_TIMEOUT} && \
    yarn config set network-concurrency ${YARN_NETWORK_CONCURRENCY} && \
    yarn install --frozen-lockfile --production=false --network-timeout ${YARN_NETWORK_TIMEOUT}

# Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set correct ownership
USER nextjs

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

# Start the application
CMD ["node", "server.js"] 