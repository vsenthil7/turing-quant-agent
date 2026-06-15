# Traceability Matrix — turing-quant-agent

Maps requirements/capabilities -> implementing module(s) -> verifying test(s) -> status.
Updated every mini-sprint. Status: OK verified · PEND partial/pending gate · BLK blocked · PLAN planned

---

## 1. Hackathon requirements (Turing Test 2026 — AI Trading & Strategy)

| # | Requirement | Module(s) | Test(s) / Evidence | Status |
|---|-------------|-----------|--------------------|--------|
| R1 | Deploy on Mantle Network | contracts/script/Deploy.s.sol; agent/src/adapters/viemChain.ts | C3 deploy + Explorer verify | PLAN |
| R2 | Open-source repo + README | repo root; docs/ | repo public; README pending | PEND |
| R3 | ERC-8004 agent identity | contracts/src/AgentIdentity.sol | contracts/test/AgentIdentity.t.sol | PEND (compile C2) |
| R4 | On-chain decision provenance | contracts/src/DecisionLog.sol; agent/src/provenance.ts; adapters/ipfsProvenance.ts | DecisionLog.t.sol; agent/test/provenance.test.ts | PEND |
| R5 | AI function callable on-chain | agent/src/orchestrate.ts -> DecisionLog | C3/C4 | PLAN |
| R6 | Runnable demo + >=2min video + public URL | web/; deploy | C7 | PLAN |
| R7 | Macro-driven strategy (track theme) | agent/src/macro.ts; packages/core/src/regime.ts | agent/test/macro.test.ts; core/test/regime.test.ts | OK |
| R8 | Verifiable backtest / strategy alpha | packages/core/src/backtest2.ts | core/test/backtest.test.ts, coverage-s2 | OK |

## 2. Product capabilities

| Capability | Module(s) | Test(s) | Status |
|------------|-----------|---------|--------|
| Technical indicators (RSI/MA) | core/src/indicators.ts | indicators.test (16) | OK |
| Signal ensemble (regime-weighted) | core/src/ensemble.ts, signals.ts | ensemble.test, ensemble.edge, signals.test | OK |
| Regime conditioning | core/src/regime.ts; agent/src/macro.ts | regime.test, macro.test | OK |
| Position sizing / risk | core/src/sizing.ts, risk.ts | sizing(.edge).test, risk.test | OK |
| Position lifecycle (B2) | core/src/position.ts | position via coverage-s2 (100%) | OK |
| Order validation/triggers (B3) | core/src/orders.ts | coverage-s2 (100%) | OK |
| Alerting rules (B4) | core/src/alerts.ts | coverage-s2 (100%) | OK |
| Backtest v2 (B5) | core/src/backtest2.ts | backtest.test, coverage-s2 (100%) | OK |
| Rebalancing (B6) | core/src/rebalance.ts | coverage-s2 (100%) | OK |
| Audit export (B7) | core/src/auditExport.ts | coverage-s2 (100%) | OK |
| Extra strategies (B1) | core/src/strategies-extra.ts | strategy.test, coverage-s2 (100%) | OK |
| Guardrails / kill-switch | core/src/guardrails.ts | guardrails.test | OK |
| Portfolio allocation | core/src/portfolio.ts | portfolio.test | OK |
| Walk-forward optimize | core/src/optimize.ts | optimize.test | OK |
| Cost/fee model | core/src/costs.ts | costs.test | OK |
| Config (zod-validated) | agent/src/config.ts | agent/test/config.test.ts | OK (zod fixed S1) |
| Config v2 per-tenant (B8) | agent/src/config2.ts | loadConfig.test, batch-b2 | OK (zod fixed S1) |
| Parse/orchestrate pipeline | agent/src/parse.ts, orchestrate.ts | parse.test, orchestrate.test | OK |
| AI policy (driver/gate/advisor) | agent/src/policy.ts | policy.test | OK |
| Event sourcing + snapshot/replay | agent/src/events.ts, replay.ts, persistence.ts | events/replay/persistence.test | OK |
| DI container | agent/src/container.ts | container.test | OK |
| API handlers (B9) | agent/src/api.ts, api2.ts | api.test | OK |
| Oracle aggregation | agent/src/oracle.ts | oracle.test | OK |
| Reputation scoring | agent/src/reputation.ts | reputation.test | OK |
| Observability | agent/src/observability.ts | observability.test | OK |
| Audit trail | agent/src/audit.ts | audit.test | OK |
| Notification model (B10) | agent/src/notifications.ts | covered via domain/api tests | OK |
| Buyer domains accounts/ledger/fee/leaderboard/ratelimit | agent/src/domain/* | agent/test/domain.test.ts | OK |
| Web UI screens (12 components) | web/components/* | web/components/__tests__/* (RTL+jest-axe), 223/223 100% | OK |
| Web view-models | web/lib/* | web/lib/__tests__/* 100% | OK |
| Mobile app | mobile/src/App.tsx | Detox e2e (Desktop); lib unit-tested | PEND (App.tsx via Detox) |
| Mobile lib (format, apiClient) | mobile/lib/* | mobile/lib/__tests__/* 100% | OK |

## 3. Adapters — mock/live parameterisation (Sprint 5 + C1)

| Adapter | File | Mock (default) | Live (env-gated) | Status |
|---------|------|----------------|------------------|--------|
| Chain (Mantle) | adapters/viemChain.ts | deterministic stub | viem + Mantle RPC | PLAN TODO[DESKTOP] |
| Oracle | adapters/mantleOracle.ts | fixed feed | live oracle | PLAN |
| IPFS provenance | adapters/ipfsProvenance.ts | in-memory CID | live IPFS | PLAN |
| Event store | adapters/sqliteEventStore.ts | in-memory | better-sqlite3 | PLAN |
| LLM | adapters/openaiLlm.ts | canned completion | OpenAI API | PLAN |

## 4. Known issues found this session
- I1 missing `zod` in agent/package.json -> 3 test files fail to load. FIXED Sprint 1.
- I2 core+agent coverage < 100 gate -> build fails despite passing assertions. FIXED Sprint 2 (core 193/193, agent 161/161, 100% all metrics).
- I3 optional native dep dtrace-provider fails to compile (no VS C++); non-fatal, Detox-only - accept/ignore.
- I4 backtest2.ts had unreachable dead `[0]` fallback branch. REMOVED Sprint 2.
- I5 web declared none of its test deps (jsdom/@testing-library/jest-axe/@vitejs-plugin-react) -> whole web suite failed to collect on clean install. FIXED Sprint 3.
- I6 CustodyPanelAsync had unreachable dead submit guard. REMOVED Sprint 3.
- I7 web + mobile had no coverage thresholds configured. ADDED 100% gates Sprint 3.
