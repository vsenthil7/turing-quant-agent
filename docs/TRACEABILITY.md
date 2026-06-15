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
| R8 | Verifiable backtest / strategy alpha | packages/core/src/backtest2.ts | core/test/backtest.test.ts, batch-b2 | PEND (coverage gate) |

## 2. Product capabilities

| Capability | Module(s) | Test(s) | Status |
|------------|-----------|---------|--------|
| Technical indicators (RSI/MA) | core/src/indicators.ts | indicators.test (16) | OK |
| Signal ensemble (regime-weighted) | core/src/ensemble.ts, signals.ts | ensemble.test, ensemble.edge, signals.test | OK |
| Regime conditioning | core/src/regime.ts; agent/src/macro.ts | regime.test, macro.test | OK |
| Position sizing / risk | core/src/sizing.ts, risk.ts | sizing(.edge).test, risk.test | OK |
| Position lifecycle (B2) | core/src/position.ts | core/test (branch gap 13-14,20-21,28) | PEND |
| Order validation/triggers (B3) | core/src/orders.ts | core/test (branch gap 19-20) | PEND |
| Alerting rules (B4) | core/src/alerts.ts | core/test (branch gap 26-30) | PEND |
| Backtest v2 (B5) | core/src/backtest2.ts | backtest.test, batch-b2 (gap line 56) | PEND |
| Rebalancing (B6) | core/src/rebalance.ts | core/test (gap line 13) | PEND |
| Audit export (B7) | core/src/auditExport.ts | core/test (gap line 15) | PEND |
| Extra strategies (B1) | core/src/strategies-extra.ts | strategy.test (gap 22-27,42) | PEND |
| Guardrails / kill-switch | core/src/guardrails.ts | guardrails.test | OK |
| Portfolio allocation | core/src/portfolio.ts | portfolio.test | OK |
| Walk-forward optimize | core/src/optimize.ts | optimize.test | OK |
| Cost/fee model | core/src/costs.ts | costs.test | OK |
| Config (zod-validated) | agent/src/config.ts | agent/test/config.test.ts | BLK missing zod (Sprint 1) |
| Config v2 per-tenant (B8) | agent/src/config2.ts | loadConfig.test, batch-b2 | BLK missing zod (Sprint 1) |
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
| Web UI screens (12 components) | web/components/* | web/components/__tests__/* (RTL+jest-axe) | PEND (clean-run Sprint 3) |
| Web view-models | web/lib/* | web/lib/__tests__/* | PEND |
| Mobile app | mobile/src/App.tsx | mobile/lib/__tests__/format.test.ts | PEND |

## 3. Adapters — mock/live parameterisation (Sprint 5 + C1)

| Adapter | File | Mock (default) | Live (env-gated) | Status |
|---------|------|----------------|------------------|--------|
| Chain (Mantle) | adapters/viemChain.ts | deterministic stub | viem + Mantle RPC | PLAN TODO[DESKTOP] |
| Oracle | adapters/mantleOracle.ts | fixed feed | live oracle | PLAN |
| IPFS provenance | adapters/ipfsProvenance.ts | in-memory CID | live IPFS | PLAN |
| Event store | adapters/sqliteEventStore.ts | in-memory | better-sqlite3 | PLAN |
| LLM | adapters/openaiLlm.ts | canned completion | OpenAI API | PLAN |

## 4. Known issues found this session
- I1 missing `zod` in agent/package.json -> 3 test files fail to load (Sprint 1).
- I2 core coverage 99.65/94.15 < 100 gate -> build fails despite 156/156 pass (Sprint 2).
- I3 optional native dep dtrace-provider fails to compile (no VS C++); non-fatal, Detox-only - accept/ignore.
