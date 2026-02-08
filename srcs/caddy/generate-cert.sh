#!/bin/sh

# Generate self-signed certificate for any IP/domain
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/caddy/server.key \
  -out /etc/caddy/server.crt \
  -subj "/C=TR/ST=Istanbul/L=Istanbul/O=Transcendence/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1,IP:10.19.17.26"

chmod 644 /etc/caddy/server.crt
chmod 600 /etc/caddy/server.key

echo "Certificate generated successfully"
