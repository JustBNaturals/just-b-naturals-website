import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import * as promotion from '../promotion.js';
import * as delivery from '../delivery.js';
function storefront(french=false){
  const storage=new Map();const context={...promotion,...delivery,console,URLSearchParams,Intl,Date,Map,Set,JSON,Math,Number,String,Array,Boolean,encodeURIComponent,decodeURIComponent,setTimeout,clearTimeout,
    location:{search:french?'?lang=fr':''},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
    document:{documentElement:{classList:{add(){}}},body:{dataset:{}},cookie:'',querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}},
    window:{location:{protocol:'https:'}},campaignLanguage:french?'fr':'en',t:en=>en};
  vm.createContext(context);if(french)vm.runInContext(readFileSync(new URL('../fr.js',import.meta.url),'utf8'),context);
  let source=readFileSync(new URL('../script.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
  source=source.slice(0,source.indexOf('renderSiteChrome();\ninitializeCampaignLanguage();'));
  source+='\nglobalThis.harness={price:cartPricing,summary:buildOrderSummary,set(items,config){orderList=items;soapCampaign=config;},products:PRODUCTS,load:loadOrderList,save:saveOrderList};';
  vm.runInContext(source,context);return {h:context.harness,storage};
}
test('cart quantity changes, removal, refresh persistence and fallback summary use shared offer',()=>{
  const {h,storage}=storefront();const config={...promotion.CAMPAIGN_DEFAULTS,startDate:'2020-01-01',endDate:'2030-01-01'};
  h.set([{id:promotion.SOAP_IDS[0],quantity:2}],config);assert.equal(h.price().itemSubtotalCents,1400);assert.match(h.summary(),/October soap offer: −\$2\.00/);
  h.set([{id:promotion.SOAP_IDS[0],quantity:3}],config);assert.equal(h.price().itemSubtotalCents,2200);
  h.save();assert.equal(JSON.parse(storage.get('just-b-naturals-order-list-v1'))[0].quantity,3);assert.equal(h.load()[0].quantity,3);
  h.set([{id:promotion.SOAP_IDS[0],quantity:1}],config);assert.equal(h.price().discountCents,0);
  h.set([],config);assert.equal(h.price().itemSubtotalCents,0);
});

test('existing French system translates soaps and includes the current Mocha bar in the offer',()=>{
  const {h}=storefront(true);const config={...promotion.CAMPAIGN_DEFAULTS,startDate:'2020-01-01',endDate:'2030-01-01'};
  assert.equal(h.products.find(p=>p.id==='matcha-lavender-soap').name,'Matcha et lavande');
  assert.equal(h.products.find(p=>p.id==='almond-milk-mocha-soap').name,'Mocha Latté');
  h.set([{id:'almond-milk-mocha-soap',quantity:2}],config);assert.equal(h.price().itemSubtotalCents,1400);
});
