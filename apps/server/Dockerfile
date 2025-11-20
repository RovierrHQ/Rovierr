# use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install

RUN mkdir -p /temp/prod

# copy all package.json files for workspace resolution
COPY package.json /temp/prod/
COPY apps/server/package.json /temp/prod/apps/server/
COPY packages/auth/package.json /temp/prod/packages/auth/
COPY packages/db/package.json /temp/prod/packages/db/
COPY packages/orpc-contracts/package.json /temp/prod/packages/orpc-contracts/
COPY packages/realtime/package.json /temp/prod/packages/realtime/
COPY packages/shared/package.json /temp/prod/packages/shared/

# install with --production (exclude devDependencies)
RUN cd /temp/prod && \
    bun install --production --filter server...

# copy production dependencies and source code into final image
FROM base AS release

# copy production node_modules from install stage
COPY --from=install /temp/prod/node_modules ./node_modules

# copy package.json and lockfile (if exists)
COPY package.json ./

# copy all package.json files for workspace resolution
COPY apps/server/package.json ./apps/server/
COPY packages/auth/package.json ./packages/auth/
COPY packages/db/package.json ./packages/db/
COPY packages/orpc-contracts/package.json ./packages/orpc-contracts/
COPY packages/realtime/package.json ./packages/realtime/
COPY packages/shared/package.json ./packages/shared/

# copy source code and config files
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
