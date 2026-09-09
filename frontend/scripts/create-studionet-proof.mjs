import { createAccount, createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import {
  ExecutionResult,
  TransactionHashVariant,
  TransactionStatus,
} from 'genlayer-js/types';

const CONTRACT_ADDRESS = '0xd8647B3A24f2973F29A5fC1822832c87E1398BA3';
const SLA_ID = process.env.AGENTSLA_PROOF_ID || `agentsla-v3-wallet-${Date.now()}`;
const PROVIDER_ADDRESS = '0x41b36C6B5cCcf9D7d5Dc09d6d2B132986FdE48e8';

const AUTHORITY_ONE_URL =
  'https://raw.githubusercontent.com/genlayerlabs/genlayer-js/4303db00c428d57c6d8e5b04a75043ea42d4b0e7/README.md';
const AUTHORITY_ONE_SHA256 =
  '76f02a57d11db0541b0d0151f9caaae3a922b4ed332afe0e0621b898676be279';
const AUTHORITY_TWO_URL =
  'https://raw.githubusercontent.com/genlayerlabs/genlayer-js/4303db00c428d57c6d8e5b04a75043ea42d4b0e7/package.json';
const AUTHORITY_TWO_SHA256 =
  'bdb0b9a86827b392ad9b584a52158bf7b90ef9e4425e009f1f5c8a8d0e6f3662';

const account = createAccount();
const client = createClient({ chain: studionet, account });

// Studionet's simulator faucet accepts whole virtual GEN. This wallet is
// generated in memory for this proof; its private key is never printed or saved.
await client.request({
  method: 'sim_fundAccount',
  params: [account.address, 2],
});

const transactionHash = await client.writeContract({
  address: CONTRACT_ADDRESS,
  functionName: 'create_sla',
  args: [
    SLA_ID,
    PROVIDER_ADDRESS,
    'Supported GenLayerJS wallet-write verification',
    'Create a public, reproducible verification record for the Agentsla v3 wallet write path.',
    'Bind the exact SDK release sources, use the supported gas estimation path, and wait for finalized state.',
    'Verify the wallet-originated transaction and compare its latest-final contract read with these immutable terms.',
    AUTHORITY_ONE_URL,
    AUTHORITY_ONE_SHA256,
    AUTHORITY_TWO_URL,
    AUTHORITY_TWO_SHA256,
    86_400,
    86_400,
    3_600,
  ],
  value: 100_000_000_000_000_000n,
});

const receipt = await client.waitForTransactionReceipt({
  hash: transactionHash,
  status: TransactionStatus.FINALIZED,
  interval: 3_000,
  retries: 120,
});

const statusName = receipt?.statusName || receipt?.status_name;
const leader = receipt?.consensus_data?.leader_receipt?.[0];
const legacySuccess = receipt?.txExecutionResultName === ExecutionResult.FINISHED_WITH_RETURN;
const simplifiedSuccess =
  receipt?.result_name === 'MAJORITY_AGREE' &&
  leader?.execution_result === 'SUCCESS' &&
  leader?.result?.status === 'return';

if (statusName !== TransactionStatus.FINALIZED || (!legacySuccess && !simplifiedSuccess)) {
  throw new Error(
    `Create SLA did not finish successfully: ${statusName || 'unknown'} / ${
      receipt?.txExecutionResultName || leader?.execution_result || receipt?.result_name || 'unknown'
    }`,
  );
}

const [result, sla, termsHash] = await Promise.all([
  client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_result',
    args: [SLA_ID],
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
  }),
  client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_sla',
    args: [SLA_ID],
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
  }),
  client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_terms_hash',
    args: [SLA_ID],
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
  }),
]);

const json = (value) =>
  JSON.stringify(value, (_key, item) => (typeof item === 'bigint' ? item.toString() : item), 2);

console.log(
  json({
    network: 'GenLayer Studionet',
    chain_id: studionet.id,
    sdk: 'genlayer-js@1.1.8',
    fee_estimation: 'writeContract -> estimateTransactionGas',
    requester: account.address,
    private_key_persisted: false,
    contract: CONTRACT_ADDRESS,
    sla_id: SLA_ID,
    transaction_hash: transactionHash,
    transaction_status: statusName,
    execution_result:
      receipt.txExecutionResultName || `${receipt.result_name}/${leader?.execution_result || 'UNKNOWN'}`,
    terms_hash: termsHash,
    result,
    sla,
  }),
);
