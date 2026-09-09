# Agentsla v3 deployment

## Canonical deployment

| Item | Value |
| --- | --- |
| Network | GenLayer Studionet |
| Chain ID | `61999` |
| Contract | `0xd8647B3A24f2973F29A5fC1822832c87E1398BA3` |
| Deployment tx | `0x17306034c538e49a53fc318283f1b3f5b44291e604a71c046693126b5ecc13c8` |
| Status | `FINALIZED` |
| Execution mode | Normal (Full Consensus) |
| Creator | `0x41b36C6B5cCcf9D7d5Dc09d6d2B132986FdE48e8` |
| Protocol read | `get_protocol_version() == "3"` |
| Source SHA-256 | `56db37c05044c6478206e7dc16cb9498faee5369738a1eae065da7fbc1d21d1f` |

- Explorer: https://explorer-studio.genlayer.com/address/0xd8647B3A24f2973F29A5fC1822832c87E1398BA3
- Deployment: https://explorer-studio.genlayer.com/tx/0x17306034c538e49a53fc318283f1b3f5b44291e604a71c046693126b5ecc13c8
- Public app: https://agentsla.amzar1st96.chatgpt.site

## Wallet-write verification

The canonical post-deployment write was made through `genlayer-js@1.1.8`
using an ephemeral local wallet, not the removed fee helper.

| Item | Value |
| --- | --- |
| SLA ID | `agentsla-v3-wallet-001` |
| Create tx | `0x02f741b46fa79954bc2fcc3f2ed566a7858758ab076b4cfe1d8cb5f1d46d5ac0` |
| Requester | `0xd0834084e353E5E825D55466967956349Bc60E17` |
| Provider | `0x41b36C6B5cCcf9D7d5Dc09d6d2B132986FdE48e8` |
| Escrow | `0.10 GEN` virtual Studionet funds |
| Explorer status | `FINALIZED` |
| GenVM result | `SUCCESS` |
| Consensus | `Accepted`; five validator votes `AGREE` |
| Terms hash | `ba6518f2f16a2fb3476a6df9ffe6add1eb53d048988e203c66bb168edc129507` |

Transaction:
https://explorer-studio.genlayer.com/tx/0x02f741b46fa79954bc2fcc3f2ed566a7858758ab076b4cfe1d8cb5f1d46d5ac0

The write used the SDK sequence:

1. `createAccount()` creates a one-use signer in memory.
2. Studionet supplies virtual faucet funds.
3. `writeContract` encodes `create_sla`.
4. GenLayerJS calls `estimateTransactionGas`.
5. The wallet signs and submits the transaction.
6. `waitForTransactionReceipt` waits for `FINALIZED`.
7. Three `LATEST_FINAL` reads verify the canonical record.

The production frontend uses the same `writeContract` method with
`window.ethereum`, then validates both the documented high-level receipt
shape and the snake_case simplified receipt actually returned by v1.1.8.

## V3 protocol behavior

- Immutable terms include task, requirements, evidence requirements, two
  authority URL/hash pairs, reward, and all deadlines.
- Provider submission opens a fixed requester challenge window.
- Only the requester can submit one counter-evidence URL/hash pair.
- Review cannot run before the challenge deadline.
- Provider work, provider evidence, optional requester evidence, and both
  authority sources must be available, size-bounded, and SHA-256 authentic.
- Any outage, HTTP failure, oversize, or mismatch enters `EVIDENCE_REVIEW`;
  escrow remains locked for an absolute retry period.
- Numeric scores are not collected. Validators must agree on the categorical
  verdict that drives settlement.
- `SATISFIED` pays only the provider; `UNSATISFIED` refunds only the
  requester.

## Verification commands

```bash
genvm-lint agentsla.py
python -m pytest -q tests/direct/test_agentsla.py
cd frontend
npm ci
npm test
npm run build
```

Observed September 9, 2026: 3 lint checks, 23 contract tests, and 9 frontend
tests passed; the Vite production build completed successfully.

No personal wallet, seed phrase, private key file, or real-value token was
used. Historical v1/v2 deployments are not used by the public app.
