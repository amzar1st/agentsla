# AgentSLA

**AI Agent-to-Agent Contract Settlement on GenLayer**

AgentSLA lets one agent fund a service agreement for another agent, bind both sides to immutable terms, submit hash-bound work and evidence, and use GenLayer consensus to determine whether the SLA was satisfied before escrow is settled.

## Core flow

`CREATE + FUND → ACCEPT TERMS → SUBMIT WORK → GENLAYER REVIEW → SATISFIED / UNSATISFIED → PAY / REFUND`

## Why GenLayer

Ordinary smart contracts can verify addresses, balances, timestamps and hashes, but they cannot reliably judge whether a research report materially satisfies natural-language requirements. AgentSLA keeps objective checks deterministic and uses GenLayer validators only for the fulfillment judgment.

## Canonical Studionet deployment

- Contract: `0xf460701AFedCe66Cd3A83d830bdaC67046575d24`
- Deployment transaction: `0xf37671ca336cff1664f97846f09fb2806ffc2dc01a9e1993e755d435b215528d`

## Live demo SLA

- SLA ID: `agentsla-cyber-001`
- Title: `Cybersecurity Incident Research SLA`
- Passing score: `80`
- Terms hash: `f715873e5f85d8f8db99eb919d235382e763664b652b1cdbd96971a7adba2a77`
- Create/fund transaction: `0x21091fd7f3f517e504d677d6dd50e792e95eb9d60c52263a0e07deba7c70ca47`
- Provider acceptance transaction: `0xd7f6c446c9e5a4af10c6210dc014fd00f4f1da7c7942e619f1f4e9469f7395a2`

The demo asks the provider to research exactly five major cybersecurity incidents announced between August 24 and September 3, 2026 and return a sourced structured JSON report.

## Demo artifact integrity

- `report.json` SHA-256: `60b47dae942830ed2c611cbc351c5e31c63b7a30f46119fe9ea6844af8357828`
- `EVIDENCE.md` SHA-256: `889e056106f36bf07e3634ec16b85e2de28502a4e201d89755826306cc4113a9`

The contract fetches the submitted public artifacts during consensus review and verifies their SHA-256 digests before using them as adjudication input.

## Contract methods

### Writes

- `create_sla`
- `accept_sla`
- `submit_work`
- `review_sla`
- `finalize_sla`
- `cancel_open_sla`
- `claim_timeout_refund`

### Reads

- `get_sla`
- `get_sla_count`
- `get_sla_id`
- `get_terms_hash`
- `get_result`

## Project files

- `agentsla.py` — deployed GenLayer Intelligent Contract source
- `report.json` — canonical provider demo deliverable
- `EVIDENCE.md` — evidence map for the demo report
- `DEPLOYMENT.md` — deployment and live lifecycle details
- `SUBMISSION_EVIDENCE.md` — reviewer-facing evidence and transaction trail

## Current live-demo status

The SLA has been created/funded and explicitly accepted by the provider. The remaining live steps are `submit_work`, full-consensus `review_sla`, and `finalize_sla`. This repository will be updated with those transaction hashes after completion.
