// Keep the local gallery as a fallback. Load connected media only near this section.
// Verified Instagram reels omitted by the provider. These are real covers, not playable videos.
// Connected copies take precedence, so a newly available video replaces this cover automatically.
const LOCAL_POSTS=[
 {id:'local-new-labels',permalink:'https://www.instagram.com/reel/De7uQEZRIKH/',image:'/images/instagram/new-labels-20261026.jpg',type:'IMAGE',video:null,timestamp:'2026-10-25',caption:'Freshly cured soaps and crisp new labels — now available',alt:'Just B Natural artisan soaps with their new bilingual kraft paper labels on a wooden display'},
 {id:'local-maple-chai',permalink:'https://www.instagram.com/reel/DekMYRiNu_z/',image:'/images/instagram/maple-chai-cover.webp',type:'IMAGE',video:null,timestamp:'2026-10-16',caption:'Pour and cut of Maple Chai 🍁🫖',alt:'Maple Chai artisan soap from @justb.naturals on Instagram'},
 {id:'local-cozy',permalink:'https://www.instagram.com/reel/Dd4j-BBtVi9/',image:'/images/instagram/cozy-reel-cover.webp',type:'IMAGE',video:null,timestamp:'2026-09-29T20:11:41Z',caption:'Cozy 🪵☕️',alt:'Cozy artisan soap making reel from @justb.naturals on Instagram'},
 {id:'local-boreal',permalink:'https://www.instagram.com/reel/Dd2TW0fOzcD/',image:'/images/instagram/boreal-reel-cover.webp',type:'IMAGE',video:null,timestamp:'2026-09-28T22:54:31Z',caption:'Winter is coming — Boréal',alt:'Blue and cream Boréal artisan soap making reel from @justb.naturals on Instagram'}
];
export function galleryPosts(connected){
 const seen=new Set();
 return [...connected,...LOCAL_POSTS].filter(post=>{const key=post.permalink?.split('/').filter(Boolean).at(-1);if(!key||seen.has(key))return false;seen.add(key);return true;}).sort((a,b)=>(Date.parse(b.timestamp)||0)-(Date.parse(a.timestamp)||0)).slice(0,9);
}
// The same visibility lifecycle is used for mouse, touch and keyboard users.
// Keep play() in the user-gesture call stack for browsers that block autoplay.
export function reelPlayback(states,{allowed,hidden,visible,onChange=()=>{}}){
 function stop(state){state.attempt=(state.attempt||0)+1;state.requested=false;state.video.pause();state.tile.classList.remove('is-previewing');state.button.setAttribute('aria-pressed','false');onChange(state,false);}
 function start(state,manual=false){
  if(state.requested||hidden()||!visible(state)||(!manual&&(!allowed()||state.userPaused||state.blockedAuto)))return;
  state.requested=true;const attempt=state.attempt=(state.attempt||0)+1;
  state.video.muted=true;state.video.defaultMuted=true;
  if(!state.video.src)state.video.src=state.video.dataset.src;
  Promise.resolve(state.video.play()).then(()=>{
   if(state.attempt!==attempt||!state.requested)return;
   state.tile.classList.add('is-previewing');state.button.setAttribute('aria-pressed','true');state.tile.classList.remove('needs-play');onChange(state,true);
  }).catch(()=>{if(state.attempt!==attempt)return;stop(state);state.blockedAuto=true;state.tile.classList.add('needs-play');});
 }
 return {
  sync(){for(const state of states){if(hidden()||!visible(state)||!allowed()){stop(state);}else start(state);}},
  intersection(state,ratio){state.ratio=ratio;if(ratio>=.35)start(state);else{stop(state);if(!ratio){state.userPaused=false;state.blockedAuto=false;}}},
  toggle(state){if(state.requested){state.userPaused=true;stop(state);}else{state.userPaused=false;state.blockedAuto=false;start(state,true);}},
  stop(){states.forEach(stop);}
 };
}
export function initializeInstagramGallery(){
 const mount=document.querySelector('[data-instagram-gallery]');if(!mount)return;
 const fr=new URLSearchParams(location.search).get('lang')==='fr',t=(en,french)=>fr?french:en;
 mount.querySelectorAll('[data-social-alt]').forEach(img=>{img.alt=fr?img.dataset.fr:img.dataset.en;});
 let busy=false,signature='',visibility=null,started=false,reels=[],playback=null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width: 680px)');
 let motionPaused=false;
 const autoAllowed=()=>!motionPaused&&!reduced.matches&&!navigator.connection?.saveData;
 const visible=state=>(state.ratio||0)>=.35&&state.tile.isConnected&&state.tile.getClientRects().length>0;
 function stopPreviews(){playback?.stop();}
 const profileDoor=mount.querySelector('.social-profile-door')?.cloneNode(true);
 const motionButton=document.createElement('button');motionButton.type='button';motionButton.className='social-motion-toggle';motionButton.hidden=true;motionButton.textContent=t('Pause video previews','Mettre les aperçus en pause');motionButton.setAttribute('aria-pressed','false');mount.after(motionButton);
 motionButton.addEventListener('click',()=>{motionPaused=!motionPaused;motionButton.setAttribute('aria-pressed',String(motionPaused));motionButton.textContent=motionPaused?t('Play video previews','Lire les aperçus vidéo'):t('Pause video previews','Mettre les aperçus en pause');for(const state of reels){state.userPaused=false;state.blockedAuto=false;}playback?.sync();});
 document.addEventListener('visibilitychange',()=>{playback?.sync();if(!document.hidden&&started)load();});
 addEventListener('pagehide',stopPreviews);
 addEventListener('pageshow',()=>playback?.sync());
 reduced.addEventListener('change',()=>playback?.sync());
 navigator.connection?.addEventListener?.('change',()=>playback?.sync());
 mobile.addEventListener('change',()=>playback?.sync());
 // Older browsers without IntersectionObserver still get viewport playback.
 function measure(){if(typeof IntersectionObserver!=='undefined')return;for(const state of reels){const b=state.tile.getBoundingClientRect();playback?.intersection(state,b.height?Math.max(0,Math.min(b.bottom,innerHeight)-Math.max(b.top,0))/b.height:0);}}
 addEventListener('scroll',measure,{passive:true});addEventListener('resize',measure,{passive:true});
 async function load(){
  if(busy||document.hidden)return;busy=true;
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
     tile.classList.add('is-reel');const video=document.createElement('video');video.className='social-hover-video';video.dataset.src=post.video;video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;video.preload='none';video.poster=post.image;video.setAttribute('muted','');video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');video.setAttribute('aria-hidden','true');link.insertBefore(video,overlay);
     const button=document.createElement('button');button.type='button';button.className='social-play-toggle';button.textContent='▶';button.setAttribute('aria-label',t('Play reel preview','Lire l’aperçu du reel'));button.setAttribute('aria-pressed','false');tile.append(button);const state={tile,video,button};
     nextReels.push(state);
     button.addEventListener('click',()=>playback?.toggle(state));
     video.addEventListener('error',()=>{state.blockedAuto=true;state.tile.classList.add('needs-play');state.requested=false;state.tile.classList.remove('is-previewing');button.setAttribute('aria-pressed','false');});
    }
    fragment.append(tile);tiles.push(tile);
   }
   if(!tiles.length)return;
   // Verify the replacement photos before removing the working fallback gallery.
   const photos=(matchMedia('(max-width: 680px)').matches?tiles.slice(0,6):tiles).map(tile=>tile.querySelector('img'));photos.forEach(img=>{img.loading='eager';});
   const results=await Promise.all(photos.map(img=>new Promise(resolve=>{const timer=setTimeout(()=>resolve(false),10000);img.decode().then(()=>{clearTimeout(timer);resolve(true);},()=>{clearTimeout(timer);resolve(false);});})));
   // A broken provider photo must not prevent the other reels from loading.
   results.forEach((ok,i)=>{if(!ok){const tile=photos[i].closest('.social-tile');tile.remove();tiles=tiles.filter(t=>t!==tile);nextReels=nextReels.filter(s=>s.tile!==tile);}});
   if(!tiles.length||mount.contains(document.activeElement))return;
   if(profileDoor&&tiles.length<9)fragment.append(profileDoor.cloneNode(true));visibility?.disconnect();stopPreviews();mount.replaceChildren(fragment);mount.dataset.connected='true';signature=nextSignature;reels=nextReels;
   motionButton.hidden=!reels.length;
   playback=reelPlayback(reels,{allowed:autoAllowed,hidden:()=>document.hidden,visible,onChange(state,isPlaying){state.button.textContent=isPlaying?'Ⅱ':'▶';state.button.setAttribute('aria-label',isPlaying?t('Pause reel preview','Mettre l’aperçu en pause'):t('Play reel preview','Lire l’aperçu du reel'));}});
   if(typeof IntersectionObserver!=='undefined'){visibility=new IntersectionObserver(entries=>{for(const e of entries){const state=reels.find(s=>s.tile===e.target);if(state)playback.intersection(state,e.isIntersecting?e.intersectionRatio:0);}},{threshold:[0,.1,.35,.6,1]});reels.forEach(state=>visibility.observe(state.tile));}else measure();
  }catch{/* Preserve the original local gallery on feed failures. */}finally{busy=false;}
 }
 function begin(){if(started)return;started=true;load();setInterval(()=>{const box=mount.getBoundingClientRect();if(!document.hidden&&box.bottom>0&&box.top<innerHeight+300)load();},300000);}
 if(typeof IntersectionObserver==='undefined')begin();else{const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();begin();}},{rootMargin:'300px'});observer.observe(mount);}
}
