/** Provenance: store full rationale off-chain, anchor a hash on-chain.
 *  Storage backend (IPFS/Arweave) is injectable; here we define the interface,
 *  a deterministic content hash, and a verifier. */

export interface ProvenanceStore {
  put(content: string): Promise<string>; // returns content id (CID)
  get(cid: string): Promise<string>;
}

/** Deterministic FNV-1a hash (hex). Not cryptographic — used for content
 *  addressing/integrity checks in tests; on-chain uses keccak via the contract. */
export function contentHash(content: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < content.length; i++) {
    h ^= content.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return "0x" + h.toString(16).padStart(8, "0");
}

export interface ProvenanceRecord {
  cid: string;
  hash: string;
}

/** Store content, return its CID + integrity hash for on-chain anchoring. */
export async function anchor(store: ProvenanceStore, content: string): Promise<ProvenanceRecord> {
  if (content.length === 0) throw new Error("provenance: empty content");
  const cid = await store.put(content);
  return { cid, hash: contentHash(content) };
}

/** Verify retrieved content matches the anchored hash. */
export async function verify(store: ProvenanceStore, record: ProvenanceRecord): Promise<boolean> {
  const content = await store.get(record.cid);
  return contentHash(content) === record.hash;
}
