/** LLM adapter — implements LlmClient via an OpenAI-compatible chat endpoint.
 *  Prompt assembly + response extraction are complete; DESKTOP fills the fetch. */
import type { LlmClient } from "../types.js";

export interface LlmConfig { apiUrl: string; apiKey: string; model: string; }

export function createOpenAiLlm(cfg: LlmConfig): LlmClient {
  return {
    async decide(prompt: string): Promise<string> {
      const body = {
        model: cfg.model,
        messages: [
          { role: "system", content: "You are a quant trading decision engine. Respond ONLY with JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0
      };
      // TODO[DESKTOP]: const res = await fetch(`${cfg.apiUrl}/chat/completions`, { method: "POST",
      //   headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.apiKey}` }, body: JSON.stringify(body) })
      //   return (await res.json()).choices[0].message.content
      void body;
      throw new Error("ADAPTER_NOT_WIRED: llm.decide");
    }
  };
}
