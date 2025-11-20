# Rovierr Web

This directory contains the Next.js web application for Rovierr. It is built using Bun runtime and Next.js 15 with the App Router.

## Development

Run the development server:

```shell
bun run dev
```

The app will be available at `http://localhost:3001`.

## Docker

### Local Development

Build from root using the build script:

```bash
./apps/web/build-docker.sh
```

The script will read from `apps/web/.env.local` if it exists, or use environment variables from your shell.

### Platform Deployment (Codebase.com, etc.)

**No .env files need to be committed!** The Dockerfile automatically generates `.env.production` from environment variables injected by your platform.

1. Set environment variables in your platform's dashboard:

   - `NEXT_PUBLIC_SERVER_URL`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `NEXT_PUBLIC_POSTHOG_HOST` (optional)

2. The platform will automatically pass these as build args during the Docker build.

3. The Dockerfile will generate `.env.production` from these variables and use them during the Next.js build.

### Manual Build with Build Args

```bash
docker build -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_SERVER_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id \
  --build-arg NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key \
  --build-arg NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com \
  -t rovierr-web .
```

**Important:** The `.env.production` file is automatically generated during build and removed after the build completes for security.

Run the container:

```bash
docker run -d -p 3001:3001 --name rovierr-web rovierr-web
```

View logs:

```bash
docker logs -f rovierr-web
```

Stop and remove the container:

```bash
docker stop rovierr-web
docker rm rovierr-web
```

## Build

Build the production bundle:

```shell
bun run build
```

Start the production server:

```shell
bun run start
```
