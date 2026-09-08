const PRODUCT_CATALOG = Object.freeze({
  "matcha-lavender-soap":"Matcha & Lavender","rosemary-sage-soap":"Rosemary & Sage","lemon-rosemary-soap":"Lemon & Rosemary","ember-ash-soap":"Ember & Ash","sweater-weather-soap":"Sweater Weather","coconut-lavender-soap":"Coconut Lavender","whisper-citrus-soap":"Whisper of Citrus","charcoal-blush-soap":"Charcoal & Blush","cedar-eucalyptus-loofah-soap":"Cedarwood & Eucalyptus Loofah","lemongrass-lavender-soap":"Lemongrass & Lavender","ylang-ylang-soap":"Ylang Ylang","honey-oat-comfort-soap":"Honey Oat Comfort","chocolate-pumpkin-pie-soap":"Chocolate Pumpkin Pie","unscented-loofah-soap":"Unscented Loofah","mint-eucalyptus-spa-soap":"Mint & Eucalyptus Spa Bar","spiced-banana-soap":"Spiced Banana","cedar-lemon-soap":"Cedar Lemon","mango-butter":"Mango Butter","vanilla-infused-tallow":"Vanilla Infused Tallow","unscented-tallow":"Unscented Tallow","just-b-calm":"Just B Calm","just-b-relieved":"Just B Relieved","cycle-harmony":"Cycle Harmony","lavender-bloom-scrub":"Lavender Bloom","harvest-spa-scrub":"Harvest Spa","vanilla-scrub":"Vanilla","just-b-rested-room-spray":"Just B Rested Room Spray","solid-dish-soap":"Non-Toxic No-Waste Solid Dish Soap"
});
const BREVO_BASE="https://api.brevo.com/v3";
const GOOGLE_PLACES_BASE="https://places.googleapis.com/v1";
const GOOGLE_ROUTES_URL="https://routes.googleapis.com/directions/v2:computeRoutes";
const DELIVERY_ORIGIN="291 Rue Lyse-Daniels, Gatineau, QC, Canada";

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}})}
function clean(value,max=300){return String(value||"").trim().slice(0,max)}
function validEmail(value){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value||""))}
function escapeHtml(value){return String(value||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c])}
function deliveryRate(env){const value=Number.parseInt(env.DELIVERY_RATE_PER_KM_CENTS,10);return Number.isInteger(value)&&value>=0?value:100}
function money(cents){return `$${(Number(cents)/100).toFixed(2)} CAD`}

