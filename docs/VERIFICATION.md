# Agentsla v2 verification — September 5, 2026

## Recheck — September 7, 2026

The verification job was rerun for the unchanged commit
`a586b0df3503914cc7816d75fc457148f7efff01` in
[GitHub Actions](https://github.com/amzar1st/agentsla-demo/actions/runs/33949637901).
The new job, `101623427628`, completed successfully:

- GenVM lint: 3 checks passed.
- Direct contract tests: 16 passed.
- Frontend tests: 4 passed, 0 failed.
- Production build: passed; bundle-size advisory remains.

These are fresh CI results, not live-chain or MetaMask test results. Local test
dependencies were unavailable in the resumed workspace, so no fresh local test
pass is claimed. The source SHA-256 remains the value recorded below.

The source was loaded into a dedicated GenLayer Studio editor file named
`agentsla_v2_verified.py`. Studio displayed the constructor with no parameters
and an available deployment button, with Normal (Full Consensus) selected.
This verifies interface generation only. A byte-for-byte export comparison,
deployment, protocol-version read, and wallet-signed lifecycle remain pending.
No deployment or payment was submitted during this recheck. The MetaMask
connection flow was opened; a connection has not yet been verified.

## Executed checks

| Check | Result |
| --- | --- |
| GenVM safety lint | Passed, 3 checks (`genvm-linter` 0.11.0) |
| Direct contract regression tests | 16 passed (`genlayer-test` 0.29.2, pytest 9.1.1, GenVM SDK v0.2.12) |
| Frontend DOM and wallet-adapter tests | 4 passed (mocked RPC and wallet) |
| Production frontend build | Passed, Vite 8.2.2; bundle-size advisory only |
| Historical report.json SHA-256 | Matches recorded digest |
| Historical EVIDENCE.md SHA-256 | Matches recorded digest |
| Live v1 consensus/recipient payment | Not independently verified; access unavailable |
| Live wallet signatures and account/network behavior | Not exercised with the owner's wallet |
| V2 deployment/full consensus/recipient payment | Pending new deployment |

Root v2 `agentsla.py` SHA-256:
`d5c3515c9d2077f2cdaf658f536088167d4257583b34043d7e5b45d39291f98d`

The lint result is a static safety check, not GenVM execution certification.
Direct tests execute contract logic with the pinned SDK and real storage/calldata
handling, mock web/LLM results, and capture SDK `EthSend` requests (recipient,
value and empty calldata). They assert provider/requester destinations and
prevention of duplicate settlement. They do not execute those transfers on a
live chain or confirm recipient balances.

Regression coverage: provider-only acceptance/submission; exact terms hash;
party-only retry; requester-only cancellation; original deadline expiration;
fixed retry grace and its exact boundary; fetch exceptions; HTTP 503; deliverable
and evidence hash mismatches; oversize input; recovery and retry; low-score and
unsatisfied refunds; successful payout; duplicate settlement; validator disagreement.

Frontend tests verify that missing v2 deployment disables writes, failed live
reads show UNVERIFIED, retry submits the correct method/address through the
mock wallet, and failed execution is never reported as successful settlement.
These are DOM integration tests, not a real MetaMask end-to-end run.

## Historical evidence integrity

Source snapshot reviewed:
[c1be08f8c1f2f1e2598361a9d358a879f6ca385d](https://github.com/amzar1st/agentsla-demo/tree/c1be08f8c1f2f1e2598361a9d358a879f6ca385d).
The uploaded final Python file had equivalent code to that snapshot (only a
trailing newline differed). The historical source remains available at that
commit; root source now intentionally differs.

- `report.json`: `033ee9d4c7ba59f2afb41d239edad0067a5be963dbfcb457f4889b6eaed33abb`
- `EVIDENCE.md`: `b9fbe4eed335704a9e42ea12351add509d9f6b76fea9bafb9ebbb72316426517`

The bytes of both artifacts are preserved unchanged by this update.
Matching repository digests confirms file integrity, not that the live validators
used those bytes or paid the provider.

## Live proof access limitations

The explorer URLs for the reported consensus and settlement transactions could
not be opened by the web tool. A direct JSON-RPC request to the Studionet API
could not complete because network approval was cancelled. No RPC receipt or
finalized state was returned. The live Netlify page was also unavailable through
the web tool. These access failures do not establish transaction or website failure.

The previous 95/100, SATISFIED and payment claims remain explicitly historical
and unverified in this review. No transaction was signed and no new contract
was deployed. Follow [V2_RUNBOOK.md](V2_RUNBOOK.md) to close these gaps.
