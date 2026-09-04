import './styles.css';
import { createClient, isSuccessful } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { TransactionHashVariant } from 'genlayer-js/types';

const CONTRACT_ADDRESS = '0xc7A6812642ea6158926B369f6c0d35F507fbAA8a';
const CANONICAL_SLA_ID = 'agentsla-cyber-003';
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
  return BigInt(whole) * 10n ** 18n + BigInt(paddedFraction || '0');
}

function setTxStatus(kind, title, detail, txHash = '') {
  txStatus.dataset.kind = kind;
  const explorer = txHash
    ? `<a href="${EXPLORER_BASE}/tx/${txHash}" target="_blank" rel="noreferrer">Open transaction ↗</a>`
    : '';

  txStatus.innerHTML = `
    <span class="tx-indicator"></span>
    <div>
      <strong>${title}</strong>
      <small>${detail}</small>
      ${explorer}
    </div>
  `;
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

async function readSlaResult(slaId) {
  const id = String(slaId || '').trim();
  if (!id) throw new Error('Enter an SLA ID.');

  return publicClient.readContract({
    address: CONTRACT_ADDRESS,
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
      resultRows[2].textContent = settled && status === 'PAID' ? 'Provider paid' : status;
    }

    liveResultMessage.textContent = `Live finalized state: ${status} · ${verdict} · ${score}/100`;
  } catch (error) {
    liveResultMessage.textContent = `Live read failed: ${error?.message || String(error)}`;
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
  await requireWallet();

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

    if (!isSuccessful(transaction)) {
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

    const value = parseGen($('#createReward').value);
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
