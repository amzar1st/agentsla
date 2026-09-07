# Agentsla v2 deployment and proof runbook

Status: **completed on GenLayer Studionet with Studio-generated accounts on
September 7, 2026.** See [deployment](../DEPLOYMENT.md) and
[submission evidence](../SUBMISSION_EVIDENCE.md).

## Completed checklist

1. Loaded root `agentsla.py`, recorded SHA-256, parsed the schema, deployed with
   Normal (Full Consensus), and verified protocol version `2`.
2. Configured the frontend with the canonical v2 address and protocol gating.
3. Created two distinct Studio sandbox accounts for requester/provider roles.
4. Created a nonzero escrow SLA and had the named provider accept the exact
   terms hash.
5. Submitted commit-pinned report/evidence URLs with matching SHA-256 digests.
6. Ran Full Consensus and observed `SATISFIED`, score `92`, one attempt.
7. Finalized the SLA and observed `PAID`, `settled: true`, plus provider balance
   change `0 -> 1 GEN`.
8. Submitted a mismatched evidence digest and observed `EVIDENCE_REVIEW`,
   `settled: false`, with retry deadline exactly 86,400 seconds after the
   original review deadline.
9. Cancelled a separate open SLA and observed `CANCELLED`, `settled: true`, and
   requester balance restoration.
10. Recorded every canonical transaction in repository documentation.

## Repeat safely

1. Confirm the selected network is GenLayer Studionet (`61999`) and execution
   mode is Normal (Full Consensus).
2. Verify the local source hash and `get_protocol_version() == "2"`.
3. Use fresh SLA IDs, two accounts, nonzero virtual GEN, and windows of at least
   60 seconds.
4. Read `get_terms_hash` before provider acceptance.
5. Use public HTTPS artifacts below 120,001 bytes and calculate SHA-256 over the
   exact downloaded bytes.
6. Wait for each write to reach `FINALIZED` before the dependent action.
7. Read `get_result` before and after `finalize_sla`, and verify the recipient
   balance change rather than relying only on `PAID`.
8. For an outage test, preserve production retry constants; do not shorten the
   24-hour protection merely to accelerate testing.

No seed phrase or private key belongs in Studio inputs, the repository, or the
frontend. The completed proof used only Studio-generated sandbox accounts.
