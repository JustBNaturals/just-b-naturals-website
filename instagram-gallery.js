// Keep the local gallery as a fallback. Load connected media only near this section.
// Verified Instagram reels omitted by the provider. These are real covers, not playable videos.
// Connected copies take precedence, so a newly available video replaces this cover automatically.
const LOCAL_POSTS=[
 {id:'local-maple-chai',permalink:'https://www.instagram.com/reel/DekMYRiNu_z/',image:'/images/instagram/maple-chai-cover.webp',type:'IMAGE',video:null,timestamp:'2026-10-16',caption:'Pour and cut of Maple Chai 🍁🫖',alt:'Maple Chai artisan soap from @justb.naturals on Instagram'},
 {id:'local-cozy',permalink:'https://www.instagram.com/reel/Dd4j-BBtVi9/',image:'/images/instagram/cozy-reel-cover.webp',type:'IMAGE',video:null,timestamp:'2026-09-29T20:11:41Z',caption:'Cozy 🪵☕️',alt:'Cozy artisan soap making reel from @justb.naturals on Instagram'},
 {id:'local-boreal',permalink:'https://www.instagram.com/reel/Dd2TW0fOzcD/',image:'/images/instagram/boreal-reel-cover.webp',type:'IMAGE',video:null,timestamp:'2026-09-28T22:54:31Z',caption:'Winter is coming — Boréal',alt:'Blue and cream Boréal artisan soap making reel from @justb.naturals on Instagram'}
];
export function galleryPosts(connected){
 const seen=new Set();
 return [...connected,...LOCAL_POSTS].filter(post=>{const key=post.permalink?.split('/').filter(Boolean).at(-1);if(!key||seen.has(key))return false;seen.add(key);return true;}).sort((a,b)=>(Date.parse(b.timestamp)||0)-(Date.parse(a.timestamp)||0)).slice(0,9);
}
export function initializeInstagramGallery(){
 const mount=document.querySelector('[data-instagram-gallery]');if(!mount)return;
 const fr=new URLSearchParams(location.search).get('lang')==='fr',t=(en,french)=>fr?french:en;
 mount.querySelectorAll('[data-social-alt]').forEach(img=>{img.alt=fr?img.dataset.fr:img.dataset.en;});
 const playing=new Set();
 let busy=false,signature='',visibility=null,started=false,reels=[];
 const hoverAllowed=()=>matchMedia('(hover: hover) and (pointer: fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!navigator.connection?.saveData;
 function stopPreviews(){for(const state of playing)stop(state);}
 const profileDoor=mount.querySelector('.social-profile-door')?.cloneNode(true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPreviews();else if(started)load();});
 matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',stopPreviews);
 navigator.connection?.addEventListener?.('change',stopPreviews);
 matchMedia('(max-width: 680px)').addEventListener('change',stopPreviews);
 function stop(state){if(!playing.has(state))return;playing.delete(state);state.attempt=(state.attempt||0)+1;state.video.pause();state.tile.classList.remove('is-previewing');state.button.setAttribute('aria-pressed','false');state.button.setAttribute('aria-label',t('Play reel preview','Lire l’aperçu du reel'));state.button.textContent='▶';}
 async function start(state,mode){
  if(playing.has(state))return;playing.add(state);state.mode=mode;const attempt=state.attempt=(state.attempt||0)+1;
  const {video,tile,button}=state;if(!video.src)video.src=video.dataset.src;
  try{await video.play();if(state.attempt!==attempt||!playing.has(state))return;tile.classList.add('is-previewing');button.textContent='Ⅱ';button.setAttribute('aria-pressed','true');button.setAttribute('aria-label',t('Pause reel preview','Mettre l’aperçu en pause'));}
  catch{if(state.attempt!==attempt)return;stop(state);}
 }
 async function load(){
  if(busy||playing.size||mount.contains(document.activeElement))return;busy=true;
  try{
   const response=await fetch('/api/instagram',{cache:'no-cache'});if(!response.ok)return;const feed=await response.json();if(feed.username!=='justb.naturals'||!feed.posts?.length)return;
   const nextSignature=JSON.stringify(feed.posts);if(nextSignature===signature)return;
   const posts=galleryPosts(feed.posts);
   const fragment=document.createDocumentFragment();let tiles=[],nextReels=[];
   for(const post of posts){
    const local=LOCAL_POSTS.includes(post);
    if(!local&&(!/^\d+$/.test(post.id)||!post.image?.startsWith('/api/instagram/media?')))continue;
    const href=new URL(post.permalink);if(href.origin!=='https://www.instagram.com')continue;
    const tile=document.createElement('article');tile.className='social-tile social-live-tile';
    const link=document.createElement('a');link.className='social-live-link';link.href=href.href;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',t('Open Instagram post: ','Ouvrir la publication Instagram : ')+(post.caption||'@justb.naturals').slice(0,100));
    const img=document.createElement('img');img.src=post.image;img.width=700;img.height=900;img.loading='lazy';img.decoding='async';img.alt=post.alt||t('From @justb.naturals on Instagram','Sur le compte Instagram @justb.naturals');link.append(img);
    const overlay=document.createElement('span');overlay.className='social-tile-overlay';const caption=document.createElement('span');caption.className='social-tile-caption';caption.textContent=post.caption?.split('\n').find(line=>line.trim())?.slice(0,110)||'@justb.naturals';const hint=document.createElement('span');hint.className='social-tile-hint';hint.textContent=t('View on Instagram ↗','Voir sur Instagram ↗');overlay.append(caption,hint);link.append(overlay);tile.append(link);
    if(post.type==='VIDEO'&&post.video?.startsWith('/api/instagram/media?')){
     tile.classList.add('is-reel');const video=document.createElement('video');video.className='social-hover-video';video.dataset.src=post.video;video.muted=true;video.loop=true;video.playsInline=true;video.preload='none';video.setAttribute('muted','');video.setAttribute('playsinline','');video.setAttribute('aria-hidden','true');link.insertBefore(video,overlay);
     const button=document.createElement('button');button.type='button';button.className='social-play-toggle';button.textContent='▶';button.setAttribute('aria-label',t('Play reel preview','Lire l’aperçu du reel'));button.setAttribute('aria-pressed','false');tile.append(button);const state={tile,video,button};
     nextReels.push(state);
     button.addEventListener('click',()=>{if(playing.has(state)){state.userPaused=true;stop(state);}else{state.userPaused=false;state.blockedAuto=false;start(state,'manual');}});
     tile.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&hoverAllowed()&&!state.userPaused)start(state,'hover');});
     tile.addEventListener('pointerleave',()=>{if(state.mode==='hover')stop(state);state.userPaused=false;});
    }
    fragment.append(tile);tiles.push(tile);
   }
   if(!tiles.length)return;
   // Verify the replacement photos before removing the working fallback gallery.
   const photos=(matchMedia('(max-width: 680px)').matches?tiles.slice(0,6):tiles).map(tile=>tile.querySelector('img'));photos.forEach(img=>{img.loading='eager';});
   await Promise.race([Promise.all(photos.map(img=>img.decode())),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Photo timeout')),15000))]);
   if(playing.size||mount.contains(document.activeElement))return;
   if(profileDoor&&tiles.length<9)fragment.append(profileDoor.cloneNode(true));visibility?.disconnect();mount.replaceChildren(fragment);mount.dataset.connected='true';signature=nextSignature;reels=nextReels;
   if(typeof IntersectionObserver!=='undefined'){visibility=new IntersectionObserver(entries=>{for(const e of entries){const state=reels.find(s=>s.tile===e.target);if(state&&!e.isIntersecting){stop(state);state.userPaused=false;}}});tiles.forEach(tile=>visibility.observe(tile));}
  }catch{/* Preserve the original local gallery on feed failures. */}finally{busy=false;}
 }
 function begin(){if(started)return;started=true;load();setInterval(()=>{const box=mount.getBoundingClientRect();if(!document.hidden&&box.bottom>0&&box.top<innerHeight+300)load();},300000);}
 if(typeof IntersectionObserver==='undefined')begin();else{const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();begin();}},{rootMargin:'300px'});observer.observe(mount);}
}
