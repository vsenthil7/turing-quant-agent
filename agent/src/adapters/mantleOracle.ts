/** Oracle adapter — fetches quotes from Mantle DEX pools + external feeds,
 *  then uses the verified aggregatePrice guard. The aggregation logic is done;
 *  DESKTOP fills only the raw quote fetching. */
import { aggregatePrice, type PriceQuote, type OracleConfig, type OracleResult } from "../oracle.js";

export interface MantleOracleConfig extends OracleConfig {
  rpcUrl: string;
  pools: { source: string; address: `0x${string}` }[];
}

export function createMantleOracle(cfg: MantleOracleConfig) {
  return {
    async getPrice(now: number = Math.floor(Date.now() / 1000)): Promise<OracleResult> {
      const quotes: PriceQuote[] = [];
      for (const pool of cfg.pools) {
        // TODO[DESKTOP]: read sqrtPriceX96 / reserves from pool.address via publicClient.readContract,
        //               convert to price, push { source: pool.source, price, timestamp: now }
        void pool;
      }
      // Aggregation + all guards (staleness/divergence/min-sources) are already verified.
      return aggregatePrice(quotes, now, cfg);
    }
  };
}
