"""Direct-mode regression tests for Agentsla v3.

Web, LLM, and transfer emission are mocked. These tests prove contract logic;
they do not claim live validator consensus or recipient balance verification.
"""

import datetime
import hashlib
import json

import pytest


DELIVERABLE = b"Completed research report with every required incident field."
PROVIDER_EVIDENCE = b"Provider evidence supporting every incident claim."
COUNTER_EVIDENCE = b"Requester counter-evidence identifying a material omission."
AUTHORITY_ONE = b"Authoritative standard one for the requested research."
AUTHORITY_TWO = b"Authoritative standard two for the requested research."

DELIVERABLE_URL = "https://example.com/deliverable"
PROVIDER_EVIDENCE_URL = "https://example.com/provider-evidence"
COUNTER_EVIDENCE_URL = "https://example.com/counter-evidence"
AUTHORITY_ONE_URL = "https://example.com/authority-one"
AUTHORITY_TWO_URL = "https://example.com/authority-two"


def digest(body):
    return hashlib.sha256(body).hexdigest()


@pytest.fixture
def env(
    direct_vm,
    direct_deploy,
    direct_alice,
    direct_bob,
    direct_charlie,
):
    class Clock(list):
        def __setitem__(self, index, value):
            super().__setitem__(index, value)
            direct_vm.warp(
                datetime.datetime.fromtimestamp(
                    value, datetime.timezone.utc
                ).isoformat()
            )

    clock = Clock([2_000_000_000])
    clock[0] = clock[0]
    contract = direct_deploy("agentsla.py", sdk_version="v0.2.12")
    transfers = []

    def capture_transfer(vm, request):
        if "EthSend" in request:
            payload = request["EthSend"]
            assert payload["calldata"] == b""
            transfers.append(
                (payload["address"].as_hex.lower(), int(payload["value"]))
            )
            return {"ok": None}
        return None

    direct_vm._gl_call_hook = capture_transfer
    return (
        contract,
        direct_vm,
        direct_alice,
        direct_bob,
        direct_charlie,
        clock,
        transfers,
    )


def create(env, sla_id="test"):
    contract, vm, alice, bob, _, _, _ = env
    vm.sender, vm.value = alice, 10**18
    contract.create_sla(
        sla_id,
        "0x" + bob.hex(),
        "Two-sided research SLA",
        "Produce a complete incident research report with evidence.",
        "Include every required incident field and source each claim.",
        "Cite authenticated evidence and compare the named authorities.",
        AUTHORITY_ONE_URL,
        digest(AUTHORITY_ONE),
        AUTHORITY_TWO_URL,
        digest(AUTHORITY_TWO),
        60,
        60,
        60,
    )
    vm.value = 0
    return contract


def accepted(env):
    contract = create(env)
    env[1].sender = env[3]
    contract.accept_sla("test", contract.get_terms_hash("test"))
    return contract


def submitted(env, challenged=False):
    contract = accepted(env)
    contract.submit_work(
        "test",
        DELIVERABLE_URL,
        digest(DELIVERABLE),
        PROVIDER_EVIDENCE_URL,
        digest(PROVIDER_EVIDENCE),
    )
    if challenged:
        env[1].sender = env[2]
        contract.submit_counter_evidence(
            "test", COUNTER_EVIDENCE_URL, digest(COUNTER_EVIDENCE)
        )
    env[5][0] += 61
    return contract


def mocks(
    env,
    *,
    deliverable=DELIVERABLE,
    provider_evidence=PROVIDER_EVIDENCE,
    counter_evidence=COUNTER_EVIDENCE,
    authority_one=AUTHORITY_ONE,
    authority_two=AUTHORITY_TWO,
    status_overrides=None,
    verdict="SATISFIED",
):
    vm = env[1]
    statuses = status_overrides or {}
    vm.clear_mocks()
    for name, url, body in [
        ("deliverable", DELIVERABLE_URL, deliverable),
        ("provider", PROVIDER_EVIDENCE_URL, provider_evidence),
        ("counter", COUNTER_EVIDENCE_URL, counter_evidence),
        ("authority_one", AUTHORITY_ONE_URL, authority_one),
        ("authority_two", AUTHORITY_TWO_URL, authority_two),
    ]:
        vm.mock_web(
            url.replace(".", r"\."),
            {"status": statuses.get(name, 200), "body": body},
        )
    vm.mock_llm(
        r".*",
        json.dumps(
            {
                "verdict": verdict,
                "summary": "Both sides and authorities were checked.",
            }
        ),
    )


def test_protocol_v3_binds_authorities_and_challenge_window(env):
    contract = create(env)
    sla = contract.get_sla("test")
    assert contract.get_protocol_version() == "3"
    assert sla.authority_url_one == AUTHORITY_ONE_URL
    assert sla.authority_hash_two == digest(AUTHORITY_TWO)
    assert int(sla.challenge_window_seconds) == 60
    assert len(contract.get_terms_hash("test")) == 64
    assert contract.get_result("test")["score_policy"] == (
        "NOT_COLLECTED_OR_USED_FOR_SETTLEMENT"
    )


