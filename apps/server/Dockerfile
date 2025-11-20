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

# install dependencies with cache mount and filter to only server workspace (production only)
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --production --filter server...

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