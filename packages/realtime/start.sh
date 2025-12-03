#!/bin/sh
echo "Substituting environment variables and starting Centrifugo..."

# Convert comma-separated ALLOWED_ORIGINS to JSON array
if [ -n "$ALLOWED_ORIGINS" ]; then
  # Replace commas with "," and wrap in brackets
  ORIGINS_JSON=$(echo "$ALLOWED_ORIGINS" | sed 's/,/","/g' | sed 's/^/["/;s/$/"]/')
else
  ORIGINS_JSON='["*"]'
fi

# Substitute environment variables
envsubst < /centrifugo/config.template.json > /centrifugo/config.tmp.json

# Replace placeholder with actual origins JSON (using | as delimiter to avoid issues with /)
sed "s|\[\"PLACEHOLDER_WILL_BE_REPLACED\"\]|$ORIGINS_JSON|" /centrifugo/config.tmp.json > /centrifugo/config.json
rm /centrifugo/config.tmp.json

# Start Centrifugo
exec centrifugo -c config.json "$@"
