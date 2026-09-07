# Agentsla v2 submission evidence

This is the reviewer-facing trail for the verified Agentsla Studionet demo.

## Project

Agentsla is an AI agent-to-agent service escrow. A requester funds immutable
natural-language terms, the named provider accepts their exact hash, and the
provider submits public deliverable/evidence URLs with SHA-256 commitments.
GenLayer validators authenticate those bytes and judge fulfillment before
deterministic settlement.

## Live project

- Public app: https://agentsla.amzar1st96.chatgpt.site
- Repository: https://github.com/amzar1st/agentsla-demo
- Network: GenLayer Studionet (`61999`)
- Contract: https://explorer-studio.genlayer.com/address/0x635c282A6A6F57521783b4C7C420bB9bC5BB34F4
- Deployed source SHA-256: `5ff8f456632cfda7b55e4d1f0e450a677993a905824e8c2b39ba67050a13de5b`

## Deployment

- Tx: https://explorer-studio.genlayer.com/tx/0xd70adeed1dded35bb62a71e9d58d3563dd40931ea5318ba2f623f410ea0c54d9
- Result: `FINALIZED`
- `get_protocol_version()`: `"2"`

## Canonical successful SLA

- SLA ID: `agentsla-v2-verified-002`
- Terms hash: `8791e92f53a8caaba8e170f7936e6ca1f657f1ea6501ab65ed859778e79b2120`
- Passing score: `80`
- Reward: `1 GEN` virtual Studionet funds
- Requester: `0xF889240e6Fa88D88d81ef1b36f55962Ca61f84e7`
- Provider: `0x022C28fF8296096a22457bFe82c9f91B53934F0f`

| Step | Finalized transaction |
| --- | --- |
| Create and escrow | https://explorer-studio.genlayer.com/tx/0x150bf70c56b1946ae06595d9462098d1baca7b6c05afa7ea5be267ae3956f4ba |
| Provider accepts exact terms | https://explorer-studio.genlayer.com/tx/0x20174ba95dd1a1391c04ab923c26a3613169df8ef596376087cc4e8096c6e27a |
| Submit hash-bound artifacts | https://explorer-studio.genlayer.com/tx/0x98fed8fdd3d8197315a06d75e1626a9fa068135d9e7927c9a741ce97c911d8ef |
| Normal / Full Consensus review | https://explorer-studio.genlayer.com/tx/0x73d99219ef0e142e5d7659e71b88bc9c9a2ec0e9572aabae6d93448d1ae1bed6 |
| Finalize provider payout | https://explorer-studio.genlayer.com/tx/0x0266239d1de25a501b3337e87bab7096756746f47717e3e226f504cf2de33c6d |

Before settlement, `get_result` returned:

```json
{
  "status": "SATISFIED",
  "verdict": "SATISFIED",
  "score": 92,
  "settled": false,
  "review_attempts": 1
}
```

The consensus summary reported exactly five incidents, all required fields,
two or more credible sources per incident, and correct labeling of unverified
attacker claims. After settlement, `get_result` returned `PAID` and
`settled: true`. Studio displayed requester `8 GEN` and provider `1 GEN`; the
provider had displayed `0 GEN` before the payout.

## Exact provider artifacts

- Deliverable URL: `https://raw.githubusercontent.com/amzar1st/agentsla-demo/a586b0df3503914cc7816d75fc457148f7efff01/report.json`
- Deliverable SHA-256: `033ee9d4c7ba59f2afb41d239edad0067a5be963dbfcb457f4889b6eaed33abb`
- Evidence URL: `https://raw.githubusercontent.com/amzar1st/agentsla-demo/a586b0df3503914cc7816d75fc457148f7efff01/EVIDENCE.md`
- Evidence SHA-256: `b9fbe4eed335704a9e42ea12351add509d9f6b76fea9bafb9ebbb72316426517`

The commit-pinned URLs keep the reviewed bytes immutable.

## Evidence-failure protection

SLA `agentsla-v2-outage-001` used the same correct deliverable and a deliberately
wrong 64-character evidence hash.

| Step | Finalized transaction |
| --- | --- |
| Create | https://explorer-studio.genlayer.com/tx/0x1dd6f07df83d15d044aab086bab4f4453a5a4dd21d385d954999d449f278bdb4 |
| Provider accept | https://explorer-studio.genlayer.com/tx/0x43131387eedab2f19fce44ec747f7afeda501ffc5a5c4c426c346be16b9cf55b |
| Submit mismatch | https://explorer-studio.genlayer.com/tx/0x64eed2b154bfbd39b3c83717c11e86154cf24f4e91dfce684be8fad50d00bf01 |
| Protected review | https://explorer-studio.genlayer.com/tx/0xa330ca8a6f90832b45a32adfd7f684d7e77c9c9810948c5d8964133cb37b09e2 |

Observed result: `EVIDENCE_REVIEW`, score `0`, `settled: false`, summary
`The evidence bytes do not match the submitted SHA-256 digest.` The retry
deadline was exactly `review_deadline + 86400`. This proves evidence failure
does not decide service failure or immediately release escrow.

## Refund proof

SLA `agentsla-v2-refund-001` was created and then cancelled by its requester
before provider acceptance:

- Create: https://explorer-studio.genlayer.com/tx/0x29d15b85547d8ec47ae569d07755992060077e8db381de05dd9162386e36d1b7
- Cancel/refund: https://explorer-studio.genlayer.com/tx/0x43cd452edcfbd2604ffbde26e1e2dd7d46913826b30ff397ace56b1cab5c0710
- Final state: `CANCELLED`, `settled: true`
- Requester balance returned to `7 GEN` after the temporary 1 GEN escrow.

## Scope of proof

These are live Studio transactions using ephemeral built-in accounts and
virtual Studionet GEN. They independently verify the sandbox contract workflow
and account balance changes. They do not claim an owner-wallet or real-value
Bradbury/Mainnet transaction.
