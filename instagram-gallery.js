// Keep the local gallery as a fallback. Load connected media only near this section.
export function chooseMobileReel(states,current){
 const visible=states.filter(s=>s.ratio>=0.55&&!s.userPaused&&!s.blockedAuto);
 return visible.find(s=>s.video===current)||visible.sort((a,b)=>b.ratio-a.ratio)[0]||null;
}
export function initializeInstagramGallery(){
 const mount=document.querySelector('[data-instagram-gallery]');if(!mount)return;
 const fr=new URLSearchParams(location.search).get('lang')==='fr',t=(en,french)=>fr?french:en;
 mount.querySelectorAll('[data-social-alt]').forEach(img=>{img.alt=fr?img.dataset.fr:img.dataset.en;});
 let active=null,busy=false,signature='',visibility=null,started=false,reels=[];
 const mobileAutoplay=()=>matchMedia('(hover: none) and (pointer: coarse)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!navigator.connection?.saveData;
 function updateMobile(){if(document.hidden||!mobileAutoplay())return;const next=chooseMobileReel(reels,active?.video);if(next&&active?.video!==next.video)start(next,'mobile');else if(!next&&active?.mode==='mobile')stop();}
 const profileDoor=mount.querySelector('.social-profile-door')?.cloneNode(true);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(started){load();updateMobile();}});
 function stop(){if(!active)return;active.video.pause();active.tile.classList.remove('is-previewing');active.button.setAttribute('aria-pressed','false');active.button.setAttribute('aria-label',t('Play reel preview','Lire l’aperçu du reel'));active.button.textContent='▶';active=null;}
 async function start(state,mode){stop();active={...state,mode};const {video,tile,button}=state;if(!video.src)video.src=video.dataset.src;try{await video.play();if(active?.video!==video){video.pause();return;}tile.classList.add('is-previewing');button.textContent='Ⅱ';button.setAttribute('aria-pressed','true');button.setAttribute('aria-label',t('Pause reel preview','Mettre l’aperçu en pause'));}catch{if(mode==='mobile')state.blockedAuto=true;if(active?.video===video)stop();}}
 async function load(){
  if(busy||active||mount.contains(document.activeElement))return;busy=true;
  try{
   const response=await fetch('/api/instagram',{cache:'no-cache'});if(!response.ok)return;const feed=await response.json();if(feed.username!=='justb.naturals'||!feed.posts?.length)return;
   const nextSignature=JSON.stringify(feed.posts);if(nextSignature===signature)return;
   const fragment=document.createDocumentFragment();let tiles=[],nextReels=[];
   for(const post of feed.posts.slice(0,6)){
    if(!/^\d+$/.test(post.id)||!post.image?.startsWith('/api/instagram/media?'))continue;
    const href=new URL(post.permalink);if(href.origin!=='https://www.instagram.com')continue;
    const tile=document.createElement('article');tile.className='social-tile social-live-tile';
    const link=document.createElement('a');link.className='social-live-link';link.href=href.href;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',t('Open Instagram post: ','Ouvrir la publication Instagram : ')+(post.caption||'@justb.naturals').slice(0,100));
    const img=document.createElement('img');img.src=post.image;img.width=700;img.height=900;img.loading='lazy';img.decoding='async';img.alt=post.alt||t('From @justb.naturals on Instagram','Sur le compte Instagram @justb.naturals');link.append(img);
    const overlay=document.createElement('span');overlay.className='social-tile-overlay';const caption=document.createElement('span');caption.className='social-tile-caption';caption.textContent=post.caption?.split('\n').find(line=>line.trim())?.slice(0,110)||'@justb.naturals';const hint=document.createElement('span');hint.className='social-tile-hint';hint.textContent=t('View on Instagram ↗','Voir sur Instagram ↗');overlay.append(caption,hint);link.append(overlay);tile.append(link);
    if(post.type==='VIDEO'&&post.video?.startsWith('/api/instagram/media?')){
     tile.classList.add('is-reel');const video=document.createElement('video');video.className='social-hover-video';video.dataset.src=post.video;video.muted=true;video.loop=true;video.playsInline=true;video.preload='none';video.setAttribute('muted','');video.setAttribute('playsinline','');video.setAttribute('aria-hidden','true');link.insertBefore(video,overlay);
     const button=document.createElement('button');button.type='button';button.className='social-play-toggle';button.textContent='▶';button.setAttribute('aria-label',t('Play reel preview','Lire l’aperçu du reel'));button.setAttribute('aria-pressed','false');tile.append(button);const state={tile,video,button};
     nextReels.push(state);
     button.addEventListener('click',()=>{if(active?.video===video){state.userPaused=true;stop();}else{state.userPaused=false;state.blockedAuto=false;start(state,'manual');}});
     tile.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&matchMedia('(hover: hover) and (pointer: fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!navigator.connection?.saveData)start(state,'hover');});
     tile.addEventListener('pointerleave',()=>{if(active?.video===video&&active.mode==='hover')stop();});
    }
    fragment.append(tile);tiles.push(tile);
   }
   if(!tiles.length)return;
   // Verify the replacement photos before removing the working fallback gallery.
   const photos=tiles.map(tile=>tile.querySelector('img'));photos.forEach(img=>{img.loading='eager';});
   await Promise.race([Promise.all(photos.map(img=>img.decode())),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Photo timeout')),15000))]);
   if(active||mount.contains(document.activeElement))return;
   if(profileDoor&&tiles.length<6)fragment.append(profileDoor.cloneNode(true));visibility?.disconnect();mount.replaceChildren(fragment);mount.dataset.connected='true';signature=nextSignature;reels=nextReels;
   if(typeof IntersectionObserver!=='undefined'){visibility=new IntersectionObserver(entries=>{for(const e of entries){const state=reels.find(s=>s.tile===e.target);if(state){state.ratio=e.isIntersecting?e.intersectionRatio:0;if(!e.isIntersecting){state.userPaused=false;state.blockedAuto=false;}}if(!e.isIntersecting&&active?.tile===e.target)stop();}updateMobile();},{threshold:[0,0.25,0.55,0.75,1]});tiles.forEach(tile=>visibility.observe(tile));}
  }catch{/* Preserve the original local gallery on feed failures. */}finally{busy=false;}
 }
 function begin(){if(started)return;started=true;load();setInterval(()=>{const box=mount.getBoundingClientRect();if(!document.hidden&&box.bottom>0&&box.top<innerHeight+300)load();},300000);}
 if(typeof IntersectionObserver==='undefined')begin();else{const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();begin();}},{rootMargin:'300px'});observer.observe(mount);}
}
