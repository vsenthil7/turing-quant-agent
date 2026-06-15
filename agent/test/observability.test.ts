import { describe, it, expect } from "vitest";
import { Logger, Metrics, health, type LogRecord, type Sink } from "../src/observability.js";

class MemSink implements Sink {
  records: LogRecord[] = [];
  write(r: LogRecord) { this.records.push(r); }
}

describe("Logger", () => {
  it("emits all levels with fixed clock + fields", () => {
    const sink = new MemSink();
    const log = new Logger(sink, () => 123);
    log.debug("d"); log.info("i", { a: 1 }); log.warn("w"); log.error("e");
    expect(sink.records).toHaveLength(4);
    expect(sink.records[0]).toEqual({ ts: 123, level: "debug", msg: "d", fields: {} });
    expect(sink.records[1]!.fields).toEqual({ a: 1 });
  });
});

describe("Metrics", () => {
  it("counts and gauges", () => {
    const m = new Metrics();
    m.inc("decisions"); m.inc("decisions", 2); m.gauge("equity", 1000);
    const s = m.snapshot();
    expect(s.counters.decisions).toBe(3);
    expect(s.gauges.equity).toBe(1000);
  });
});

describe("health", () => {
  it("ok when all pass or empty", () => {
    expect(health({}).status).toBe("ok");
    expect(health({ rpc: true, llm: true }).status).toBe("ok");
  });
  it("degraded when some fail", () => {
    expect(health({ rpc: true, llm: false }).status).toBe("degraded");
  });
  it("down when all fail", () => {
    expect(health({ rpc: false, llm: false }).status).toBe("down");
  });
});
