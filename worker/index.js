const PRODUCT_CATALOG = Object.freeze({
  "matcha-lavender-soap":"Matcha & Lavender","rosemary-sage-soap":"Rosemary & Sage","lemon-rosemary-soap":"Lemon & Rosemary","ember-ash-soap":"Ember & Ash","sweater-weather-soap":"Sweater Weather","coconut-lavender-soap":"Coconut Lavender","whisper-citrus-soap":"Whisper of Citrus","charcoal-blush-soap":"Charcoal & Blush","cedar-eucalyptus-loofah-soap":"Cedarwood & Eucalyptus Loofah","lemongrass-lavender-soap":"Lemongrass & Lavender","ylang-ylang-soap":"Ylang Ylang","honey-oat-comfort-soap":"Oat and Tallow","chocolate-pumpkin-pie-soap":"Chocolate Pumpkin Pie","unscented-loofah-soap":"Unscented Loofah","mint-eucalyptus-spa-soap":"Mint & Eucalyptus Spa Bar","spiced-banana-soap":"Spiced Banana","cedar-lemon-soap":"Cedar Lemon","blue-cedar-soap":"Blue Cedar","chamomile-soap":"Chamomile","forest-soap":"Forest","lavender-oat-soap":"Lavender and Oat","ocean-soap":"Ocean","rose-matter-soap":"Rose Matter","mango-butter":"Mango Butter","vanilla-infused-tallow":"Vanilla Infused Tallow","unscented-tallow":"Unscented Tallow","just-b-calm":"Hormonal Balance Roll-On","just-b-relieved":"Headache Relief Roll-On","cycle-harmony":"Cramp and Bloat Relief","lavender-bloom-scrub":"Lavender Bloom","harvest-spa-scrub":"Harvest Spa","vanilla-scrub":"Vanilla","just-b-rested-room-spray":"Linen Room Spray","solid-dish-soap":"Non-Toxic Solid Dish Soap"
});
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
function deliveryRate(env){const value=Number.parseInt(env.DELIVERY_RATE_PER_KM_CENTS,10);return Number.isInteger(value)&&value>=0?value:50}
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
  const rateCentsPerKm=deliveryRate(env);
  return {distanceMeters,distanceKm:Math.round(distanceMeters/100)/10,duration:Number.isFinite(route.duration)?`${Math.round(route.duration)}s`:"",feeCents:Math.round(distanceMeters/1000*rateCentsPerKm),rateCentsPerKm,originLabel:"Aylmer"};
}
async function calculateDelivery(env,placeId){
  const openDestination=osmCoordinates(placeId);
  if(openDestination)return calculateOpenDelivery(env,openDestination);
  const originAddress=clean(env.DELIVERY_ORIGIN_ADDRESS,220);
  if(!originAddress)throw new Error("Delivery origin is not configured.");
  const result=await googleRequest(env,GOOGLE_ROUTES_URL,{origin:{address:originAddress},destination:{placeId},travelMode:"DRIVE",routingPreference:"TRAFFIC_UNAWARE",computeAlternativeRoutes:false,languageCode:"en-CA",units:"METRIC"},"routes.distanceMeters,routes.duration");
  const route=result.routes?.[0],distanceMeters=Number(route?.distanceMeters);
  if(!Number.isFinite(distanceMeters)||distanceMeters<=0)throw new Error("No driving route was found.");
  const rateCentsPerKm=deliveryRate(env);
  return {distanceMeters,distanceKm:Math.round(distanceMeters/100)/10,duration:clean(route.duration,30),feeCents:Math.round(distanceMeters/1000*rateCentsPerKm),rateCentsPerKm,originLabel:"Aylmer"};
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
  const result=await env.INVENTORY_DB.prepare(`SELECT product_id,stock_count,price_cents,is_active,availability_status,available_date FROM inventory WHERE product_id IN (${marks})`).bind(...items.map(i=>i.id)).all();
  const rows=new Map((result.results||[]).map(row=>[row.product_id,row]));
  return items.map(item=>{const row=rows.get(item.id)||{};return {...item,stock:row.stock_count??null,priceCents:row.price_cents??null,active:row.is_active!==0,availabilityStatus:row.availability_status||"available",availableDate:row.available_date||null}});
}
function orderHtml(order){
  const items=order.items.map(item=>`<li style="padding:8px 0">${escapeHtml(item.name)} × ${item.quantity}${Number.isInteger(item.priceCents)?` — $${(item.priceCents*item.quantity/100).toFixed(2)} CAD`:""}${item.availabilityStatus==="preorder"&&item.availableDate?` <strong>(preorder — expected ${escapeHtml(item.availableDate)})</strong>`:""}${Number.isInteger(item.stock)?` <small>(${item.stock} currently recorded in stock)</small>`:""}</li>`).join("");
  const customer=[["Name",`${order.firstName} ${order.lastName}`],["Email",order.email],["Phone",order.phone||"Not provided"],[order.fulfillment==="delivery"?"Delivery address":"Area",order.fulfillment==="delivery"?order.deliveryAddress||order.area||"Not provided":order.area||"Not provided"],["Fulfillment",order.fulfillment==="delivery"?"Local delivery — additional charge":"Local pickup"],...(Number.isFinite(order.deliveryDistanceKm)?[["Estimated driving distance",`${order.deliveryDistanceKm.toFixed(1)} km`]]:[]),...(Number.isInteger(order.deliveryFeeCents)?[["Estimated delivery fee",`${money(order.deliveryFeeCents)} additional`]]:[]),["Payment",order.payment==="cash"?"Cash":"Interac e-Transfer"],["Promotional emails",order.marketingConsent?"Yes — consent given":"No"],["Notes",order.notes||"None"]].map(([a,b])=>`<tr><th style="padding:7px 12px 7px 0;text-align:left">${escapeHtml(a)}</th><td style="padding:7px 0">${escapeHtml(b)}</td></tr>`).join("");
  const totals=`<table style="width:100%;margin:18px 0;border-collapse:collapse"><tr><th style="padding:8px 0;text-align:left;border-top:1px solid #d8cfbf">Products subtotal</th><td style="padding:8px 0;text-align:right;border-top:1px solid #d8cfbf">${escapeHtml(money(order.itemSubtotalCents))}</td></tr>${Number.isInteger(order.deliveryFeeCents)?`<tr><th style="padding:8px 0;text-align:left">Estimated local delivery</th><td style="padding:8px 0;text-align:right">${escapeHtml(money(order.deliveryFeeCents))}</td></tr>`:""}<tr><th style="padding:10px 0;text-align:left;border-top:1px solid #d8cfbf">Estimated order total</th><td style="padding:10px 0;text-align:right;border-top:1px solid #d8cfbf;font-size:20px"><strong>${escapeHtml(money(order.estimatedTotalCents))}</strong></td></tr></table>`;
  return `<div style="max-width:680px;margin:auto;font-family:Arial,sans-serif;color:#173329"><p>Just B Natural</p><h1>Order request ${escapeHtml(order.orderId)}</h1><p style="border-left:4px solid #d38044;padding:12px 16px;background:#fbf4ec"><strong>Keep this order together:</strong> use Gmail’s Reply button on this message. Your reply will go directly to ${escapeHtml(order.firstName)} and remain attached to the original order in this email thread.</p><div style="margin:14px 0;padding:14px 16px;border:1px solid #d8cfbf;background:#fffdf8"><strong>Suggested reply template</strong><p style="margin-bottom:0">Hi ${escapeHtml(order.firstName)},<br><br>Your Just B Natural order ${escapeHtml(order.orderId)} is confirmed. [Add availability, pickup or delivery details, final total, and payment instructions here.]<br><br>Thank you!<br>Brigitte</p></div><ul>${items}</ul>${totals}<table>${customer}</table></div>`;
}
function customerHtml(order){const delivery=order.fulfillment==="delivery"?`<p>Local delivery is an additional charge.${Number.isInteger(order.deliveryFeeCents)?` The current driving-distance estimate is <strong>${escapeHtml(money(order.deliveryFeeCents))}</strong>.`:""} The final delivery fee will be confirmed before payment.</p>`:"";return `<div style="max-width:620px;margin:auto;font-family:Arial,sans-serif;color:#173329"><p>Just B Natural</p><h1>We received your request, ${escapeHtml(order.firstName)}.</h1><p>Your request number is <strong>${escapeHtml(order.orderId)}</strong>.</p><p>Products subtotal: <strong>${escapeHtml(money(order.itemSubtotalCents))}</strong><br>Estimated order total: <strong>${escapeHtml(money(order.estimatedTotalCents))}</strong></p><p style="border-left:4px solid #d38044;padding:12px 16px;background:#fbf4ec"><strong>Please do not send payment yet.</strong> Nothing has been charged or finalized.</p>${delivery}<p>We will confirm availability, ${order.fulfillment==="delivery"?"delivery":"pickup"} details, and payment instructions separately.</p></div>`}

