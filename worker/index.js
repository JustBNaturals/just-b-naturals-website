import {secureResponse,boundedJsonRequest} from "./security.js";
import { businessRoute, ensureBusiness, recordMetric, changeOrderStatus } from "./business.js";
import { PRODUCT_SEO } from "../product-seo.js";
import { PRODUCT_NAMES } from "../product-names.js";
import { launchEmailHtml } from "../email-preview.js";
import { localDeliveryFee } from "../delivery.js";
import { CAMPAIGN_DEFAULTS, campaignConfig, priceOrder } from "../promotion.js";
const PRODUCT_CATALOG = PRODUCT_NAMES;
const BREVO_BASE="https://api.brevo.com/v3";
const GOOGLE_PLACES_BASE="https://places.googleapis.com/v1";
const GOOGLE_ROUTES_URL="https://routes.googleapis.com/directions/v2:computeRoutes";
const PHOTON_BASE="https://photon.komoot.io/api/";
const OSRM_BASE="https://router.project-osrm.org/route/v1/driving";

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}})}
function clean(value,max=300){return String(value||"").trim().slice(0,max)}
function validEmail(value){return String(value||"").length<=160&&/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(String(value||""))}
function validName(value){return /^[\p{L}][\p{L}\p{M}'’ -]{1,79}$/u.test(String(value||""))}
function validPhone(value){return !value||/^[0-9+() .-]{7,25}$/.test(String(value))}
function validArea(value){return !value||(String(value).length>=2&&String(value).length<=120)}
function escapeHtml(value){return String(value||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c])}

function money(cents){return `$${(Number(cents)/100).toFixed(2)} CAD`}

async function googleRequest(env,url,body,fieldMask){
  if(!env.GOOGLE_MAPS_API_KEY)throw new Error("Google address estimates are not connected yet.");
  const response=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","X-Goog-Api-Key":env.GOOGLE_MAPS_API_KEY,"X-Goog-FieldMask":fieldMask},body:JSON.stringify(body)});
  if(!response.ok)throw new Error(`Google Maps service error: ${response.status}`);
  return response.json();
}
async function photonSearch(query,limit=5){
  const url=new URL(PHOTON_BASE);url.searchParams.set("q",query);url.searchParams.set("limit",String(limit));url.searchParams.set("lang","en");url.searchParams.set("lat","45.4");url.searchParams.set("lon","-75.8");
  const response=await fetch(url,{headers:{"User-Agent":"Just B Natural local delivery estimator (justbnatural.ca)"}});
  if(!response.ok)throw new Error(`Address service error: ${response.status}`);
  return response.json();
}
function photonLabel(properties={}){
  const street=[properties.housenumber,properties.street||properties.name].filter(Boolean).join(" ");
  return [...new Set([street,properties.city||properties.locality||properties.district,properties.state,properties.postcode,"Canada"].filter(Boolean))].join(", ");
}
function osmCoordinates(placeId){const match=/^osm:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/.exec(placeId);return match?{lon:Number(match[1]),lat:Number(match[2])}:null}
async function calculateOpenDelivery(env,destination){
  const originAddress=clean(env.DELIVERY_ORIGIN_ADDRESS,220);
  if(!originAddress)throw new Error("Delivery origin is not configured.");
  const originResult=await photonSearch(originAddress,1),coordinates=originResult.features?.[0]?.geometry?.coordinates;
  if(!Array.isArray(coordinates)||coordinates.length<2)throw new Error("Delivery origin was not found.");
  const url=`${OSRM_BASE}/${coordinates[0]},${coordinates[1]};${destination.lon},${destination.lat}?overview=false&steps=false`;
  const response=await fetch(url,{headers:{"User-Agent":"Just B Natural local delivery estimator (justbnatural.ca)"}});
  if(!response.ok)throw new Error(`Routing service error: ${response.status}`);
  const result=await response.json(),route=result.routes?.[0],distanceMeters=Number(route?.distance);
  if(!Number.isFinite(distanceMeters)||distanceMeters<=0)throw new Error("No driving route was found.");
  return {distanceMeters,distanceKm:Math.round(distanceMeters/100)/10,duration:Number.isFinite(route.duration)?`${Math.round(route.duration)}s`:"",feeCents:localDeliveryFee(distanceMeters/1000,0),originLabel:"Aylmer"};
}
async function calculateDelivery(env,placeId){
  const openDestination=osmCoordinates(placeId);
  if(openDestination)return calculateOpenDelivery(env,openDestination);
  const originAddress=clean(env.DELIVERY_ORIGIN_ADDRESS,220);
  if(!originAddress)throw new Error("Delivery origin is not configured.");
  const result=await googleRequest(env,GOOGLE_ROUTES_URL,{origin:{address:originAddress},destination:{placeId},travelMode:"DRIVE",routingPreference:"TRAFFIC_UNAWARE",computeAlternativeRoutes:false,languageCode:"en-CA",units:"METRIC"},"routes.distanceMeters,routes.duration");
  const route=result.routes?.[0],distanceMeters=Number(route?.distanceMeters);
  if(!Number.isFinite(distanceMeters)||distanceMeters<=0)throw new Error("No driving route was found.");
  return {distanceMeters,distanceKm:Math.round(distanceMeters/100)/10,duration:clean(route.duration,30),feeCents:localDeliveryFee(distanceMeters/1000,0),originLabel:"Aylmer"};
}
async function handleDeliveryAutocomplete(request,env){
  try{
    const data=await request.json(),input=clean(data.input,160),sessionToken=clean(data.sessionToken,100);
    if(input.length<3)return json({predictions:[]});
    if(env.GOOGLE_MAPS_API_KEY){
      const result=await googleRequest(env,`${GOOGLE_PLACES_BASE}/places:autocomplete`,{input,includedRegionCodes:["ca"],languageCode:"en",regionCode:"CA",locationBias:{circle:{center:{latitude:45.4,longitude:-75.8},radius:50000}},...(sessionToken?{sessionToken}:{})},"suggestions.placePrediction.placeId,suggestions.placePrediction.text.text");
      const predictions=(result.suggestions||[]).map(item=>({placeId:clean(item.placePrediction?.placeId,300),text:clean(item.placePrediction?.text?.text,220)})).filter(item=>item.placeId&&item.text).slice(0,5);
      return json({predictions,provider:"Google"});
    }
    const result=await photonSearch(`${input}, Quebec, Canada`,6);
    const predictions=(result.features||[]).map(feature=>{const coordinates=feature.geometry?.coordinates,text=photonLabel(feature.properties);return Array.isArray(coordinates)&&text?{placeId:`osm:${coordinates[0]},${coordinates[1]}`,text}:null}).filter(Boolean).slice(0,5);
    return json({predictions,provider:"OpenStreetMap"});
  }catch(_){return json({error:"Address suggestions are temporarily unavailable. Enter the full address and the fee will be confirmed by email."},502)}
}
async function handleDeliveryEstimate(request,env){
  try{
    const data=await request.json(),placeId=clean(data.placeId,300),address=clean(data.address,220);
    if(!placeId)return json({error:"Please select a recognized address."},400);
    const estimate=await calculateDelivery(env,placeId);
    estimate.feeCents=localDeliveryFee(estimate.distanceKm,Number.isInteger(data.subtotalCents)&&data.subtotalCents>=0?data.subtotalCents:0);
    return json({address,...estimate});
  }catch(_){return json({error:"A driving-distance estimate could not be calculated for that address."},502)}
}

async function secureMatch(left,right){
  const encode=value=>new TextEncoder().encode(String(value||""));
  const [a,b]=await Promise.all([crypto.subtle.digest("SHA-256",encode(left)),crypto.subtle.digest("SHA-256",encode(right))]);
  const aa=new Uint8Array(a),bb=new Uint8Array(b);let difference=aa.length^bb.length;
  for(let index=0;index<aa.length;index++)difference|=aa[index]^bb[index];
  return difference===0;
}
async function inventoryAuthorized(request,env){
  if(!env.INVENTORY_ADMIN_KEY)return false;
  const supplied=request.headers.get("Authorization")?.replace(/^Bearer\s+/i,"")||"";
  return secureMatch(supplied,env.INVENTORY_ADMIN_KEY);
}

async function brevoRequest(env,path,body){
  if(!env.BREVO_API_KEY)throw new Error("Email service is not configured.");
  const response=await fetch(`${BREVO_BASE}${path}`,{method:"POST",headers:{"Content-Type":"application/json","api-key":env.BREVO_API_KEY},body:JSON.stringify(body)});
  if(!response.ok)throw new Error(`Email service error: ${response.status}`);
  return response.status===204?{}:response.json().catch(()=>({}));
}
function sendEmail(env,{to,toName,replyTo,subject,htmlContent}){
  const senderEmail=env.BREVO_SENDER_EMAIL||env.ORDER_EMAIL||"justbnaturalss@gmail.com";
  return brevoRequest(env,"/smtp/email",{sender:{name:env.BREVO_SENDER_NAME||"Just B Natural",email:senderEmail},to:[{email:to,name:toName||to}],...(replyTo?{replyTo:{email:replyTo.email,name:replyTo.name||replyTo.email}}:{}),subject,htmlContent});
}
function addSubscriber(env,email){const listId=Number(env.BREVO_LIST_ID);return brevoRequest(env,"/contacts",{email,updateEnabled:true,...(Number.isInteger(listId)&&listId>0?{listIds:[listId]}:{})})}
async function recordConsent(env,{email,consentText,consentedAt,source}){
  const orderEmail=env.ORDER_EMAIL||"justbnaturalss@gmail.com";
  const rows=[["Subscriber",email],["Date",consentedAt],["Source",source],["Consent shown",consentText]].map(([a,b])=>`<tr><th style="padding:8px;text-align:left">${escapeHtml(a)}</th><td style="padding:8px">${escapeHtml(b)}</td></tr>`).join("");
  return sendEmail(env,{to:orderEmail,toName:"Just B Natural",subject:`New promotional email consent — ${email}`,htmlContent:`<div style="font-family:Arial,sans-serif;color:#173329"><h1>New email subscriber</h1><table>${rows}</table></div>`});
}

function normalizeItems(items){
  if(!Array.isArray(items)||items.length>50)throw new Error("Invalid cart.");
  const grouped=new Map();
  for(const item of items){
    const id=clean(item?.id,100),name=PRODUCT_CATALOG[id],quantity=Number(item?.quantity);
    if(!name||!Number.isInteger(quantity)||quantity<1||quantity>99)throw new Error("Invalid cart item.");
    const total=(grouped.get(id)?.quantity||0)+quantity;
    if(total>99)throw new Error("Too many units of one product.");
    grouped.set(id,{id,name,quantity:total});
  }
  return [...grouped.values()];
}
async function attachInventory(env,items){
  if(!env.INVENTORY_DB||!items.length)return items;
  const marks=items.map(()=>"?").join(",");
  const result=await env.INVENTORY_DB.prepare(`SELECT product_id,stock_count,price_cents,is_active,availability_status,available_date FROM inventory WHERE product_id IN (${marks})`).bind(...items.map(i=>i.id)).all();
  const rows=new Map((result.results||[]).map(row=>[row.product_id,row]));
  return items.map(item=>{const row=rows.get(item.id)||{};return {...item,stock:row.stock_count??null,priceCents:row.price_cents??null,active:row.is_active!==0,availabilityStatus:row.availability_status||"available",availableDate:row.available_date||null}});
}
function orderHtml(order){
  const items=order.items.map(item=>`<li style="padding:8px 0">${escapeHtml(item.name)} × ${item.quantity}${Number.isInteger(item.priceCents)?` — $${(item.priceCents*item.quantity/100).toFixed(2)} CAD`:""}${item.availabilityStatus==="preorder"&&item.availableDate?` <strong>(preorder — expected ${escapeHtml(item.availableDate)})</strong>`:""}${Number.isInteger(item.stock)?` <small>(${item.stock} currently recorded in stock)</small>`:""}</li>`).join("");
  const customer=[["Name",`${order.firstName} ${order.lastName}`],["Email",order.email],["Phone",order.phone||"Not provided"],[order.fulfillment==="delivery"?"Delivery address":"Area",order.fulfillment==="delivery"?order.deliveryAddress||order.area||"Not provided":order.area||"Not provided"],["Fulfillment",order.fulfillment==="delivery"?"Local delivery — additional charge":"Local pickup"],...(Number.isFinite(order.deliveryDistanceKm)?[["Estimated driving distance",`${order.deliveryDistanceKm.toFixed(1)} km`]]:[]),...(Number.isInteger(order.deliveryFeeCents)?[["Estimated delivery fee",`${money(order.deliveryFeeCents)} additional`]]:[]),["Payment",order.payment==="cash"?"Cash":"Interac e-Transfer"],["Promotional emails",order.marketingConsent?"Yes — consent given":"No"],["Notes",order.notes||"None"]].map(([a,b])=>`<tr><th style="padding:7px 12px 7px 0;text-align:left">${escapeHtml(a)}</th><td style="padding:7px 0">${escapeHtml(b)}</td></tr>`).join("");
  const totals=`<table style="width:100%;margin:18px 0;border-collapse:collapse"><tr><th style="padding:8px 0;text-align:left;border-top:1px solid #d8cfbf">Products subtotal</th><td style="padding:8px 0;text-align:right;border-top:1px solid #d8cfbf">${escapeHtml(money(order.regularSubtotalCents))}</td></tr>${promotionEmailRows(order)}<tr><th style="padding:8px 0;text-align:left">${order.language==="fr"?"Sous-total après promotion":"Subtotal after promotion"}</th><td style="text-align:right">${escapeHtml(money(order.itemSubtotalCents))}</td></tr>${order.fulfillment==="delivery"?`<tr><th style="padding:8px 0;text-align:left">Local delivery</th><td style="padding:8px 0;text-align:right">${escapeHtml(Number.isInteger(order.deliveryFeeCents)?money(order.deliveryFeeCents):"Pending address")}</td></tr>`:`<tr><th style="padding:8px 0;text-align:left">Delivery</th><td style="padding:8px 0;text-align:right">Local pickup — no delivery charge</td></tr>`}<tr><th style="padding:10px 0;text-align:left;border-top:1px solid #d8cfbf">Estimated order total</th><td style="padding:10px 0;text-align:right;border-top:1px solid #d8cfbf;font-size:20px"><strong>${escapeHtml(money(order.estimatedTotalCents))}</strong></td></tr></table>`;
  return `<div style="max-width:680px;margin:auto;font-family:Arial,sans-serif;color:#173329"><p>Just B Natural</p><h1>Order request ${escapeHtml(order.orderId)}</h1><p style="border-left:4px solid #d38044;padding:12px 16px;background:#fbf4ec"><strong>Keep this order together:</strong> use Gmail’s Reply button on this message. Your reply will go directly to ${escapeHtml(order.firstName)} and remain attached to the original order in this email thread.</p><div style="margin:14px 0;padding:14px 16px;border:1px solid #d8cfbf;background:#fffdf8"><strong>Suggested reply template</strong><p style="margin-bottom:0">Hi ${escapeHtml(order.firstName)},<br><br>Your Just B Natural order ${escapeHtml(order.orderId)} is confirmed. [Add availability, pickup or delivery details, final total, and payment instructions here.]<br><br>Thank you!<br>Brigitte</p></div><ul>${items}</ul>${totals}<table>${customer}</table></div>`;
}
function customerHtml(order){if(order.language==="fr")return frenchCustomerHtml(order);const deliveryRow=order.fulfillment==="delivery"?`<tr><th style="padding:8px 0;text-align:left">Local delivery</th><td style="padding:8px 0;text-align:right">${escapeHtml(Number.isInteger(order.deliveryFeeCents)?money(order.deliveryFeeCents):"Pending address")}</td></tr>`:`<tr><th style="padding:8px 0;text-align:left">Delivery</th><td style="padding:8px 0;text-align:right">Local pickup — no delivery charge</td></tr>`;const totals=`<table style="width:100%;margin:18px 0;border-collapse:collapse"><tr><th style="padding:8px 0;text-align:left;border-top:1px solid #d8cfbf">Products subtotal</th><td style="padding:8px 0;text-align:right;border-top:1px solid #d8cfbf">${escapeHtml(money(order.regularSubtotalCents))}</td></tr>${promotionEmailRows(order)}<tr><th style="padding:8px 0;text-align:left">${order.language==="fr"?"Sous-total après promotion":"Subtotal after promotion"}</th><td style="text-align:right">${escapeHtml(money(order.itemSubtotalCents))}</td></tr>${deliveryRow}<tr><th style="padding:10px 0;text-align:left;border-top:1px solid #d8cfbf">Estimated order total</th><td style="padding:10px 0;text-align:right;border-top:1px solid #d8cfbf;font-size:20px"><strong>${escapeHtml(money(order.estimatedTotalCents))}</strong></td></tr></table>`;const delivery=order.fulfillment==="delivery"?`<p>Local delivery within 20 km of Aylmer is $10, or free for a product subtotal of $50 or more after discounts. Your delivery fee is included above.</p>`:`<p>You selected local pickup, so there is no delivery charge in this estimate.</p>`;return `<div style="max-width:620px;margin:auto;font-family:Arial,sans-serif;color:#173329"><p>Just B Natural</p><h1>We received your request, ${escapeHtml(order.firstName)}.</h1><p>Your request number is <strong>${escapeHtml(order.orderId)}</strong>.</p>${totals}<p style="border-left:4px solid #d38044;padding:12px 16px;background:#fbf4ec"><strong>Please do not send payment yet.</strong> Nothing has been charged or finalized.</p>${delivery}<p>We will confirm availability, ${order.fulfillment==="delivery"?"delivery":"pickup"} details, and payment instructions separately.</p></div>`}

async function handleOrder(request,env){
  let savedOrderId=null;
  try{
    const data=await request.json();if(clean(data.website,50))return json({ok:true,orderId:"Submitted"});
    const order={language:(data.language||data.locale)==="fr"?"fr":"en",firstName:clean(data.firstName,80),lastName:clean(data.lastName,80),email:clean(data.email,160).toLowerCase(),phone:clean(data.phone,40),area:clean(data.area,220),fulfillment:["pickup","delivery"].includes(data.fulfillment)?data.fulfillment:"pickup",deliveryAddress:clean(data.deliveryAddress,220),deliveryPlaceId:clean(data.deliveryPlaceId,300),deliveryDistanceKm:null,deliveryFeeCents:null,payment:["cash","etransfer"].includes(data.payment)?data.payment:"etransfer",notes:clean(data.notes,1000),marketingConsent:data.marketingConsent===true,consentText:clean(data.consentText,300),consentedAt:clean(data.consentedAt,60)||new Date().toISOString(),items:normalizeItems(data.items),orderId:`JB-${new Date().toISOString().slice(2,10).replaceAll("-","")}-${crypto.randomUUID().slice(0,4).toUpperCase()}`,orderEmail:env.ORDER_EMAIL||"justbnaturalss@gmail.com"};
    if(!validName(order.firstName)||!validName(order.lastName))return json({error:"Please provide a valid first and last name."},400);
    if(!validEmail(order.email))return json({error:"Please provide a complete, valid email address."},400);
    if(!validPhone(order.phone))return json({error:"Please provide a valid phone number or leave it blank."},400);
    if(!validArea(order.area))return json({error:"Please provide a valid neighbourhood or area."},400);
    if(!["pickup","delivery"].includes(data.fulfillment)||!["cash","etransfer"].includes(data.payment))return json({error:"Please select valid fulfillment and payment options."},400);
    if(!order.items.length)return json({error:"Your cart is empty."},400);
    if(order.fulfillment==="delivery"&&(order.deliveryAddress.length<8||!order.deliveryPlaceId))return json({error:"Please select a recognized local delivery address and calculate its fee."},400);
    await ensureBusiness(env.INVENTORY_DB);
    order.requestKey=/^[a-zA-Z0-9-]{20,80}$/.test(String(data.requestKey||''))?data.requestKey:null;
    if(order.requestKey){
      const previous=await env.INVENTORY_DB.prepare('SELECT order_json FROM order_delivery WHERE request_key=?').bind(order.requestKey).first();
      if(previous){
        const saved=JSON.parse(previous.order_json);
        const lines=o=>JSON.stringify(o.items.map(i=>[i.id,i.quantity]).sort());
        if(saved.email!==order.email||lines(saved)!==lines(order)||saved.fulfillment!==order.fulfillment||saved.deliveryAddress!==order.deliveryAddress||saved.payment!==order.payment)return json({error:'This request key belongs to a different order. Refresh and try again.'},409);
        const delivered=await deliverOrderEmails(env,saved);return json({ok:true,orderId:saved.orderId,status:'pending_confirmation',emailPending:!delivered.complete,reused:true});
      }
    }
    if(order.fulfillment==="delivery"){
      try{
        const estimate=await calculateDelivery(env,order.deliveryPlaceId);
        if(!Number.isInteger(estimate.feeCents)||estimate.feeCents<0||!Number.isFinite(estimate.distanceKm))throw new Error("Incomplete delivery estimate");
        order.deliveryDistanceKm=estimate.distanceKm;
        order.deliveryFeeCents=estimate.feeCents;
        order.deliveryDuration=estimate.duration;
        order.deliveryOriginLabel=estimate.originLabel;
      }catch(_){
        return json({error:"The delivery fee could not be calculated. Please choose the suggested address again before submitting."},400);
      }
    }
    if(order.fulfillment==="delivery"&&(!Number.isInteger(order.deliveryFeeCents)||order.deliveryFeeCents<0))return json({error:"A delivery fee is required before this order can be emailed."},400);
    order.items=await attachInventory(env,order.items);
    const insufficient=order.items.find(item=>item.availabilityStatus!=="preorder"&&Number.isInteger(item.stock)&&item.quantity>item.stock);
    if(insufficient)return json({error:`Only ${insufficient.stock} ${insufficient.name} remain. Please reduce the quantity.`},400);
    const unavailable=order.items.find(item=>item.active===false||item.availabilityStatus==="unavailable"||(item.stock===0&&item.availabilityStatus!=="preorder"));
    if(unavailable)return json({error:`${unavailable.name} is currently unavailable. Please remove it from your cart before sending the request.`},400);
    if(order.items.some(item=>!Number.isInteger(item.priceCents)))return json({error:"One or more product prices need to be set before this order can be sent."},400);
    order.campaignConfig=await readCampaign(env);
    order.createdAt=new Date().toISOString();
    Object.assign(order,priceOrder(order.items,order.campaignConfig,new Date(order.createdAt)));
    if(order.fulfillment==="delivery")order.deliveryFeeCents=localDeliveryFee(order.deliveryDistanceKm,order.itemSubtotalCents);
    order.estimatedTotalCents=order.itemSubtotalCents+(Number.isInteger(order.deliveryFeeCents)?order.deliveryFeeCents:0);
    await saveCampaignOrder(env,order);
    savedOrderId=order.orderId;
    const emailDelivery=await deliverOrderEmails(env,order);
    try{await recordMetric(env.INVENTORY_DB,'request_created');}catch(_){}
    let subscriberAdded=false;if(order.marketingConsent&&order.consentText){try{await addSubscriber(env,order.email);await recordConsent(env,{email:order.email,consentText:order.consentText,consentedAt:order.consentedAt,source:`checkout ${order.orderId}`});subscriberAdded=true}catch(_){subscriberAdded=false}}
    return json({ok:true,orderId:order.orderId,status:"pending_confirmation",emailPending:!emailDelivery.complete,subscriberAdded,pricing:{regularSubtotalCents:order.regularSubtotalCents,discountCents:order.discountCents,itemSubtotalCents:order.itemSubtotalCents,estimatedTotalCents:order.estimatedTotalCents,donationCommitmentCents:order.donationCommitmentCents}});
  }catch(_){if(savedOrderId)try{await env.INVENTORY_DB.prepare("UPDATE campaign_orders SET email_status='failed' WHERE order_id=?").bind(savedOrderId).run();}catch(_){}return json({error:"The order could not be sent. Please try again or use the email option.",...(savedOrderId?{orderId:savedOrderId}:{})},500)}
}
async function deliverOrderEmails(env,order){
 const subject=`${order.orderId} — ${order.language==='fr'?'Demande de commande':'Order request'}`;
 for(const kind of ['business','customer']){
  const claim=await env.INVENTORY_DB.prepare(`UPDATE order_delivery SET ${kind}_sent=2,${kind}_attempt_at=CURRENT_TIMESTAMP WHERE order_id=? AND (${kind}_sent=0 OR (${kind}_sent=2 AND ${kind}_attempt_at<datetime('now','-10 minutes')))` ).bind(order.orderId).run();
  if(Number(claim.meta?.changes??claim.changes??0)===0)continue;
  try{
   await sendEmail(env,kind==='business'?{to:order.orderEmail,toName:'Just B Natural',replyTo:{email:order.email,name:`${order.firstName} ${order.lastName}`},subject,htmlContent:orderHtml(order)}:{to:order.email,toName:`${order.firstName} ${order.lastName}`,replyTo:{email:order.orderEmail,name:'Just B Natural'},subject,htmlContent:customerHtml(order)});
   await env.INVENTORY_DB.prepare(`UPDATE order_delivery SET ${kind}_sent=1 WHERE order_id=?`).bind(order.orderId).run();
  }catch(_){await env.INVENTORY_DB.prepare(`UPDATE order_delivery SET ${kind}_sent=0 WHERE order_id=?`).bind(order.orderId).run();}
 }
 const state=await env.INVENTORY_DB.prepare('SELECT business_sent,customer_sent FROM order_delivery WHERE order_id=?').bind(order.orderId).first();
 const complete=state?.business_sent===1&&state?.customer_sent===1;
 await env.INVENTORY_DB.prepare('UPDATE campaign_orders SET email_status=? WHERE order_id=?').bind(complete?'sent':'failed',order.orderId).run();
 return {complete};
}
async function retryOrderEmail(request,env){
 if(request.method!=='POST')return json({error:'Method not allowed.'},405);
 if(!await inventoryAuthorized(request,env))return json({error:'Open the private manager first.'},401);
 if(request.headers.get('Origin')&&request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Request not allowed.'},403);
 await ensureBusiness(env.INVENTORY_DB);
 const data=await request.json();const row=await env.INVENTORY_DB.prepare("SELECT order_json FROM order_delivery WHERE order_id=? AND created_at>=datetime('now','-90 days')").bind(clean(data.orderId,40)).first();
 if(!row)return json({error:'The private order copy is unavailable or has expired.'},404);
 const result=await deliverOrderEmails(env,JSON.parse(row.order_json));return json({ok:result.complete,...result});
}

async function handleEmailPreview(request,env){
  if(request.method!=="POST")return json({error:"Method not allowed."},405);
  if(!await inventoryAuthorized(request,env))return json({error:"Please open inventory first."},401);
  if(request.headers.get("Origin")&&request.headers.get("Origin")!==new URL(request.url).origin)return json({error:"Request not allowed."},403);
  try{
    const data=await request.json();const email=clean(data.email,160).toLowerCase();
    if(!validEmail(email))return json({error:"Enter a complete email address."},400);
    await sendEmail(env,{to:email,toName:"",replyTo:{email:env.ORDER_EMAIL||"justbnaturalss@gmail.com",name:"Just B Naturals"},subject:"[TEST] Any 2 handmade soaps for $14 this October",htmlContent:launchEmailHtml});
    return json({ok:true,message:"Brevo accepted the test email."});
  }catch(_){return json({error:"The preview could not be sent. Check the existing Brevo sender setup."},502)}
}

async function handleSubscribe(request,env){
  try{const data=await request.json(),email=clean(data.email,160).toLowerCase(),consentText=clean(data.consentText,300),consentedAt=clean(data.consentedAt,60)||new Date().toISOString(),source=clean(data.source,100)||"website";if(!validEmail(email))return json({error:"Please enter a valid email address."},400);if(data.consent!==true||!consentText)return json({error:"Consent is required before joining the promotional list."},400);await addSubscriber(env,email);await recordConsent(env,{email,consentText,consentedAt,source});return json({ok:true})}catch(_){return json({error:"The signup could not be completed right now."},500)}
}

function promotionEmailRows(order){
  const fr=order.language==="fr";
  if(!order.qualifyingPairs)return "";
  return `<tr><th style="padding:8px 0;text-align:left;color:#9a405f">${fr?"Promotion de savons d’octobre":"October soap offer applied"}</th><td style="text-align:right">−${money(order.discountCents)}</td></tr><tr><td colspan="2" style="padding:8px 0">${fr?"Engagement de Just B envers Ruban Rose":"Just B’s commitment to Ruban Rose"}: ${money(order.donationCommitmentCents)} (${fr?"après paiement; aucun supplément":"after payment; no extra charge"}).</td></tr>`;
}
function frenchCustomerHtml(order){
  return `<div lang="fr" style="max-width:620px;margin:auto;font-family:Arial,sans-serif;color:#173329"><p>Just B Natural</p><h1>Votre demande a été reçue, ${escapeHtml(order.firstName)}.</h1><p>Numéro de demande : <strong>${escapeHtml(order.orderId)}</strong>.</p><ul>${order.items.map(i=>`<li>${escapeHtml(i.name)} × ${i.quantity} — ${money(i.priceCents*i.quantity)}</li>`).join("")}</ul><table style="width:100%"><tr><th style="text-align:left">Sous-total des produits</th><td>${money(order.regularSubtotalCents)}</td></tr>${promotionEmailRows(order)}<tr><th style="text-align:left">Sous-total après promotion</th><td>${money(order.itemSubtotalCents)}</td></tr><tr><th style="text-align:left">${order.fulfillment==="delivery"?"Livraison locale estimée":"Ramassage local"}</th><td>${money(order.deliveryFeeCents||0)}</td></tr><tr><th style="text-align:left">Total estimé</th><td><strong>${money(order.estimatedTotalCents)}</strong></td></tr></table><p><strong>Veuillez attendre avant de payer.</strong> Rien n’a été facturé ou finalisé. Nous confirmerons la disponibilité, le ${order.fulfillment==="delivery"?"prix de livraison":"ramassage"} et les instructions de paiement par courriel.</p></div>`;
}

async function ensureCampaignTables(env){
  if(!env.INVENTORY_DB)throw new Error("Inventory database is not connected.");
  await env.INVENTORY_DB.exec(`CREATE TABLE IF NOT EXISTS campaign_settings (id INTEGER PRIMARY KEY CHECK(id=1), config_json TEXT NOT NULL); CREATE TABLE IF NOT EXISTS campaign_orders (order_id TEXT PRIMARY KEY, created_at TEXT NOT NULL, order_json TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', retained_pairs INTEGER NOT NULL, email_status TEXT NOT NULL DEFAULT 'pending', updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
}
async function readCampaign(env){
  await ensureCampaignTables(env);
  const row=await env.INVENTORY_DB.prepare("SELECT config_json FROM campaign_settings WHERE id=1").first();
  return campaignConfig(row?JSON.parse(row.config_json):CAMPAIGN_DEFAULTS);
}
async function saveCampaignOrder(env,order){
  // Public campaign ledger remains free of contact details. Private fulfillment copies expire after 90 days.
  await ensureBusiness(env.INVENTORY_DB);
  const snapshot={items:order.items.map(({id,name,quantity,priceCents})=>({id,name,quantity,priceCents})),campaignConfig:order.campaignConfig,qualifyingPairs:order.qualifyingPairs,regularSubtotalCents:order.regularSubtotalCents,discountCents:order.discountCents,itemSubtotalCents:order.itemSubtotalCents,donationCommitmentCents:order.donationCommitmentCents,estimatedTotalCents:order.estimatedTotalCents,deliveryFeeCents:order.deliveryFeeCents,language:order.language};
  await env.INVENTORY_DB.batch([
    env.INVENTORY_DB.prepare("INSERT INTO campaign_orders(order_id,created_at,order_json,retained_pairs) VALUES(?,?,?,?)").bind(order.orderId,order.createdAt,JSON.stringify(snapshot),order.qualifyingPairs),
    env.INVENTORY_DB.prepare("INSERT INTO order_delivery(order_id,request_key,order_json) VALUES(?,?,?)").bind(order.orderId,order.requestKey||null,JSON.stringify(order))
  ]);
}
async function handleCampaign(request,env){
  try{
    if(request.method==="GET")return json({config:await readCampaign(env)});
    if(request.method!=="POST")return json({error:"Method not allowed."},405);
    if(!await inventoryAuthorized(request,env))return json({error:"Please open inventory first."},401);
    if(request.headers.get("Origin")&&request.headers.get("Origin")!==new URL(request.url).origin)return json({error:"Request not allowed."},403);
    const config=campaignConfig((await request.json()).config);
    await ensureCampaignTables(env);
    await env.INVENTORY_DB.prepare("INSERT INTO campaign_settings(id,config_json) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET config_json=excluded.config_json").bind(JSON.stringify(config)).run();
    return json({ok:true,config});
  }catch(error){return json({error:request.method==="POST"?error.message:"Campaign settings are temporarily unavailable."},request.method==="POST"?400:503)}
}
async function handleCampaignOrders(request,env){
  if(!await inventoryAuthorized(request,env))return json({error:"Please open inventory first."},401);
  try{
    await ensureCampaignTables(env);
    if(request.method==="POST"){
      if(request.headers.get("Origin")&&request.headers.get("Origin")!==new URL(request.url).origin)return json({error:"Request not allowed."},403);
      const data=await request.json(),id=clean(data.orderId,40);
      if(!["pending","confirmed","paid","completed","cancelled","refunded","partial_refund"].includes(data.status))return json({error:"Choose a valid order status."},400);
      try{return json(await changeOrderStatus(env.INVENTORY_DB,{orderId:id,status:data.status,retainedPairs:data.retainedPairs,restock:data.restock===true}));}
      catch(error){return json({error:error.message},400);}
    }
    if(request.method!=="GET")return json({error:"Method not allowed."},405);
    const result=await env.INVENTORY_DB.prepare("SELECT * FROM campaign_orders ORDER BY created_at DESC LIMIT 100").all();
    const totals=await env.INVENTORY_DB.prepare("SELECT status,retained_pairs,order_json FROM campaign_orders WHERE retained_pairs>0").all();
    let pendingCents=0,earnedCents=0;
    for(const row of totals.results||[]){const value=row.retained_pairs*JSON.parse(row.order_json).campaignConfig.donationPerPairCents;if(["pending","confirmed"].includes(row.status))pendingCents+=value;else if(["paid","completed","partial_refund"].includes(row.status))earnedCents+=value;}
    return json({pendingCents,earnedCents,orders:(result.results||[]).map(row=>({...row,order:JSON.parse(row.order_json),order_json:undefined}))});
  }catch(_){return json({error:"The donation tracker could not be updated."},503)}
}
async function handleProducts(env){
  if(!env.INVENTORY_DB)return json({products:[]});
  try{const result=await env.INVENTORY_DB.prepare("SELECT product_id,stock_count,price_cents,is_active,availability_status,available_date,updated_at FROM inventory ORDER BY product_id").all();return json({products:(result.results||[]).map(row=>({id:row.product_id,stock:row.stock_count,priceCents:row.price_cents,active:row.is_active!==0,availabilityStatus:row.availability_status||"available",availableDate:row.available_date||null,updatedAt:row.updated_at}))})}catch(_){return json({products:[]})}
}

async function sendReadyNotifications(env,productId){
  const productName=PRODUCT_CATALOG[productId];
  if(!productName||!env.INVENTORY_DB||!env.BREVO_API_KEY)return 0;
  const result=await env.INVENTORY_DB.prepare("SELECT email FROM restock_notifications WHERE product_id = ? AND status = 'pending' LIMIT 100").bind(productId).all();
  let sent=0;
  for(const row of result.results||[]){
    try{
      await sendEmail(env,{to:row.email,subject:`${productName} is now available`,htmlContent:`<div style="max-width:620px;margin:auto;font-family:Arial,sans-serif;color:#173329"><p>Just B Natural</p><h1>${escapeHtml(productName)} is ready.</h1><p>The product you asked about is now available to order.</p><p><a href="https://justbnatural.ca/product-${encodeURIComponent(productId)}.html">View ${escapeHtml(productName)}</a></p><p>You received this one-time message because you requested an availability update for this product.</p></div>`});
      await env.INVENTORY_DB.prepare("UPDATE restock_notifications SET status = 'sent', notified_at = CURRENT_TIMESTAMP WHERE product_id = ? AND email = ?").bind(productId,row.email).run();
      sent++;
    }catch(_){}
  }
  return sent;
}

async function handleNotify(request,env){
  if(request.method!=="POST")return json({error:"Method not allowed."},405);
  if(!env.INVENTORY_DB)return json({error:"Availability notifications are not connected."},503);
  try{
    const data=await request.json(),productId=clean(data.productId,100),email=clean(data.email,160).toLowerCase(),productName=PRODUCT_CATALOG[productId];
    if(!productName)return json({error:"Please choose a valid product."},400);
    if(data.consent!==true)return json({error:"Please agree to the one-time availability email."},400);
    if(!validEmail(email))return json({error:"Please enter a complete, valid email address."},400);
    const current=await env.INVENTORY_DB.prepare("SELECT availability_status,available_date FROM inventory WHERE product_id = ?").bind(productId).first();
    if(!current)return json({error:"That product could not be found."},404);
    await env.INVENTORY_DB.prepare("INSERT INTO restock_notifications (product_id,email,status,created_at,notified_at) VALUES (?,?,'pending',CURRENT_TIMESTAMP,NULL) ON CONFLICT(product_id,email) DO UPDATE SET status='pending',created_at=CURRENT_TIMESTAMP,notified_at=NULL").bind(productId,email).run();
    const dateNote=current.available_date?` It is currently expected to be ready on <strong>${escapeHtml(current.available_date)}</strong>.`:"";
    await sendEmail(env,{to:email,subject:`We’ll let you know about ${productName}`,htmlContent:`<div style="max-width:620px;margin:auto;font-family:Arial,sans-serif;color:#173329"><p>Just B Natural</p><h1>You’re on the list.</h1><p>We’ll send you one email when <strong>${escapeHtml(productName)}</strong> becomes available.${dateNote}</p><p>No promotional emails will be sent from this request.</p></div>`});
    return json({ok:true});
  }catch(_){return json({error:"We could not save that notification request. Please try again."},500)}
}

async function handleInventoryAdmin(request,env){
  if(!await inventoryAuthorized(request,env))return json({error:"That inventory passcode was not accepted."},401);
  if(!env.INVENTORY_DB)return json({error:"Inventory is not connected."},503);
  if(request.method==="GET")return handleProducts(env);
  if(request.method!=="POST")return json({error:"Method not allowed."},405);
  if(request.headers.get("Origin")&&request.headers.get("Origin")!==new URL(request.url).origin)return json({error:"Request not allowed."},403);
  try{
    const data=await request.json();
    if(!Array.isArray(data.products)||data.products.length>Object.keys(PRODUCT_CATALOG).length)return json({error:"The inventory list is invalid."},400);
    const updates=[],availableIds=[];
    for(const item of data.products){
      const id=clean(item?.id,100);
      if(!PRODUCT_CATALOG[id])return json({error:"The inventory list contains an unknown product."},400);
      const stock=item.stock===null||item.stock===""?null:Number(item.stock);
      if(stock!==null&&(!Number.isInteger(stock)||stock<0||stock>99999))return json({error:"Stock must be a whole number or left blank."},400);
      const priceCents=item.priceCents===null||item.priceCents===""?null:Number(item.priceCents);
      if(priceCents!==null&&(!Number.isInteger(priceCents)||priceCents<0||priceCents>9999999))return json({error:"Price must be a valid dollar amount or left blank."},400);
      const availabilityStatus=["available","preorder"].includes(item.availabilityStatus)?item.availabilityStatus:"available";
      const availableDate=item.availableDate===null||item.availableDate===""?null:clean(item.availableDate,10);
      if(availabilityStatus==="preorder"&&!/^\d{4}-\d{2}-\d{2}$/.test(availableDate||""))return json({error:"Every preorder needs a valid ready date."},400);
      const savedDate=availabilityStatus==="preorder"?availableDate:null;
      updates.push(env.INVENTORY_DB.prepare("UPDATE inventory SET stock_count = ?, price_cents = ?, is_active = ?, availability_status = ?, available_date = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?").bind(stock,priceCents,1,availabilityStatus,savedDate,id));
      if(availabilityStatus==="available"&&stock!==0)availableIds.push(id);
    }
    await env.INVENTORY_DB.batch(updates);
    let notificationsSent=0;for(const id of availableIds)notificationsSent+=await sendReadyNotifications(env,id);
    return json({ok:true,updated:updates.length,notificationsSent});
  }catch(_){return json({error:"The inventory changes could not be saved."},500)}
}

async function serveAsset(request,env){
 const response=await env.ASSETS.fetch(request),url=new URL(request.url);
 if(!response.headers.get('Content-Type')?.includes('text/html'))return response;
 const headers=new Headers(response.headers);headers.set('Cache-Control','no-cache');
 const id=/^\/product-(.+?)(?:\.html)?\/?$/.exec(url.pathname)?.[1];
 const product=PRODUCT_SEO[id];if(!product)return new Response(response.body,{status:response.status,headers});
 let html=await response.text();const fr=url.searchParams.get('lang')==='fr';
 const name=fr?product.frName:product.name,description=fr?product.frDescription:product.description;
 const schema={'@context':'https://schema.org','@type':'Product',name,description,image:['https://justbnatural.ca/'+product.image],sku:id,brand:{'@type':'Brand',name:'Just B Natural'}};
 try{const stock=await env.INVENTORY_DB.prepare('SELECT price_cents,stock_count,is_active,availability_status FROM inventory WHERE product_id=?').bind(id).first();
  if(stock&&stock.is_active!==0&&Number.isInteger(stock.price_cents))schema.offers={'@type':'Offer',url:'https://justbnatural.ca/product-'+id+(fr?'?lang=fr':''),priceCurrency:'CAD',price:(stock.price_cents/100).toFixed(2),availability:stock.availability_status==='preorder'?'https://schema.org/PreOrder':stock.stock_count===0?'https://schema.org/OutOfStock':'https://schema.org/InStock'};
 }catch(_){}
 html=html.replace(/<script type="application\/ld\+json" data-product-schema>.*?<\/script>/s,`<script type="application/ld+json" data-product-schema>${JSON.stringify(schema).replaceAll('<','\\u003c')}</script>`);
 if(fr)html=html.replace('<html lang="en">','<html lang="fr">').replace(/<title>.*?<\/title>/s,`<title>${escapeHtml(name)} | Just B Natural</title>`).replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${escapeHtml(description)}">`).replace(/<meta property="og:title"[^>]*>/,`<meta property="og:title" content="${escapeHtml(name)} | Just B Natural">`).replace(/<meta property="og:description"[^>]*>/,`<meta property="og:description" content="${escapeHtml(description)}">`).replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="https://justbnatural.ca/product-${id}?lang=fr">`);
 return new Response(html,{status:response.status,headers});
}

export default{async scheduled(event,env){await ensureBusiness(env.INVENTORY_DB);await env.INVENTORY_DB.prepare("DELETE FROM order_delivery WHERE created_at<datetime('now','-90 days')").run();},async fetch(request,env){const origin=request.headers.get("Origin");if(request.method!=="GET"&&request.method!=="HEAD"&&origin&&origin!==new URL(request.url).origin)return secureResponse(json({error:"Request not allowed."},403));const checked=await boundedJsonRequest(request);if(checked instanceof Response)return secureResponse(checked);return secureResponse(await routeRequest(checked,env));}};
async function routeRequest(request,env){if(new URL(request.url).pathname==='/api/business/retry-email')return retryOrderEmail(request,env);const business=await businessRoute(request,env,{json,auth:inventoryAuthorized,names:PRODUCT_CATALOG});if(business)return business;const path=new URL(request.url).pathname.replace(/\/+$/,"")||"/";if(path==="/api/campaign/email-preview")return handleEmailPreview(request,env);if(path==="/api/campaign")return handleCampaign(request,env);if(path==="/api/campaign/orders")return handleCampaignOrders(request,env);if(path==="/api/products")return request.method==="GET"?handleProducts(env):json({error:"Method not allowed."},405);if(path==="/api/inventory")return handleInventoryAdmin(request,env);if(path==="/api/notify")return handleNotify(request,env);if(path==="/api/order")return request.method==="POST"?handleOrder(request,env):json({error:"Method not allowed."},405);if(path==="/api/subscribe")return request.method==="POST"?handleSubscribe(request,env):json({error:"Method not allowed."},405);if(path==="/api/delivery/autocomplete")return request.method==="POST"?handleDeliveryAutocomplete(request,env):json({error:"Method not allowed."},405);if(path==="/api/delivery/estimate")return request.method==="POST"?handleDeliveryEstimate(request,env):json({error:"Method not allowed."},405);return serveAsset(request,env)}

