import './styles.css';
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionHashVariant } from 'genlayer-js/types';

const DEFAULT_CONTRACT_ADDRESS = '0x635c282A6A6F57521783b4C7C420bB9bC5BB34F4';
const configuredAddress = import.meta.env.VITE_AGENTSLA_V2_ADDRESS?.trim() || DEFAULT_CONTRACT_ADDRESS;
if (configuredAddress && !/^0x[a-fA-F0-9]{40}$/.test(configuredAddress)) {
  throw new Error('VITE_AGENTSLA_V2_ADDRESS must be a valid contract address.');
}
const CONTRACT_ADDRESS = configuredAddress;
let v2Ready = false;
const CANONICAL_SLA_ID = 'agentsla-v2-verified-002';
const EXPLORER_BASE = 'https://explorer-studio.genlayer.com';
const STUDIONET_CHAIN_ID_DECIMAL = 61999;
const STUDIONET_CHAIN_ID_HEX = '0xf22f';
const STUDIONET_RPC = 'https://studio.genlayer.com/api';

const publicClient = createClient({ chain: studionet });
let walletClient = null;
let connectedAccount = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const connectWalletBtn = $('#connectWalletBtn');
const refreshResultBtn = $('#refreshResultBtn');
const liveResultMessage = $('#liveResultMessage');
const txStatus = $('#txStatus');
const readOutput = $('#readOutput');

function shortAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function jsonStringify(value) {
  return JSON.stringify(
    value,
    (_key, item) => (typeof item === 'bigint' ? item.toString() : item),
    2,
  );
}

function parseGen(value) {
  const normalized = String(value).trim();
  if (!/^\d+(\.\d{0,18})?$/.test(normalized)) {
    throw new Error('Reward must be a positive GEN amount with at most 18 decimals.');
  }

  const [whole, fraction = ''] = normalized.split('.');
  const paddedFraction = `${fraction}${'0'.repeat(18)}`.slice(0, 18);
  const amount = BigInt(whole) * 10n ** 18n + BigInt(paddedFraction || '0');
  if (amount <= 0n) throw new Error('Reward must be greater than zero GEN.');
  return amount;
}

function setTxStatus(kind, title, detail, txHash = '') {
  txStatus.dataset.kind = kind;
  txStatus.replaceChildren();
  const indicator = document.createElement('span');
  indicator.className = 'tx-indicator';
  const body = document.createElement('div');
  const heading = document.createElement('strong');
  heading.textContent = title;
  const description = document.createElement('small');
  description.textContent = detail;
  body.append(heading, description);
  if (/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    const link = document.createElement('a');
    link.href = `${EXPLORER_BASE}/tx/${txHash}`;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = 'Open transaction ↗';
    body.append(link);
  }
  txStatus.append(indicator, body);
}

async function ensureStudionet() {
  if (!window.ethereum) {
    throw new Error('No injected EIP-1193 wallet found. Install or open MetaMask first.');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: STUDIONET_CHAIN_ID_HEX }],
    });
  } catch (error) {
    const code = Number(error?.code);
    if (code !== 4902) throw error;

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: STUDIONET_CHAIN_ID_HEX,
          chainName: 'GenLayer Studionet',
          nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
          rpcUrls: [STUDIONET_RPC],
          blockExplorerUrls: [EXPLORER_BASE],
        },
      ],
    });
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    setTxStatus('error', 'Wallet not found', 'Install MetaMask or another injected EIP-1193 wallet.');
    return;
  }

  try {
    connectWalletBtn.disabled = true;
    connectWalletBtn.textContent = 'Connecting…';

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts?.length) throw new Error('The wallet returned no account.');

    await ensureStudionet();

    connectedAccount = accounts[0];
    walletClient = createClient({
      chain: studionet,
      account: connectedAccount,
      provider: window.ethereum,
    });

    await walletClient.connect('studionet');

    connectWalletBtn.textContent = shortAddress(connectedAccount);
    connectWalletBtn.classList.add('connected');
    setTxStatus(
      'success',
      'Wallet connected',
      `${shortAddress(connectedAccount)} · Studionet ${STUDIONET_CHAIN_ID_DECIMAL}`,
    );
  } catch (error) {
    connectWalletBtn.textContent = 'Connect wallet';
    setTxStatus('error', 'Connection failed', error?.message || String(error));
  } finally {
    connectWalletBtn.disabled = false;
  }
}

