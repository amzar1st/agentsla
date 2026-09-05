# Agentsla

**AI agent service escrow and consensus settlement on GenLayer.** A requester
funds an immutable service agreement, the named provider accepts its terms hash,
and validators judge authenticated deliverables before payment or refund.

## Current status — v2 deployment pending

The root `agentsla.py` is **v2 source with protected evidence retries**. It has
not been deployed in this update. The old address
`0xc7A6812642ea6158926B369f6c0d35F507fbAA8a` is the **historical v1 deployment**
and does not implement these protections. GitHub updates cannot upgrade it.

The existing website is [agentsla.netlify.app](https://agentsla.netlify.app).
The updated frontend disables writes until a deployed v2 address is configured
and reports protocol version `2`. Historical v1 reads and proof links remain
available. Publishing this source to Netlify, if Git-connected, will pause old
write actions until that configuration is supplied.

**Submission is pending a v2 live demonstration and payment verification.**
See [verification results](docs/VERIFICATION.md) and the
[deployment runbook](docs/V2_RUNBOOK.md).

## Why GenLayer is central

Identity, reward, deadlines, immutable terms and SHA-256 authentication are
objective checks. GenLayer validators independently fetch the same artifacts
and judge fulfillment of the natural-language requirements. The accepted
verdict controls escrow settlement. The frontend uses `genlayer-js` to read
and write the Intelligent Contract; no application database is required.

## Protected evidence review

| Result | Consequence |
| --- | --- |
| Authenticated `SATISFIED`, score at least the agreed threshold | `finalize_sla` emits the provider payment |
| Authenticated `UNSATISFIED` or score below threshold | `finalize_sla` emits the requester refund |
| Fetch exception, non-2xx HTTP response, oversized artifact or hash mismatch | `EVIDENCE_REVIEW`; escrow stays locked |
| Evidence restored during grace period | Either party calls `retry_review` with the original URLs and hashes |
| Grace period expires | `claim_timeout_refund` emits the requester refund |

The original review window is 24 hours after submission. Evidence failure
protects escrow until **original review deadline + 24 hours**, inclusive.
A retry at the deadline is allowed; timeout refund requires a strictly later
transaction timestamp. Repeated failures never extend this absolute deadline.
An outage is not recorded as a failed service judgment. Artifacts over 120,000
bytes are rejected from judgment instead of silently truncating the jury input.

V2 terms hashes bind the review and retry durations. URL/hash changes are not
accepted during retry. `get_result` exposes review attempts and deadlines.

## Historical evidence

The prior documentation reports SLA `agentsla-cyber-003`, `SATISFIED`, score
`95/100`, and provider payment. These remain **historical reported claims**,
not proof of v2. Explorer/RPC access was unavailable during this review, so the
live consensus result, emitted transfer and recipient receipt were not
independently verified. See [historical proof links](SUBMISSION_EVIDENCE.md).

The exact repository bytes of `report.json` and `EVIDENCE.md` match the
previously recorded SHA-256 digests. Keep those files unchanged; they are demo
evidence, not general project documentation.

## Run and test

Python 3.12+ and Node.js 22:

```bash
python -m pip install -r requirements-dev.txt
python -m pytest tests/direct -q
genvm-lint agentsla.py
cd frontend
npm ci
npm test
npm run build
npm run dev
```

The first direct-mode test run downloads the GenVM SDK. Tests mock web/LLM
responses and intercept actual SDK transfer requests; they do not move GEN.

To activate v2, set `VITE_AGENTSLA_V2_ADDRESS` to the new contract address in
the frontend build environment, rebuild, and complete the live runbook.
Never use the historical v1 address for this variable.

## Repository map

- `agentsla.py` — v2 Intelligent Contract
- `frontend/` — wallet interface, protected deployment controls and frontend tests
- `tests/direct/test_agentsla.py` — authentication, authorization, deadlines, consensus and emitted-transfer regressions
- `docs/V2_RUNBOOK.md` — deployment and live evidence checklist
- `docs/VERIFICATION.md` — actual checks, results and remaining limitations
- `DEPLOYMENT.md`, `SUBMISSION_EVIDENCE.md` — historical deployment records
- `PROJECT_SUBMISSION.md` — draft pending live v2 evidence
- `report.json`, `EVIDENCE.md` — unchanged historical demo artifacts
- `.github/workflows/verify.yml` — repeatable automated checks

## Contract interface

Writes: `create_sla`, `accept_sla`, `submit_work`, `review_sla`, `retry_review`,
`finalize_sla`, `cancel_open_sla`, `claim_timeout_refund`.

Reads: `get_protocol_version`, `get_sla`, `get_sla_count`, `get_sla_id`,
`get_terms_hash`, `get_result`.
