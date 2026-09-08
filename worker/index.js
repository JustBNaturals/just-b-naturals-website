const PRODUCT_CATALOG = Object.freeze({
  "matcha-lavender-soap":"Matcha & Lavender","rosemary-sage-soap":"Rosemary & Sage","lemon-rosemary-soap":"Lemon & Rosemary","ember-ash-soap":"Ember & Ash","sweater-weather-soap":"Sweater Weather","coconut-lavender-soap":"Coconut Lavender","whisper-citrus-soap":"Whisper of Citrus","charcoal-blush-soap":"Charcoal & Blush","cedar-eucalyptus-loofah-soap":"Cedarwood & Eucalyptus Loofah","lemongrass-lavender-soap":"Lemongrass & Lavender","ylang-ylang-soap":"Ylang Ylang","honey-oat-comfort-soap":"Honey Oat Comfort","chocolate-pumpkin-pie-soap":"Chocolate Pumpkin Pie","unscented-loofah-soap":"Unscented Loofah","mint-eucalyptus-spa-soap":"Mint & Eucalyptus Spa Bar","spiced-banana-soap":"Spiced Banana","cedar-lemon-soap":"Cedar Lemon","mango-butter":"Mango Butter","vanilla-infused-tallow":"Vanilla Infused Tallow","unscented-tallow":"Unscented Tallow","just-b-calm":"Just B Calm","just-b-relieved":"Just B Relieved","cycle-harmony":"Cycle Harmony","lavender-bloom-scrub":"Lavender Bloom","harvest-spa-scrub":"Harvest Spa","vanilla-scrub":"Vanilla","just-b-rested-room-spray":"Just B Rested Room Spray","solid-dish-soap":"Non-Toxic No-Waste Solid Dish Soap"
});
const BREVO_BASE="https://api.brevo.com/v3";

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}})}
function clean(value,max=300){return String(value||"").trim().slice(0,max)}
function validEmail(value){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value||""))}
function escapeHtml(value){return String(value||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c])}

async function brevoRequest(env,path,body){
  if(!env.BREVO_API_KEY)throw new Error("Email service is not configured.");
  const response=await fetch(`${BREVO_BASE}${path}`,{method:"POST",headers:{"Content-Type":"application/json","api-key":env.BREVO_API_KEY},body:JSON.stringify(body)});
  if(!response.ok)throw new Error(`Email service error: ${response.status}`);
  return response.status===204?{}:response.json().catch(()=>({}));
}
function sendEmail(env,{to,toName,replyTo,subject,htmlContent}){
  const senderEmail=env.BREVO_SENDER_EMAIL||env.ORDER_EMAIL||"justbnaturalss@gmail.com";
  return brevoRequest(env,"/smtp/email",{sender:{name:env.BREVO_SENDER_NAME||"Just B Naturals",email:senderEmail},to:[{email:to,name:toName||to}],...(replyTo?{replyTo:{email:replyTo.email,name:replyTo.name||replyTo.email}}:{}),subject,htmlContent});
}
function addSubscriber(env,email){const listId=Number(env.BREVO_LIST_ID);return brevoRequest(env,"/contacts",{email,updateEnabled:true,...(Number.isInteger(listId)&&listId>0?{listIds:[listId]}:{})})}
async function recordConsent(env,{email,consentText,consentedAt,source}){
  const orderEmail=env.ORDER_EMAIL||"justbnaturalss@gmail.com";
  const rows=[["Subscriber",email],["Date",consentedAt],["Source",source],["Consent shown",consentText]].map(([a,b])=>`<tr><th style="padding:8px;text-align:left">${escapeHtml(a)}</th><td style="padding:8px">${escapeHtml(b)}</td></tr>`).join("");
  return sendEmail(env,{to:orderEmail,toName:"Just B Naturals",subject:`New promotional email consent — ${email}`,htmlContent:`<div style="font-family:Arial,sans-serif;color:#173329"><h1>New email subscriber</h1><table>${rows}</table></div>`});
}

