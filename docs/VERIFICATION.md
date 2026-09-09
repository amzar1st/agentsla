# Agentsla v3 verification — September 9, 2026

## Verification outcome

The steward-requested v3 contract is deployed on GenLayer Studionet and exposes
source in the explorer. A fresh ephemeral GenLayerJS wallet created and funded
an SLA through the supported SDK write path. That transaction finalized with
successful GenVM execution and validator consensus, and the SDK then read the
created record from latest-final state.

This document deliberately separates observed v3 facts from automated tests
and historical v2 demonstrations. It does not claim that the new v3 proof SLA
has completed provider acceptance, review, or settlement.

## Canonical v3 deployment

| Item | Observed value |
| --- | --- |
| Network | GenLayer Studionet, chain ID `61999` |
| Contract | `0xd8647B3A24f2973F29A5fC1822832c87E1398BA3` |
| Deployment tx | `0x17306034c538e49a53fc318283f1b3f5b44291e604a71c046693126b5ecc13c8` |
| Deployment state | `FINALIZED` |
| Execution mode | Normal (Full Consensus) |
| Creator | `0x41b36C6B5cCcf9D7d5Dc09d6d2B132986FdE48e8` |
| Protocol read | `get_protocol_version() == "3"` |
| Source SHA-256 | `56db37c05044c6478206e7dc16cb9498faee5369738a1eae065da7fbc1d21d1f` |
| Source size | 28,997 bytes; 811 newline-terminated lines |

- Contract: https://explorer-studio.genlayer.com/address/0xd8647B3A24f2973F29A5fC1822832c87E1398BA3
- Deployment: https://explorer-studio.genlayer.com/tx/0x17306034c538e49a53fc318283f1b3f5b44291e604a71c046693126b5ecc13c8

## Wallet-originated Create SLA

The proof runner generated a one-use account in process memory with
`createAccount()`, requested only virtual Studionet faucet funds, and called
`client.writeContract` from `genlayer-js@1.1.8`. The SDK used its supported
`estimateTransactionGas` path, signed locally, submitted the transaction, and
waited for finalization. The private key was neither printed nor saved.

| Item | Observed value |
| --- | --- |
| SLA ID | `agentsla-v3-wallet-001` |
| Create tx | `0x02f741b46fa79954bc2fcc3f2ed566a7858758ab076b4cfe1d8cb5f1d46d5ac0` |
| Requester | `0xd0834084e353E5E825D55466967956349Bc60E17` |
| Provider | `0x41b36C6B5cCcf9D7d5Dc09d6d2B132986FdE48e8` |
| Escrow | `0.10 GEN` virtual Studionet funds |
| Created | September 9, 2026 at 06:05:01 UTC |
| Finalized | September 9, 2026 at 06:05:38 UTC |
| Explorer status | `FINALIZED` |
| GenVM execution | `SUCCESS` |
| Consensus | `Accepted`; five validator votes `AGREE` |
| Execution mode | Normal |
| Validator rotations | `0` |
| Terms hash | `ba6518f2f16a2fb3476a6df9ffe6add1eb53d048988e203c66bb168edc129507` |

Transaction:
https://explorer-studio.genlayer.com/tx/0x02f741b46fa79954bc2fcc3f2ed566a7858758ab076b4cfe1d8cb5f1d46d5ac0

The GenLayerJS receipt reported `status_name: FINALIZED`,
`result_name: MAJORITY_AGREE`, leader `execution_result: SUCCESS`, and leader
return status `return`. The production app accepts this actual v1.1.8
snake_case receipt shape as well as the SDK's legacy display aliases.

## Canonical latest-final read

Immediately after the finalized write, `get_result` returned:

