import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const source = (await readFile(new URL('../src/main.js', import.meta.url), 'utf8'))
  .replace(/^import .*;\n/gm, '').replaceAll('import.meta.env', 'window.testEnv');
const flush = async () => { for(let i=0;i<8;i++) await new Promise(r=>setImmediate(r)); };
async function setup({v2=false, readFail=false, txFail=false}={}) {
  const dom = new JSDOM(html, {runScripts:'outside-only', url:'https://example.com'});
  const {window:w} = dom;
  const writes=[];
  w.testEnv = v2 ? {VITE_AGENTSLA_V2_ADDRESS:'0x'+'1'.repeat(40)} : {};
  w.studionet = {};
  w.TransactionHashVariant = {LATEST_FINAL:'latest-final'};
  w.ethereum = {request:async ({method})=>method==='eth_requestAccounts'?['0x'+'2'.repeat(40)]:null, on:()=>{}};
  w.createClient = () => ({
    connect:async()=>{},
    readContract:async ({functionName})=>{
      if(functionName==='get_protocol_version')return '2';
      if(readFail)throw new Error('RPC unavailable');
      return {status:'PAID',verdict:'SATISFIED',score:95,settled:true};
    },
    estimateTransactionFeesForWrite:async()=>({distribution:[],feeValue:0n}),
    writeContract:async call=>{writes.push(call);return '0x'+'a'.repeat(64);},
    waitForFinalization:async()=>({txExecutionResultName:txFail?'ERROR':'FINISHED_WITH_RETURN',statusName:'FINALIZED'}),
  });
  w.eval(source);
  await flush();
  return {w,writes,close:()=>dom.window.close()};
}

test('unconfigured v2 disables writes and keeps historical read available',async()=>{
  const e=await setup();
  try {
    assert.equal(e.w.document.querySelector('#retryForm button').disabled,true);
    assert.equal(e.w.document.querySelector('#readForm button').disabled,false);
    assert.match(e.w.document.querySelector('#deploymentStatus').textContent,/old contract/);
  } finally {e.close();}
});

test('failed live reads do not display a verified payout',async()=>{
  const e=await setup({readFail:true});
  try {
    assert.equal(e.w.document.querySelector('.verdict').textContent,'UNVERIFIED');
    assert.equal(e.w.document.querySelector('.score-pill').textContent,'—');
    assert.match(e.w.document.querySelector('#liveResultMessage').textContent,/could not be verified/);
  } finally {e.close();}
});

test('configured v2 retry uses the wallet and the correct method',async()=>{
  const e=await setup({v2:true});
  try {
    assert.equal(e.w.document.querySelector('#retryForm button').disabled,false);
    e.w.document.querySelector('#retryId').value='retry-demo';
    e.w.document.querySelector('#retryForm').dispatchEvent(new e.w.Event('submit',{bubbles:true,cancelable:true}));
    await flush();
    assert.equal(e.writes.length,1);
    assert.equal(e.writes[0].functionName,'retry_review');
    assert.equal(e.writes[0].args[0],'retry-demo');
    assert.equal(e.writes[0].address,'0x'+'1'.repeat(40));
    assert.equal(e.w.document.querySelector('#txStatus').dataset.kind,'success');
  } finally {e.close();}
});

test('execution failure never reports successful settlement',async()=>{
  const e=await setup({v2:true,txFail:true});
  try {
    e.w.document.querySelector('#finalizeId').value='demo';
    e.w.document.querySelector('#finalizeForm').dispatchEvent(new e.w.Event('submit',{bubbles:true,cancelable:true}));
    await flush();
    assert.equal(e.w.document.querySelector('#txStatus').dataset.kind,'error');
    assert.match(e.w.document.querySelector('#txStatus').textContent,/Inspect the existing transaction/);
  } finally {e.close();}
});
