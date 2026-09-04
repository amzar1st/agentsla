# AgentSLA Deployment

## Network

GenLayer Studionet

## Canonical contract

- Contract address: `0xf460701AFedCe66Cd3A83d830bdaC67046575d24`
- Deployment transaction: `0xf37671ca336cff1664f97846f09fb2806ffc2dc01a9e1993e755d435b215528d`

Older AgentSLA deployments used during debugging are not canonical and should not be used for the final demo.

## Canonical demo SLA

- SLA ID: `agentsla-cyber-001`
- Title: `Cybersecurity Incident Research SLA`
- Passing score: `80`
- Immutable terms hash: `f715873e5f85d8f8db99eb919d235382e763664b652b1cdbd96971a7adba2a77`

### Completed lifecycle transactions

1. Contract deployed: `0xf37671ca336cff1664f97846f09fb2806ffc2dc01a9e1993e755d435b215528d`
2. SLA created and funded: `0x21091fd7f3f517e504d677d6dd50e792e95eb9d60c52263a0e07deba7c70ca47`
3. Provider explicitly accepted the immutable terms: `0xd7f6c446c9e5a4af10c6210dc014fd00f4f1da7c7942e619f1f4e9469f7395a2`

### Remaining live-demo steps

4. `submit_work`
5. `review_sla` with Normal / Full Consensus
6. `get_result`
7. `finalize_sla`

These remaining transaction hashes will be added after the end-to-end demo is completed.

## Demo artifact URLs

- Deliverable: `https://raw.githubusercontent.com/amzar1st/agentsla-demo/main/report.json`
- Evidence: `https://raw.githubusercontent.com/amzar1st/agentsla-demo/main/EVIDENCE.md`

## Demo artifact SHA-256

- `report.json`: `60b47dae942830ed2c611cbc351c5e31c63b7a30f46119fe9ea6844af8357828`
- `EVIDENCE.md`: `889e056106f36bf07e3634ec16b85e2de28502a4e201d89755826306cc4113a9`

Do not edit the two demo artifacts between `submit_work` and `review_sla`, because the Intelligent Contract verifies their exact SHA-256 bytes during consensus review.
