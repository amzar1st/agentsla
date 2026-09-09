import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const rawSource = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
const source = rawSource
  .replace(/^import[\s\S]*?;\n/gm, '')
  .replaceAll('import.meta.env', 'window.testEnv');

const flush = async () => {
  for (let i = 0; i < 10; i += 1) await new Promise((resolve) => setImmediate(resolve));
};

async function setup({ configured = false, readFail = false, txFail = false, protocolVersion = '3' } = {}) {
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://example.com' });
  const { window: w } = dom;
  const writes = [];
  const receipts = [];
  w.testEnv = configured ? { VITE_AGENTSLA_V3_ADDRESS: `0x${'1'.repeat(40)}` } : {};
  w.studionet = {};
  w.TransactionHashVariant = { LATEST_FINAL: 'latest-final' };
  w.TransactionStatus = { FINALIZED: 'FINALIZED' };
  w.ExecutionResult = {
    FINISHED_WITH_RETURN: 'FINISHED_WITH_RETURN',
    FINISHED_WITH_ERROR: 'FINISHED_WITH_ERROR',
  };
  w.ethereum = {
    request: async ({ method }) => (method === 'eth_requestAccounts' ? [`0x${'2'.repeat(40)}`] : null),
    on: () => {},
  };
  w.createClient = () => ({
    connect: async () => {},
    readContract: async ({ functionName }) => {
      if (functionName === 'get_protocol_version') return protocolVersion;
      if (readFail) throw new Error('RPC unavailable');
      return {
        status: 'OPEN',
        verdict: '',
        settled: false,
        score_policy: 'NOT_COLLECTED_OR_USED_FOR_SETTLEMENT',
      };
    },
    writeContract: async (call) => {
      writes.push(call);
      return `0x${'a'.repeat(64)}`;
    },
    waitForTransactionReceipt: async (args) => {
      receipts.push(args);
      return {
        status_name: 'FINALIZED',
        result_name: 'MAJORITY_AGREE',
        consensus_data: {
          leader_receipt: [
            {
              execution_result: txFail ? 'ERROR' : 'SUCCESS',
              result: { status: txFail ? 'error' : 'return' },
            },
          ],
        },
      };
    },
  });
  w.eval(source);
  await flush();
  return { w, writes, receipts, close: () => dom.window.close() };
}

test('verified default v3 deployment enables writes', async () => {
  const env = await setup();
  try {
    assert.equal(env.w.document.querySelector('#retryForm button').disabled, false);
    assert.equal(env.w.document.querySelector('#readForm button').disabled, false);
    assert.match(env.w.document.querySelector('#deploymentStatus').textContent, /two-sided evidence/i);
  } finally {
    env.close();
  }
});

test('wrong protocol version disables every write action', async () => {
  const env = await setup({ protocolVersion: '2' });
  try {
    assert.equal(env.w.document.querySelector('#retryForm button').disabled, true);
    assert.equal(env.w.document.querySelector('#readForm button').disabled, false);
    assert.match(env.w.document.querySelector('#deploymentStatus').textContent, /verification failed/i);
  } finally {
    env.close();
  }
});

test('failed live reads do not display a verified outcome', async () => {
  const env = await setup({ readFail: true });
  try {
    assert.equal(env.w.document.querySelector('.verdict').textContent, 'UNVERIFIED');
    assert.equal(env.w.document.querySelector('.score-pill').textContent, '—');
    assert.match(env.w.document.querySelector('#liveResultMessage').textContent, /could not be verified/);
  } finally {
    env.close();
  }
});

test('stable GenLayerJS write path does not call the removed fee helper', async () => {
  assert.doesNotMatch(rawSource, /estimateTransactionFeesForWrite/);
  assert.match(rawSource, /writeContract/);
  assert.match(rawSource, /waitForTransactionReceipt/);
  assert.match(rawSource, /TransactionStatus\.FINALIZED/);
  assert.match(rawSource, /status_name/);
  assert.match(rawSource, /MAJORITY_AGREE/);
});

