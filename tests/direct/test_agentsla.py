"""Direct-mode regression tests; web/LLM responses and transfer emission are mocked.
These tests do not claim live consensus or recipient balance verification.
"""
import hashlib
import json
import datetime

import pytest

BODY = b'Completed research with all required incident fields.'
EVIDENCE = b'Independent supporting evidence for each incident.'
URL = 'https://example.com/work'
EURL = 'https://example.com/evidence'
H = hashlib.sha256(BODY).hexdigest()
EH = hashlib.sha256(EVIDENCE).hexdigest()


@pytest.fixture
def env(direct_vm, direct_deploy, direct_alice, direct_bob, direct_charlie, monkeypatch):
    class Clock(list):
        def __setitem__(self, index, value):
            super().__setitem__(index, value)
            direct_vm.warp(datetime.datetime.fromtimestamp(value, datetime.timezone.utc).isoformat())
    clock = Clock([2_000_000_000])
    clock[0] = clock[0]
    contract = direct_deploy('agentsla.py', sdk_version='v0.2.12')
    transfers = []
    def capture_transfer(vm, request):
        if 'EthSend' in request:
            payload = request['EthSend']
            assert payload['calldata'] == b''
            transfers.append((payload['address'].as_hex.lower(), int(payload['value'])))
            return {'ok': None}
        return None
    direct_vm._gl_call_hook = capture_transfer
    return contract, direct_vm, direct_alice, direct_bob, direct_charlie, clock, transfers


def create(env):
    c, vm, alice, bob, _, _, _ = env
    vm.sender, vm.value = alice, 10**18
    c.create_sla('test', '0x' + bob.hex(), 'Research SLA',
                 'Produce an incident research report with evidence.',
                 'Include every required incident field.', 'Cite public supporting evidence.',
                 60, 60, 80)
    vm.value = 0
    return c


def accepted(env):
    c = create(env)
    env[1].sender = env[3]
    c.accept_sla('test', c.get_terms_hash('test'))
    return c


def submitted(env):
    c = accepted(env)
    c.submit_work('test', URL, H, EURL, EH)
    return c


def mocks(env, body=BODY, evidence=EVIDENCE, status=200, verdict='SATISFIED', score=95):
    vm = env[1]
    vm.clear_mocks()
    vm.mock_web(r'https://example\.com/work', {'status': status, 'body': body})
    vm.mock_web(r'https://example\.com/evidence', {'status': 200, 'body': evidence})
    vm.mock_llm(r'.*', json.dumps({'verdict': verdict, 'score': score, 'summary': 'Evidence checked.'}))


def test_success_pays_provider_once(env):
    c = submitted(env)
    mocks(env)
    c.review_sla('test')
    assert env[1].run_validator() is True
    assert c.get_result('test')['score'] == 95
    c.finalize_sla('test')
    assert c.get_result('test')['status'] == 'PAID'
    assert env[6] == [('0x' + env[3].hex(), 10**18)]
    with env[1].expect_revert('already settled'):
        c.finalize_sla('test')
    assert len(env[6]) == 1


@pytest.mark.parametrize('kwargs', [
    {'body': b'changed content'}, {'evidence': b'changed evidence'},
    {'status': 503}, {'body': b'x' * 120001},
])
def test_authentication_failure_holds_and_can_recover(env, kwargs):
    c = submitted(env)
    mocks(env, **kwargs)
    c.review_sla('test')
    assert c.get_result('test')['status'] == 'EVIDENCE_REVIEW'
    assert env[1].run_validator() is True
    assert env[6] == []
    with env[1].expect_revert('not in a finalizable state'):
        c.finalize_sla('test')
    with env[1].expect_revert('No refundable'):
        c.claim_timeout_refund('test')
    mocks(env)
    c.retry_review('test')
    assert c.get_result('test')['review_attempts'] == 2
    c.finalize_sla('test')
    assert c.get_result('test')['status'] == 'PAID'


def test_fetch_exception_holds_without_llm(env, monkeypatch):
    c = submitted(env)
    import genlayer
    monkeypatch.setattr(genlayer.gl.nondet.web, 'get', lambda *_: (_ for _ in ()).throw(RuntimeError('offline')))
    c.review_sla('test')
    assert c.get_result('test')['status'] == 'EVIDENCE_REVIEW'
    assert env[6] == []


