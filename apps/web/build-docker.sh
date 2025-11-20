#!/bin/bash

# Build script for Rovierr Web Docker image
# Reads from .env.local for local builds, or uses environment variables for platform builds

set -e

ENV_FILE="apps/web/.env.local"

# Check if .env.local exists (for local development)
if [ -f "$ENV_FILE" ]; then
  # Load environment variables from .env.local
  set -a
  source "$ENV_FILE"
  set +a
  echo "Loaded environment variables from $ENV_FILE"
else
  echo "Note: $ENV_FILE not found, using environment variables from current shell"
  echo "For platform builds (Codebase.com, etc.), env vars should be set in the platform dashboard"
fi

# Build the Docker image with build args from environment variables
docker build -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_SERVER_URL="${NEXT_PUBLIC_SERVER_URL}" \
  --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID="${NEXT_PUBLIC_GOOGLE_CLIENT_ID}" \
  --build-arg NEXT_PUBLIC_POSTHOG_KEY="${NEXT_PUBLIC_POSTHOG_KEY}" \
  --build-arg NEXT_PUBLIC_POSTHOG_HOST="${NEXT_PUBLIC_POSTHOG_HOST}" \
  -t rovierr-web .

echo "Docker image 'rovierr-web' built successfully"
