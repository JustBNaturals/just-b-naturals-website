import {priceOrder} from './promotion.js';
import {cartSuggestions} from './recommendations.js';
export function scentFamilies(product){
 if(product.scentFamilies)return product.scentFamilies;
 const text=[product.name,...(product.ingredients||[])].join(' ').toLowerCase();
 if(/unscented|sans parfum/.test(text))return ['unscented'];
 const tags=[];
 if(/lavender|lavande|geranium|géranium|ylang|chamomile|camomille|\brose\b/.test(text))tags.push('floral');
 if(/lemon|citron|citrus|bergamot|orange|mint|menthe|eucalyptus|eucalypt/.test(text))tags.push('fresh');
 if(/cedar|cèdre|patchouli|rosemary|romarin|sage|sauge|frankincense|encens/.test(text))tags.push('woodsy');
 if(/vanilla|vanille|cinnamon|cannelle|coffee|café|espresso|clove|girofle/.test(text))tags.push('warm');
 return tags;
}
const escape=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function initializeGrowth(api){
 const {products,t,language}=api;let inventory=new Map(),inventoryReady=false,storefront=null;
 const format=cents=>new Intl.NumberFormat(language==='fr'?'fr-CA':'en-CA',{style:'currency',currency:'CAD'}).format(cents/100);
 const available=p=>inventoryReady&&inventory.has(p.id)&&p.active!==false&&p.availabilityStatus!=='preorder'&&p.availabilityStatus!=='unavailable'&&p.stock!==0&&Number.isInteger(inventory.get(p.id).priceCents);
 let statisticsEnabled=true;try{statisticsEnabled=localStorage.getItem('jbn-usage-optout')!=='1';}catch(_){}
 function track(event,productId=''){
  if(!statisticsEnabled||navigator.doNotTrack==='1'||navigator.globalPrivacyControl||document.body.classList.contains('inventory-page'))return;
  const utm=new URLSearchParams(location.search).get('utm_source')||'';let source=/brevo|email/i.test(utm)?'email':/instagram/i.test(utm)?'instagram':utm?'other':'direct';
  if(!utm&&document.referrer){try{const host=new URL(document.referrer).hostname;if(/instagram/.test(host))source='instagram';else if(/google\./.test(host))source='google';else if(host!==location.hostname)source='other';}catch(_){}}
  fetch('/api/metrics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event,productId,source}),keepalive:true}).catch(()=>{});
 }
 track('page_view');if(document.body.dataset.productId)track('product_view',document.body.dataset.productId);
 if(document.querySelector('[data-checkout]'))track('checkout_start');
 document.addEventListener('jbn:cart-add',event=>track('add_to_cart',event.detail.id));document.addEventListener('jbn:signup',()=>track('signup'));
 if(document.body.dataset.page==='privacy'){
  const section=document.createElement('section');section.className='usage-preferences';section.innerHTML=`<h2>${t('Anonymous usage counts','Statistiques anonymes')}</h2><p>${t('We count page views and shopping actions to improve the store. These counts do not contain your name, email, IP address or a visitor identifier, and do not use tracking cookies. They are action counts, not unique visitor counts. Your browser’s privacy signal is respected.','Nous comptons les visites de pages et les actions d’achat pour améliorer la boutique. Aucun nom, courriel, adresse IP ou identifiant de visiteur n’est enregistré dans ces statistiques. Aucun témoin de suivi n’est utilisé. Il s’agit de nombres d’actions, pas de visiteurs uniques. Le signal de confidentialité du navigateur est respecté.')}</p><label><input type="checkbox" data-usage-choice ${statisticsEnabled?'checked':''}> ${t('Allow anonymous usage counts on this device','Permettre les statistiques anonymes sur cet appareil')}</label><h2>${t('Order fulfillment records','Dossiers de commande')}</h2><p>${t('Contact and delivery details used in the private order manager are deleted after 90 days by a daily cleanup. Transactional emails and non-identifying order totals may be retained separately for business records.','Les coordonnées utilisées dans le gestionnaire privé sont supprimées après 90 jours lors d’un nettoyage quotidien. Les courriels transactionnels et les totaux sans coordonnées peuvent être conservés séparément pour les dossiers de l’entreprise.')}</p>`;document.querySelector('main').append(section);
  section.querySelector('input').addEventListener('change',e=>{statisticsEnabled=e.target.checked;try{localStorage.setItem('jbn-usage-optout',statisticsEnabled?'0':'1');}catch(_){}});
 }
 // A useful, compact scent selector. Existing search, category and sort controls still apply.
 const search=document.querySelector('[data-product-search]');
 if(search){const controls=document.createElement('div');controls.className='scent-filter';controls.setAttribute('role','group');controls.setAttribute('aria-label',t('Shop by scent','Magasiner par parfum'));controls.innerHTML=`<span>${t('Find your scent','Trouvez votre parfum')}</span>`+[['all','All scents','Tous les parfums'],['fresh','Fresh','Frais'],['floral','Floral','Floral'],['woodsy','Woodsy','Boisé'],['warm','Warm','Chaleureux'],['unscented','Unscented','Sans parfum']].map(([key,en,fr])=>`<button type="button" data-scent="${key}" aria-pressed="${key==='all'}">${t(en,fr)}</button>`).join('');
  const grid=document.querySelector('[data-catalog="all"],[data-category]');grid?.before(controls);
  controls.addEventListener('click',e=>{const b=e.target.closest('[data-scent]');if(!b)return;document.body.dataset.scent=b.dataset.scent;controls.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));search.dispatchEvent(new Event('input'));});
 }
 const recommendations=document.querySelector('[data-cart-suggestions]');
 let recommendationKey='';
 function renderSuggestions(){
  if(!recommendations)return;
  const state=cartSuggestions(products,[...inventory.values()],api.cart(),api.config(),scentFamilies);
  const key=JSON.stringify({ready:inventoryReady,items:state.items.map(i=>[i.product.id,i.priceCents,i.completesPair]),remaining:state.remaining,language});
  if(key===recommendationKey)return;recommendationKey=key;
  recommendations.hidden=!inventoryReady||!api.cart().length;
  if(recommendations.hidden){recommendations.innerHTML='';return;}
  const delivery=state.remaining===null?'':`<p class="cart-delivery-progress">${state.remaining?t('You’re '+format(state.remaining)+' away from free local delivery.','Il vous manque '+format(state.remaining)+' pour la livraison locale gratuite.'):t('Your cart qualifies for free local delivery.','Votre panier est admissible à la livraison locale gratuite.')} <span>${t('Within 20 km of Aylmer.','Dans un rayon de 20 km d’Aylmer.')}</span></p>`;
  recommendations.innerHTML=delivery+(state.items.length?`<h3>${t('A little something to go with it','Pour accompagner votre choix')}</h3><div class="cart-suggestion-list">${state.items.map(item=>{const p=item.product;return `<article class="cart-suggestion"><a href="product-${encodeURIComponent(p.id)}.html${language==='fr'?'?lang=fr':''}"><img src="${escape(p.image)}" alt="${escape(p.name)}" width="64" height="64" loading="lazy"></a><div><a href="product-${encodeURIComponent(p.id)}.html${language==='fr'?'?lang=fr':''}">${escape(p.name)}</a><p>${format(item.priceCents)}${item.completesPair?' · '+t('Completes your soap pair','Complète votre duo de savons'):''}</p></div><button type="button" data-recommend-add="${p.id}" aria-label="${escape(t('Add '+p.name+' to cart','Ajouter '+p.name+' au panier'))}">${t('Add','Ajouter')} +</button></article>`;}).join('')}</div>`:'');
 }
 recommendations?.addEventListener('click',e=>{const button=e.target.closest('[data-recommend-add]');if(!button)return;const id=button.dataset.recommendAdd;const item=cartSuggestions(products,[...inventory.values()],api.cart(),api.config(),scentFamilies).items.find(i=>i.product.id===id);if(!item)return;if(api.add(id)){track('recommendation_added',id);document.querySelector('[data-order-drawer-title]')?.focus();}});
 const gifts=document.querySelector('[data-gift-sets]');
 function renderGifts(){
  if(!gifts)return;const sets=[{key:'duo',title:t('A soap duo','Un duo de savons'),categories:['artisan-soap','artisan-soap']},{key:'soft',title:t('Soap & a little softness','Savon et douceur'),categories:['artisan-soap','body-care']},{key:'ritual',title:t('An everyday ritual','Un rituel quotidien'),categories:['artisan-soap','sugar-scrubs']}];
  gifts.innerHTML=sets.map(set=>{const chosen=[];for(const category of set.categories){const p=products.find(p=>p.category===category&&available(p)&&!chosen.some(x=>x.id===p.id));if(p)chosen.push(p);}if(chosen.length!==set.categories.length)return '';
   const result=priceOrder(chosen.map(p=>({id:p.id,quantity:1,priceCents:inventory.get(p.id).priceCents})),api.config());return `<article class="gift-set"><div class="gift-set-images">${chosen.map(p=>`<a href="product-${encodeURIComponent(p.id)}.html"><img src="${escape(p.image)}" alt="${escape(p.name)}" loading="lazy"></a>`).join('')}</div><h2>${set.title}</h2><p>${chosen.map(p=>escape(p.name)).join(' + ')}</p><strong>${format(result.itemSubtotalCents)}</strong><button class="button button-dark" type="button" data-gift-add="${chosen.map(p=>p.id).join(',')}">${t('Add this combination','Ajouter cet ensemble')}</button><p role="status" data-gift-status></p></article>`;}).join('')||`<p>${t('New combinations will appear when products are available.','Les ensembles apparaîtront selon les produits disponibles.')}</p>`;
 }
 gifts?.addEventListener('click',e=>{const b=e.target.closest('[data-gift-add]');if(!b)return;const ids=b.dataset.giftAdd.split(',');const valid=ids.every(id=>{const p=products.find(p=>p.id===id);return available(p)&&(!Number.isInteger(p.stock)||p.stock>(api.cart().find(i=>i.id===id)?.quantity||0));});if(!valid){b.closest('article').querySelector('[data-gift-status]').textContent=t('Please check your cart quantities first.','Vérifiez les quantités au panier.');return;}ids.forEach(id=>api.add(id));track('gift_added');b.closest('article').querySelector('[data-gift-status]').textContent=t('Added to your cart.','Ajouté au panier.');});
 function addBuyingFacts(){
  const mount=document.querySelector('.product-detail-purchase');if(!mount)return;mount.querySelector('.buying-facts')?.remove();
  const p=products.find(p=>p.id===document.body.dataset.productId);const detail=storefront?.details?.find(d=>d.product_id===p?.id);const box=document.createElement('div');box.className='buying-facts';box.innerHTML=`${detail?.size_label?`<p><strong>${t('Size','Format')}:</strong> ${escape(detail.size_label)}</p>`:''}<p>${t('Handmade in Gatineau · Local pickup','Fait à Gatineau · Ramassage local')}</p><p>${t('$10 delivery within 20 km of Aylmer · Free from $75','Livraison à 10 $ dans un rayon de 20 km d’Aylmer · Gratuite dès 75 $')}</p><p>${t('Cash or e-transfer after your order is confirmed.','Comptant ou virement après confirmation de la commande.')}</p><a href="local-pickup.html${language==='fr'?'?lang=fr':''}">${t('Pickup & delivery details','Détails du ramassage et de la livraison')} →</a>`;mount.querySelector('.product-detail-add')?.after(box);
 }
 // Reuse the shop's permission-based reviews; these are shop-wide testimonials.
 if(document.querySelector('.product-detail-purchase,[data-catalog],[data-category]')&&!document.querySelector('[data-customer-reviews]')){
  const reviews=document.createElement('section');reviews.className='section shell';reviews.dataset.customerReviews='';reviews.hidden=true;
  const before=document.querySelector('.related-products');if(before)before.before(reviews);else document.querySelector('main')?.append(reviews);
 }
 let sticky=null;
 const purchase=document.querySelector('.product-detail-add');
 if(purchase&&typeof IntersectionObserver!=='undefined'){
  sticky=document.createElement('aside');sticky.className='mobile-purchase-bar';sticky.hidden=true;sticky.setAttribute('aria-label',t('Quick purchase','Achat rapide'));
  const p=products.find(p=>p.id===document.body.dataset.productId);
  if(p){sticky.innerHTML=`<div><strong>${escape(p.name)}</strong><span data-sticky-price></span></div><button class="button button-dark" type="button" data-add-order="${escape(p.id)}">${t('Add to cart','Ajouter au panier')} +</button><button class="button button-dark" type="button" data-notify-product="${escape(p.id)}" hidden>${t('Notify me','M’aviser')}</button>`;document.body.append(sticky);
   const observer=new IntersectionObserver(entries=>{const entry=entries[0];sticky.dataset.past=String(!entry.isIntersecting&&entry.boundingClientRect.top<0);refreshSticky();});observer.observe(purchase.parentElement);
  }
 }
 function refreshSticky(){
  if(!sticky)return;const p=products.find(p=>p.id===document.body.dataset.productId),record=inventory.get(p?.id);
  const soldOut=p&&(p.active===false||p.availabilityStatus==='unavailable'||(p.stock===0&&p.availabilityStatus!=='preorder'));
  sticky.hidden=!inventoryReady||!record||(!Number.isInteger(record.priceCents)&&!soldOut)||sticky.dataset.past!=='true';
  sticky.querySelector('[data-sticky-price]').textContent=Number.isInteger(record?.priceCents)?format(record.priceCents):'';
  const add=sticky.querySelector('[data-add-order]'),notify=sticky.querySelector('[data-notify-product]');add.hidden=!!soldOut;notify.hidden=!soldOut;
  add.textContent=p?.availabilityStatus==='preorder'?t('Preorder +','Précommander +'):t('Add to cart +','Ajouter au panier +');
 }
 function showReviews(){
  const mount=document.querySelector('[data-customer-reviews]');if(!mount||!storefront?.reviews?.length)return;
  const entries=storefront.reviews.filter(r=>language!=='fr'||r.quote_fr);if(!entries.length)return;mount.hidden=false;mount.innerHTML=`<p class="eyebrow">${t('From our customers','Les mots de nos clients')}</p><h2>${t('A few words from our customers.','Quelques mots de nos clients.')}</h2><div class="customer-review-grid">${entries.slice(0,3).map(r=>`<figure><blockquote>${escape(language==='fr'?r.quote_fr:r.quote_en)}</blockquote><figcaption>${escape(r.author)}</figcaption></figure>`).join('')}</div>`;
 }
 if(document.querySelector('.product-detail-purchase,[data-customer-reviews]'))fetch('/api/storefront',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(data=>{storefront=data;addBuyingFacts();showReviews();}).catch(()=>{});
 addBuyingFacts();
 return {track,refresh(){renderSuggestions();renderGifts();addBuyingFacts();refreshSticky();},setInventory(records){inventory=new Map(records.map(r=>[r.id,r]));inventoryReady=true;renderSuggestions();renderGifts();refreshSticky();}};
}
