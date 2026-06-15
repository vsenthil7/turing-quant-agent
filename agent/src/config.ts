import { z } from "zod";

/** Typed, validated runtime config. AI role is configurable here. */
export const ConfigSchema = z.object({
  aiMode: z.enum(["driver", "gate", "advisor"]),
  risk: z.object({
    maxPositionSize: z.number().positive(),
    maxDrawdownPct: z.number().min(0).max(1)
  }),
  signals: z.object({
    fast: z.number().int().positive(),
    slow: z.number().int().positive(),
    weights: z.object({
      maCross: z.number().min(0).max(1),
      momentum: z.number().min(0).max(1)
    })
  }),
  dryRun: z.boolean()
}).refine(c => c.signals.fast < c.signals.slow, {
  message: "signals.fast must be < signals.slow"
});

export type Config = z.infer<typeof ConfigSchema>;

export function parseConfig(raw: unknown): Config {
  return ConfigSchema.parse(raw);
}
