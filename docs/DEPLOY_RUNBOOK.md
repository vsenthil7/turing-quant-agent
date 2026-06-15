# Deploy Runbook — turing-quant-agent on Vultr (atrio-demo)

Single-container deploy (nginx + Next.js + node agent API) matching the
/srv/<project> + docker compose pattern already on the box.

- Host: `45.77.52.54` (atrio-demo, Ubuntu 24.04)
- Host port: **8097** -> container 80  (free slot after agentfoundry=8096)
- Mode: **mock** by default (NOT connected to Mantle yet; live = Sprints C1-C3)
- Repo: https://github.com/vsenthil7/turing-quant-agent

## One-time / each deploy

```sh
ssh root@45.77.52.54

# First time:
cd /srv && git clone https://github.com/vsenthil7/turing-quant-agent.git
cd /srv/turing-quant-agent

# Subsequent deploys:
cd /srv/turing-quant-agent && git pull

# Build + run (mock mode):
docker compose up -d --build

# Verify (give it ~20s to boot):
curl -s -o /dev/null -w "web: %{http_code}\n"  http://localhost:8097/
curl -s http://localhost:8097/api/health; echo
curl -s http://localhost:8097/api/config; echo
docker compose ps
```

Expected: web 200; `/api/health` returns `{"status":"ok",...,"container":{"aiMode":"gate","dryRun":true,...}}`.

Public URL once deployed: `http://45.77.52.54:8097/`

## Notes
- **Windows caveat:** `next build` standalone packaging uses symlinks, which fail
  on Windows (EPERM). The app compiles fine; the standalone step only completes on
  Linux / inside Docker — which is exactly where it runs here. Do NOT try to build
  the image on the Windows dev box.
- **Mock vs live:** to connect Mantle/LLM/IPFS later, set `TQA_MODE=live` (or per-adapter
  `TQA_*_MODE=live`) plus the live config in compose env / a server-side `.env`
  (never committed). Until then this is a mock-mode demo.
- **Port check before deploy:** confirm 8097 still free: `ss -tlnp | grep :8097`
  (empty = free). If taken, pick the next free 809x and update docker-compose.yml.
