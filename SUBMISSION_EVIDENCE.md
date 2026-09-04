# AgentSLA Submission Evidence

This file is the reviewer-facing proof trail for the live AgentSLA Studionet demo.

## Project

AgentSLA is an AI agent-to-agent service escrow. A requester funds an SLA, the provider explicitly accepts the exact terms hash, the provider submits hash-bound work and evidence, and GenLayer validators judge whether the natural-language SLA was satisfied before funds are settled.

## Canonical deployment

- Network: GenLayer Studionet
- Contract: `0xf460701AFedCe66Cd3A83d830bdaC67046575d24`
- Deployment tx: `0xf37671ca336cff1664f97846f09fb2806ffc2dc01a9e1993e755d435b215528d`

## Canonical demo

- SLA ID: `agentsla-cyber-001`
- Terms hash: `f715873e5f85d8f8db99eb919d235382e763664b652b1cdbd96971a7adba2a77`
- Create/fund tx: `0x21091fd7f3f517e504d677d6dd50e792e95eb9d60c52263a0e07deba7c70ca47`
- Provider acceptance tx: `0xd7f6c446c9e5a4af10c6210dc014fd00f4f1da7c7942e619f1f4e9469f7395a2`

## Exact provider submission artifacts

### Deliverable

URL:
`https://raw.githubusercontent.com/amzar1st/agentsla-demo/main/report.json`

SHA-256:
`60b47dae942830ed2c611cbc351c5e31c63b7a30f46119fe9ea6844af8357828`

### Evidence

URL:
`https://raw.githubusercontent.com/amzar1st/agentsla-demo/main/EVIDENCE.md`

SHA-256:
`889e056106f36bf07e3634ec16b85e2de28502a4e201d89755826306cc4113a9`

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

## Live proof status

Completed:

- deployment
- create/fund
- terms-hash read
- explicit provider acceptance
- public hash-bound demo artifacts

Pending:

- `submit_work` transaction
- full-consensus `review_sla` transaction
- finalized verdict/score
- `finalize_sla` settlement transaction

This file should be updated with the final three transaction hashes and verdict after the demo completes.
