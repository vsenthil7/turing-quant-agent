/** Chain adapter — implements Chain via viem against Mantle.
 *  DESKTOP INTEGRATION: fill the two TODO calls with viem writeContract.
 *  Everything else (encoding, validation, return shape) is complete. */
import type { Chain, Action } from "../types.js";

export interface ViemChainConfig {
  rpcUrl: string;
  decisionLogAddress: `0x${string}`;
  vaultAddress: `0x${string}`;
  privateKey: `0x${string}`;
}

export function createViemChain(cfg: ViemChainConfig): Chain {
  // TODO[DESKTOP]: construct walletClient = createWalletClient({ account: privateKeyToAccount(cfg.privateKey), chain: mantle, transport: http(cfg.rpcUrl) })
  // and publicClient = createPublicClient({ chain: mantle, transport: http(cfg.rpcUrl) })
  const walletClient: any = null;

  return {
    async record(signalHash: string, rationaleHash: string, action: Action): Promise<number> {
      if (!walletClient) throw new Error("ADAPTER_NOT_WIRED: viem walletClient (see TODO[DESKTOP])");
      // TODO[DESKTOP]: const hash = await walletClient.writeContract({ address: cfg.decisionLogAddress, abi: decisionLogAbi, functionName: "record", args: [signalHash, rationaleHash, action] })
      //               const receipt = await publicClient.waitForTransactionReceipt({ hash }); return decoded id from receipt logs
      throw new Error("ADAPTER_NOT_WIRED: record");
    },
    async execute(decisionId: number, action: Action, size: number): Promise<void> {
      if (!walletClient) throw new Error("ADAPTER_NOT_WIRED: viem walletClient");
      // TODO[DESKTOP]: await walletClient.writeContract({ address: cfg.vaultAddress, abi: vaultAbi, functionName: "execute", args: [decisionId, action, BigInt(size)] })
      throw new Error("ADAPTER_NOT_WIRED: execute");
    }
  };
}
