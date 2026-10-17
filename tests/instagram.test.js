import test from 'node:test';import assert from 'node:assert/strict';
import {feedPosts,trustedMedia,instagramRoute} from '../worker/instagram.js';
const post={id:'111',mediaType:'VIDEO',permalink:'https://www.instagram.com/reel/Real1/',mediaUrl:'https://scontent-test.cdninstagram.com/movie.mp4',sizes:{medium:{mediaUrl:'https://behold.pictures/preview.webp'}},caption:'Unmolding & cutting soap'};
test('latest-six grid includes campaign posts and mixed post types without manual omissions',()=>{
 const posts=Array.from({length:8},(_,i)=>({...post,id:String(100+i),mediaType:i%2?'IMAGE':'VIDEO'}));
 const rows=feedPosts({username:'justb.naturals',posts});assert.equal(rows.length,6);assert.deepEqual(rows.map(p=>p.id),['100','101','102','103','104','105']);assert.equal(rows[1].type,'IMAGE');
});
test('Instagram feed accepts only the connected account, trusted media and actual post links',()=>{
 assert.equal(feedPosts({username:'someone-else',posts:[post]}).length,0);
 const rows=feedPosts({username:'justb.naturals',posts:[post,{...post,id:'18150794686550483'},{...post,permalink:'https://evil.example/reel/test/'},{...post,id:'<script>'}]});assert.equal(rows.length,2);assert.equal(rows[0].type,'VIDEO');
 for(const url of ['http://behold.pictures/x','https://behold.pictures.evil.example/x','https://user:password@behold.pictures/x','http://127.0.0.1/admin','https://evil.example/x'])assert.equal(trustedMedia(url),null);
});
test('connected feed is cached, exposes same-origin media and forwards real video ranges only',async()=>{
 const savedFetch=globalThis.fetch,savedCaches=Object.getOwnPropertyDescriptor(globalThis,'caches'),cache=new Map(),requests=[];
 Object.defineProperty(globalThis,'caches',{configurable:true,value:{default:{match:async key=>cache.get(key.url)?.clone(),put:async(key,response)=>cache.set(key.url,response.clone())}}});
 globalThis.fetch=async(url,options)=>{requests.push({url,options});if(url.startsWith('https://feeds.behold.so/'))return Response.json({username:'justb.naturals',posts:[post]});return new Response(new Uint8Array([1,2]),{status:206,headers:{'Content-Type':'video/mp4','Content-Range':'bytes 0-1/100','Content-Length':'2','Accept-Ranges':'bytes'}});};
 try{
  const feed=await(await instagramRoute(new Request('https://shop.test/api/instagram'))).json();assert.equal(feed.posts[0].video,'/api/instagram/media?id=111&type=video');assert.ok(!JSON.stringify(feed).includes('cdninstagram.com'));
  const video=await instagramRoute(new Request('https://shop.test/api/instagram/media?id=111&type=video',{headers:{Range:'bytes=0-1'}}));assert.equal(video.status,206);assert.equal(video.headers.get('Content-Range'),'bytes 0-1/100');assert.deepEqual([...new Uint8Array(await video.arrayBuffer())],[1,2]);assert.equal(requests[1].options.headers.Range,'bytes=0-1');assert.equal(requests.filter(r=>r.url.startsWith('https://feeds.behold.so/')).length,1);
  assert.equal((await instagramRoute(new Request('https://shop.test/api/instagram/media?id=999&type=video'))).status,404);
  assert.equal((await instagramRoute(new Request('https://shop.test/api/instagram/media?id=111&type=video',{headers:{Range:'bytes=0-1,2-3'}}))).status,416);
  assert.equal((await instagramRoute(new Request('https://shop.test/api/instagram',{method:'POST'}))).status,405);
 }finally{globalThis.fetch=savedFetch;if(savedCaches)Object.defineProperty(globalThis,'caches',savedCaches);else delete globalThis.caches;}
});
test('a failed Instagram service produces a clean failure for the local gallery fallback',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>new Response('unavailable',{status:503});try{const response=await instagramRoute(new Request('https://shop.test/api/instagram'));assert.equal(response.status,502);assert.equal(response.headers.get('Cache-Control'),'no-store');assert.equal(await instagramRoute(new Request('https://shop.test/api/products')),null);}finally{globalThis.fetch=original;}
});
