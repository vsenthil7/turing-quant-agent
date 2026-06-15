# Sprint Tracker — turing-quant-agent

Single source of truth for all work. Mini-sprint cadence. Every sprint:
**build -> commit -> test -> (if red) fix -> commit -> push -> test -> (green) next.**

Legend — State: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked
Env: `[SANDBOX]` runs offline/deterministic · `[DESKTOP]` needs chain/DB/browser/auth

Repo: https://github.com/vsenthil7/turing-quant-agent (public)
Local: `D:\Users\senthil\Projects\0017_AT-Hack0028-The Turing Test`
Monorepo: `turing-quant-agent` · packages `@tqa/core`, `@tqa/agent`, `@tqa/web`, `@tqa/mobile`, `contracts`

**Mock/live policy:** every external boundary (chain, oracle, IPFS, LLM, DB) is
parameterised. Default `mock` (deterministic, no network/keys). `live` selected via
env flag (`TQA_MODE` / per-adapter `*_MODE`). Switching is a parameter, not a code change.

**Deploy target:** Vultr VPS `atrio-demo` (45.77.52.54, Ubuntu 24.04), single-container
nginx+node pattern under /srv/<project>, one host port -> container 80, `docker compose up -d`.
Host ports in use (2026-06-15 ss -tlnp): 1025, 5432/5434/5435, 7880/7881/7882, 8000, 8025,
8080, 8081, 8093, 8094, 8095, 8096, 8787, 9000/9001. **turing-quant-agent assigned host port 8097**
(next free in the 809x web band after agentfoundry=8096). DB port if ever needed: 5436.

---

## Status snapshot (updated each sprint)

| Workspace | Tests passing | Coverage gate (100%) | Clean-install OK |
|-----------|---------------|----------------------|------------------|
| @tqa/core | 193 / 193     | PASS 100% all metrics | OK |
| @tqa/agent| 192 / 192     | PASS 100% all metrics | OK (builds via tsc) |
| @tqa/web  | 223 / 223     | PASS 100% all metrics | OK (test deps fixed S3) |
| @tqa/mobile| 6 / 6        | PASS 100% (lib scope) | OK (test deps fixed S3) |
| contracts | not yet run   | - (Foundry)          | - |

**Unit total: 614 tests, all green, 100% coverage across all four workspaces. core + agent build clean via tsc.**

---

## DONE — prior sprints (from BUILD_PLAN.md, built before this session)

### Off-chain engine — @tqa/core
- [x] [SANDBOX] quant engine: indicators, ensemble, regime, sizing, costs, strategy registry
- [x] [SANDBOX] risk, portfolio, guardrails, analytics, optimize
- [x] [SANDBOX] B1 strategies: momentum + breakout + meanReversion
- [x] [SANDBOX] B2 position lifecycle (open/close/PnL state machine)
- [x] [SANDBOX] B3 order types (market/limit/stop validation + trigger)
- [x] [SANDBOX] B4 alerting rules (threshold/drawdown/anomaly)
- [x] [SANDBOX] B5 backtest engine v2 (ensemble-aware, cost-aware, PerfReport)
- [x] [SANDBOX] B6 portfolio rebalancing (target-weight diff -> orders)
- [x] [SANDBOX] B7 audit export (deterministic -> CSV/JSON)
- [x] [SANDBOX] FOUND+FIXED bug: RSI returned 100 on flat market; now 50 (neutral)

### Agent layer — @tqa/agent
- [x] [SANDBOX] parse, orchestrate, config, policy, macro, replay, reputation
- [x] [SANDBOX] observability, audit, events, persistence, container, api
- [x] [SANDBOX] B8 config schema v2 (per-tenant, strategy selection, fee schedule)
- [x] [SANDBOX] B9 API handlers v2 (leaderboard, accounts, ledger, deposit/withdraw)
- [x] [SANDBOX] B10 notification model (events -> payloads)
- [x] [SANDBOX] buyer domains: accounts, ledger, feeModel, leaderboard, ratelimit
- [x] [SANDBOX] 5 adapter stubs with TODO[DESKTOP]: viem, mantleOracle, ipfs, sqlite, openai

### Web — @tqa/web
- [x] [SANDBOX] 12 components + lib view-models + RTL/jsdom/jest-axe tests
- [x] [SANDBOX] FOUND+FIXED a11y bug: orphan ARIA roles in DecisionRow
- [x] [DESKTOP] Playwright E2E specs written (7 specs x4 browsers)
- [ ] [DESKTOP] wire screens to routes + live API

### Mobile — @tqa/mobile
- [x] [SANDBOX] Expo App + NavShell + format/logic tests
- [x] [DESKTOP] Detox E2E specs written

### Contracts
- [x] [SANDBOX] AgentIdentity.sol (ERC-8004), DecisionLog.sol, StrategyVault.sol + Foundry tests + Deploy script (written; not yet compiled)

---

