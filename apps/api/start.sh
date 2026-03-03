#!/bin/bash
set -e

echo "🚀 Starting Rovierr Server..."
echo "Environment: ${NODE_ENV:-development}"
echo "Port: ${PORT:-3000}"
echo "Host: ${HOST:-0.0.0.0}"
echo ""

# Check critical environment variables
MISSING_VARS=()

check_var() {
  if [ -z "${!1}" ]; then
    MISSING_VARS+=("$1")
  fi
}

echo "🔍 Checking required environment variables..."

check_var "DATABASE_URL"
check_var "BETTER_AUTH_SECRET"
check_var "SERVER_URL"
check_var "GOOGLE_CLIENT_ID"
check_var "GOOGLE_CLIENT_SECRET"
check_var "CORS_ORIGIN"
check_var "USESEND_API_KEY"
check_var "WEB_URL"
check_var "POSTHOG_API_KEY"
check_var "POSTHOG_HOST"
check_var "CLOUDFLARE_ACCESS_KEY"
check_var "CLOUDFLARE_SECRET_KEY"
check_var "CLOUDFLARE_BUCKET_NAME"
check_var "CLOUDFLARE_R2_ENDPOINT"

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
  echo ""
  echo "❌ Missing required environment variables:"
  for var in "${MISSING_VARS[@]}"; do
    echo "  - $var"
  done
  echo ""
  echo "Please set these variables in your .env file or environment."
  echo "See .env.prod.example for reference."
  exit 1
fi

echo "✅ All required environment variables are set"
echo ""

# Start the server
echo "🎯 Starting server on ${HOST:-0.0.0.0}:${PORT:-3000}..."
exec bun run src/index.ts
