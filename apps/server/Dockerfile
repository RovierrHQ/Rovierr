# use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install pnpm
RUN bun install -g pnpm

# copy package files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages/auth/package.json ./packages/auth/
COPY packages/db/package.json ./packages/db/
COPY packages/orpc-contracts/package.json ./packages/orpc-contracts/
COPY packages/realtime/package.json ./packages/realtime/
COPY packages/shared/package.json ./packages/shared/

# install dependencies with cache mount and filter to only server workspace (production only)
# Increased timeouts for large packages like googleapis (15MB+)
# --ignore-scripts skips prepare scripts that require dev dependencies (like husky)
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm config set network-timeout 600000 && \
    pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-factor 2 && \
    pnpm config set fetch-retry-mintimeout 10000 && \
    pnpm install --frozen-lockfile --filter server... --prod --ignore-scripts --fetch-timeout=600000 --reporter=default --loglevel=info

# copy source code and config files (grouped by package for efficiency)
COPY apps/server/src apps/server/tsconfig.json apps/server/drizzle.config.ts ./apps/server/
COPY packages/auth/src packages/auth/tsconfig.json ./packages/auth/
COPY packages/db/src packages/db/tsconfig.json ./packages/db/
COPY packages/orpc-contracts/src packages/orpc-contracts/tsconfig.json ./packages/orpc-contracts/
COPY packages/realtime/src packages/realtime/tsconfig.json ./packages/realtime/
COPY packages/shared/src packages/shared/tsconfig.json ./packages/shared/

# build the server
ENV NODE_ENV=production
WORKDIR /usr/src/app/apps/server

# run the app
USER bun
ARG PORT=3000
EXPOSE ${PORT}
WORKDIR /usr/src/app/apps/server
ENTRYPOINT [ "bun", "run", "src/index.ts" ]