async function googleRequest(env,url,body,fieldMask){
  if(!env.GOOGLE_MAPS_API_KEY)throw new Error("Google address estimates are not connected yet.");
  const response=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json","X-Goog-Api-Key":env.GOOGLE_MAPS_API_KEY,"X-Goog-FieldMask":fieldMask},body:JSON.stringify(body)});
  if(!response.ok)throw new Error(`Google Maps service error: ${response.status}`);
  return response.json();
}
async function calculateDelivery(env,placeId){
  const result=await googleRequest(env,GOOGLE_ROUTES_URL,{origin:{address:DELIVERY_ORIGIN},destination:{placeId},travelMode:"DRIVE",routingPreference:"TRAFFIC_UNAWARE",computeAlternativeRoutes:false,languageCode:"en-CA",units:"METRIC"},"routes.distanceMeters,routes.duration");
  const route=result.routes?.[0],distanceMeters=Number(route?.distanceMeters);
  if(!Number.isFinite(distanceMeters)||distanceMeters<=0)throw new Error("No driving route was found.");
  const rateCentsPerKm=deliveryRate(env);
  return {distanceMeters,distanceKm:Math.round(distanceMeters/100)/10,duration:clean(route.duration,30),feeCents:Math.round(distanceMeters/1000*rateCentsPerKm),rateCentsPerKm,originLabel:"Aylmer"};
}
async function handleDeliveryAutocomplete(request,env){
  if(!env.GOOGLE_MAPS_API_KEY)return json({error:"Google address estimates are not connected yet. Enter the full address and the delivery fee will be confirmed by email."},503);
  try{
    const data=await request.json(),input=clean(data.input,160),sessionToken=clean(data.sessionToken,100);
    if(input.length<3)return json({predictions:[]});
    const result=await googleRequest(env,`${GOOGLE_PLACES_BASE}/places:autocomplete`,{input,includedRegionCodes:["ca"],languageCode:"en",regionCode:"CA",locationBias:{circle:{center:{latitude:45.4,longitude:-75.8},radius:50000}},...(sessionToken?{sessionToken}:{})},"suggestions.placePrediction.placeId,suggestions.placePrediction.text.text");
    const predictions=(result.suggestions||[]).map(item=>({placeId:clean(item.placePrediction?.placeId,300),text:clean(item.placePrediction?.text?.text,220)})).filter(item=>item.placeId&&item.text).slice(0,5);
    return json({predictions});
  }catch(_){return json({error:"Address suggestions are temporarily unavailable. Enter the full address and the fee will be confirmed by email."},502)}
}
async function handleDeliveryEstimate(request,env){
  if(!env.GOOGLE_MAPS_API_KEY)return json({error:"Google address estimates are not connected yet. Enter the full address and the delivery fee will be confirmed by email."},503);
  try{
    const data=await request.json(),placeId=clean(data.placeId,300),address=clean(data.address,220);
    if(!placeId)return json({error:"Please select a recognized address."},400);
    return json({address,...await calculateDelivery(env,placeId)});
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
  if(!Array.isArray(items))return [];
  return items.slice(0,50).map(item=>{const id=clean(item?.id,100),name=PRODUCT_CATALOG[id],quantity=Math.min(99,Math.max(1,Number.parseInt(item?.quantity,10)||1));return name?{id,name,quantity}:null}).filter(Boolean);
}
async function attachInventory(env,items){
  if(!env.INVENTORY_DB||!items.length)return items;
  const marks=items.map(()=>"?").join(",");
  const result=await env.INVENTORY_DB.prepare(`SELECT product_id,stock_count,price_cents,is_active FROM inventory WHERE product_id IN (${marks})`).bind(...items.map(i=>i.id)).all();
  const rows=new Map((result.results||[]).map(row=>[row.product_id,row]));
  return items.map(item=>({...item,stock:rows.get(item.id)?.stock_count??null,priceCents:rows.get(item.id)?.price_cents??null,active:rows.get(item.id)?.is_active!==0}));
}
function approvalEmailUrl(order){
  const fulfillment=order.fulfillment==="delivery"?"delivery":"pickup";
  const body=[`Hi ${order.firstName},`,"",`Good news—your Just B Natural order ${order.orderId} is confirmed and the items are available.`,"","Final price and payment instructions:","[Add the confirmed total and payment instructions here]","",`${fulfillment==="delivery"?"Delivery":"Pickup"} details:`,"[Add the location, date, and time here]","","Thank you!","Just B Natural"].join("\n");
  return `mailto:${order.email}?subject=${encodeURIComponent(`${order.orderId} — Your order is confirmed`)}&body=${encodeURIComponent(body)}`;
}
function unavailableEmailUrl(order){const body=[`Hi ${order.firstName},`,"",`Thank you for your order request ${order.orderId}. Unfortunately, one or more items are not available right now, so no payment is needed.`,"","If you would like, reply to this email and we can help with alternatives or let you know when the item is available again.","","Just B Natural"].join("\n");return `mailto:${order.email}?subject=${encodeURIComponent(`${order.orderId} — Update on your order request`)}&body=${encodeURIComponent(body)}`}
function orderHtml(order){
  const items=order.items.map(item=>`<li style="padding:8px 0">${escapeHtml(item.name)} × ${item.quantity}${Number.isInteger(item.priceCents)?` — $${(item.priceCents*item.quantity/100).toFixed(2)} CAD`:""}${Number.isInteger(item.stock)?` <small>(${item.stock} currently recorded in stock)</small>`:""}</li>`).join("");
  const customer=[["Name",`${order.firstName} ${order.lastName}`],["Email",order.email],["Phone",order.phone||"Not provided"],[order.fulfillment==="delivery"?"Delivery address":"Area",order.fulfillment==="delivery"?order.deliveryAddress||order.area||"Not provided":order.area||"Not provided"],["Fulfillment",order.fulfillment==="delivery"?"Local delivery — additional charge":"Local pickup"],...(Number.isFinite(order.deliveryDistanceKm)?[["Estimated driving distance",`${order.deliveryDistanceKm.toFixed(1)} km`]]:[]),...(Number.isInteger(order.deliveryFeeCents)?[["Estimated delivery fee",`${money(order.deliveryFeeCents)} additional`]]:[]),["Payment",order.payment==="cash"?"Cash":"Interac e-Transfer"],["Promotional emails",order.marketingConsent?"Yes — consent given":"No"],["Notes",order.notes||"None"]].map(([a,b])=>`<tr><th style="padding:7px 12px 7px 0;text-align:left">${escapeHtml(a)}</th><td style="padding:7px 0">${escapeHtml(b)}</td></tr>`).join("");
  return `<div style="max-width:680px;margin:auto;font-family:Arial,sans-serif;color:#173329"><p>Just B Natural</p><h1>Order request ${escapeHtml(order.orderId)}</h1><p style="border-left:4px solid #d38044;padding:12px 16px;background:#fbf4ec"><strong>Approval needed.</strong> Confirm availability and pricing before sending payment instructions.</p><ul>${items}</ul><table>${customer}</table><p><a href="${escapeHtml(approvalEmailUrl(order))}">Confirm order and prepare payment steps</a> · <a href="${escapeHtml(unavailableEmailUrl(order))}">Tell customer it is unavailable</a></p></div>`;
}
function customerHtml(order){const delivery=order.fulfillment==="delivery"?`<p>Local delivery is an additional charge.${Number.isInteger(order.deliveryFeeCents)?` The current driving-distance estimate is <strong>${escapeHtml(money(order.deliveryFeeCents))}</strong>.`:""} The final delivery fee will be confirmed before payment.</p>`:"";return `<div style="max-width:620px;margin:auto;font-family:Arial,sans-serif;color:#173329"><p>Just B Natural</p><h1>We received your request, ${escapeHtml(order.firstName)}.</h1><p>Your request number is <strong>${escapeHtml(order.orderId)}</strong>.</p><p style="border-left:4px solid #d38044;padding:12px 16px;background:#fbf4ec"><strong>Please do not send payment yet.</strong> Nothing has been charged or finalized.</p>${delivery}<p>We will confirm availability, pricing, ${order.fulfillment==="delivery"?"delivery":"pickup"} details, and payment instructions separately.</p></div>`}

async function handleOrder(request,env){
  try{
    const data=await request.json();if(clean(data.website,50))return json({ok:true,orderId:"Submitted"});
    const order={firstName:clean(data.firstName,80),lastName:clean(data.lastName,80),email:clean(data.email,160).toLowerCase(),phone:clean(data.phone,40),area:clean(data.area,220),fulfillment:["pickup","delivery"].includes(data.fulfillment)?data.fulfillment:"pickup",deliveryAddress:clean(data.deliveryAddress,220),deliveryPlaceId:clean(data.deliveryPlaceId,300),deliveryDistanceKm:null,deliveryFeeCents:null,payment:["cash","etransfer"].includes(data.payment)?data.payment:"etransfer",notes:clean(data.notes,1000),marketingConsent:data.marketingConsent===true,consentText:clean(data.consentText,300),consentedAt:clean(data.consentedAt,60)||new Date().toISOString(),items:normalizeItems(data.items),orderId:`JBN-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${crypto.randomUUID().slice(0,6).toUpperCase()}`,orderEmail:env.ORDER_EMAIL||"justbnaturalss@gmail.com"};
    if(!order.firstName||!order.lastName||!validEmail(order.email))return json({error:"Please provide a valid name and email address."},400);
    if(!order.items.length)return json({error:"Your cart is empty."},400);
    if(order.fulfillment==="delivery"&&!order.deliveryAddress)return json({error:"Please enter the local delivery address."},400);
    if(order.fulfillment==="delivery"&&order.deliveryPlaceId&&env.GOOGLE_MAPS_API_KEY){try{Object.assign(order,await calculateDelivery(env,order.deliveryPlaceId))}catch(_){order.deliveryDistanceKm=null;order.deliveryFeeCents=null}}
    order.items=await attachInventory(env,order.items);
    await sendEmail(env,{to:order.orderEmail,toName:"Just B Natural",replyTo:{email:order.email,name:`${order.firstName} ${order.lastName}`},subject:`${order.orderId} — Approval needed before payment`,htmlContent:orderHtml(order)});
    await sendEmail(env,{to:order.email,toName:`${order.firstName} ${order.lastName}`,replyTo:{email:order.orderEmail,name:"Just B Natural"},subject:`${order.orderId} — Request received; please wait to pay`,htmlContent:customerHtml(order)});
    let subscriberAdded=false;if(order.marketingConsent&&order.consentText){try{await addSubscriber(env,order.email);await recordConsent(env,{email:order.email,consentText:order.consentText,consentedAt:order.consentedAt,source:`checkout ${order.orderId}`});subscriberAdded=true}catch(_){subscriberAdded=false}}
    return json({ok:true,orderId:order.orderId,status:"pending_confirmation",subscriberAdded});
  }catch(_){return json({error:"The order could not be sent. Please try again or use the email option."},500)}
}
async function handleSubscribe(request,env){
  try{const data=await request.json(),email=clean(data.email,160).toLowerCase(),consentText=clean(data.consentText,300),consentedAt=clean(data.consentedAt,60)||new Date().toISOString(),source=clean(data.source,100)||"website";if(!validEmail(email))return json({error:"Please enter a valid email address."},400);if(data.consent!==true||!consentText)return json({error:"Consent is required before joining the promotional list."},400);await addSubscriber(env,email);await recordConsent(env,{email,consentText,consentedAt,source});return json({ok:true})}catch(_){return json({error:"The signup could not be completed right now."},500)}
}
async function handleProducts(env){
  if(!env.INVENTORY_DB)return json({products:[]});
  try{const result=await env.INVENTORY_DB.prepare("SELECT product_id,stock_count,price_cents,is_active,updated_at FROM inventory ORDER BY product_id").all();return json({products:(result.results||[]).map(row=>({id:row.product_id,stock:row.stock_count,priceCents:row.price_cents,active:row.is_active!==0,updatedAt:row.updated_at}))})}catch(_){return json({products:[]})}
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
    const updates=[];
    for(const item of data.products){
      const id=clean(item?.id,100);
      if(!PRODUCT_CATALOG[id])return json({error:"The inventory list contains an unknown product."},400);
      const stock=item.stock===null||item.stock===""?null:Number(item.stock);
      if(stock!==null&&(!Number.isInteger(stock)||stock<0||stock>99999))return json({error:"Stock must be a whole number or left blank."},400);
      const priceCents=item.priceCents===null||item.priceCents===""?null:Number(item.priceCents);
      if(priceCents!==null&&(!Number.isInteger(priceCents)||priceCents<0||priceCents>9999999))return json({error:"Price must be a valid dollar amount or left blank."},400);
      updates.push(env.INVENTORY_DB.prepare("UPDATE inventory SET stock_count = ?, price_cents = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?").bind(stock,priceCents,id));
    }
    await env.INVENTORY_DB.batch(updates);
    return json({ok:true,updated:updates.length});
  }catch(_){return json({error:"The inventory changes could not be saved."},500)}
}

export default{async fetch(request,env){const path=new URL(request.url).pathname.replace(/\/+$/,"")||"/";if(path==="/api/products")return request.method==="GET"?handleProducts(env):json({error:"Method not allowed."},405);if(path==="/api/inventory")return handleInventoryAdmin(request,env);if(path==="/api/order")return request.method==="POST"?handleOrder(request,env):json({error:"Method not allowed."},405);if(path==="/api/subscribe")return request.method==="POST"?handleSubscribe(request,env):json({error:"Method not allowed."},405);if(path==="/api/delivery/autocomplete")return request.method==="POST"?handleDeliveryAutocomplete(request,env):json({error:"Method not allowed."},405);if(path==="/api/delivery/estimate")return request.method==="POST"?handleDeliveryEstimate(request,env):json({error:"Method not allowed."},405);return env.ASSETS.fetch(request)}};

