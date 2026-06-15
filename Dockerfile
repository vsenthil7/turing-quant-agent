# syntax=docker/dockerfile:1.6
# Multi-stage build for turing-quant-agent.
#   builder: install workspace, build @tqa/core + @tqa/agent (tsc) and @tqa/web (next standalone)
#   runtime: nginx serves the web build + reverse-proxies /api -> node agent server
# Single container, matches the /srv/<project> + docker compose pattern on atrio-demo.

# ---------- builder ----------
FROM node:22-slim AS builder
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

# Install deps with workspace context (copy manifests first for layer caching)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages/core/package.json packages/core/
COPY agent/package.json agent/
COPY web/package.json web/
COPY mobile/package.json mobile/
RUN pnpm install --frozen-lockfile

# Copy sources and build
COPY packages/core packages/core
COPY agent agent
COPY web web
RUN pnpm --filter @tqa/core build \
 && pnpm --filter @tqa/agent build \
 && pnpm --filter @tqa/web exec next build

# Prune agent to production deps for a lean runtime node_modules
RUN pnpm --filter @tqa/agent --prod deploy /app/agent-deploy

# ---------- runtime ----------
FROM node:22-slim AS runtime
WORKDIR /app
# nginx for static + reverse proxy
RUN apt-get update && apt-get install -y --no-install-recommends nginx \
 && rm -rf /var/lib/apt/lists/*

# Agent server (compiled) + its production node_modules
COPY --from=builder /app/agent-deploy/dist        /app/agent/dist
COPY --from=builder /app/agent-deploy/node_modules /app/agent/node_modules
COPY --from=builder /app/agent-deploy/package.json /app/agent/package.json

# Web: Next standalone server + static assets.
# In a pnpm workspace, `.next/standalone` preserves the monorepo layout, so the
# server entrypoint is at standalone/web/server.js and assets nest under web/.next.
COPY --from=builder /app/web/.next/standalone /app/web-standalone
COPY --from=builder /app/web/.next/static     /app/web-standalone/web/.next/static
COPY --from=builder /app/web/public           /app/web-standalone/web/public

# nginx config + entrypoint
COPY deploy/nginx.conf   /etc/nginx/sites-available/default
COPY deploy/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Container listens on 80 (nginx). Compose maps host 8097 -> 80.
EXPOSE 80
# Mock mode by default; set TQA_MODE=live + live config to connect Mantle/LLM/etc.
ENV TQA_MODE=mock \
    AGENT_PORT=8000 \
    WEB_PORT=3000 \
    NODE_ENV=production
ENTRYPOINT ["/entrypoint.sh"]
