/** Load + validate runtime config from environment. Complete; DESKTOP only
 *  provides the .env values. */
import { parseConfig, type Config } from "./config.js";

export interface Env { [k: string]: string | undefined; }

export function loadConfig(env: Env): Config {
  return parseConfig({
    aiMode: env.AI_MODE ?? "gate",
    risk: {
      maxPositionSize: Number(env.MAX_POSITION_SIZE ?? "100"),
      maxDrawdownPct: Number(env.MAX_DRAWDOWN_PCT ?? "0.2")
    },
    signals: {
      fast: Number(env.SIGNAL_FAST ?? "5"),
      slow: Number(env.SIGNAL_SLOW ?? "20"),
      weights: {
        maCross: Number(env.WEIGHT_MACROSS ?? "0.5"),
        momentum: Number(env.WEIGHT_MOMENTUM ?? "0.5")
      }
    },
    dryRun: (env.DRY_RUN ?? "true") === "true"
  });
}
