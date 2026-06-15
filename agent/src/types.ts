export type Action = -1 | 0 | 1;

export interface LlmClient {
  decide(prompt: string): Promise<string>; // returns JSON string
}

export interface Chain {
  record(signalHash: string, rationaleHash: string, action: Action): Promise<number>;
  execute(decisionId: number, action: Action, size: number): Promise<void>;
}

export interface Decision {
  action: Action;
  size: number;
  rationale: string;
}
