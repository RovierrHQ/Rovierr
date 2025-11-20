# use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# copy package files and lockfile first for better caching
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY packages/auth/package.json ./packages/auth/
COPY packages/db/package.json ./packages/db/
COPY packages/orpc-contracts/package.json ./packages/orpc-contracts/
COPY packages/realtime/package.json ./packages/realtime/
COPY packages/shared/package.json ./packages/shared/
COPY packages/ui/package.json ./packages/ui/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# install all dependencies (needed for Next.js build)
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install

# copy source code and config files
COPY apps/web/src ./apps/web/src
COPY apps/web/public ./apps/web/public
COPY apps/web/next.config.ts apps/web/tsconfig.json apps/web/postcss.config.mjs apps/web/components.json ./apps/web/
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
COPY packages/ui/src ./packages/ui/src
COPY packages/ui/tsconfig.json packages/ui/postcss.config.mjs packages/ui/components.json ./packages/ui/
COPY packages/typescript-config ./packages/typescript-config/

# build the Next.js app
# Accept all NEXT_PUBLIC_* environment variables as build args (injected by platform)
# These will be automatically collected and written to .env.production for Next.js
# Pattern matches Amplify workflow: env | grep -E '^NEXT_PUBLIC_'
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST

# Convert ARG to ENV so they're available in the environment
ENV NODE_ENV=production
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}
ENV NEXT_PUBLIC_POSTHOG_KEY=${NEXT_PUBLIC_POSTHOG_KEY}
ENV NEXT_PUBLIC_POSTHOG_HOST=${NEXT_PUBLIC_POSTHOG_HOST}

WORKDIR /usr/src/app/apps/web

# The platform (koyeb.com, Amplify, etc.) injects these as build args or env vars
RUN env | grep -E '^NEXT_PUBLIC_' > .env.production || true

# Build Next.js app (it will read from .env.production)
RUN bun run build

# Remove .env.production after build (security best practice)
RUN rm -f .env.production

# run the app
USER bun
ARG PORT=3001
ENV PORT=${PORT}
EXPOSE ${PORT}
WORKDIR /usr/src/app/apps/web
CMD bun run next start --port ${PORT}
