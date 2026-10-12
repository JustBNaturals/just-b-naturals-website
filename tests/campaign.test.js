import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker from '../worker/index.js';
import { CAMPAIGN_DEFAULTS, SOAP_IDS, priceOrder, campaignActive, campaignConfig, torontoDate } from '../promotion.js';
const now=new Date('2026-10-12T12:00:00Z');
const soap=(quantity=1,priceCents=800,id=SOAP_IDS[0])=>({id,quantity,priceCents});
const p=items=>priceOrder(items,CAMPAIGN_DEFAULTS,now);
test('0–4 bars, same scent and mixed scents, excluded products',()=>{
  for(const [q,total,discount,pairs] of [[0,0,0,0],[1,800,0,0],[2,1400,200,1],[3,2200,200,1],[4,2800,400,2]]){
    const result=p(q?[soap(q)]:[]);assert.equal(result.itemSubtotalCents,total);assert.equal(result.discountCents,discount);assert.equal(result.qualifyingPairs,pairs);assert.equal(result.donationCommitmentCents,pairs*100);
  }
  assert.equal(p([soap(1),soap(1,800,SOAP_IDS[1])]).itemSubtotalCents,1400);
  assert.equal(p([soap(2),{id:'solid-dish-soap',quantity:2,priceCents:2000}]).itemSubtotalCents,5400);
  assert.equal(p([{id:'solid-dish-soap',quantity:2,priceCents:2000}]).qualifyingPairs,0);
});
test('customer-favourable pairing and lower regular prices',()=>{
  assert.equal(p([soap(1,1000),soap(1,800,SOAP_IDS[1]),soap(1,600,SOAP_IDS[2])]).itemSubtotalCents,2000);
  assert.equal(p([soap(2,600)]).itemSubtotalCents,1200);
  assert.equal(p([soap(1,1000),soap(1,800,SOAP_IDS[1]),soap(2,600,SOAP_IDS[2])]).itemSubtotalCents,2600);
});
test('Toronto start/end boundary and disable',()=>{
  assert.equal(campaignActive(CAMPAIGN_DEFAULTS,new Date('2026-10-01T03:59:59Z')),false);
  assert.equal(campaignActive(CAMPAIGN_DEFAULTS,new Date('2026-10-01T04:00:00Z')),true);
  assert.equal(campaignActive(CAMPAIGN_DEFAULTS,new Date('2026-11-01T03:59:59Z')),true);
  assert.equal(campaignActive(CAMPAIGN_DEFAULTS,new Date('2026-11-01T04:00:00Z')),false);
  assert.equal(priceOrder([soap(4)],CAMPAIGN_DEFAULTS,new Date('2026-11-01T12:00:00Z')).itemSubtotalCents,3200);
  assert.equal(priceOrder([soap(4)],{...CAMPAIGN_DEFAULTS,enabled:false},now).donationCommitmentCents,0);
});
test('invalid settings and prices rejected',()=>{
  assert.throws(()=>campaignConfig({endDate:'2026-02-30'}));
  assert.throws(()=>campaignConfig({pairPriceCents:-1}));
  assert.throws(()=>priceOrder([soap(1,-500)],CAMPAIGN_DEFAULTS,now));
  assert.throws(()=>priceOrder([soap(1.5)],CAMPAIGN_DEFAULTS,now));
});
function database(){
  const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE inventory(product_id TEXT PRIMARY KEY,stock_count INTEGER,price_cents INTEGER,is_active INTEGER,availability_status TEXT,available_date TEXT)');
  for(const id of SOAP_IDS)db.prepare("INSERT INTO inventory VALUES(?,10,800,1,'available',NULL)").run(id);
  db.prepare("INSERT INTO inventory VALUES('solid-dish-soap',10,2000,1,'available',NULL)").run();
  const api={exec:async sql=>db.exec(sql),prepare(sql){let values=[];return {bind(...args){values=args;return this},async all(){return {results:db.prepare(sql).all(...values)}},async first(){return db.prepare(sql).get(...values)||null},async run(){return db.prepare(sql).run(...values)}}}};
  return {db,api};
}
const request=(path,data,auth=false)=>new Request('https://justbnatural.ca'+path,{method:data?'POST':'GET',headers:{...(data?{'Content-Type':'application/json'}:{}),...(auth?{Authorization:'Bearer test-key'}:{})},...(data?{body:JSON.stringify(data)}:{})});
test('trusted order totals match saved ledger and both emails; status/refund totals and auth',async()=>{
  const {db,api}=database();const env={INVENTORY_DB:api,INVENTORY_ADMIN_KEY:'test-key',BREVO_API_KEY:'fake-for-local-test',ORDER_EMAIL:'test@example.com'};
  const sent=[];const originalFetch=globalThis.fetch;globalThis.fetch=async(url,options)=>{sent.push(JSON.parse(options.body));return Response.json({messageId:'local-test'});};
  try{
    const today=torontoDate();await worker.fetch(request('/api/campaign',{config:{...CAMPAIGN_DEFAULTS,startDate:today,endDate:today}},true),env);
    for(const language of ['en','fr']){
      const response=await worker.fetch(request('/api/order',{language,firstName:'Test',lastName:'Customer',email:'customer@example.com',fulfillment:'pickup',payment:'cash',items:[{id:SOAP_IDS[0],quantity:3,priceCents:1},{id:'solid-dish-soap',quantity:1}],itemSubtotalCents:1,discountCents:99999}),env);
      assert.equal(response.status,200);const result=await response.json();assert.equal(result.pricing.regularSubtotalCents,4400);assert.equal(result.pricing.itemSubtotalCents,4200);assert.equal(result.pricing.discountCents,200);
      const row=db.prepare('SELECT * FROM campaign_orders WHERE order_id=?').get(result.orderId);assert.equal(JSON.parse(row.order_json).itemSubtotalCents,4200);assert.equal(row.status,'pending');assert.equal(row.email_status,'sent');
      for(const email of sent.slice(-2)){assert.match(email.htmlContent,/42\.00/);assert.match(email.htmlContent,/−\$2\.00/);assert.match(email.htmlContent,/Ruban Rose/);}
      assert.equal((await worker.fetch(request('/api/campaign/orders'),env)).status,401);
      await worker.fetch(request('/api/campaign/orders',{orderId:result.orderId,status:'paid'},true),env);
      let ledger=await (await worker.fetch(request('/api/campaign/orders',undefined,true),env)).json();assert.equal(ledger.earnedCents,100);
      await worker.fetch(request('/api/campaign/orders',{orderId:result.orderId,status:'completed'},true),env);ledger=await (await worker.fetch(request('/api/campaign/orders',undefined,true),env)).json();assert.equal(ledger.earnedCents,100);
      assert.equal((await worker.fetch(request('/api/campaign/orders',{orderId:result.orderId,status:'partial_refund',retainedPairs:2},true),env)).status,400);
      await worker.fetch(request('/api/campaign/orders',{orderId:result.orderId,status:'partial_refund',retainedPairs:0},true),env);ledger=await (await worker.fetch(request('/api/campaign/orders',undefined,true),env)).json();assert.equal(ledger.earnedCents,0);
      await worker.fetch(request('/api/campaign/orders',{orderId:result.orderId,status:'refunded'},true),env);
    }
    const invalid=await worker.fetch(request('/api/order',{firstName:'Test',lastName:'Customer',email:'customer@example.com',fulfillment:'pickup',payment:'cash',items:[{id:SOAP_IDS[0],quantity:-2}]}),env);assert.notEqual(invalid.status,200);
    db.prepare('UPDATE inventory SET price_cents=600 WHERE product_id=?').run(SOAP_IDS[0]);
    const lower=await worker.fetch(request('/api/order',{firstName:'Test',lastName:'Customer',email:'customer@example.com',fulfillment:'pickup',payment:'cash',items:[{id:SOAP_IDS[0],quantity:2}]}),env);assert.equal((await lower.json()).pricing.itemSubtotalCents,1200);
  }finally{globalThis.fetch=originalFetch;db.close();}
});