async function handleOrder(request,env){
  try{
    const data=await request.json();if(clean(data.website,50))return json({ok:true,orderId:"Submitted"});
    const order={firstName:clean(data.firstName,80),lastName:clean(data.lastName,80),email:clean(data.email,160).toLowerCase(),phone:clean(data.phone,40),area:clean(data.area,220),fulfillment:["pickup","delivery"].includes(data.fulfillment)?data.fulfillment:"pickup",deliveryAddress:clean(data.deliveryAddress,220),deliveryPlaceId:clean(data.deliveryPlaceId,300),deliveryDistanceKm:null,deliveryFeeCents:null,payment:["cash","etransfer"].includes(data.payment)?data.payment:"etransfer",notes:clean(data.notes,1000),marketingConsent:data.marketingConsent===true,consentText:clean(data.consentText,300),consentedAt:clean(data.consentedAt,60)||new Date().toISOString(),items:normalizeItems(data.items),orderId:`JB-${new Date().toISOString().slice(2,10).replaceAll("-","")}-${crypto.randomUUID().slice(0,4).toUpperCase()}`,orderEmail:env.ORDER_EMAIL||"justbnaturalss@gmail.com"};
    if(!validName(order.firstName)||!validName(order.lastName))return json({error:"Please provide a valid first and last name."},400);
    if(!validEmail(order.email))return json({error:"Please provide a complete, valid email address."},400);
    if(!validPhone(order.phone))return json({error:"Please provide a valid phone number or leave it blank."},400);
    if(!validArea(order.area))return json({error:"Please provide a valid neighbourhood or area."},400);
    if(!["pickup","delivery"].includes(data.fulfillment)||!["cash","etransfer"].includes(data.payment))return json({error:"Please select valid fulfillment and payment options."},400);
    if(!order.items.length)return json({error:"Your cart is empty."},400);
    if(order.fulfillment==="delivery"&&(order.deliveryAddress.length<8||!order.deliveryPlaceId))return json({error:"Please select a recognized local delivery address and calculate its fee."},400);
    if(order.fulfillment==="delivery"){try{Object.assign(order,await calculateDelivery(env,order.deliveryPlaceId))}catch(_){return json({error:"The delivery route could not be calculated. Please choose the address again."},400)}}
    order.items=await attachInventory(env,order.items);
    const unavailable=order.items.find(item=>item.active===false||item.availabilityStatus==="unavailable"||(item.stock===0&&item.availabilityStatus!=="preorder"));
    if(unavailable)return json({error:`${unavailable.name} is currently unavailable. Please remove it from your cart before sending the request.`},400);
    if(order.items.some(item=>!Number.isInteger(item.priceCents)))return json({error:"One or more product prices need to be set before this order can be sent."},400);
    order.itemSubtotalCents=order.items.reduce((total,item)=>total+item.priceCents*item.quantity,0);
    order.estimatedTotalCents=order.itemSubtotalCents+(Number.isInteger(order.deliveryFeeCents)?order.deliveryFeeCents:0);
    const conversationSubject=`${order.orderId} — Order request`;
    await sendEmail(env,{to:order.orderEmail,toName:"Just B Natural",replyTo:{email:order.email,name:`${order.firstName} ${order.lastName}`},subject:conversationSubject,htmlContent:orderHtml(order)});
    await sendEmail(env,{to:order.email,toName:`${order.firstName} ${order.lastName}`,replyTo:{email:order.orderEmail,name:"Just B Natural"},subject:conversationSubject,htmlContent:customerHtml(order)});
    let subscriberAdded=false;if(order.marketingConsent&&order.consentText){try{await addSubscriber(env,order.email);await recordConsent(env,{email:order.email,consentText:order.consentText,consentedAt:order.consentedAt,source:`checkout ${order.orderId}`});subscriberAdded=true}catch(_){subscriberAdded=false}}
    return json({ok:true,orderId:order.orderId,status:"pending_confirmation",subscriberAdded});
  }catch(_){return json({error:"The order could not be sent. Please try again or use the email option."},500)}
}
async function handleSubscribe(request,env){
  try{const data=await request.json(),email=clean(data.email,160).toLowerCase(),consentText=clean(data.consentText,300),consentedAt=clean(data.consentedAt,60)||new Date().toISOString(),source=clean(data.source,100)||"website";if(!validEmail(email))return json({error:"Please enter a valid email address."},400);if(data.consent!==true||!consentText)return json({error:"Consent is required before joining the promotional list."},400);await addSubscriber(env,email);await recordConsent(env,{email,consentText,consentedAt,source});return json({ok:true})}catch(_){return json({error:"The signup could not be completed right now."},500)}
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

export default{async fetch(request,env){const path=new URL(request.url).pathname.replace(/\/+$/,"")||"/";if(path==="/api/products")return request.method==="GET"?handleProducts(env):json({error:"Method not allowed."},405);if(path==="/api/inventory")return handleInventoryAdmin(request,env);if(path==="/api/notify")return handleNotify(request,env);if(path==="/api/order")return request.method==="POST"?handleOrder(request,env):json({error:"Method not allowed."},405);if(path==="/api/subscribe")return request.method==="POST"?handleSubscribe(request,env):json({error:"Method not allowed."},405);if(path==="/api/delivery/autocomplete")return request.method==="POST"?handleDeliveryAutocomplete(request,env):json({error:"Method not allowed."},405);if(path==="/api/delivery/estimate")return request.method==="POST"?handleDeliveryEstimate(request,env):json({error:"Method not allowed."},405);return env.ASSETS.fetch(request)}};