async function readSlaResult(slaId, address = CONTRACT_ADDRESS) {
  const id = String(slaId || '').trim();
  if (!id) throw new Error('Enter an SLA ID.');

  return publicClient.readContract({
    address,
    functionName: 'get_result',
    args: [id],
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
  });
}

async function refreshCanonicalResult() {
  try {
    refreshResultBtn.disabled = true;
    refreshResultBtn.textContent = 'Refreshing…';
    liveResultMessage.textContent = 'Reading latest finalized contract state…';

    const result = await readSlaResult(CANONICAL_SLA_ID);
    const status = result?.status ?? 'UNKNOWN';
    const verdict = result?.verdict ?? 'UNKNOWN';
    const score = Number(result?.score ?? 0);
    const settled = Boolean(result?.settled);

    $('.verdict').textContent = verdict;
    $('.score-pill').textContent = `${score} / 100`;
    const resultRows = $$('.result-list dd');
    if (resultRows[2]) {
      resultRows[2].textContent = settled && status === 'PAID' ? 'Provider paid · verified' : status;
    }

    liveResultMessage.textContent = `Live finalized state: ${status} · ${verdict} · ${score}/100`;
  } catch (error) {
    $('.verdict').textContent = 'UNVERIFIED';
    $('.score-pill').textContent = '—';
    $$('.result-list dd')[2].textContent = 'Live read unavailable';
    liveResultMessage.textContent = `Live v2 demo could not be verified: ${error?.message || String(error)}`;
  } finally {
    refreshResultBtn.disabled = false;
    refreshResultBtn.textContent = 'Refresh on-chain result';
  }
}

async function requireWallet() {
  if (!walletClient || !connectedAccount) {
    await connectWallet();
  }
  if (!walletClient || !connectedAccount) {
    throw new Error('Connect a wallet before submitting a write.');
  }
}

async function submitWrite(call, label) {
  if (!v2Ready) {
    setTxStatus('error', 'Upgrade pending', 'Write actions open after the v2 contract is deployed and verified.');
    throw new Error('Deploy and configure the v2 contract first.');
  }
  await requireWallet();
  await ensureStudionet();

  let txId;
  try {
    setTxStatus('working', 'Estimating transaction', `${label}: calculating the current GenLayer fee policy.`);

    const estimate = await walletClient.estimateTransactionFeesForWrite(call);

    setTxStatus('working', 'Awaiting wallet signature', `${label}: review the transaction in your wallet.`);

    txId = await walletClient.writeContract({
      ...call,
      fees: {
        distribution: estimate.distribution,
        feeValue: estimate.feeValue,
      },
    });

    setTxStatus(
      'working',
      'Transaction submitted',
      `${label}: waiting for GenLayer finalization. Do not submit a duplicate write.`,
      txId,
    );

    const transaction = await walletClient.waitForFinalization({ hash: txId });

    if (transaction?.txExecutionResultName !== 'FINISHED_WITH_RETURN') {
      const statusName = transaction?.statusName || 'unknown status';
      const executionName = transaction?.txExecutionResultName || 'unknown execution result';
      throw new Error(`${statusName} / ${executionName}`);
    }

    setTxStatus('success', `${label} complete`, 'The transaction finalized successfully.', txId);
    return txId;
  } catch (error) {
    const message = error?.message || String(error);
    setTxStatus(
      'error',
      `${label} failed`,
      txId ? `${message} Inspect the existing transaction before retrying.` : message,
      txId,
    );
    throw error;
  }
}

function wireTabs() {
  $$('.console-tab').forEach((button) => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;
      $$('.console-tab').forEach((item) => item.classList.toggle('active', item === button));
      $$('.console-pane').forEach((pane) => pane.classList.toggle('active', pane.dataset.pane === tab));
    });
  });
}

