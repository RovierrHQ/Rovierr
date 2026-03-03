# use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# copy package files first for better caching
COPY package.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/auth/package.json ./packages/auth/
COPY packages/db/package.json ./packages/db/
COPY packages/orpc-contracts/package.json ./packages/orpc-contracts/
COPY packages/realtime/package.json ./packages/realtime/
COPY packages/shared/package.json ./packages/shared/

# install dependencies with cache mount (production only)
# --ignore-scripts skips prepare scripts that require dev dependencies (like husky)
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --production --ignore-scripts

# copy source code and config files
COPY apps/server/src ./apps/server/src
COPY apps/server/start.sh ./apps/server/
COPY apps/server/tsconfig.json apps/server/drizzle.config.ts ./apps/server/
COPY packages/auth/src ./packages/auth/src
COPY packages/auth/tsconfig.json ./packages/auth/
COPY packages/db/src ./packages/db/src
COPY packages/db/tsconfig.json ./packages/db/
COPY packages/orpc-contracts/src ./packages/orpc-contracts/src
COPY packages/orpc-contracts/tsconfig.json ./packages/orpc-contracts/
COPY packages/realtime/src ./packages/realtime/src
COPY packages/realtime/tsconfig.json ./packages/realtime/
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/

# build the server
ENV NODE_ENV=production
WORKDIR /usr/src/app/apps/server

# Make start script executable before switching to bun user
RUN chmod +x start.sh

# run the app
USER bun
ARG PORT=3000
EXPOSE ${PORT}
WORKDIR /usr/src/app/apps/server

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

ENTRYPOINT [ "./start.sh" ]
