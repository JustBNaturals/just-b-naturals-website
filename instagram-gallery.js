// Keep the local gallery as a fallback. Load connected media only near this section.
export function initializeInstagramGallery(){
 const mount=document.querySelector('[data-instagram-gallery]');if(!mount)return;
 const fr=new URLSearchParams(location.search).get('lang')==='fr',t=(en,french)=>fr?french:en;
 mount.querySelectorAll('[data-social-alt]').forEach(img=>{img.alt=fr?img.dataset.fr:img.dataset.en;});
 let active=null;
 function stop(){if(!active)return;active.video.pause();active.tile.classList.remove('is-previewing');active.button.setAttribute('aria-pressed','false');active.button.setAttribute('aria-label',t('Play reel preview','Lire l’aperçu du reel'));active.button.textContent='▶';active=null;}
 async function start(state,mode){stop();active={...state,mode};const {video,tile,button}=state;if(!video.src)video.src=video.dataset.src;try{await video.play();if(active?.video!==video){video.pause();return;}tile.classList.add('is-previewing');button.textContent='Ⅱ';button.setAttribute('aria-pressed','true');button.setAttribute('aria-label',t('Pause reel preview','Mettre l’aperçu en pause'));}catch{if(active?.video===video)stop();}}
 async function load(){
  try{
   const response=await fetch('/api/instagram');if(!response.ok)return;const feed=await response.json();if(feed.username!=='justb.naturals'||!feed.posts?.length)return;
   const fragment=document.createDocumentFragment();let tiles=[];
   for(const post of feed.posts.slice(0,6)){
    if(!/^\d+$/.test(post.id)||!post.image?.startsWith('/api/instagram/media?'))continue;
    const href=new URL(post.permalink);if(href.origin!=='https://www.instagram.com')continue;
    const tile=document.createElement('article');tile.className='social-tile social-live-tile';
    const link=document.createElement('a');link.className='social-live-link';link.href=href.href;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',t('Open Instagram post: ','Ouvrir la publication Instagram : ')+(post.caption||'@justb.naturals').slice(0,100));
    const img=document.createElement('img');img.src=post.image;img.width=700;img.height=900;img.loading='lazy';img.decoding='async';img.alt=post.alt||t('From @justb.naturals on Instagram','Sur le compte Instagram @justb.naturals');link.append(img);
    const overlay=document.createElement('span');overlay.className='social-tile-overlay';const caption=document.createElement('span');caption.className='social-tile-caption';caption.textContent=post.caption?.split('\n').find(line=>line.trim())?.slice(0,110)||'@justb.naturals';const hint=document.createElement('span');hint.className='social-tile-hint';hint.textContent=t('View on Instagram ↗','Voir sur Instagram ↗');overlay.append(caption,hint);link.append(overlay);tile.append(link);
    if(post.type==='VIDEO'&&post.video?.startsWith('/api/instagram/media?')){
     tile.classList.add('is-reel');const video=document.createElement('video');video.className='social-hover-video';video.dataset.src=post.video;video.muted=true;video.loop=true;video.playsInline=true;video.preload='none';video.setAttribute('muted','');video.setAttribute('aria-hidden','true');link.insertBefore(video,overlay);
     const button=document.createElement('button');button.type='button';button.className='social-play-toggle';button.textContent='▶';button.setAttribute('aria-label',t('Play reel preview','Lire l’aperçu du reel'));button.setAttribute('aria-pressed','false');tile.append(button);const state={tile,video,button};
     button.addEventListener('click',()=>active?.video===video?stop():start(state,'manual'));
     tile.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&matchMedia('(hover: hover) and (pointer: fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!navigator.connection?.saveData)start(state,'hover');});
     tile.addEventListener('pointerleave',()=>{if(active?.video===video&&active.mode==='hover')stop();});
    }
    fragment.append(tile);tiles.push(tile);
   }
   if(!tiles.length)return;
   // Verify the replacement photos before removing the working fallback gallery.
   const photos=tiles.map(tile=>tile.querySelector('img'));photos.forEach(img=>{img.loading='eager';});
   await Promise.race([Promise.all(photos.map(img=>img.decode())),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Photo timeout')),15000))]);
   const more=mount.querySelector('.social-profile-door');if(more&&tiles.length<6)fragment.append(more.cloneNode(true));mount.replaceChildren(fragment);mount.dataset.connected='true';
   const note=document.querySelector('.social-source-note');if(note)note.textContent=t('Fresh from @justb.naturals. Hover to preview reels, or tap ▶.','Du nouveau chez @justb.naturals. Survolez les reels ou touchez ▶.');
   if(typeof IntersectionObserver!=='undefined'){const visibility=new IntersectionObserver(entries=>{for(const e of entries)if(!e.isIntersecting&&active?.tile===e.target)stop();});tiles.forEach(tile=>visibility.observe(tile));}
   document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  }catch{/* Preserve the original local gallery on feed failures. */}
 }
 if(typeof IntersectionObserver==='undefined')load();else{const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();load();}},{rootMargin:'300px'});observer.observe(mount);}
}
