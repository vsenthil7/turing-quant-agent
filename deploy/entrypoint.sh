#!/bin/sh
# Start the agent API (node) + Next.js web server, then nginx in the foreground.
# Mock mode by default; TQA_MODE=live (+ live config) switches adapters.
set -eu

AGENT_PORT="${AGENT_PORT:-8000}"
WEB_PORT="${WEB_PORT:-3000}"

# Render nginx port placeholders.
sed -i "s/__AGENT_PORT__/${AGENT_PORT}/g; s/__WEB_PORT__/${WEB_PORT}/g" \
    /etc/nginx/sites-available/default

# Agent API server (compiled). RUN_SERVER=1 triggers listen in httpServer.js.
RUN_SERVER=1 PORT="${AGENT_PORT}" node /app/agent/dist/server/httpServer.js &
AGENT_PID=$!

# Next.js standalone server. The standalone bundle entrypoint is server.js.
PORT="${WEB_PORT}" HOSTNAME=127.0.0.1 node /app/web/server.js &
WEB_PID=$!

# If either backend dies, stop the container.
trap 'kill "$AGENT_PID" "$WEB_PID" 2>/dev/null || true' TERM INT

# nginx in the foreground (PID 1 keeps the container alive).
nginx -g 'daemon off;'
