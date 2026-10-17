import test from 'node:test';import assert from 'node:assert/strict';import {initializeCheckoutPage} from '../checkout-ui.js';
test('checkout module retains cart and retry key after failure, submits ids/quantities, clears only after success',async()=>{
 const names=['document','window','sessionStorage','FormData','fetch'],before=new Map(names.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 const events=new Map(),storage=new Map(),requests=[];let cart=[{id:'matcha-lavender-soap',quantity:2}],cleared=0;
 const classList={add(){},remove(){}},button={disabled:false,textContent:''},status={textContent:'',classList},fallback={hidden:true},checkout={dataset:{}},content={hidden:false},success={hidden:true,querySelector:()=>({textContent:''}),scrollIntoView(){}};
 const values={firstName:'Test',lastName:'Customer',email:'customer@example.com',fulfillment:'pickup',payment:'cash'};
 const form={classList,reportValidity:()=>true,querySelector:s=>s==='[type="submit"]'?button:s==='[data-checkout-status]'?status:s==='[data-checkout-fallback]'?fallback:null,addEventListener:(name,fn)=>events.set(name,fn)};
 globalThis.document={querySelector:s=>({'[data-checkout]':checkout,'[data-checkout-form]':form,'[data-checkout-content]':content,'[data-checkout-success]':success}[s]||null)};
 globalThis.window={location:{protocol:'https:'}};globalThis.sessionStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};globalThis.FormData=class{get(k){return values[k]||null;}};
 globalThis.fetch=async(url,options)=>{requests.push({url,body:JSON.parse(options.body)});return requests.length===1?Response.json({error:'Temporary failure'},{status:503}):Response.json({orderId:'TEST-1'});};
 try{
  initializeCheckoutPage({STORE:{orderEndpoint:'/api/order',orderEmail:'test@example.com'},campaignLanguage:'fr',t:en=>en,cartSubtotalCents:()=>1400,updateCheckoutTotals(){},escapeHtml:s=>s,buildOrderSummary:()=>'',initializeInlineValidation:()=>()=>{},renderOrderList(){},syncCheckoutState(){},cart:()=>cart,clearCart(){cleared++;cart=[];}});
  const submit={preventDefault(){},submitter:{matches:()=>true}};await events.get('submit')(submit);
  assert.equal(cleared,0);assert.equal(cart.length,1);assert.equal(fallback.hidden,false);assert.equal(button.disabled,false);
  await events.get('submit')(submit);assert.equal(requests[0].body.requestKey,requests[1].body.requestKey);assert.deepEqual(requests[1].body.items,[{id:'matcha-lavender-soap',quantity:2}]);assert.equal(requests[1].body.language,'fr');assert.equal(cleared,1);assert.equal(cart.length,0);assert.equal(success.hidden,false);assert.equal(storage.size,0);
 }finally{for(const [name,descriptor]of before){if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}}
});