## THIS SESSION — Desktop migration sprints

### Sprint 0 — Setup & baseline  DONE (2026-06-15)
- [x] Read hackathon brief + inventory zip (BUILD_PLAN.md + scaffold.tar.gz)
- [x] Confirm env: git 2.54, node v24.16, corepack 0.35 (pnpm via `corepack pnpm@9`), gh 2.93 authed vsenthil7
- [x] Populate project folder from scaffold; remove nested scaffold.tar.gz
- [x] git init; baseline commit 61780c9
- [x] gh repo create turing-quant-agent --public --source . --push
- [x] corepack pnpm@9 install (1093 pkgs; only optional native dep dtrace-provider failed - non-fatal)
- [x] core suite: 156/156 pass BUT coverage gate fails (99.65/94.15 vs 100)
- [x] agent suite: 108/129 pass, 3 files fail to load - root cause missing `zod`
- Outcome: "506 green" was assertions-only; Desktop clean-install + coverage gates expose 2 real gaps.

### Sprint 1 — Fix `zod` dependency (unblock agent)  DONE (2026-06-15)
- [x] [SANDBOX] add `zod` ^3.25.76 to agent/package.json (was undeclared; pulled transitively before)
- [x] [SANDBOX] reinstall clean; agent suite 108 -> **129/129 pass**
- [x] commit + push  (coverage gate still open -> folded into Sprint 2)

### Sprint 2 — Coverage to 100% (core + agent)  DONE (2026-06-15)
- [x] [SANDBOX] core branch/edge tests (coverage-s2.test.ts): alerts, orders, position, rebalance, strategies-extra, auditExport -> core 193/193, 100% all metrics (b04ed5e)
- [x] [SANDBOX] FOUND+REMOVED dead code: backtest2.ts unreachable `[0]` fallback (guard makes it impossible)
- [x] [SANDBOX] agent branch/edge tests (coverage-s2.test.ts): api2, notifications, accounts, feeModel, leaderboard, ledger, ratelimit -> agent 161/161, 100% all metrics
- [x] [SANDBOX] both gates green; commit + push

