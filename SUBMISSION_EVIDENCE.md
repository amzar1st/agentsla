> **Historical v1 record.** The root contract is now v2 source, pending deployment.
> The address and results below describe v1 only. Live consensus and recipient payment
> were not independently verified in the September 5 review. See [verification](docs/VERIFICATION.md).

# AgentSLA Submission Evidence

This file is the reviewer-facing proof trail for the completed AgentSLA Studionet demo.

## Project

AgentSLA is an AI agent-to-agent service escrow. A requester funds an SLA, the provider explicitly accepts the exact terms hash, the provider submits hash-bound work and evidence, and GenLayer validators judge whether the natural-language SLA was satisfied before funds are settled.

## Live project

- Website: `https://agentsla.netlify.app`
- GitHub: `https://github.com/amzar1st/agentsla-demo`

## Canonical deployment

- Network: GenLayer Studionet
- Contract: `0xc7A6812642ea6158926B369f6c0d35F507fbAA8a`
- Deployment tx: `0xf38aa4cf30da510c5eff61b13fdc8eef9e33fe34281f2dbe599b99ec94c88c5c`

## Canonical demo

- SLA ID: `agentsla-cyber-003`
- Terms hash: `b7be1201bfd6c06d8e70cdf3a368ffe5b6e4436547e554891cd8b315a80d1303`
- Passing score: `80`
- Create/fund tx: `0x75fdc6d3c5ee2daf44f30f20f7b80fd54234beee85b7f6bf5d1b37cdd5e8b212`
- Provider acceptance tx: `0x6c877a0aacd51b4b11795d540d8eb3121691d9a9b78aff16b937dd591ad25722`
- Submission tx: `0x2053c8c2b4373f7b12c2035486f0680b0bf6629db1ea41ee39ced0e69403342c`
- Full Consensus review tx: `0x58da7437a475bacfe4d35985c4e483714ba02b095442dfe612d8bd8a44a827d0`
- Final settlement tx: `0xec12f79864d65061601e679535efb8dba8d4c0116b3fb2e1dca2ea0d7f108862`

## Exact provider submission artifacts

### Deliverable

URL:
`https://raw.githubusercontent.com/amzar1st/agentsla-demo/main/report.json`

SHA-256:
`033ee9d4c7ba59f2afb41d239edad0067a5be963dbfcb457f4889b6eaed33abb`

### Evidence

URL:
`https://raw.githubusercontent.com/amzar1st/agentsla-demo/main/EVIDENCE.md`

SHA-256:
`b9fbe4eed335704a9e42ea12351add509d9f6b76fea9bafb9ebbb72316426517`

## Demo requirements represented by the artifacts

The provider report contains exactly five cybersecurity incidents and includes organization, announcement date, incident date where known, summary, reported impact, and at least two source URLs for each incident. The evidence document maps those claims to public sources and distinguishes confirmed facts from unverified attacker claims.

## GenLayer trust boundary demonstrated

- requester/provider identities and deadlines are deterministic;
- escrow is funded on creation;
- provider acceptance is bound to the immutable terms hash;
- deliverable and evidence are SHA-256 bound;
- validators independently retrieve the submitted public artifacts;
- the contract checks the artifact hashes before adjudication;
- GenLayer consensus determines `SATISFIED` or `UNSATISFIED` with a 0-100 fulfillment score;
- only the resulting deterministic contract state controls payout or refund.

## Full Consensus result

`get_result("agentsla-cyber-003")` returned before settlement:

- `status`: `SATISFIED`
- `verdict`: `SATISFIED`
- `score`: `95`
- `settled`: `false`

Consensus summary:

> The deliverable provides exactly five incidents, each with required fields and at least two source URLs. All summaries and impact statements are corroborated by the supplied evidence. No material claims are unsupported, meeting the SLA and passing score.

The final `finalize_sla` transaction then settled the successful SLA, released the escrowed reward to the provider, and moved the canonical demo to final state `PAID`.

## Completed proof

- deployment ✅
- live wallet-connected DApp ✅
- create/fund ✅
- immutable terms hash ✅
- explicit provider acceptance ✅
- public hash-bound artifacts ✅
- provider submission ✅
- Normal / Full Consensus adjudication ✅
- `SATISFIED` verdict at `95/100` ✅
- escrow settlement to provider ✅
- final state `PAID` ✅

AgentSLA therefore demonstrates a complete agent-to-agent contracting lifecycle from immutable commitment through GenLayer consensus to economic settlement.
