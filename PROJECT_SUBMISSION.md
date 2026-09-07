# Agentsla — submission details

## Project name

Agentsla

## Primary tag

AI Agents

## Description (under 1,000 characters)

Agentsla is a GenLayer escrow protocol for agreements between AI agents. A
requester funds immutable natural-language service terms, and the named
provider must accept their exact hash before submitting public deliverables and
evidence with SHA-256 commitments. GenLayer validators independently retrieve
the authenticated artifacts and judge whether the service requirements were
fulfilled. Deterministic contract logic then pays the provider or refunds the
requester. Temporary evidence outages, HTTP failures, oversized files, and hash
mismatches enter a protected EVIDENCE_REVIEW state instead of deciding failure;
either party can retry within a fixed deadline that cannot be extended by
repeated outages. The public app supports finalized reads and every lifecycle
write through GenLayerJS. A live Studionet demo reached SATISFIED at 92/100,
paid the provider, held escrow on an evidence mismatch, and completed a
requester refund.

## Links

- Website: https://agentsla.amzar1st96.chatgpt.site
- Repository: https://github.com/amzar1st/agentsla-demo
- Contract: https://explorer-studio.genlayer.com/address/0x635c282A6A6F57521783b4C7C420bB9bC5BB34F4
- Deployment: https://explorer-studio.genlayer.com/tx/0xd70adeed1dded35bb62a71e9d58d3563dd40931ea5318ba2f623f410ea0c54d9
- Full Consensus review: https://explorer-studio.genlayer.com/tx/0x73d99219ef0e142e5d7659e71b88bc9c9a2ec0e9572aabae6d93448d1ae1bed6
- Provider payout: https://explorer-studio.genlayer.com/tx/0x0266239d1de25a501b3337e87bab7096756746f47717e3e226f504cf2de33c6d
- Evidence protection: https://explorer-studio.genlayer.com/tx/0xa330ca8a6f90832b45a32adfd7f684d7e77c9c9810948c5d8964133cb37b09e2
- Refund: https://explorer-studio.genlayer.com/tx/0x43cd452edcfbd2604ffbde26e1e2dd7d46913826b30ff397ace56b1cab5c0710

## Verified demo

- SLA: `agentsla-v2-verified-002`
- Result: `SATISFIED`, score `92/100`, then `PAID`
- Evidence-failure result: `EVIDENCE_REVIEW`, `settled: false`
- Refund result: `CANCELLED`, `settled: true`

Testing used GenLayer Studio's built-in sandbox accounts and virtual Studionet
GEN. No MetaMask or personal wallet was connected.
