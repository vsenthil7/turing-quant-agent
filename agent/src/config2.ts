/** Config v2: per-tenant config with strategy selection + fee schedule.
 *  Extends base config (zod-validated). */
import { z } from "zod";
import { ConfigSchema } from "./config.js";

export const FeeScheduleSchema = z.object({
  managementBps: z.number().min(0).max(10_000),
  performanceBps: z.number().min(0).max(10_000)
});

export const TenantConfigSchema = ConfigSchema.and(z.object({
  tenantId: z.string().min(1),
  strategy: z.enum(["static-ensemble", "regime-adaptive", "momentum", "breakout", "mean-reversion"]),
  fees: FeeScheduleSchema,
  notional: z.number().positive(),
  budgetUsdPerDay: z.number().min(0)
}));

export type TenantConfig = z.infer<typeof TenantConfigSchema>;

export function parseTenantConfig(raw: unknown): TenantConfig {
  return TenantConfigSchema.parse(raw);
}
