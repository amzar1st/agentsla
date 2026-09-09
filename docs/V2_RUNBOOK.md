# Agentsla v3 deployment and proof runbook

The filename is retained so existing repository links do not break. This
runbook now describes only the canonical v3 deployment and proof.

Status: **completed on GenLayer Studionet with virtual funds on September 9,
2026.**

## Completed verification

1. Deployed root `agentsla.py` in Normal (Full Consensus) mode.
2. Confirmed deployment `FINALIZED` and
   `get_protocol_version() == "3"`.
3. Generated an ephemeral local signer with `genlayer-js@1.1.8`.
4. Requested virtual Studionet faucet funds for that signer.
5. Created `agentsla-v3-wallet-001` with `0.10 GEN` through
   `client.writeContract` and the SDK's `estimateTransactionGas` path.
6. Waited for `FINALIZED` and verified GenVM `SUCCESS`,
   `MAJORITY_AGREE`, and five `AGREE` votes.
7. Read `get_result`, `get_sla`, and `get_terms_hash` from
   `LATEST_FINAL`.
8. Confirmed the created record binds two official authority sources, a
   one-hour requester challenge window, and categorical-only settlement.
9. Confirmed automated coverage for protected evidence review, recovery,
   authorization, deadlines, payout, refund, and duplicate settlement.

## Canonical values

- Contract:
  https://explorer-studio.genlayer.com/address/0xd8647B3A24f2973F29A5fC1822832c87E1398BA3
- Deployment:
  https://explorer-studio.genlayer.com/tx/0x17306034c538e49a53fc318283f1b3f5b44291e604a71c046693126b5ecc13c8
- Wallet Create SLA:
  https://explorer-studio.genlayer.com/tx/0x02f741b46fa79954bc2fcc3f2ed566a7858758ab076b4cfe1d8cb5f1d46d5ac0
- SLA ID: `agentsla-v3-wallet-001`
- Requester: `0xd0834084e353E5E825D55466967956349Bc60E17`
- Provider: `0x41b36C6B5cCcf9D7d5Dc09d6d2B132986FdE48e8`
- Terms hash:
  `ba6518f2f16a2fb3476a6df9ffe6add1eb53d048988e203c66bb168edc129507`

## Reproduce the wallet write safely

1. Use GenLayer Studionet only. The script requests virtual faucet funds.
2. From `frontend`, install the exact lockfile with `npm ci`.
3. Choose a never-used SLA ID and run:

   ```bash
   AGENTSLA_PROOF_ID=your-unique-sla-id npm run proof:create
   ```

4. Wait for the printed receipt to show `FINALIZED`,
   `MAJORITY_AGREE`, and leader `SUCCESS`.
5. Compare the printed latest-final reads with the decoded explorer input.
6. Verify both authority URL/hash pairs and the terms hash.
7. Never copy a generated signer into the website or repository. The script
   intentionally keeps it in memory and does not print its private key.

## Re-run the local verification gate

```bash
genvm-lint agentsla.py
python -m pytest -q tests/direct/test_agentsla.py
cd frontend
npm ci
npm test
npm run build
```

Use `SUBMISSION_EVIDENCE.md` for the exact observed transaction and read
record. Earlier v2 score-based runs are historical and are not part of the
current submission proof.
