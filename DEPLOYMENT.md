> **Historical v1 record.** The root contract is now v2 source, pending deployment.
> The address and results below describe v1 only. Live consensus and recipient payment
> were not independently verified in the September 5 review. See [verification](docs/VERIFICATION.md).

# AgentSLA Deployment

## Network

GenLayer Studionet

## Live DApp

- Website: `https://agentsla.netlify.app`
- GitHub: `https://github.com/amzar1st/agentsla-demo`

## Canonical contract

- Contract address: `0xc7A6812642ea6158926B369f6c0d35F507fbAA8a`
- Deployment transaction: `0xf38aa4cf30da510c5eff61b13fdc8eef9e33fe34281f2dbe599b99ec94c88c5c`

Older AgentSLA deployments were debugging iterations and are not canonical.

## Canonical demo SLA

- SLA ID: `agentsla-cyber-003`
- Title: `Cybersecurity Incident Research SLA`
- Passing score: `80`
- Immutable terms hash: `b7be1201bfd6c06d8e70cdf3a368ffe5b6e4436547e554891cd8b315a80d1303`

## Completed lifecycle transactions

1. Contract deployed: `0xf38aa4cf30da510c5eff61b13fdc8eef9e33fe34281f2dbe599b99ec94c88c5c`
2. SLA created and funded: `0x75fdc6d3c5ee2daf44f30f20f7b80fd54234beee85b7f6bf5d1b37cdd5e8b212`
3. Provider accepted exact immutable terms: `0x6c877a0aacd51b4b11795d540d8eb3121691d9a9b78aff16b937dd591ad25722`
4. Provider submitted hash-bound work and evidence: `0x2053c8c2b4373f7b12c2035486f0680b0bf6629db1ea41ee39ced0e69403342c`
5. Full Consensus SLA review: `0x58da7437a475bacfe4d35985c4e483714ba02b095442dfe612d8bd8a44a827d0`
6. Final escrow settlement: `0xec12f79864d65061601e679535efb8dba8d4c0116b3fb2e1dca2ea0d7f108862`

## Final consensus result

- Status before settlement: `SATISFIED`
- Verdict: `SATISFIED`
- Score: `95 / 100`
- Passing threshold: `80`
- Settlement outcome: provider paid
- Final state: `PAID`

Consensus summary:

> The deliverable provides exactly five incidents, each with required fields and at least two source URLs. All summaries and impact statements are corroborated by the supplied evidence, meeting the SLA and passing score.

## Demo artifact URLs

- Deliverable: `https://raw.githubusercontent.com/amzar1st/agentsla-demo/main/report.json`
- Evidence: `https://raw.githubusercontent.com/amzar1st/agentsla-demo/main/EVIDENCE.md`

## Demo artifact SHA-256

- `report.json`: `033ee9d4c7ba59f2afb41d239edad0067a5be963dbfcb457f4889b6eaed33abb`
- `EVIDENCE.md`: `b9fbe4eed335704a9e42ea12351add509d9f6b76fea9bafb9ebbb72316426517`

The artifact digests were committed at `submit_work` and verified by the Intelligent Contract during consensus review before adjudication.
