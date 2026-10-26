#!/bin/sh
# Volumes (Railway, docker compose) are mounted owned by root. Make the upload folder
# writable, then run the app as the unprivileged "node" user.
set -e
mkdir -p "${UPLOAD_DIR:-/data/uploads}"
chown -R node:node "$(dirname "${UPLOAD_DIR:-/data/uploads}")" 2>/dev/null || true
exec su-exec node "$@"