def test_retry_deadline_is_fixed_and_boundary_is_protected(env):
    c = submitted(env)
    mocks(env, status=503)
    c.review_sla('test')
    deadline = c.get_result('test')['evidence_retry_deadline']
    assert deadline == c.get_result('test')['review_deadline'] + 86400
    env[5][0] = deadline
    c.retry_review('test')
    assert c.get_result('test')['evidence_retry_deadline'] == deadline
    with env[1].expect_revert('No refundable'):
        c.claim_timeout_refund('test')
    env[5][0] += 1
    with env[1].expect_revert('deadline has passed'):
        c.retry_review('test')
    c.claim_timeout_refund('test')
    assert c.get_result('test')['status'] == 'EXPIRED'
    assert env[6] == [('0x' + env[2].hex(), 10**18)]
    with env[1].expect_revert('already settled'):
        c.claim_timeout_refund('test')


@pytest.mark.parametrize('score,verdict', [(20, 'UNSATISFIED'), (79, 'SATISFIED')])
def test_authenticated_failure_refunds_requester(env, score, verdict):
    c = submitted(env)
    mocks(env, score=score, verdict=verdict)
    c.review_sla('test')
    assert c.get_result('test')['status'] == 'UNSATISFIED'
    c.finalize_sla('test')
    assert c.get_result('test')['status'] == 'REFUNDED'
    assert env[6] == [('0x' + env[2].hex(), 10**18)]


def test_only_provider_accepts_exact_terms_and_submits(env):
    c = create(env)
    env[1].sender = env[4]
    with env[1].expect_revert('Only the specified provider'):
        c.accept_sla('test', c.get_terms_hash('test'))
    env[1].sender = env[3]
    with env[1].expect_revert('Terms hash mismatch'):
        c.accept_sla('test', '0' * 64)
    c.accept_sla('test', c.get_terms_hash('test'))
    env[1].sender = env[4]
    with env[1].expect_revert('Only the accepted provider'):
        c.submit_work('test', URL, H, EURL, EH)
    assert c.get_result('test')['status'] == 'ACCEPTED'


def test_only_parties_retry(env):
    c = submitted(env)
    mocks(env, status=503)
    c.review_sla('test')
    env[1].sender = env[4]
    with env[1].expect_revert('Only an SLA party'):
        c.retry_review('test')
    env[1].sender = env[2]
    mocks(env)
    c.retry_review('test')
    assert c.get_result('test')['status'] == 'SATISFIED'


@pytest.mark.parametrize('stage,delta', [('OPEN', 61), ('ACCEPTED', 61), ('SUBMITTED', 86401)])
def test_original_deadlines_and_refunds(env, stage, delta):
    c = {'OPEN': create, 'ACCEPTED': accepted, 'SUBMITTED': submitted}[stage](env)
    with env[1].expect_revert('No refundable'):
        c.claim_timeout_refund('test')
    env[5][0] += delta
    if stage == 'OPEN':
        env[1].sender = env[3]
        with env[1].expect_revert('Acceptance deadline'):
            c.accept_sla('test', c.get_terms_hash('test'))
    elif stage == 'ACCEPTED':
        with env[1].expect_revert('Submission deadline'):
            c.submit_work('test', URL, H, EURL, EH)
    else:
        with env[1].expect_revert('Review deadline'):
            c.review_sla('test')
    c.claim_timeout_refund('test')
    assert env[6] == [('0x' + env[2].hex(), 10**18)]


def test_cancel_requires_requester_and_open_state(env):
    c = create(env)
    env[1].sender = env[3]
    with env[1].expect_revert('Only the requester'):
        c.cancel_open_sla('test')
    env[1].sender = env[2]
    c.cancel_open_sla('test')
    assert c.get_result('test')['status'] == 'CANCELLED'
    assert len(env[6]) == 1


def test_validator_rejects_different_evidence_or_verdict(env):
    c = submitted(env)
    mocks(env)
    c.review_sla('test')
    mocks(env, body=b'changed')
    assert env[1].run_validator() is False
    mocks(env, verdict='UNSATISFIED', score=30)
    assert env[1].run_validator() is False
