# AgentSLA — Project Submission Package

## Recommended title

**AgentSLA: AI Agent-to-Agent Service Escrow & Consensus Settlement**

## Copy-ready description

AgentSLA is a GenLayer service-settlement protocol for autonomous agents. A requester agent creates and funds an immutable SLA, a named provider explicitly accepts the exact terms hash, then submits public work and evidence identified by SHA-256. Deterministic contract logic enforces identities, deadlines, escrow and artifact integrity; GenLayer validators independently judge only the natural-language fulfillment question. A canonical Studionet demo completed the full lifecycle: CREATE → ACCEPT → SUBMIT → FULL CONSENSUS REVIEW → SATISFIED → PAY. Validators returned SATISFIED at 95/100 and the escrow was finalized to the provider. The repository includes the Intelligent Contract, hash-bound demo artifacts, complete transaction proof trail, and a wallet-connected GenLayerJS frontend.

## Canonical links

- GitHub: `https://github.com/amzar1st/agentsla-demo`
- Live website: `https://agentsla.netlify.app`
- Contract: `https://explorer-studio.genlayer.com/contracts/0xc7A6812642ea6158926B369f6c0d35F507fbAA8a`
- Deployment tx: `https://explorer-studio.genlayer.com/tx/0xf38aa4cf30da510c5eff61b13fdc8eef9e33fe34281f2dbe599b99ec94c88c5c`
- Full Consensus review tx: `https://explorer-studio.genlayer.com/tx/0x58da7437a475bacfe4d35985c4e483714ba02b095442dfe612d8bd8a44a827d0`
- Final settlement tx: `https://explorer-studio.genlayer.com/tx/0xec12f79864d65061601e679535efb8dba8d4c0116b3fb2e1dca2ea0d7f108862`
- Deliverable: `https://raw.githubusercontent.com/amzar1st/agentsla-demo/main/report.json`
- Evidence: `https://raw.githubusercontent.com/amzar1st/agentsla-demo/main/EVIDENCE.md`
- Reviewer proof trail: `https://github.com/amzar1st/agentsla-demo/blob/main/SUBMISSION_EVIDENCE.md`

## Canonical demo result

- SLA ID: `agentsla-cyber-003`
- Terms hash: `b7be1201bfd6c06d8e70cdf3a368ffe5b6e4436547e554891cd8b315a80d1303`
- Passing score: `80`
- Consensus verdict: `SATISFIED`
- Consensus score: `95 / 100`
- Final state: `PAID`

## Lifecycle transaction hashes

1. Deploy: `0xf38aa4cf30da510c5eff61b13fdc8eef9e33fe34281f2dbe599b99ec94c88c5c`
2. Create + fund: `0x75fdc6d3c5ee2daf44f30f20f7b80fd54234beee85b7f6bf5d1b37cdd5e8b212`
3. Provider acceptance: `0x6c877a0aacd51b4b11795d540d8eb3121691d9a9b78aff16b937dd591ad25722`
4. Submit work: `0x2053c8c2b4373f7b12c2035486f0680b0bf6629db1ea41ee39ced0e69403342c`
5. Full Consensus review: `0x58da7437a475bacfe4d35985c4e483714ba02b095442dfe612d8bd8a44a827d0`
6. Finalize settlement: `0xec12f79864d65061601e679535efb8dba8d4c0116b3fb2e1dca2ea0d7f108862`

## Artifact hashes

- `report.json`: `033ee9d4c7ba59f2afb41d239edad0067a5be963dbfcb457f4889b6eaed33abb`
- `EVIDENCE.md`: `b9fbe4eed335704a9e42ea12351add509d9f6b76fea9bafb9ebbb72316426517`

## Reviewer notes

AgentSLA deliberately keeps objective settlement facts deterministic and uses validator intelligence only for the part an ordinary smart contract cannot reliably decide: whether a natural-language service commitment was materially fulfilled. The provider must accept the exact precommitted terms before work, submitted bytes are hash-bound, requester rejection cannot override consensus, and timeout refund paths prevent indefinite escrow lockup.
