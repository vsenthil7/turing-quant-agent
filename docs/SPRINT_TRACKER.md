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

---

## Status snapshot (updated each sprint)

| Workspace | Tests passing | Coverage gate (100%) | Clean-install OK |
|-----------|---------------|----------------------|------------------|
| @tqa/core | 156 / 156     | FAIL 99.65% st / 94.15% br | OK |
| @tqa/agent| 108 / 129     | FAIL (3 files fail to load) | FAIL missing `zod` |
| @tqa/web  | not yet run   | -                    | - |
| @tqa/mobile| not yet run  | -                    | - |
| contracts | not yet run   | - (Foundry)          | - |

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

### Sprint 1 — Fix `zod` dependency (unblock agent)  [~] IN PROGRESS
- [ ] [SANDBOX] add `zod` to agent/package.json; reinstall
- [ ] [SANDBOX] agent suite -> 129/129; commit + push

### Sprint 2 — Core coverage to 100%  [ ] TODO
- [ ] [SANDBOX] add branch/edge tests: alerts, orders, position, rebalance, strategies-extra, backtest2, auditExport
- [ ] [SANDBOX] core gate green; commit + push

### Sprint 3 — Web + mobile clean-run  [ ] TODO
- [ ] [SANDBOX] run web unit suite under clean install; fix dep/coverage gaps
- [ ] [SANDBOX] run mobile suite; fix gaps; commit + push

### Sprint 4 — Tracker/traceability/docs in repo  [~] IN PROGRESS
- [x] create docs/SPRINT_TRACKER.md (this file)
- [x] create docs/TRACEABILITY.md
- [ ] add README.md (setup, architecture, deploy address placeholder - 20-Project Award req)
- [ ] commit + push

### Sprint 5 — Mock/live parameterisation  [ ] TODO  [SANDBOX]
- [ ] introduce TQA_MODE + per-adapter mode flag; default mock
- [ ] adapter factory selects mock|live impl; mock path fully tested
- [ ] tests assert mock default; live path guarded behind env

---

## FUTURE — Section C (DESKTOP integration -> submission)

### Sprint C1 — Adapters: fill 5 TODO[DESKTOP] (live path)  [ ] [DESKTOP]
- [ ] viemChain (Mantle RPC), mantleOracle, ipfsProvenance, sqliteEventStore, openaiLlm
- [ ] each: mock retained + live behind env; integration test per adapter

### Sprint C2 — Contracts compile + Foundry tests  [ ] [DESKTOP]
- [ ] install Foundry; forge build; forge test green for AgentIdentity/DecisionLog/StrategyVault

### Sprint C3 — Deploy to Mantle testnet + verify  [ ] [DESKTOP]
- [ ] deploy via Deploy.s.sol to Mantle testnet (key from local .env only)
- [ ] verify on Mantle Explorer; record addresses in README + traceability

### Sprint C4 — Server binding + live API  [ ] [DESKTOP]
- [ ] thin server binds api/api2 handlers; web wired to live API + routes

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
