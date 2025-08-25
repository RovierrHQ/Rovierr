# Use the official Centrifugo image
FROM centrifugo/centrifugo:v6

# Switch to root to install packages
USER root

# Install envsubst
RUN apk add --no-cache gettext

# Create startup script that handles env substitution
RUN echo '#!/bin/sh' > /centrifugo/start.sh && \
    echo 'echo "Substituting environment variables and starting Centrifugo..."' >> /centrifugo/start.sh && \
    echo 'envsubst < /centrifugo/config.template.json > /centrifugo/config.json' >> /centrifugo/start.sh && \
    echo 'exec centrifugo -c config.json "$@"' >> /centrifugo/start.sh && \
    chmod +x /centrifugo/start.sh

# Set working directory
WORKDIR /centrifugo

# Copy the configuration template
COPY centrifugo-config.json config.template.json

# Copy additional files
COPY src/ src/

# Switch back to centrifugo user for security
USER centrifugo

# Expose the default Centrifugo port
EXPOSE 8000

# Use the start script as entrypoint
ENTRYPOINT ["/centrifugo/start.sh"]
