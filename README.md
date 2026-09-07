# Agentsla

**AI agent service escrow and consensus settlement on GenLayer.** A requester
escrows GEN under immutable service terms, the named provider accepts the exact
terms hash, and GenLayer validators authenticate submitted artifacts before
judging whether payment or refund is due.

## Verified v2 deployment

- Public app: https://agentsla.amzar1st96.chatgpt.site
- GitHub: https://github.com/amzar1st/agentsla-demo
- Network: GenLayer Studionet, chain ID `61999`
- Contract: `0x635c282A6A6F57521783b4C7C420bB9bC5BB34F4`
- Deployment tx: `0xd70adeed1dded35bb62a71e9d58d3563dd40931ea5318ba2f623f410ea0c54d9`
- Root source SHA-256: `5ff8f456632cfda7b55e4d1f0e450a677993a905824e8c2b39ba67050a13de5b`
- Protocol read: `get_protocol_version() == "2"`

The contract was deployed and tested with GenLayer Studio's generated sandbox
accounts. No MetaMask or owner wallet was connected for these tests.

## Live proof

| Case | Verified result | Transaction |
| --- | --- | --- |
| Full Consensus review | `SATISFIED`, `92/100`, one review attempt | `0x73d99219...ae1bed6` |
| Provider settlement | `PAID`, `settled: true`; provider balance `0 -> 1 GEN` | `0x0266239d...de33c6d` |
| Evidence mismatch | `EVIDENCE_REVIEW`, `settled: false`; escrow held | `0xa330ca8a...37b09e2` |
| Open-SLA cancellation | `CANCELLED`, `settled: true`; requester refunded | `0x43cd452e...b5c0710` |

The canonical successful SLA is `agentsla-v2-verified-002`. Its exact terms
hash is `8791e92f53a8caaba8e170f7936e6ca1f657f1ea6501ab65ed859778e79b2120`.
The requester sandbox account was
`0xF889240e6Fa88D88d81ef1b36f55962Ca61f84e7`; the provider was
`0x022C28fF8296096a22457bFe82c9f91B53934F0f`.

See [submission evidence](SUBMISSION_EVIDENCE.md) for all lifecycle transaction
hashes and [verification](docs/VERIFICATION.md) for the observed states and
test boundary.

## Protected evidence review

| Review result | Contract consequence |
| --- | --- |
| Authenticated `SATISFIED` at or above the agreed threshold | `finalize_sla` pays the provider |
| Authenticated `UNSATISFIED` or a below-threshold score | `finalize_sla` refunds the requester |
| Fetch exception, non-2xx response, oversized artifact, or hash mismatch | `EVIDENCE_REVIEW`; no payout or refund |
| Evidence becomes available during the grace period | Either SLA party retries the original URL/hash commitments |
| The fixed grace period expires | The requester can claim the timeout refund |

The retry deadline is fixed at the original review deadline plus 24 hours.
Retries cannot roll it forward. URLs and SHA-256 commitments cannot be changed
after submission, and artifacts larger than 120,000 bytes never reach the jury.

## Why GenLayer is central

Wallet identities, deadlines, exact terms, artifact hashes, and transfers are
deterministic. GenLayer validators independently fetch the hash-bound artifacts
and judge the natural-language SLA. Validator equivalence compares the
settlement-critical categorical decision; explanatory score variation does not
strand a clear decision as `UNDETERMINED`.

The frontend uses `genlayer-js` for finalized reads, fee estimation, wallet
signatures, writes, and transaction finalization. It verifies protocol version
`2` before enabling writes.

## Run and test

Python 3.12+ and Node.js 22:

```bash
python -m pip install -r requirements-dev.txt
genvm-lint agentsla.py
python -m pytest tests/direct -q
cd frontend
npm ci
npm test
npm run build
```

The direct-mode tests mock web/LLM responses and capture SDK transfer requests;
they do not move real GEN. The Studio evidence above uses virtual Studionet GEN.

## Repository map

- `agentsla.py` — deployed Intelligent Contract source
- `tests/direct/test_agentsla.py` — evidence, authorization, deadline, payout, refund, retry, and validator regressions
- `frontend/` — public wallet-enabled application and DOM integration tests
- `SUBMISSION_EVIDENCE.md` — reviewer-facing live transaction trail
- `docs/VERIFICATION.md` — verification record and limits
- `docs/V2_RUNBOOK.md` — completed run and replay checklist
- `report.json`, `EVIDENCE.md` — commit-pinned canonical demo artifacts

The earlier contract `0xc7A6812642ea6158926B369f6c0d35F507fbAA8a`
remains a historical v1 deployment and is not used by the current app.