function normalizeItems(items){
  if(!Array.isArray(items))return [];
  return items.slice(0,50).map(item=>{const id=clean(item?.id,100),name=PRODUCT_CATALOG[id],quantity=Math.min(99,Math.max(1,Number.parseInt(item?.quantity,10)||1));return name?{id,name,quantity}:null}).filter(Boolean);
}
async function attachInventory(env,items){
  if(!env.INVENTORY_DB||!items.length)return items;
  const marks=items.map(()=>"?").join(",");
  const result=await env.INVENTORY_DB.prepare(`SELECT product_id,stock_count,is_active FROM inventory WHERE product_id IN (${marks})`).bind(...items.map(i=>i.id)).all();
  const rows=new Map((result.results||[]).map(row=>[row.product_id,row]));
  return items.map(item=>({...item,stock:rows.get(item.id)?.stock_count??null,active:rows.get(item.id)?.is_active!==0}));
}
function approvalEmailUrl(order){
  const fulfillment=order.fulfillment==="delivery"?"delivery":"pickup";
  const body=[`Hi ${order.firstName},`,"",`Good news—your Just B Naturals order ${order.orderId} is confirmed and the items are available.`,"","Final price and payment instructions:","[Add the confirmed total and payment instructions here]","",`${fulfillment==="delivery"?"Delivery":"Pickup"} details:`,"[Add the location, date, and time here]","","Thank you!","Just B Naturals"].join("\n");
  return `mailto:${order.email}?subject=${encodeURIComponent(`${order.orderId} — Your order is confirmed`)}&body=${encodeURIComponent(body)}`;
}
function unavailableEmailUrl(order){const body=[`Hi ${order.firstName},`,"",`Thank you for your order request ${order.orderId}. Unfortunately, one or more items are not available right now, so no payment is needed.`,"","If you would like, reply to this email and we can help with alternatives or let you know when the item is available again.","","Just B Naturals"].join("\n");return `mailto:${order.email}?subject=${encodeURIComponent(`${order.orderId} — Update on your order request`)}&body=${encodeURIComponent(body)}`}
function orderHtml(order){
  const items=order.items.map(item=>`<li style="padding:8px 0">${escapeHtml(item.name)} × ${item.quantity}${Number.isInteger(item.stock)?` <small>(${item.stock} currently recorded in stock)</small>`:""}</li>`).join("");
  const customer=[["Name",`${order.firstName} ${order.lastName}`],["Email",order.email],["Phone",order.phone||"Not provided"],["Area",order.area||"Not provided"],["Fulfillment",order.fulfillment==="delivery"?"Local delivery":"Local pickup"],["Payment",order.payment==="cash"?"Cash":"Interac e-Transfer"],["Promotional emails",order.marketingConsent?"Yes — consent given":"No"],["Notes",order.notes||"None"]].map(([a,b])=>`<tr><th style="padding:7px 12px 7px 0;text-align:left">${escapeHtml(a)}</th><td style="padding:7px 0">${escapeHtml(b)}</td></tr>`).join("");
  return `<div style="max-width:680px;margin:auto;font-family:Arial,sans-serif;color:#173329"><p>Just B Naturals</p><h1>Order request ${escapeHtml(order.orderId)}</h1><p style="border-left:4px solid #d38044;padding:12px 16px;background:#fbf4ec"><strong>Approval needed.</strong> Confirm availability and pricing before sending payment instructions.</p><ul>${items}</ul><table>${customer}</table><p><a href="${escapeHtml(approvalEmailUrl(order))}">Confirm order and prepare payment steps</a> · <a href="${escapeHtml(unavailableEmailUrl(order))}">Tell customer it is unavailable</a></p></div>`;
}
function customerHtml(order){return `<div style="max-width:620px;margin:auto;font-family:Arial,sans-serif;color:#173329"><p>Just B Naturals</p><h1>We received your request, ${escapeHtml(order.firstName)}.</h1><p>Your request number is <strong>${escapeHtml(order.orderId)}</strong>.</p><p style="border-left:4px solid #d38044;padding:12px 16px;background:#fbf4ec"><strong>Please do not send payment yet.</strong> Nothing has been charged or finalized.</p><p>We will confirm availability, pricing, ${order.fulfillment==="delivery"?"delivery":"pickup"} details, and payment instructions separately.</p></div>`}

