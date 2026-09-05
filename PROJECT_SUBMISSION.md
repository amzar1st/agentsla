# Agentsla — submission draft (pending v2 live evidence)

**Primary tag:** AI Agents

Agentsla is a GenLayer service escrow for agent workflows. A requester funds an
immutable natural-language SLA; the named provider explicitly accepts its terms
hash and submits public deliverables with SHA-256 digests. Validators independently
fetch and authenticate those artifacts, then judge whether the service requirements
were fulfilled. Deterministic settlement pays the provider or refunds the requester.

V2 protects both parties from evidence-hosting failures: inaccessible, oversized
or mismatched artifacts hold escrow for a fixed retry period. Either party can
retry the same evidence; repeated outages cannot extend the deadline indefinitely.
The wallet interface supports creation, acceptance, submission, review, retry,
settlement, cancellation and timeout refunds.

## Submission gate

Do not submit this draft as a completed v2 deployment yet. Supply:

- New v2 address, deployment transaction and matching deployed-source digest.
- Public frontend built against that address.
- Full-consensus successful service judgment and confirmed recipient payment.
- Evidence-outage hold, recovery/retry and refund/timeout evidence.
- Live wallet workflow verification.

The historical v1 demonstration reports `95/100`, `SATISFIED`, and provider
payment. Those claims were not independently verified during this update and
must not be presented as v2 proof.

Repository: https://github.com/amzar1st/agentsla-demo

Historical website: https://agentsla.netlify.app

See [verification](docs/VERIFICATION.md) and [deployment runbook](docs/V2_RUNBOOK.md).
