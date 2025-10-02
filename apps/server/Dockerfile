# use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install pnpm
RUN bun install -g pnpm

# copy package files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages/ ./packages/

# install dependencies
RUN pnpm install --frozen-lockfile

# copy source code (excluding node_modules)
COPY apps/server/src ./apps/server/src
COPY apps/server/tsconfig.json ./apps/server/
COPY packages/*/src ./packages/*/src/
COPY packages/*/package.json ./packages/*/
COPY packages/*/tsconfig.json ./packages/*/

# build the server
ENV NODE_ENV=production
WORKDIR /usr/src/app/apps/server
RUN bun run check-types

# run the app
USER bun
ARG PORT=3000
EXPOSE ${PORT}
WORKDIR /usr/src/app/apps/server
ENTRYPOINT [ "bun", "run", "src/index.ts" ]