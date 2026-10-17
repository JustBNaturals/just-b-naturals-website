// Public Behold JSON feed; no Instagram credentials are stored in the website.
const FEED_URL='https://feeds.behold.so/ls8nqtVeRM7cA4xGR5lY';
const OMIT=new Set(['18150794686550483']); // October photograph already featured above.
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':status===200?'public, max-age=300':'no-store'}});
export function trustedMedia(value){
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&(u.hostname==='behold.pictures'||u.hostname.endsWith('.behold.pictures')||u.hostname.endsWith('.cdninstagram.com')||u.hostname.endsWith('.fbcdn.net'))?u.href:null;}catch{return null;}
}
export function feedPosts(feed){
 if(feed.username!=='justb.naturals'||!Array.isArray(feed.posts))return [];
 return feed.posts.slice(0,6).flatMap(p=>{
  if(!/^\d{1,30}$/.test(p.id)||OMIT.has(p.id))return [];
  let permalink;try{const u=new URL(p.permalink);if(u.protocol!=='https:'||u.hostname!=='www.instagram.com'||!/^\/(?:p|reel)\/[\w-]+\/?$/.test(u.pathname))return [];permalink=u.origin+u.pathname;}catch{return [];}
  const image=trustedMedia(p.sizes?.medium?.mediaUrl||p.sizes?.small?.mediaUrl||p.thumbnailUrl||p.mediaUrl);
  const video=p.mediaType==='VIDEO'?trustedMedia(p.mediaUrl):null;if(!image)return [];
  return [{id:p.id,permalink,image,video,caption:String(p.prunedCaption||p.caption||'').slice(0,2200),alt:String(p.altText||'').slice(0,500),type:video?'VIDEO':p.mediaType==='CAROUSEL_ALBUM'?'CAROUSEL':'IMAGE'}];
 });
}
async function mediaFetch(source,options){
 let url=source;
 for(let hop=0;hop<4;hop++){
  const response=await fetch(url,{...options,redirect:'manual'});
  if(![301,302,303,307,308].includes(response.status))return response;
  const location=response.headers.get('Location');const next=location&&trustedMedia(new URL(location,url).href);
  await response.body?.cancel();if(!next)throw new Error('Untrusted media redirect');url=next;
 }
 throw new Error('Too many media redirects');
}
async function loadFeed(request){
 const cache=typeof caches==='undefined'?null:caches.default,key=new Request(new URL('/_instagram-cache/connected-v1',request.url));
 let saved;try{saved=await cache?.match(key);}catch{}if(saved)return saved.json();
 const upstream=await fetch(FEED_URL,{redirect:'follow',signal:AbortSignal.timeout(15000),headers:{Accept:'application/json'}});
 if(!upstream.ok)throw new Error('feed_http_'+upstream.status);
 const text=await upstream.text();if(text.length>1000000)throw new Error('Feed too large');
 let feed;try{feed=JSON.parse(text);}catch{throw new Error('feed_format');}if(feed.username!=='justb.naturals'||!Array.isArray(feed.posts))throw new Error('feed_account');
 const posts=feedPosts(feed);if(!posts.length)throw new Error('feed_empty');
 try{await cache?.put(key,Response.json(posts,{headers:{'Cache-Control':'public, max-age=600'}}));}catch{}return posts;
}
export async function instagramRoute(request){
 const url=new URL(request.url);if(!['/api/instagram','/api/instagram/media'].includes(url.pathname))return null;
 if(!['GET','HEAD'].includes(request.method))return json({error:'Method not allowed.'},405);
 try{
  const posts=await loadFeed(request);
  if(url.pathname==='/api/instagram')return json({username:'justb.naturals',posts:posts.map(({image,video,...p})=>({...p,image:`/api/instagram/media?id=${p.id}&type=image`,video:video?`/api/instagram/media?id=${p.id}&type=video`:null}))});
  const post=posts.find(p=>p.id===url.searchParams.get('id')),type=url.searchParams.get('type');
  if(!post||!['image','video'].includes(type)||!post[type])return json({error:'Media not found.'},404);
  const range=request.headers.get('Range');if(range&&!/^bytes=\d+-\d*$/.test(range))return json({error:'Invalid range.'},416);
  const upstream=await mediaFetch(post[type],{method:request.method,signal:AbortSignal.timeout(20000),headers:range?{Range:range}:{}});
  if(!upstream.ok)return json({error:'Media unavailable.'},502);
  const contentType=upstream.headers.get('Content-Type')||'';if(type==='video'?!contentType.startsWith('video/'):!contentType.startsWith('image/'))return json({error:'Unexpected media type.'},502);
  const headers=new Headers({'Content-Type':contentType,'Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'});
  for(const name of ['Content-Length','Content-Range','Accept-Ranges','ETag']){const value=upstream.headers.get(name);if(value)headers.set(name,value);}
  return new Response(upstream.body,{status:upstream.status,headers});
 }catch(error){const reason=/^feed_(?:http_\d{3}|format|account|empty)$/.test(error.message)?error.message:error.name==='TimeoutError'?'feed_timeout':'feed_unavailable';return json({error:'Instagram is temporarily unavailable.',reason},502);}
}
