# Agentsla v2 verification — September 7, 2026

## Outcome

The corrected v2 contract was deployed and exercised end to end in GenLayer
Studio using Normal (Full Consensus). The successful demo returned
`SATISFIED`, score `92/100`, then paid the provider. Separate live cases proved
that an evidence mismatch holds escrow and that cancellation refunds an open
SLA.

## Canonical deployment

| Item | Verified value |
| --- | --- |
| Network | GenLayer Studionet, chain ID `61999` |
| Contract | `0x635c282A6A6F57521783b4C7C420bB9bC5BB34F4` |
| Deployment tx | `0xd70adeed1dded35bb62a71e9d58d3563dd40931ea5318ba2f623f410ea0c54d9` |
| Deployment status | `FINALIZED` |
| Protocol read | `"2"` |
| Repository source SHA-256 | `5ff8f456632cfda7b55e4d1f0e450a677993a905824e8c2b39ba67050a13de5b` |
| Source size | 25,693 bytes; 742 newline-terminated lines |

The local source was entered into Studio as `agentsla_v2_1.py`. Studio displayed
743 editor rows including the final blank row, parsed the constructor with no
parameters, and exposed all expected methods before deployment. The browser
did not provide a reliable post-deployment source export, so the repository
digest records the exact local input rather than claiming an explorer-side
byte-for-byte download comparison.

## Full Consensus success and payout

SLA `agentsla-v2-verified-002` used a 1 GEN virtual reward, passing score `80`,
and terms hash
`8791e92f53a8caaba8e170f7936e6ca1f657f1ea6501ab65ed859778e79b2120`.

| Action | Transaction | Result |
| --- | --- | --- |
| Create/fund | `0x150bf70c56b1946ae06595d9462098d1baca7b6c05afa7ea5be267ae3956f4ba` | `FINALIZED` |
| Provider accept | `0x20174ba95dd1a1391c04ab923c26a3613169df8ef596376087cc4e8096c6e27a` | `FINALIZED` |
| Submit | `0x98fed8fdd3d8197315a06d75e1626a9fa068135d9e7927c9a741ce97c911d8ef` | `FINALIZED` |
| Review | `0x73d99219ef0e142e5d7659e71b88bc9c9a2ec0e9572aabae6d93448d1ae1bed6` | `FINALIZED` |
| Finalize | `0x0266239d1de25a501b3337e87bab7096756746f47717e3e226f504cf2de33c6d` | `FINALIZED` |

Observed result before settlement: `SATISFIED`, score `92`, `settled: false`,
one review attempt. After settlement: `PAID`, `settled: true`. Studio displayed
provider balance `1 GEN`, up from `0 GEN`, and requester balance `8 GEN`.

Artifacts were immutable commit URLs:

- `report.json`: `033ee9d4c7ba59f2afb41d239edad0067a5be963dbfcb457f4889b6eaed33abb`
- `EVIDENCE.md`: `b9fbe4eed335704a9e42ea12351add509d9f6b76fea9bafb9ebbb72316426517`

## Evidence failure protection

SLA `agentsla-v2-outage-001` submitted the correct report commitment and a
deliberately mismatched evidence digest. Its review transaction
`0xa330ca8a6f90832b45a32adfd7f684d7e77c9c9810948c5d8964133cb37b09e2`
finalized. `get_result` returned:

```json
{
  "status": "EVIDENCE_REVIEW",
  "verdict": "EVIDENCE_REVIEW",
  "score": 0,
  "settled": false,
  "review_attempts": 1,
  "review_deadline": 1788862837,
  "evidence_retry_deadline": 1788949237,
  "summary": "The evidence bytes do not match the submitted SHA-256 digest."
}
```

The retry deadline difference is exactly 86,400 seconds. No payment or refund
was emitted by the protected review.

## Refund proof

SLA `agentsla-v2-refund-001` was created in
`0x29d15b85547d8ec47ae569d07755992060077e8db381de05dd9162386e36d1b7`
and cancelled before acceptance in
`0x43cd452edcfbd2604ffbde26e1e2dd7d46913826b30ff397ace56b1cab5c0710`.
Both finalized. Result: `CANCELLED`, `settled: true`; requester balance returned
to `7 GEN` after the temporary escrow.

## Authorization proof

On the first deployed v2 build, the requester attempted the provider-only
`accept_sla` action in transaction
`0x632ec7645a3a6f6bf03a72c83a34260cfd0512d85d9dab260076467fdaf7e06b`.
A subsequent `get_result` remained `OPEN` with no acceptance timestamp or
review attempt. The assigned provider then accepted successfully.

## Consensus correction discovered during live testing

The first v2 review transaction
`0xb336cc57f6883ef1f06ba5b60ab46d0c76fda5a4d42d9f5c65a3e307fb1ec530`
ended `UNDETERMINED`. The validator compared both categorical verdict and a
numeric score tolerance. Independent LLM scores can vary even when the
settlement decision agrees. The deployed correction compares authenticated
artifact results and the settlement-critical categorical verdict; numeric
score differences are explanatory and do not block consensus. The repeated
Full Consensus review then finalized successfully at `92/100`.

## Automated verification

The updated suite contains 17 direct contract tests and 6 frontend integration
tests. It covers evidence unavailability/mismatch/recovery, fixed deadlines,
authorization, payout/refund recipients, duplicate settlement, categorical
validator disagreement, accepted score variance, protocol gating, wallet
writes, failed execution, and zero reward validation.

Corrected source commit `797545924915b507f999907f597e7d65c0c37d93`
passed the complete GitHub Actions gate in run
[`34113048475`](https://github.com/amzar1st/agentsla-demo/actions/runs/34113048475),
job `101713442312`: three GenVM lint checks passed, 17 direct contract tests
passed, all 6 frontend tests passed with zero failures, and the Vite 8.2.2
production build completed. Vite reported only its non-blocking bundle-size
advisory.

## Verification boundary

Live tests used Studio-generated ephemeral accounts and virtual Studionet GEN:

- Requester: `0xF889240e6Fa88D88d81ef1b36f55962Ca61f84e7`
- Provider: `0x022C28fF8296096a22457bFe82c9f91B53934F0f`

No MetaMask, owner wallet, private key, real-value token, or Bradbury/Mainnet
transaction was used. The observed Studio transactions and balance changes are
live sandbox proof within that boundary.