async function handleOrder(request,env){
  try{
    const data=await request.json();if(clean(data.website,50))return json({ok:true,orderId:"Submitted"});
    const order={firstName:clean(data.firstName,80),lastName:clean(data.lastName,80),email:clean(data.email,160).toLowerCase(),phone:clean(data.phone,40),area:clean(data.area,120),fulfillment:["pickup","delivery"].includes(data.fulfillment)?data.fulfillment:"pickup",payment:["cash","etransfer"].includes(data.payment)?data.payment:"etransfer",notes:clean(data.notes,1000),marketingConsent:data.marketingConsent===true,consentText:clean(data.consentText,300),consentedAt:clean(data.consentedAt,60)||new Date().toISOString(),items:normalizeItems(data.items),orderId:`JBN-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${crypto.randomUUID().slice(0,6).toUpperCase()}`,orderEmail:env.ORDER_EMAIL||"justbnaturalss@gmail.com"};
    if(!order.firstName||!order.lastName||!validEmail(order.email))return json({error:"Please provide a valid name and email address."},400);
    if(!order.items.length)return json({error:"Your cart is empty."},400);
    order.items=await attachInventory(env,order.items);
    await sendEmail(env,{to:order.orderEmail,toName:"Just B Naturals",replyTo:{email:order.email,name:`${order.firstName} ${order.lastName}`},subject:`${order.orderId} — Approval needed before payment`,htmlContent:orderHtml(order)});
    await sendEmail(env,{to:order.email,toName:`${order.firstName} ${order.lastName}`,replyTo:{email:order.orderEmail,name:"Just B Naturals"},subject:`${order.orderId} — Request received; please wait to pay`,htmlContent:customerHtml(order)});
    let subscriberAdded=false;if(order.marketingConsent&&order.consentText){try{await addSubscriber(env,order.email);await recordConsent(env,{email:order.email,consentText:order.consentText,consentedAt:order.consentedAt,source:`checkout ${order.orderId}`});subscriberAdded=true}catch(_){subscriberAdded=false}}
    return json({ok:true,orderId:order.orderId,status:"pending_confirmation",subscriberAdded});
  }catch(_){return json({error:"The order could not be sent. Please try again or use the email option."},500)}
}
async function handleSubscribe(request,env){
  try{const data=await request.json(),email=clean(data.email,160).toLowerCase(),consentText=clean(data.consentText,300),consentedAt=clean(data.consentedAt,60)||new Date().toISOString(),source=clean(data.source,100)||"website";if(!validEmail(email))return json({error:"Please enter a valid email address."},400);if(data.consent!==true||!consentText)return json({error:"Consent is required before joining the promotional list."},400);await addSubscriber(env,email);await recordConsent(env,{email,consentText,consentedAt,source});return json({ok:true})}catch(_){return json({error:"The signup could not be completed right now."},500)}
}
async function handleProducts(env){
  if(!env.INVENTORY_DB)return json({products:[]});
  try{const result=await env.INVENTORY_DB.prepare("SELECT product_id,stock_count,is_active,updated_at FROM inventory ORDER BY product_id").all();return json({products:(result.results||[]).map(row=>({id:row.product_id,stock:row.stock_count,active:row.is_active!==0,updatedAt:row.updated_at}))})}catch(_){return json({products:[]})}
}

export default{async fetch(request,env){const path=new URL(request.url).pathname.replace(/\/+$/,"")||"/";if(path==="/api/products")return request.method==="GET"?handleProducts(env):json({error:"Method not allowed."},405);if(path==="/api/order")return request.method==="POST"?handleOrder(request,env):json({error:"Method not allowed."},405);if(path==="/api/subscribe")return request.method==="POST"?handleSubscribe(request,env):json({error:"Method not allowed."},405);return env.ASSETS.fetch(request)}};
