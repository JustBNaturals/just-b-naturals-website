import {priceOrder} from './promotion.js';
import {FREE_DELIVERY_THRESHOLD_CENTS} from './delivery.js';
// Deterministic product matching, using current inventory only. No profiling or invented popularity.
export function cartSuggestions(products,records,cart,config,families,now=new Date()){
 const inventory=new Map(records.map(r=>[r.id,r])),ids=new Set(cart.map(i=>i.id));
 const lines=cart.flatMap(i=>{const r=inventory.get(i.id);return r&&Number.isInteger(r.priceCents)?[{...i,priceCents:r.priceCents}]:[]});
 const pricing=priceOrder(lines,config,now);
 if(!cart.length||lines.length!==cart.length)return {items:[],pricing,remaining:null};
 const chosen=products.filter(p=>ids.has(p.id)),tags=new Set(chosen.flatMap(families));
 const gentle=chosen.length>0&&chosen.every(p=>families(p).includes('unscented'));
 const pair=pricing.active&&pricing.eligibleQuantity%2===1;
 const candidates=products.filter(p=>{const r=inventory.get(p.id);return !ids.has(p.id)&&r&&r.active!==false&&r.availabilityStatus!=='preorder'&&r.availabilityStatus!=='unavailable'&&(r.stock===null||Number.isInteger(r.stock)&&r.stock>0)&&Number.isInteger(r.priceCents)&&r.priceCents>=0&&(!gentle||families(p).includes('unscented'));}).map(p=>{
  const overlap=families(p).filter(tag=>tags.has(tag)).length;
  const soap=p.category==='artisan-soap';
  const score=(pair&&soap?100:0)+overlap*5+(!pair&&chosen.some(c=>c.category==='artisan-soap')&&p.category==='body-care'?15:0)+(!chosen.some(c=>c.category===p.category)?3:0);
  return {product:p,priceCents:inventory.get(p.id).priceCents,score,completesPair:pair&&soap};
 }).sort((a,b)=>b.score-a.score||a.priceCents-b.priceCents||a.product.id.localeCompare(b.product.id)).slice(0,2);
 return {items:candidates,pricing,remaining:Math.max(0,FREE_DELIVERY_THRESHOLD_CENTS-pricing.itemSubtotalCents)};
}
