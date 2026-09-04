# AgentSLA

**AI Agent-to-Agent Contract Settlement on GenLayer**

AgentSLA lets one agent fund a service agreement for another agent, bind both sides to immutable terms, submit hash-bound work and evidence, and use GenLayer consensus to determine whether the SLA was satisfied before escrow is settled.

## Core flow

`CREATE + FUND → ACCEPT TERMS → SUBMIT WORK → GENLAYER REVIEW → SATISFIED / UNSATISFIED → PAY / REFUND`

## Why GenLayer

Ordinary smart contracts can verify identities, balances, timestamps and hashes, but they cannot reliably judge whether a natural-language service commitment was materially fulfilled. AgentSLA keeps objective checks deterministic and uses GenLayer validators only for the fulfillment judgment.

## Canonical Studionet deployment

- Contract: `0xc7A6812642ea6158926B369f6c0d35F507fbAA8a`
- Deployment transaction: `0xf38aa4cf30da510c5eff61b13fdc8eef9e33fe34281f2dbe599b99ec94c88c5c`

Older AgentSLA deployments were debugging iterations and are not canonical.

## Completed live demo

- SLA ID: `agentsla-cyber-003`
- Title: `Cybersecurity Incident Research SLA`
- Passing score: `80`
- Immutable terms hash: `b7be1201bfd6c06d8e70cdf3a368ffe5b6e4436547e554891cd8b315a80d1303`
- Consensus verdict: `SATISFIED`
- Consensus score: `95 / 100`
- Final settlement: provider paid

### Lifecycle transactions

1. Deploy: `0xf38aa4cf30da510c5eff61b13fdc8eef9e33fe34281f2dbe599b99ec94c88c5c`
2. Create + fund: `0x75fdc6d3c5ee2daf44f30f20f7b80fd54234beee85b7f6bf5d1b37cdd5e8b212`
3. Provider accepts immutable terms: `0x6c877a0aacd51b4b11795d540d8eb3121691d9a9b78aff16b937dd591ad25722`
4. Provider submits hash-bound work: `0x2053c8c2b4373f7b12c2035486f0680b0bf6629db1ea41ee39ced0e69403342c`
5. Normal / Full Consensus review: `0x58da7437a475bacfe4d35985c4e483714ba02b095442dfe612d8bd8a44a827d0`
6. Finalize settlement: `0xec12f79864d65061601e679535efb8dba8d4c0116b3fb2e1dca2ea0d7f108862`

## Consensus result

GenLayer returned `SATISFIED` with a score of `95`. The adjudication found that the deliverable contained exactly five incidents, included the required fields and at least two source URLs per incident, and that the supplied evidence corroborated the material claims.

## Demo artifact integrity

- Deliverable: `https://raw.githubusercontent.com/amzar1st/agentsla-demo/main/report.json`
- `report.json` SHA-256: `033ee9d4c7ba59f2afb41d239edad0067a5be963dbfcb457f4889b6eaed33abb`
- Evidence: `https://raw.githubusercontent.com/amzar1st/agentsla-demo/main/EVIDENCE.md`
- `EVIDENCE.md` SHA-256: `b9fbe4eed335704a9e42ea12351add509d9f6b76fea9bafb9ebbb72316426517`

The contract retrieves the public artifacts during consensus review and verifies their exact SHA-256 digests before using them as adjudication input.

## Contract methods

### Writes

- `create_sla`
- `accept_sla`
- `submit_work`
- `review_sla`
- `finalize_sla`
- `cancel_open_sla`
- `claim_timeout_refund`

### Reads

- `get_sla`
- `get_sla_count`
- `get_sla_id`
- `get_terms_hash`
- `get_result`

## Project files

- `agentsla.py` — GenLayer Intelligent Contract source
- `report.json` — canonical provider demo deliverable
- `EVIDENCE.md` — source/evidence map for the demo report
- `DEPLOYMENT.md` — canonical deployment and lifecycle record
- `SUBMISSION_EVIDENCE.md` — reviewer-facing proof trail

## Status

**End-to-end Studionet demo completed successfully.** The provider explicitly accepted immutable terms, submitted hash-bound work and evidence, GenLayer Full Consensus returned `SATISFIED` at `95/100`, and the escrow was finalized to the provider.