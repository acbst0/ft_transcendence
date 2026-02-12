FROM caddy:2-alpine

# Update package index and install required packages
RUN apk update && \
	apk add --no-cache openssl bash ca-certificates && \
	rm -rf /var/cache/apk/*

# Copy certificate generation script
COPY generate-cert.sh /usr/local/bin/generate-cert.sh
RUN chmod +x /usr/local/bin/generate-cert.sh

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Create entrypoint script
RUN echo '#!/bin/sh' > /entrypoint.sh && \
	echo '/usr/local/bin/generate-cert.sh' >> /entrypoint.sh && \
	echo 'exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile' >> /entrypoint.sh && \
	chmod +x /entrypoint.sh

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["/entrypoint.sh"]