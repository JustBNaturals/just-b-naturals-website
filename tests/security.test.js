import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import worker from '../worker/index.js';import {boundedJsonRequest,SECURITY_HEADERS} from '../worker/security.js';
test('API limits actual streamed bytes, not only declared length; normal JSON survives',async()=>{
 const stream=new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode('x'.repeat(66000)));controller.close();}});
 const rejected=await boundedJsonRequest(new Request('https://justbnatural.ca/api/order',{method:'POST',headers:{'Content-Type':'application/json'},body:stream,duplex:'half'}));assert.equal(rejected.status,413);
 const checked=await boundedJsonRequest(new Request('https://justbnatural.ca/api/order',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"items":[]}'}));assert.deepEqual(await checked.json(),{items:[]});
});
test('cross-origin mutations are rejected; API and asset security policies agree',async()=>{
 const response=await worker.fetch(new Request('https://justbnatural.ca/api/inventory',{method:'POST',headers:{Origin:'https://unrelated.example','Content-Type':'application/json'},body:'{}'}),{});assert.equal(response.status,403);assert.equal(response.headers.get('Cache-Control'),'no-store');
 const staticHeaders=readFileSync(new URL('../_headers',import.meta.url),'utf8');for(const [header,value]of Object.entries(SECURITY_HEADERS)){assert.equal(response.headers.get(header),value);assert.ok(staticHeaders.includes(header+': '+value));}
 assert.match(response.headers.get('Content-Security-Policy'),/script-src 'self';/);assert.match(response.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/);
});
