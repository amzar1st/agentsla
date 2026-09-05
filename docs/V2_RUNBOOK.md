# Agentsla v2 deployment and live proof runbook

Status: **not deployed**. A source update does not modify the historical contract.
Use the owner's GenLayer Studio and wallet for deployment and signed actions.

1. Run the verification commands in README. Deploy the exact root `agentsla.py`
   in Studio. Record its SHA-256, Git commit, new address and deployment transaction.
   Confirm finalization and successful execution, then compare deployed source
   to the repository source. `get_protocol_version` must return `2`.
2. Set `VITE_AGENTSLA_V2_ADDRESS` in the frontend build environment to the new
   address. Run `npm ci`, `npm test`, `npm run build`, and publish that build.
   Confirm the application displays the new address and enables v2 writes.
3. Use two distinct wallets (requester and provider). Use a fresh SLA ID such as
   `agentsla-v2-success-001`, nonzero test GEN, and acceptance/submission windows
   long enough to complete the demo (e.g. 86400 seconds each). Describe an exact,
   testable service and evidence criteria. Record all agreed terms and reward.
4. Requester: `create_sla`. Provider: read `get_terms_hash`, inspect the full SLA,
   and `accept_sla` with that exact hash. Save both successful transaction records.
5. Provider: publish short UTF-8 deliverable/evidence files at immutable Git
   commit URLs; calculate SHA-256 over their exact downloaded bytes. Use
   `submit_work` with those URLs and hashes. Keep both files below 120,001 bytes.
6. Call `review_sla` under normal/full consensus. Save the transaction response,
   validator commits/reveals, verdict, score and finalized `get_result`.
7. Call `finalize_sla`. Verify successful execution and the emitted payment's
   recipient and amount. Record the transfer receipt or balance proof accounting
   for gas/other activity. `PAID` alone records that payment was emitted; it is
   not standalone proof of recipient receipt.
8. Run a second SLA using an owner-controlled HTTPS endpoint that temporarily
   returns 503. On review, verify `EVIDENCE_REVIEW`, no payment/refund, and
   `evidence_retry_deadline = review_deadline + 86400`. Restore the exact bytes,
   retry as either party before that deadline, and verify normal settlement.
   Save state/transaction records before and after recovery.
9. Run an authenticated unsuccessful-service example to prove requester refund.
   For timeout proof, use a separate evidence-failure SLA and wait until the
   protected deadline has passed; do not use shortened production constants.
10. Update deployment and submission documents only with observed results.
    Replace the pending-v2 status with links to the new proof and retain v1
    as historical. Include the website, GitHub, network, contract address,
    exact source digest, lifecycle transactions and payout/refund proof.

For wallet testing, confirm account switching, rejected signatures, wrong
network recovery, retry controls and failed transaction messages. No private
key or seed phrase is needed in the repository or frontend.

## Historical v1 verification still needed

Use the old address and SLA ID in `SUBMISSION_EVIDENCE.md`. Independently read
`get_result` at finalized state, inspect the full consensus receipt and validator
records, and trace the emitted transfer through recipient receipt. Store the
raw responses with retrieval dates. A README claim or static dashboard is not
an independent chain check.