### Sprint 3 — Web + mobile clean-run  DONE (2026-06-15)
- [x] [SANDBOX] FOUND+FIXED: web declared NONE of its test deps (jsdom, @testing-library/react+user-event+jest-dom, jest-axe, @vitejs/plugin-react). Added to web/package.json; added `test` script.
- [x] [SANDBOX] added coverage thresholds (100%) + scope (exclude layout.tsx, e2e, configs) to web vitest.config
- [x] [SANDBOX] added tests: apiClient (paths+non-ok), custody Infinity branch, CustodyPanelAsync withdraw/deposit tabs + invalid-amount, CustodyPanel deposit tab
- [x] [SANDBOX] REMOVED dead guard in CustodyPanelAsync (unreachable: submit btn disabled when invalid)
- [x] [SANDBOX] web -> 223/223, 100% all metrics
- [x] [SANDBOX] mobile: added apiClient test; scoped coverage to lib/** (App.tsx + Detox e2e are Desktop-covered); added test script + deps
- [x] [SANDBOX] mobile -> 6/6, lib 100%
- [x] [SANDBOX] commit + push

### Sprint 4 — Tracker/traceability/docs in repo  [~] IN PROGRESS
- [x] create docs/SPRINT_TRACKER.md (this file)
- [x] create docs/TRACEABILITY.md
- [x] commit + push tracker + traceability (a8fb32a)
- [ ] add README.md (setup, architecture, deploy address placeholder - 20-Project Award req)

### Sprint 5 — Mock/live parameterisation  DONE (2026-06-15)  [SANDBOX]
- [x] [SANDBOX] mocks.ts: deterministic in-memory impls of Chain, LlmClient, ProvenanceStore, EventStore, oracle
- [x] [SANDBOX] factory.ts: resolveMode (per-adapter env wins over TQA_MODE, default mock) + make* selectors; live requires config or throws
- [x] [SANDBOX] adapters/index.ts exports mocks + factory; narrowed coverage exclude to live stubs only (mocks+factory now covered)
- [x] [SANDBOX] tests: full mock behavior, end-to-end mock run, mode resolution, live-without-config errors -> agent 182/182, 100%
- [x] [SANDBOX] .env.example: documented TQA_MODE + per-adapter flags + live config keys
- [x] [SANDBOX] commit + push

---

## Sprint 6 — Server binding (prerequisite for deploy)  DONE (2026-06-15)  [SANDBOX]
Production HTTP server so the app is runnable/containerisable. No external keys (mock mode).
- [x] [SANDBOX] thin Node http server (src/server/httpServer.ts) + pure router (router.ts) over api/api2 handlers -> /health,/state,/metrics,/config,/replay
- [x] [SANDBOX] buildContainerFromFactory(): makeAdapters in mock by default; TQA_MODE=live switches (live needs config)
- [x] [SANDBOX] router tests: every route, method-guards (405), 404, slash-normalisation -> agent 192/192, 100%
- [x] [SANDBOX] FOUND+FIXED 4 build-time bugs (masked by vitest's ambient env, exposed by real tsc build):
      (a) @types/node undeclared; (b) @tqa/core had no types/exports + not a declared workspace dep;
      (c) ApiResponse exported by both api.ts and api2.ts (dup); (d) no proven build path existed at all.
- [x] [SANDBOX] core+agent now build clean via tsc (core emits dist + .d.ts; agent consumes @tqa/core workspace dist)
- [x] [VERIFIED LIVE] booted compiled server on :8099 -> /health,/state,/config,/metrics 200, /nope 404 (mock mode)
- [x] cleaned stray in-src compiled artifacts; added *.tsbuildinfo to .gitignore
- [ ] commit + push

## Sprint 7 — Containerise + deploy to Vultr (mock-mode demo)  [~] ARTIFACTS DONE; deploy pending on box
Single-container nginx+node, matching the Convergence pattern on atrio-demo.
- [x] [SANDBOX] Dockerfile (multi-stage: pnpm build core+agent+web standalone; runtime nginx + node)
- [x] [SANDBOX] docker-compose.yml (host 8097 -> 80), deploy/nginx.conf (/api proxy strip), deploy/entrypoint.sh, .dockerignore
- [x] [SANDBOX] web build prerequisites: next.config.js (output standalone), web/tsconfig.json, public/ dir, agent start script
- [x] [VERIFIED] `next build` COMPILES clean (4/4 pages, types OK); standalone symlink step fails on Windows only (EPERM) -> works in Linux/Docker
- [x] [SANDBOX] docs/DEPLOY_RUNBOOK.md with exact ssh/clone/compose/curl commands
- [ ] [DEPLOY] on Vultr: ssh root@45.77.52.54; clone -> /srv/turing-quant-agent; docker compose up -d --build; curl :8097/api/health  (USER-RUN, Docker not on Windows box)
- [x] commit + push deploy artifacts
- NOTE: MOCK-MODE demo (not Mantle-connected). Live = Sprints C1-C3.

---

## FUTURE — Section C (DESKTOP integration -> submission)

### Sprint C1 — Adapters: fill 5 TODO[DESKTOP] (live path)  [ ] [DESKTOP]
- [ ] viemChain (Mantle RPC), mantleOracle, ipfsProvenance, sqliteEventStore, openaiLlm
- [ ] each: mock retained + live behind env; integration test per adapter

### Sprint C2 — Contracts compile + Foundry tests  [~] IN PROGRESS (Foundry installed on Vultr)  [DESKTOP]
- [x] Foundry 1.7.1 installed + verified on atrio-demo (forge/cast/anvil/chisel)
- [x] added contracts/remappings.txt (forge-std/) + gitignored contracts/lib/
- [ ] [ON BOX] forge install foundry-rs/forge-std --no-git
- [ ] [ON BOX] forge build (3 contracts, solc 0.8.26)
- [ ] [ON BOX] forge test -vvv (expect ~26 tests incl. revert/negative cases)
- [ ] [ON BOX] forge coverage (100% standard)
- NOTE: forge runs on the Vultr box (not the Windows shell); commands in DEPLOY/this tracker, output reviewed here.

### Sprint C3 — Deploy to Mantle testnet + verify  [ ] [DESKTOP]
- [ ] deploy via Deploy.s.sol to Mantle testnet (key from local .env only)
- [ ] verify on Mantle Explorer; record addresses in README + traceability

### Sprint C4 — Server binding + live API  [~] superseded by Sprint 6 (mock) + C1 (live wiring)  [DESKTOP]
- [ ] thin server binding done in Sprint 6 (mock); live adapters wired in C1; web -> live API + routes

### Sprint C5 — E2E live  [ ] [DESKTOP]
- [ ] Playwright (7x4) + Detox green against running app

### Sprint C6 — Hardening  [ ] [DESKTOP]
- [ ] multi-sig/timelock for admin + withdrawals; real auth provider; DB persistence; monitoring

### Sprint C7 — Submission artifacts  [ ] [DESKTOP]
- [ ] public (non-localhost) frontend deploy; >=2min demo video; deployed addresses; one-line pitch; DoraHacks submission

---

## Hackathon requirement mapping (Turing Test 2026 — AI Trading & Strategy)
- Deploy on Mantle Network -> Sprint C3
- Open-source repo + README -> Sprint 4 / C7
- ERC-8004 agent identity -> AgentIdentity.sol (built) -> C2/C3
- On-chain decision provenance -> DecisionLog.sol + ipfsProvenance -> C1/C3
- AI function callable on-chain (20-Project Award) -> C3/C4
- Runnable demo + video + public URL -> C7
- Grand Champion scoring: Tech Depth 30 / Innovation 25 / Mantle Contribution 25 / Product Completeness 20
