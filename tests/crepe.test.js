import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {PRODUCTS} from '../product-data.js';
import * as promotion from '../promotion.js';
import * as delivery from '../delivery.js';
import worker from '../worker/index.js';

function render(french) {
  const mount={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]};
  const context={PRODUCTS:structuredClone(PRODUCTS),...promotion,...delivery,console,URLSearchParams,Intl,Date,Map,Set,JSON,Math,Number,String,Array,Boolean,encodeURIComponent,decodeURIComponent,setTimeout,clearTimeout,
    location:{search:french?'?lang=fr':''},localStorage:{getItem:()=>null,setItem(){}},
    document:{documentElement:{classList:{add(){}}},body:{dataset:{productId:'sourdough-crepe-mix'}},cookie:'',querySelector:selector=>selector==='[data-product-page]'?mount:null,querySelectorAll:()=>[],addEventListener(){}},
    window:{location:{protocol:'https:'},matchMedia:()=>({matches:false})},campaignLanguage:french?'fr':'en',t:(en,fr)=>french?(fr||en):en};
  vm.createContext(context);
  vm.runInContext(readFileSync(new URL('../fr.js',import.meta.url),'utf8'),context);
  let source=readFileSync(new URL('../script.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
  source=source.slice(0,source.indexOf('renderSiteChrome();\ninitializeCampaignLanguage();'));
  source+='\nrenderProductPage();globalThis.harness={products:PRODUCTS,button:updateAddButton};';
  vm.runInContext(source,context);
  return {html:mount.innerHTML,...context.harness};
}

test('crêpe page keeps complete bilingual cooking directions and food storage instead of cosmetic guidance',()=>{
  for(const french of [false,true]) {
    const {html,products,button}=render(french);
    const product=products.find(p=>p.id==='sourdough-crepe-mix');
    assert.equal(product.category,'home-linen');assert.equal(product.weightGrams,255);
    assert.match(html,/255 g/);assert.match(html,french?/8 à 10 crêpes de 10 po/:/8–10 crêpes, 10 inches/);
    assert.equal(product.preparationSteps.length,4);
    for(const step of product.preparationSteps)assert.ok(html.includes(step.replaceAll('’','’')));
    assert.match(html,french?/fouet ou d’un mélangeur à main/:/whisk or stick blender/);
    const ownUse=html.split('class="shell product-use-section"')[1].split('<section class="related-products')[0];
    assert.doesNotMatch(ownUse,/external use|mist|linens|irritation|skin|usage externe/i);
    assert.match(ownUse,french?/Réfrigérer/:/Refrigerate/);
    const btn={dataset:{addOrder:product.id},classList:{remove(){},toggle(){}},textContent:''};
    button(btn);assert.equal(btn.disabled,true);assert.match(btn.textContent,french?/Prix à confirmer/:/Price to be confirmed/);
    product.price=12;button(btn);assert.equal(btn.disabled,false);assert.match(btn.innerHTML,french?/Add to cart|Ajouter/:/Add to cart/);
    assert.equal(products.some(p=>/magnesium|magnésium/i.test(p.id)),false);
  }
});

test('first crêpe inventory save creates the row and later saves preserve other products',async()=>{
  const db=new DatabaseSync(':memory:');
  db.exec("CREATE TABLE inventory(product_id TEXT PRIMARY KEY,stock_count INTEGER,price_cents INTEGER,is_active INTEGER,availability_status TEXT,available_date TEXT,updated_at TEXT DEFAULT CURRENT_TIMESTAMP); INSERT INTO inventory VALUES('matcha-lavender-soap',3,800,1,'available',NULL,CURRENT_TIMESTAMP)");
  const api={prepare(sql){let args=[];return {bind(...v){args=v;return this},async all(){return {results:db.prepare(sql).all(...args)}},async first(){return db.prepare(sql).get(...args)},async run(){return db.prepare(sql).run(...args)}}},async batch(statements){db.exec('BEGIN');try{for(const s of statements)await s.run();db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}}};
  const env={INVENTORY_DB:api,INVENTORY_ADMIN_KEY:'test-key'};
  try {
    for(const [stock,priceCents] of [[7,1200],[5,1300]]) {
      const request=new Request('https://justbnatural.ca/api/inventory',{method:'POST',headers:{Origin:'https://justbnatural.ca','Content-Type':'application/json',Authorization:'Bearer test-key'},body:JSON.stringify({products:[{id:'sourdough-crepe-mix',stock,priceCents,availabilityStatus:'available'}]})});
      const response=await worker.fetch(request,env);assert.equal(response.status,200);
      const saved=db.prepare("SELECT * FROM inventory WHERE product_id='sourdough-crepe-mix'").get();assert.equal(saved.stock_count,stock);assert.equal(saved.price_cents,priceCents);
      assert.equal(db.prepare("SELECT stock_count FROM inventory WHERE product_id='matcha-lavender-soap'").get().stock_count,3);
    }
  } finally {db.close()}
});
