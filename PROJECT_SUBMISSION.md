# Agentsla — Project Explorer submission

Use these values for the corrected September 2026 resubmission.

## 01 — Identity

- Project name: **Agentsla**
- Primary tag: **AI & Agents**
- Suggested topics: **Agent Infrastructure**, **Escrow**
- Logo: `AgentSLA_logo.png`

## 02 — One-liner (180 characters maximum)

Two-sided escrow for AI-agent services, with hash-bound evidence, a requester
challenge window, and validator-agreed settlement on GenLayer.

## 03 — Description (1,000 characters maximum)

Agentsla is a GenLayer escrow protocol for agreements between AI agents. A
requester locks GEN under immutable service terms, names the provider, and
binds two authoritative HTTPS sources by SHA-256. The provider accepts the
exact terms and submits hash-bound work and evidence. A fixed challenge window
then lets only the requester add counter-evidence before review. Validators
authenticate every required artifact and must agree on a categorical
SATISFIED or UNSATISFIED verdict; numeric scores are not collected or used for
settlement. Temporary outages, HTTP errors, oversized responses, or hash
mismatches enter EVIDENCE_REVIEW and keep escrow locked for retry under an
absolute deadline. SATISFIED pays only the provider; UNSATISFIED refunds only
the requester. The public app reads latest-final state and sends lifecycle
writes through the supported GenLayerJS 1.1.8 wallet path.

## 04 — Demo video

Optional. Leave blank unless a current v3 walkthrough is recorded; do not use
the old score-based v2 video.

## 05 — Exact how-to path

### 1. Verify the canonical deployment

Open the v3 contract link and confirm the deployment and protocol read are
finalized on Studionet.

### 2. Verify the wallet-originated Create SLA

Open the Create SLA transaction. Confirm method `create_sla`, status
`FINALIZED`, GenVM `SUCCESS`, consensus `Accepted`, requester
`0xd0834084e353E5E825D55466967956349Bc60E17`, and value `0.10 GEN`.

### 3. Read canonical state in the app

Open the website and select **Refresh on-chain result**. Confirm SLA
`agentsla-v3-wallet-001` reads `OPEN` from the v3
contract and shows the two authority sources.

### 4. Inspect the two-sided evidence model

Open the repository and inspect `agentsla.py`. Confirm requester-only
`submit_counter_evidence`, a fixed challenge deadline, two authority URL/hash
pairs, protected `EVIDENCE_REVIEW`, and categorical-only settlement.

### 5. Reproduce the supported write path

From `frontend`, run `npm ci`, choose a fresh `AGENTSLA_PROOF_ID`, and run
`npm run proof:create`. The script creates an ephemeral SDK wallet, obtains
virtual Studionet funds, writes through GenLayerJS, waits for finalization, and
prints latest-final reads without exposing the private key.

## 06 — Expected verification outcome (500 characters maximum)

The v3 deployment and Create SLA transaction are FINALIZED on Studionet. The
Create call shows GenVM SUCCESS and Accepted consensus from the ephemeral
requester for 0.10 GEN. Loading `agentsla-v3-wallet-001` returns canonical
latest-final state `OPEN`, both committed authority URLs, `settled: false`,
`score_policy: NOT_COLLECTED_OR_USED_FOR_SETTLEMENT`, and
`settlement_basis: VALIDATOR_AGREED_CATEGORICAL_VERDICT`.

## 06 — Contract links

1. https://explorer-studio.genlayer.com/address/0xd8647B3A24f2973F29A5fC1822832c87E1398BA3
2. https://explorer-studio.genlayer.com/tx/0x17306034c538e49a53fc318283f1b3f5b44291e604a71c046693126b5ecc13c8
3. https://explorer-studio.genlayer.com/tx/0x02f741b46fa79954bc2fcc3f2ed566a7858758ab076b4cfe1d8cb5f1d46d5ac0

## 07 — Project links

- Website: https://agentsla.amzar1st96.chatgpt.site
- GitHub: https://github.com/amzar1st/agentsla

## Evidence links

Add each as URL evidence:

1. Repository: https://github.com/amzar1st/agentsla
2. Steward response: https://github.com/amzar1st/agentsla/blob/main/SUBMISSION_EVIDENCE.md
3. V3 contract: https://explorer-studio.genlayer.com/address/0xd8647B3A24f2973F29A5fC1822832c87E1398BA3
4. V3 deployment: https://explorer-studio.genlayer.com/tx/0x17306034c538e49a53fc318283f1b3f5b44291e604a71c046693126b5ecc13c8
5. Wallet Create SLA: https://explorer-studio.genlayer.com/tx/0x02f741b46fa79954bc2fcc3f2ed566a7858758ab076b4cfe1d8cb5f1d46d5ac0
6. Public app: https://agentsla.amzar1st96.chatgpt.site

## Steward resubmission note

The September 8 request is addressed in v3. The broken pre-signature fee call
has been removed: the app and reproducible proof pin GenLayerJS 1.1.8 and use
its supported `writeContract` / `estimateTransactionGas` path. A new
wallet-originated Create SLA is finalized and linked above, with its exact
latest-final read recorded in `SUBMISSION_EVIDENCE.md`. V3 also adds
requester-only counter-evidence, a fixed challenge window, two immutable
authoritative sources per SLA, and categorical validator-agreed settlement.
Numeric scores are not collected or used.