def test_success_requires_closed_challenge_and_pays_provider_once(env):
    contract = accepted(env)
    contract.submit_work(
        "test",
        DELIVERABLE_URL,
        digest(DELIVERABLE),
        PROVIDER_EVIDENCE_URL,
        digest(PROVIDER_EVIDENCE),
    )
    mocks(env)
    with env[1].expect_revert("Challenge window is still open"):
        contract.review_sla("test")

    env[5][0] += 61
    contract.review_sla("test")
    assert env[1].run_validator() is True
    result = contract.get_result("test")
    assert result["status"] == "SATISFIED"
    assert result["settlement_basis"] == "VALIDATOR_AGREED_CATEGORICAL_VERDICT"
    assert "score" not in result

    contract.finalize_sla("test")
    assert contract.get_result("test")["status"] == "PAID"
    assert env[6] == [("0x" + env[3].hex(), 10**18)]
    with env[1].expect_revert("already settled"):
        contract.finalize_sla("test")
    assert len(env[6]) == 1


def test_requester_counter_evidence_is_hash_bound_and_seen_by_review(env):
    contract = submitted(env, challenged=True)
    sla = contract.get_sla("test")
    assert sla.status == "CHALLENGED"
    assert sla.counter_evidence_submitted is True
    assert sla.counter_evidence_hash == digest(COUNTER_EVIDENCE)
    mocks(env, verdict="UNSATISFIED")
    contract.review_sla("test")
    assert env[1].run_validator() is True
    assert contract.get_result("test")["status"] == "UNSATISFIED"
    contract.finalize_sla("test")
    assert contract.get_result("test")["status"] == "REFUNDED"
    assert env[6] == [("0x" + env[2].hex(), 10**18)]


def test_counter_evidence_is_requester_only_once_and_before_deadline(env):
    contract = accepted(env)
    contract.submit_work(
        "test",
        DELIVERABLE_URL,
        digest(DELIVERABLE),
        PROVIDER_EVIDENCE_URL,
        digest(PROVIDER_EVIDENCE),
    )
    env[1].sender = env[4]
    with env[1].expect_revert("Only the requester"):
        contract.submit_counter_evidence(
            "test", COUNTER_EVIDENCE_URL, digest(COUNTER_EVIDENCE)
        )
    env[1].sender = env[2]
    contract.submit_counter_evidence(
        "test", COUNTER_EVIDENCE_URL, digest(COUNTER_EVIDENCE)
    )
    with env[1].expect_revert("already committed"):
        contract.submit_counter_evidence(
            "test", COUNTER_EVIDENCE_URL, digest(COUNTER_EVIDENCE)
        )


@pytest.mark.parametrize(
    "body_name",
    ["deliverable", "provider_evidence", "authority_one", "authority_two"],
)
def test_any_required_artifact_mismatch_holds_escrow_for_retry(env, body_name):
    contract = submitted(env)
    kwargs = {body_name: b"changed bytes"}
    mocks(env, **kwargs)
    contract.review_sla("test")
    assert env[1].run_validator() is True
    result = contract.get_result("test")
    assert result["status"] == "EVIDENCE_REVIEW"
    assert env[6] == []
    with env[1].expect_revert("not in a finalizable state"):
        contract.finalize_sla("test")


def test_unavailable_counter_evidence_holds_escrow(env):
    contract = submitted(env, challenged=True)
    mocks(env, status_overrides={"counter": 503})
    contract.review_sla("test")
    assert contract.get_result("test")["status"] == "EVIDENCE_REVIEW"
    assert env[6] == []


def test_temporary_outage_recovers_without_rolling_retry_deadline(env):
    contract = submitted(env)
    mocks(env, status_overrides={"authority_one": 503})
    contract.review_sla("test")
    deadline = contract.get_result("test")["evidence_retry_deadline"]
    assert deadline == contract.get_result("test")["review_deadline"] + 86400

    env[1].sender = env[2]
    mocks(env)
    contract.retry_review("test")
    assert contract.get_result("test")["status"] == "SATISFIED"
    assert contract.get_result("test")["evidence_retry_deadline"] == deadline


def test_fetch_exception_holds_without_llm(env, monkeypatch):
    contract = submitted(env)
    import genlayer

    monkeypatch.setattr(
        genlayer.gl.nondet.web,
        "get",
        lambda *_: (_ for _ in ()).throw(RuntimeError("offline")),
    )
    contract.review_sla("test")
    assert contract.get_result("test")["status"] == "EVIDENCE_REVIEW"
    assert env[6] == []


def test_validator_rejects_changed_artifact_or_categorical_verdict(env):
    contract = submitted(env)
    mocks(env, verdict="SATISFIED")
    contract.review_sla("test")
    mocks(env, deliverable=b"changed bytes", verdict="SATISFIED")
    assert env[1].run_validator() is False
    mocks(env, verdict="UNSATISFIED")
    assert env[1].run_validator() is False


