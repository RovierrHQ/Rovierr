# use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# copy package files first for better caching
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/auth/package.json ./packages/auth/
COPY packages/config/package.json ./packages/config/
COPY packages/db/package.json ./packages/db/
COPY packages/realtime/package.json ./packages/realtime/

# install dependencies with cache mount (production only)
# --ignore-scripts skips prepare scripts that require dev dependencies (like husky)
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --production --ignore-scripts

# copy source code and config files
COPY apps/api/src ./apps/api/src
COPY apps/api/start.sh ./apps/api/
COPY apps/api/tsconfig.json ./apps/api/
COPY packages/auth/src ./packages/auth/src
COPY packages/auth/tsconfig.json ./packages/auth/
COPY packages/config/base.json ./packages/config/
COPY packages/db/src ./packages/db/src
COPY packages/db/tsconfig.json ./packages/db/
COPY packages/realtime/src ./packages/realtime/src
COPY packages/realtime/tsconfig.json ./packages/realtime/

# build the server
ENV NODE_ENV=production
WORKDIR /usr/src/app/apps/api

# Make start script executable before switching to bun user
RUN chmod +x start.sh

# run the app
USER bun
ARG PORT=3001
EXPOSE ${PORT}
WORKDIR /usr/src/app/apps/api

# Add health check (curl is in oven/bun image)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

ENTRYPOINT [ "./start.sh" ]
