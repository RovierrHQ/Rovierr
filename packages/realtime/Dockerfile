# Use the official Centrifugo image
FROM centrifugo/centrifugo:v6

# Switch to root to install packages
USER root

# Install envsubst
RUN apk add --no-cache gettext

# Copy startup script
COPY start.sh /centrifugo/start.sh
RUN chmod +x /centrifugo/start.sh

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