def test_only_provider_accepts_exact_terms_and_submits(env):
    contract = create(env)
    env[1].sender = env[4]
    with env[1].expect_revert("Only the specified provider"):
        contract.accept_sla("test", contract.get_terms_hash("test"))
    env[1].sender = env[3]
    with env[1].expect_revert("Terms hash mismatch"):
        contract.accept_sla("test", "0" * 64)
    contract.accept_sla("test", contract.get_terms_hash("test"))
    env[1].sender = env[4]
    with env[1].expect_revert("Only the accepted provider"):
        contract.submit_work(
            "test",
            DELIVERABLE_URL,
            digest(DELIVERABLE),
            PROVIDER_EVIDENCE_URL,
            digest(PROVIDER_EVIDENCE),
        )


def test_retry_is_party_only_and_refund_is_requester_only(env):
    contract = submitted(env)
    mocks(env, status_overrides={"provider": 503})
    contract.review_sla("test")

    env[1].sender = env[4]
    with env[1].expect_revert("Only an SLA party"):
        contract.retry_review("test")

    env[1].sender = env[3]
    mocks(env)
    contract.retry_review("test")
    assert contract.get_result("test")["status"] == "SATISFIED"

    other = create(env, "timeout")
    env[5][0] += 61
    env[1].sender = env[4]
    with env[1].expect_revert("Only the requester"):
        other.claim_timeout_refund("timeout")


@pytest.mark.parametrize("stage", ["OPEN", "ACCEPTED", "CHALLENGE_WINDOW"])
def test_deadlines_block_late_actions_and_enable_requester_refund(env, stage):
    if stage == "OPEN":
        contract = create(env)
        deadline = int(contract.get_sla("test").acceptance_deadline)
    elif stage == "ACCEPTED":
        contract = accepted(env)
        deadline = int(contract.get_sla("test").submission_deadline)
    else:
        contract = accepted(env)
        contract.submit_work(
            "test",
            DELIVERABLE_URL,
            digest(DELIVERABLE),
            PROVIDER_EVIDENCE_URL,
            digest(PROVIDER_EVIDENCE),
        )
        deadline = int(contract.get_sla("test").review_deadline)

    env[1].sender = env[2]
    with env[1].expect_revert("No refundable"):
        contract.claim_timeout_refund("test")
    env[5][0] = deadline + 1
    contract.claim_timeout_refund("test")
    assert contract.get_result("test")["status"] == "EXPIRED"
    assert env[6] == [("0x" + env[2].hex(), 10**18)]


def test_evidence_retry_timeout_refund_is_protected_until_fixed_deadline(env):
    contract = submitted(env)
    mocks(env, status_overrides={"deliverable": 503})
    contract.review_sla("test")
    deadline = contract.get_result("test")["evidence_retry_deadline"]
    env[1].sender = env[2]
    env[5][0] = deadline
    with env[1].expect_revert("No refundable"):
        contract.claim_timeout_refund("test")
    env[5][0] += 1
    with env[1].expect_revert("deadline has passed"):
        contract.retry_review("test")
    contract.claim_timeout_refund("test")
    assert contract.get_result("test")["status"] == "EXPIRED"


def test_cancel_requires_requester_and_open_state(env):
    contract = create(env)
    env[1].sender = env[3]
    with env[1].expect_revert("Only the requester"):
        contract.cancel_open_sla("test")
    env[1].sender = env[2]
    contract.cancel_open_sla("test")
    assert contract.get_result("test")["status"] == "CANCELLED"
    assert len(env[6]) == 1


@pytest.mark.parametrize(
    "field,value,message",
    [
        ("url_one", "http://example.com/one", "public HTTPS"),
        ("hash_one", "bad", "64-character"),
        ("challenge", 59, "at least 60"),
    ],
)
def test_creation_validates_authorities_and_challenge_window(
    env, field, value, message
):
    contract, vm, alice, bob, _, _, _ = env
    vm.sender, vm.value = alice, 10**18
    values = {
        "url_one": AUTHORITY_ONE_URL,
        "hash_one": digest(AUTHORITY_ONE),
        "challenge": 60,
    }
    values[field] = value
    with vm.expect_revert(message):
        contract.create_sla(
            "bad",
            "0x" + bob.hex(),
            "Research SLA",
            "Produce a complete incident research report.",
            "Include all required incident fields.",
            "Cite authenticated supporting evidence.",
            values["url_one"],
            values["hash_one"],
            AUTHORITY_TWO_URL,
            digest(AUTHORITY_TWO),
            60,
            60,
            values["challenge"],
        )


def test_zero_reward_and_duplicate_authorities_are_rejected(env):
    contract, vm, alice, bob, _, _, _ = env
    vm.sender, vm.value = alice, 0
    args = [
        "bad",
        "0x" + bob.hex(),
        "Research SLA",
        "Produce a complete incident research report.",
        "Include all required incident fields.",
        "Cite authenticated supporting evidence.",
        AUTHORITY_ONE_URL,
        digest(AUTHORITY_ONE),
        AUTHORITY_TWO_URL,
        digest(AUTHORITY_TWO),
        60,
        60,
        60,
    ]
    with vm.expect_revert("non-zero GEN"):
        contract.create_sla(*args)
    vm.value = 10**18
    args[8] = AUTHORITY_ONE_URL
    with vm.expect_revert("must be distinct"):
        contract.create_sla(*args)