function wireForms() {
  $('#readForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const slaId = $('#readSlaId').value;
    readOutput.textContent = 'Reading latest finalized state…';

    try {
      const result = await readSlaResult(slaId);
      readOutput.textContent = jsonStringify(result);
    } catch (error) {
      readOutput.textContent = `Read failed: ${error?.message || String(error)}`;
    }
  });

  $('#createForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const args = [
      $('#createId').value.trim(),
      $('#createProvider').value.trim(),
      $('#createTitle').value.trim(),
      $('#createTask').value.trim(),
      $('#createRequirements').value.trim(),
      $('#createEvidenceRequirements').value.trim(),
      Number($('#createAcceptance').value),
      Number($('#createSubmission').value),
      Number($('#createPassing').value),
    ];

    let value;
    try {
      value = parseGen($('#createReward').value);
    } catch (error) {
      setTxStatus('error', 'Invalid reward', error?.message || String(error));
      return;
    }
    await submitWrite(
      {
        address: CONTRACT_ADDRESS,
        functionName: 'create_sla',
        args,
        value,
      },
      'Create SLA',
    ).catch(() => {});
  });

  $('#acceptForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await submitWrite(
      {
        address: CONTRACT_ADDRESS,
        functionName: 'accept_sla',
        args: [$('#acceptId').value.trim(), $('#acceptHash').value.trim()],
      },
      'Accept SLA',
    ).catch(() => {});
  });

  $('#submitForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await submitWrite(
      {
        address: CONTRACT_ADDRESS,
        functionName: 'submit_work',
        args: [
          $('#submitId').value.trim(),
          $('#deliverableUrl').value.trim(),
          $('#deliverableHash').value.trim(),
          $('#evidenceUrl').value.trim(),
          $('#evidenceHash').value.trim(),
        ],
      },
      'Submit work',
    ).catch(() => {});
  });

  $('#reviewForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await submitWrite(
      {
        address: CONTRACT_ADDRESS,
        functionName: 'review_sla',
        args: [$('#reviewId').value.trim()],
      },
      'Consensus review',
    ).catch(() => {});
  });

  for (const [form, input, method, label] of [
    ['retryForm', 'retryId', 'retry_review', 'Retry evidence review'],
    ['timeoutForm', 'timeoutId', 'claim_timeout_refund', 'Claim timeout refund'],
    ['cancelForm', 'cancelId', 'cancel_open_sla', 'Cancel open SLA'],
  ]) {
    $(`#${form}`).addEventListener('submit', async (event) => {
      event.preventDefault();
      await submitWrite({ address: CONTRACT_ADDRESS, functionName: method,
        args: [$(`#${input}`).value.trim()] }, label).catch(() => {});
    });
  }

  $('#finalizeForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await submitWrite(
      {
        address: CONTRACT_ADDRESS,
        functionName: 'finalize_sla',
        args: [$('#finalizeId').value.trim()],
      },
      'Finalize SLA',
    ).catch(() => {});
  });
}

function wireWalletEvents() {
  if (!window.ethereum?.on) return;

  window.ethereum.on('accountsChanged', (accounts) => {
    connectedAccount = accounts?.[0] || null;
    walletClient = null;
    connectWalletBtn.textContent = connectedAccount ? shortAddress(connectedAccount) : 'Connect wallet';
    connectWalletBtn.classList.toggle('connected', Boolean(connectedAccount));
    if (connectedAccount) connectWallet().catch(() => {});
  });

  window.ethereum.on('chainChanged', () => {
    walletClient = null;
    if (connectedAccount) connectWallet().catch(() => {});
  });
}

connectWalletBtn.addEventListener('click', connectWallet);
refreshResultBtn.addEventListener('click', refreshCanonicalResult);
wireTabs();
wireForms();
wireWalletEvents();
refreshCanonicalResult();


async function verifyDeployment() {
  const banner = $('#deploymentStatus');
  $$('.console-pane form button[type="submit"]').forEach(button => {
    if (button.closest('form').id !== 'readForm') button.disabled = true;
  });
  try {
    const version = await publicClient.readContract({address: CONTRACT_ADDRESS,
      functionName: 'get_protocol_version', args: [],
      transactionHashVariant: TransactionHashVariant.LATEST_FINAL});
    if (String(version) !== '2') throw new Error('Contract does not report protocol v2.');
    v2Ready = true;
    banner.textContent = `Agentsla v2 · ${CONTRACT_ADDRESS} · protected evidence retries enabled`;
    $$('.console-pane form button[type="submit"]').forEach(button => button.disabled = false);
  } catch (error) {
    banner.textContent = `V2 verification failed; writes disabled: ${error?.message || String(error)}`;
  }
}
verifyDeployment();