```json
{
  "authority_url_one": "https://raw.githubusercontent.com/genlayerlabs/genlayer-js/4303db00c428d57c6d8e5b04a75043ea42d4b0e7/README.md",
  "authority_url_two": "https://raw.githubusercontent.com/genlayerlabs/genlayer-js/4303db00c428d57c6d8e5b04a75043ea42d4b0e7/package.json",
  "challenge_deadline": 0,
  "counter_evidence_submitted": false,
  "evidence_retry_deadline": 0,
  "review_attempts": 0,
  "review_deadline": 0,
  "score_policy": "NOT_COLLECTED_OR_USED_FOR_SETTLEMENT",
  "settled": false,
  "settlement_basis": "VALIDATOR_AGREED_CATEGORICAL_VERDICT",
  "status": "OPEN",
  "summary": "",
  "verdict": ""
}
```

`get_sla` independently returned the same requester/provider, reward
`100000000000000000`, status `OPEN`, acceptance window `86400` seconds,
challenge window `3600` seconds, both authority commitments, and the same terms
hash. `get_terms_hash` returned that terms hash directly. All three reads used
`TransactionHashVariant.LATEST_FINAL`.

## Immutable authority sources

The SLA binds two distinct files from the official `genlayerlabs/genlayer-js`
v1.1.8 release commit `4303db00c428d57c6d8e5b04a75043ea42d4b0e7`:

| Authority URL | Committed SHA-256 |
| --- | --- |
| https://raw.githubusercontent.com/genlayerlabs/genlayer-js/4303db00c428d57c6d8e5b04a75043ea42d4b0e7/README.md | `76f02a57d11db0541b0d0151f9caaae3a922b4ed332afe0e0621b898676be279` |
| https://raw.githubusercontent.com/genlayerlabs/genlayer-js/4303db00c428d57c6d8e5b04a75043ea42d4b0e7/package.json | `bdb0b9a86827b392ad9b584a52158bf7b90ef9e4425e009f1f5c8a8d0e6f3662` |

Both URLs, hashes, and all 13 `create_sla` arguments are visible in the
explorer's decoded transaction input.

## V3 settlement safeguards

- Provider submission starts an immutable requester challenge window.
- Only the requester can submit one hash-bound counter-evidence artifact.
- Review is impossible until the challenge deadline passes.
- Two distinct authoritative HTTPS sources and their hashes are terms of every
  SLA.
- Provider work, provider evidence, optional requester counter-evidence, and
  both authority sources must be retrievable, size-bounded, and hash-correct.
- Any required artifact outage, HTTP error, oversize response, or digest
  mismatch enters `EVIDENCE_REVIEW`. It cannot decide service failure.
- Escrow remains locked during evidence review. Either party may retry before
  one absolute evidence deadline that retries cannot extend.
- Numeric scores are not collected, stored, displayed as canonical, or used in
  settlement. Validators must agree exactly on `SATISFIED` or `UNSATISFIED`.
- `SATISFIED` pays only the provider; `UNSATISFIED` refunds only the requester.
  Open cancellation and timeouts are requester-only, and settlement is
  single-use.

## Automated verification

The September 9 local gate produced:

- GenVM lint: 3 checks passed
- Direct contract suite: 23 passed
- Frontend integration suite: 9 passed
- Vite production build: passed

Coverage includes unauthorized actions, exact-term acceptance, authority URL
and hash validation, requester-only counter-evidence, challenge timing,
provider/counter-evidence/authority outages and mismatches, fixed-deadline
recovery, categorical validator disagreement, payout and refund recipients,
timeouts, cancellation, duplicate settlement, protocol gating, zero reward,
and the actual simplified SDK receipt shape.

## Historical proof boundary

Older v2 transactions demonstrated a completed `SATISFIED` review, provider
payout, protected evidence hold, and requester refund. Those records remain
historical evidence only; they are not used as proof that the v3 wallet-created
SLA has settled. V3 intentionally removed numeric scoring.

All current live evidence uses public Studionet, virtual GEN, and ephemeral
sandbox accounts. No personal wallet, seed phrase, private-key file,
real-value asset, Bradbury transaction, or Mainnet transaction is claimed.
