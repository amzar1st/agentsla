# Agentsla v3 submission evidence

This document answers the September 8, 2026 steward request with a new v3
deployment, a supported GenLayerJS wallet write, and the resulting latest-final
on-chain read.

## Steward request → verified response

| Requested correction | Implemented and verified |
| --- | --- |
| Replace broken fee helper | Frontend pins `genlayer-js@1.1.8` and calls `writeContract`, whose supported path invokes `estimateTransactionGas` |
| New wallet-originated Create SLA | Finalized transaction `0x02f741…d46d5ac0` from an ephemeral SDK wallet |
| On-chain read | `get_result`, `get_sla`, and `get_terms_hash` read from `LATEST_FINAL` |
| Requester counter-evidence | One requester-only SHA-256-bound submission during a fixed challenge window |
| Challenge window | Review is rejected until the immutable challenge deadline closes |
| Authoritative sources per SLA | Two distinct HTTPS authority URLs and SHA-256 commitments are immutable terms |
| Scores only if validators agree | V3 does not collect or expose a numeric score; settlement uses only an exact validator-agreed categorical verdict |
| Temporary evidence outage | Any required artifact outage, HTTP error, oversize, or hash mismatch enters protected `EVIDENCE_REVIEW`; escrow remains locked |

## Canonical deployment

- Network: GenLayer Studionet, chain ID `61999`
- Contract: https://explorer-studio.genlayer.com/address/0xd8647B3A24f2973F29A5fC1822832c87E1398BA3
- Deployment transaction: https://explorer-studio.genlayer.com/tx/0x17306034c538e49a53fc318283f1b3f5b44291e604a71c046693126b5ecc13c8
- Deployment state: `FINALIZED`
- Creator: `0x41b36C6B5cCcf9D7d5Dc09d6d2B132986FdE48e8`
- Studio execution mode: Normal (Full Consensus)
- `get_protocol_version()`: `"3"` from finalized state
- Repository source SHA-256: `56db37c05044c6478206e7dc16cb9498faee5369738a1eae065da7fbc1d21d1f`

## Canonical wallet-created SLA

- SLA ID: `agentsla-v3-wallet-001`
- Create transaction: https://explorer-studio.genlayer.com/tx/0x02f741b46fa79954bc2fcc3f2ed566a7858758ab076b4cfe1d8cb5f1d46d5ac0
- Requester: https://explorer-studio.genlayer.com/address/0xd0834084e353E5E825D55466967956349Bc60E17
- Provider: `0x41b36C6B5cCcf9D7d5Dc09d6d2B132986FdE48e8`
- Value: `0.10 GEN` virtual Studionet escrow
- Terms hash: `ba6518f2f16a2fb3476a6df9ffe6add1eb53d048988e203c66bb168edc129507`
- Created: September 9, 2026 at 06:05:01 UTC
- Finalized: September 9, 2026 at 06:05:38 UTC

The explorer independently shows:

| Field | Observed value |
| --- | --- |
| Type / method | `Call / create_sla` |
| Status | `FINALIZED` |
| GenVM execution | `SUCCESS`, return value `null`, empty stdout/stderr |
| Consensus | `Accepted` |
| Execution mode | `Normal` |
| Initial validators | `5` |
| Rotation count | `0` |
| Escrow value | `0.10 GEN` |

The SDK receipt also reported `status_name: FINALIZED`,
`result_name: MAJORITY_AGREE`, leader `execution_result: SUCCESS`, and five
`AGREE` validator votes.

## Exact wallet-write path

The proof runner is `frontend/scripts/create-studionet-proof.mjs`. It:

1. creates a new local wallet in process memory with `createAccount()`;
2. requests virtual Studionet faucet funds for that address;
3. calls `client.writeContract({ functionName: "create_sla", ... })`;
4. lets GenLayerJS invoke its supported `estimateTransactionGas` path;
5. signs locally and submits the raw transaction;
6. waits for `TransactionStatus.FINALIZED`; and
7. reads `get_result`, `get_sla`, and `get_terms_hash` with
   `TransactionHashVariant.LATEST_FINAL`.

The generated private key was never printed, saved, committed, or connected to
the website. Only virtual Studionet GEN was used. The production browser path
uses the same pinned SDK `writeContract` flow with an injected EIP-1193 wallet.

## Immutable authority sources

The proof SLA binds the official `genlayerlabs/genlayer-js` v1.1.8 release
commit `4303db00c428d57c6d8e5b04a75043ea42d4b0e7`:

| Authority | SHA-256 |
| --- | --- |
| https://raw.githubusercontent.com/genlayerlabs/genlayer-js/4303db00c428d57c6d8e5b04a75043ea42d4b0e7/README.md | `76f02a57d11db0541b0d0151f9caaae3a922b4ed332afe0e0621b898676be279` |
| https://raw.githubusercontent.com/genlayerlabs/genlayer-js/4303db00c428d57c6d8e5b04a75043ea42d4b0e7/package.json | `bdb0b9a86827b392ad9b584a52158bf7b90ef9e4425e009f1f5c8a8d0e6f3662` |

The explorer's decoded input displays both URLs, both hashes, and all 13 v3
arguments.

## Latest-final on-chain read

`get_result("agentsla-v3-wallet-001")` returned:

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

Selected values from `get_sla("agentsla-v3-wallet-001")`:

```json
{
  "requester": "0xd0834084e353e5e825d55466967956349bc60e17",
  "provider": "0x41b36c6b5cccf9d7d5dc09d6d2b132986fde48e8",
  "reward": "100000000000000000",
  "status": "OPEN",
  "created_at": 1788914101,
  "acceptance_deadline": 1789000501,
  "submission_window_seconds": 86400,
  "challenge_window_seconds": 3600,
  "authority_hash_one": "76f02a57d11db0541b0d0151f9caaae3a922b4ed332afe0e0621b898676be279",
  "authority_hash_two": "bdb0b9a86827b392ad9b584a52158bf7b90ef9e4425e009f1f5c8a8d0e6f3662",
  "terms_hash": "ba6518f2f16a2fb3476a6df9ffe6add1eb53d048988e203c66bb168edc129507"
}
```

The 86,400-second acceptance interval exactly matches the committed input.

## Automated verification

Verified locally on September 9, 2026:

- GenVM lint: 3 checks passed
- Direct contract tests: 23 passed
- Frontend integration tests: 9 passed
- Vite production build: passed

Coverage includes evidence mismatch and outages for every required artifact,
recovery without deadline extension, requester-only counter-evidence,
challenge timing, authority validation, unauthorized actions, exact terms,
payout/refund recipients, timeouts, cancellation, duplicate settlement,
validator disagreement, protocol gating, the actual v1.1.8 simplified receipt
shape, and zero-value rejection.

## Verification boundary

This is public Studionet sandbox evidence. The transaction, decoded input,
validator votes, source, and contract reads are independently inspectable.
Studionet GEN has no real value. The proof does not claim a Mainnet/Bradbury
deployment or use a personal wallet.

Historical v1/v2 score-based transactions are intentionally excluded from the
v3 evidence set.