test('configured v3 retry uses the wallet and zero value', async () => {
  const env = await setup({ configured: true });
  try {
    env.w.document.querySelector('#retryId').value = 'retry-demo';
    env.w.document.querySelector('#retryForm').dispatchEvent(
      new env.w.Event('submit', { bubbles: true, cancelable: true }),
    );
    await flush();
    assert.equal(env.writes.length, 1);
    assert.equal(env.writes[0].functionName, 'retry_review');
    assert.equal(env.writes[0].args[0], 'retry-demo');
    assert.equal(env.writes[0].address, `0x${'1'.repeat(40)}`);
    assert.equal(env.writes[0].value, 0n);
    assert.equal(env.w.document.querySelector('#txStatus').dataset.kind, 'success');
  } finally {
    env.close();
  }
});

test('wallet-originated Create SLA sends all v3 terms and waits for FINALIZED', async () => {
  const env = await setup({ configured: true });
  try {
    const values = {
      createId: 'wallet-create-001',
      createProvider: `0x${'3'.repeat(40)}`,
      createTitle: 'Two-sided research SLA',
      createTask: 'Produce a complete research report with evidence.',
      createRequirements: 'Include every material requirement.',
      createEvidenceRequirements: 'Cite authenticated evidence.',
      createAuthorityOneUrl: 'https://example.com/authority-one',
      createAuthorityOneHash: 'a'.repeat(64),
      createAuthorityTwoUrl: 'https://example.com/authority-two',
      createAuthorityTwoHash: 'b'.repeat(64),
      createAcceptance: '3600',
      createSubmission: '86400',
      createChallenge: '3600',
      createReward: '1',
    };
    for (const [id, value] of Object.entries(values)) {
      env.w.document.querySelector(`#${id}`).value = value;
    }

    env.w.document.querySelector('#createForm').dispatchEvent(
      new env.w.Event('submit', { bubbles: true, cancelable: true }),
    );
    await flush();

    assert.equal(env.writes.length, 1);
    const call = env.writes[0];
    assert.equal(call.functionName, 'create_sla');
    assert.equal(call.args.length, 13);
    assert.deepEqual(Array.from(call.args.slice(6, 10)), [
      values.createAuthorityOneUrl,
      values.createAuthorityOneHash,
      values.createAuthorityTwoUrl,
      values.createAuthorityTwoHash,
    ]);
    assert.deepEqual(Array.from(call.args.slice(10)), [3600, 86400, 3600]);
    assert.equal(call.value, 10n ** 18n);
    assert.equal(Object.hasOwn(call, 'fees'), false);
    assert.equal(env.receipts.length, 1);
    assert.equal(env.receipts[0].status, 'FINALIZED');
  } finally {
    env.close();
  }
});

test('counter-evidence form invokes requester method', async () => {
  const env = await setup({ configured: true });
  try {
    env.w.document.querySelector('#counterId').value = 'challenged';
    env.w.document.querySelector('#counterEvidenceUrl').value = 'https://example.com/counter';
    env.w.document.querySelector('#counterEvidenceHash').value = 'c'.repeat(64);
    env.w.document.querySelector('#counterForm').dispatchEvent(
      new env.w.Event('submit', { bubbles: true, cancelable: true }),
    );
    await flush();
    assert.equal(env.writes.length, 1);
    assert.equal(env.writes[0].functionName, 'submit_counter_evidence');
    assert.deepEqual(Array.from(env.writes[0].args), [
      'challenged',
      'https://example.com/counter',
      'c'.repeat(64),
    ]);
  } finally {
    env.close();
  }
});

test('execution failure never reports success', async () => {
  const env = await setup({ configured: true, txFail: true });
  try {
    env.w.document.querySelector('#finalizeId').value = 'demo';
    env.w.document.querySelector('#finalizeForm').dispatchEvent(
      new env.w.Event('submit', { bubbles: true, cancelable: true }),
    );
    await flush();
    assert.equal(env.w.document.querySelector('#txStatus').dataset.kind, 'error');
    assert.match(env.w.document.querySelector('#txStatus').textContent, /Inspect the existing transaction/);
  } finally {
    env.close();
  }
});

test('zero reward is rejected before any wallet write', async () => {
  const env = await setup();
  try {
    env.w.document.querySelector('#createReward').value = '0';
    env.w.document.querySelector('#createForm').dispatchEvent(
      new env.w.Event('submit', { bubbles: true, cancelable: true }),
    );
    await flush();
    assert.equal(env.writes.length, 0);
    assert.equal(env.w.document.querySelector('#txStatus').dataset.kind, 'error');
    assert.match(env.w.document.querySelector('#txStatus').textContent, /greater than zero/i);
  } finally {
    env.close();
  }
});
