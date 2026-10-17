const ACCOUNT='justb.naturals';let cached=null,pending=null;
const json=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'public, max-age=60','X-Content-Type-Options':'nosniff'}});
function imageUrl(value){try{const url=new URL(value);return url.protocol==='https:'&&(url.hostname==='behold.pictures'||url.hostname.endsWith('.behold.pictures'))?url.href:null;}catch{return null;}}
function postUrl(value){try{const url=new URL(value);return url.protocol==='https:'&&['instagram.com','www.instagram.com'].includes(url.hostname)&&/^\/(p|reel)\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)?url.origin+url.pathname:null;}catch{return null;}}
export function normalizeInstagramFeed(data){
 if(String(data?.username||'').replace(/^@/,'').toLowerCase()!==ACCOUNT)throw new Error('The feed must belong to @'+ACCOUNT+'.');
 return (Array.isArray(data.posts)?data.posts:[]).slice(0,6).flatMap(post=>{
  const id=String(post.id||''),href=postUrl(post.permalink),small=imageUrl(post.sizes?.medium?.mediaUrl||post.sizes?.small?.mediaUrl),large=imageUrl(post.sizes?.large?.mediaUrl||post.sizes?.medium?.mediaUrl);
  if(!/^[A-Za-z0-9_-]{1,80}$/.test(id)||!href||!small)return [];
  return [{id,href,small,large:large||small,caption:String(post.prunedCaption||post.caption||'').slice(0,2200),alt:String(post.altText||'').slice(0,500),type:['VIDEO','CAROUSEL_ALBUM'].includes(post.mediaType)?post.mediaType:'IMAGE'}];
 });
}
async function loadFeed(id){
 if(cached?.id===id&&cached.until>Date.now())return cached.posts;
 if(pending?.id===id)return pending.promise;
 const promise=(async()=>{const response=await fetch('https://feeds.behold.so/'+encodeURIComponent(id),{signal:AbortSignal.timeout(5000),headers:{Accept:'application/json'},cf:{cacheTtl:300,cacheEverything:true}});if(!response.ok)throw new Error('Feed unavailable');const posts=normalizeInstagramFeed(await response.json());cached={id,posts,until:Date.now()+300000};return posts;})();pending={id,promise};try{return await promise;}finally{pending=null;}
}
export async function instagramRoute(request,env){
 const url=new URL(request.url);if(!['/api/instagram','/api/instagram/image'].includes(url.pathname))return null;
 if(request.method!=='GET')return json({error:'Method not allowed.'},405);
 const id=String(env.INSTAGRAM_BEHOLD_FEED_ID||'').trim();
 if(!/^[A-Za-z0-9_-]{4,80}$/.test(id))return url.pathname.endsWith('/image')?json({error:'Image unavailable.'},404):json({connected:false,posts:[]});
 try{const posts=await loadFeed(id);
  if(url.pathname==='/api/instagram')return json({connected:true,posts:posts.map(({small,large,...post})=>({...post,image:'/api/instagram/image?id='+encodeURIComponent(post.id),largeImage:'/api/instagram/image?id='+encodeURIComponent(post.id)+'&size=large'}))});
  const post=posts.find(p=>p.id===url.searchParams.get('id'));if(!post)return json({error:'Image unavailable.'},404);
  const response=await fetch(url.searchParams.get('size')==='large'?post.large:post.small,{signal:AbortSignal.timeout(5000),cf:{cacheTtl:3600,cacheEverything:true}});
  if(!response.ok||!response.headers.get('Content-Type')?.startsWith('image/'))return json({error:'Image unavailable.'},502);
  return new Response(response.body,{headers:{'Content-Type':response.headers.get('Content-Type'),'Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'}});
 }catch{return json({connected:false,posts:[]});}
}
