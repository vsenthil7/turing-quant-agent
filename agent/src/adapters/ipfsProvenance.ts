/** Provenance adapter — implements ProvenanceStore via an IPFS HTTP client.
 *  DESKTOP fills the two client calls; CID handling + interface are complete. */
import type { ProvenanceStore } from "../provenance.js";

export interface IpfsConfig { apiUrl: string; gatewayUrl: string; }

export function createIpfsProvenance(cfg: IpfsConfig): ProvenanceStore {
  void cfg;
  return {
    async put(content: string): Promise<string> {
      if (content.length === 0) throw new Error("provenance: empty content");
      // TODO[DESKTOP]: const res = await fetch(`${cfg.apiUrl}/api/v0/add`, { method: "POST", body: form(content) }); return res.Hash (CID)
      throw new Error("ADAPTER_NOT_WIRED: ipfs put");
    },
    async get(cid: string): Promise<string> {
      // TODO[DESKTOP]: return await (await fetch(`${cfg.gatewayUrl}/ipfs/${cid}`)).text()
      void cid;
      throw new Error("ADAPTER_NOT_WIRED: ipfs get");
    }
  };
}
