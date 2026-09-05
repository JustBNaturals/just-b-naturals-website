var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// functions/api/_catalog.js
var PRODUCT_CATALOG = Object.freeze({
  "citrus-fresh-dish-soap": { name: "Citrus Fresh Solid Dish Soap Set", price: 20 },
  "lemon-eucalyptus-dish-soap": { name: "Lemon Eucalyptus Solid Dish Soap Set", price: 20 },
  "unscented-dish-soap": { name: "Unscented Solid Dish Soap Set", price: 20 },
  "harmony-roller": { name: "Calm Aromatherapy Roller Oil", price: 15 },
  "refresh-roller": { name: "Relieve Headache Roller Oil", price: 15 },
  "period-comfort-roller": { name: "Cycle Harmony Roller Oil", price: 15 },
  "citrus-sugar-scrub": { name: "Citrus Sunrise Organic Sugar Scrub", price: 20 },
  "woodland-sugar-scrub": { name: "Woodland Escape Organic Sugar Scrub", price: 20 },
  "vanilla-tallow-balm": { name: "Nourished Vanilla Bean Tallow Balm", price: 25 },
  "mango-shea-body-butter": { name: "Nourished Whipped Mango & Shea Body Butter", price: 25 },
  "lavender-oat-soap": { name: "Lavender & Oat Artisan Soap", price: 8 },
  "orange-eucalyptus-soap": { name: "Orange & Eucalyptus Artisan Soap", price: 8 },
  "lemongrass-poppyseed-soap": { name: "Lemongrass & Poppyseed Artisan Soap", price: 8 },
  "cedarwood-charcoal-soap": { name: "Cedarwood & Charcoal Artisan Soap", price: 8 },
  "rose-geranium-soap": { name: "Rose Geranium Artisan Soap", price: 8 },
  "honey-almond-soap": { name: "Honey Almond Artisan Soap", price: 8 },
  "peppermint-tea-tree-soap": { name: "Peppermint Tea Tree Artisan Soap", price: 8 },
  "vanilla-chai-soap": { name: "Vanilla Chai Artisan Soap", price: 8 },
  "unscented-gentle-soap": { name: "Unscented Gentle Artisan Soap", price: 8 },
  "seasonal-soap": { name: "Seasonal Small-Batch Artisan Soap", price: 8 },
  "rested-linen-spray": { name: "Rested Deep Sleep Linen Spray", price: 15 },
  "sourdough-crepe-mix": { name: "Sourdough Cr\xEApe Mix", price: 12 }
});

// functions/api/_shared.js
var BREVO_BASE = "https://api.brevo.com/v3";
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
__name(json, "json");
function clean(value, max = 300) {
  return String(value || "").trim().slice(0, max);
}
__name(clean, "clean");
function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
}
__name(validEmail, "validEmail");
function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}
__name(escapeHtml, "escapeHtml");
async function brevoRequest(env, path, body) {
  if (!env.BREVO_API_KEY) throw new Error("Email service is not configured.");
  const response = await fetch(`${BREVO_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": env.BREVO_API_KEY
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Email service error: ${response.status} ${message.slice(0, 200)}`);
  }
  return response.status === 204 ? {} : response.json().catch(() => ({}));
}
__name(brevoRequest, "brevoRequest");
async function sendEmail(env, { to, toName, replyTo, subject, htmlContent }) {
  const senderEmail = env.BREVO_SENDER_EMAIL || env.ORDER_EMAIL || "justbnaturalss@gmail.com";
  return brevoRequest(env, "/smtp/email", {
    sender: { name: env.BREVO_SENDER_NAME || "Just B Naturals", email: senderEmail },
    to: [{ email: to, name: toName || to }],
    ...replyTo ? { replyTo: { email: replyTo.email, name: replyTo.name || replyTo.email } } : {},
    subject,
    htmlContent
  });
}
__name(sendEmail, "sendEmail");
async function addSubscriber(env, email) {
  const listId = Number(env.BREVO_LIST_ID);
  return brevoRequest(env, "/contacts", {
    email,
    updateEnabled: true,
    ...Number.isInteger(listId) && listId > 0 ? { listIds: [listId] } : {}
  });
}
__name(addSubscriber, "addSubscriber");
async function recordConsent(env, { email, consentText, consentedAt, source }) {
  const orderEmail = env.ORDER_EMAIL || "justbnaturalss@gmail.com";
  const rows = [
    ["Subscriber", email],
    ["Date", consentedAt],
    ["Source", source],
    ["Consent shown", consentText]
  ].map(([label, value]) => `<tr><th style="padding:8px;text-align:left;border-bottom:1px solid #ddd">${escapeHtml(label)}</th><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(value)}</td></tr>`).join("");
  return sendEmail(env, {
    to: orderEmail,
    toName: "Just B Naturals",
    subject: `New promotional email consent \u2014 ${email}`,
    htmlContent: `<div style="font-family:Arial,sans-serif;color:#173329"><h1 style="font-size:22px">New email subscriber</h1><table style="border-collapse:collapse;width:100%">${rows}</table></div>`
  });
}
__name(recordConsent, "recordConsent");

// functions/api/order.js
function normalizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 50).map((item) => {
    const id = clean(item?.id, 100);
    const product = PRODUCT_CATALOG[id];
    const quantity = Math.min(99, Math.max(1, Number.parseInt(item?.quantity, 10) || 1));
    return product ? { id, ...product, quantity, lineTotal: product.price * quantity } : null;
  }).filter(Boolean);
}
__name(normalizeItems, "normalizeItems");
function orderHtml(order) {
  const rows = order.items.map((item) => `<tr><td style="padding:10px 0;border-bottom:1px solid #ddd">${escapeHtml(item.name)} \xD7 ${item.quantity}</td><td style="padding:10px 0;border-bottom:1px solid #ddd;text-align:right">$${item.lineTotal.toFixed(2)}</td></tr>`).join("");
  const customer = [
    ["Name", `${order.firstName} ${order.lastName}`],
    ["Email", order.email],
    ["Phone", order.phone || "Not provided"],
    ["Area", order.area || "Not provided"],
    ["Fulfillment", order.fulfillment === "delivery" ? "Local delivery" : "Local pickup"],
    ["Payment", order.payment === "cash" ? "Cash" : "Interac e-Transfer"],
    ["Promotional emails", order.marketingConsent ? "Yes \u2014 consent given" : "No"],
    ["Notes", order.notes || "None"]
  ].map(([label, value]) => `<tr><th style="padding:7px 12px 7px 0;text-align:left;vertical-align:top">${escapeHtml(label)}</th><td style="padding:7px 0">${escapeHtml(value)}</td></tr>`).join("");
  const approvalUrl = approvalEmailUrl(order);
  const unavailableUrl = unavailableEmailUrl(order);
  return `<div style="max-width:680px;margin:auto;font-family:Arial,sans-serif;color:#173329"><p style="letter-spacing:.12em;text-transform:uppercase;font-size:12px">Just B Naturals</p><h1 style="font-family:Georgia,serif;font-size:34px;font-weight:normal">Order request ${escapeHtml(order.orderId)}</h1><p style="border-left:4px solid #d38044;padding:12px 16px;background:#fbf4ec"><strong>Approval needed.</strong> The customer has been told not to pay. Check that every item is available, then use one of the buttons below.</p><table style="border-collapse:collapse;width:100%;margin:24px 0">${rows}<tr><th style="padding:16px 0;text-align:left">Product total</th><th style="padding:16px 0;text-align:right">$${order.total.toFixed(2)} CAD</th></tr></table><table style="border-collapse:collapse;width:100%">${customer}</table><p style="margin:28px 0 10px"><a href="${escapeHtml(approvalUrl)}" style="display:inline-block;margin:0 8px 8px 0;padding:13px 18px;background:#173329;color:#fff;text-decoration:none">Confirm order &amp; send payment steps</a><a href="${escapeHtml(unavailableUrl)}" style="display:inline-block;padding:12px 18px;border:1px solid #173329;color:#173329;text-decoration:none">Tell customer it is unavailable</a></p><p style="color:#65736a;font-size:13px;line-height:1.6">These buttons open a ready-to-send email. Review the message, add pickup or delivery details, and send it from your email account.</p></div>`;
}
__name(orderHtml, "orderHtml");
function approvalEmailUrl(order) {
  const fulfillment = order.fulfillment === "delivery" ? "delivery" : "pickup";
  const payment = order.payment === "cash" ? `You can pay $${order.total.toFixed(2)} CAD in cash at ${fulfillment}.` : `You can now send an Interac e-Transfer for $${order.total.toFixed(2)} CAD to ${order.paymentEmail}. Please include ${order.orderId} in the message.`;
  const body = [
    `Hi ${order.firstName},`,
    "",
    `Good news\u2014your Just B Naturals order ${order.orderId} is confirmed and the items are available.`,
    "",
    payment,
    "",
    `${fulfillment === "delivery" ? "Delivery" : "Pickup"} details:`,
    "[Add the location, date, and time here]",
    "",
    "Thank you!",
    "Just B Naturals"
  ].join("\n");
  return `mailto:${order.email}?subject=${encodeURIComponent(`${order.orderId} \u2014 Your order is confirmed`)}&body=${encodeURIComponent(body)}`;
}
__name(approvalEmailUrl, "approvalEmailUrl");
function unavailableEmailUrl(order) {
  const body = [
    `Hi ${order.firstName},`,
    "",
    `Thank you for your order request ${order.orderId}. Unfortunately, one or more items are not available right now, so no payment is needed.`,
    "",
    "If you would like, reply to this email and we can help with alternatives or let you know when the item is available again.",
    "",
    "Just B Naturals"
  ].join("\n");
  return `mailto:${order.email}?subject=${encodeURIComponent(`${order.orderId} \u2014 Update on your order request`)}&body=${encodeURIComponent(body)}`;
}
__name(unavailableEmailUrl, "unavailableEmailUrl");
function customerHtml(order) {
  const method = order.payment === "cash" ? "cash" : "Interac e-Transfer";
  return `<div style="max-width:620px;margin:auto;font-family:Arial,sans-serif;color:#173329"><p style="letter-spacing:.12em;text-transform:uppercase;font-size:12px">Just B Naturals</p><h1 style="font-family:Georgia,serif;font-size:34px;font-weight:normal">We received your request, ${escapeHtml(order.firstName)}.</h1><p>Your request number is <strong>${escapeHtml(order.orderId)}</strong> and the current product total is <strong>$${order.total.toFixed(2)} CAD</strong>.</p><p style="border-left:4px solid #d38044;padding:12px 16px;background:#fbf4ec"><strong>Please do not send payment yet.</strong> Nothing has been charged or finalized.</p><p>Just B Naturals will check the small-batch inventory and email you separately to confirm availability, your final total, ${order.fulfillment === "delivery" ? "delivery" : "pickup"} details, and when to pay by ${method}.</p><p style="margin-top:28px;color:#65736a">Questions? Reply to this email or contact ${escapeHtml(order.orderEmail)}.</p></div>`;
}
__name(customerHtml, "customerHtml");
async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    if (clean(data.website, 50)) return json({ ok: true, orderId: "Submitted" });
    const order = {
      firstName: clean(data.firstName, 80),
      lastName: clean(data.lastName, 80),
      email: clean(data.email, 160).toLowerCase(),
      phone: clean(data.phone, 40),
      area: clean(data.area, 120),
      fulfillment: ["pickup", "delivery"].includes(data.fulfillment) ? data.fulfillment : "pickup",
      payment: ["cash", "etransfer"].includes(data.payment) ? data.payment : "etransfer",
      notes: clean(data.notes, 1e3),
      marketingConsent: data.marketingConsent === true,
      consentText: clean(data.consentText, 300),
      consentedAt: clean(data.consentedAt, 60) || (/* @__PURE__ */ new Date()).toISOString(),
      items: normalizeItems(data.items),
      orderId: `JBN-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      orderEmail: env.ORDER_EMAIL || "justbnaturalss@gmail.com",
      paymentEmail: env.PAYMENT_EMAIL || env.ORDER_EMAIL || "justbnaturalss@gmail.com"
    };
    if (!order.firstName || !order.lastName || !validEmail(order.email)) return json({ error: "Please provide a valid name and email address." }, 400);
    if (!order.items.length) return json({ error: "Your cart is empty." }, 400);
    order.total = order.items.reduce((sum, item) => sum + item.lineTotal, 0);
    await sendEmail(env, {
      to: order.orderEmail,
      toName: "Just B Naturals",
      replyTo: { email: order.email, name: `${order.firstName} ${order.lastName}` },
      subject: `${order.orderId} \u2014 Approval needed before payment`,
      htmlContent: orderHtml(order)
    });
    await sendEmail(env, {
      to: order.email,
      toName: `${order.firstName} ${order.lastName}`,
      replyTo: { email: order.orderEmail, name: "Just B Naturals" },
      subject: `${order.orderId} \u2014 Request received; please wait to pay`,
      htmlContent: customerHtml(order)
    });
    let subscriberAdded = false;
    if (order.marketingConsent && order.consentText) {
      try {
        await addSubscriber(env, order.email);
        await recordConsent(env, { email: order.email, consentText: order.consentText, consentedAt: order.consentedAt, source: `checkout ${order.orderId}` });
        subscriberAdded = true;
      } catch (_) {
        subscriberAdded = false;
      }
    }
    return json({ ok: true, orderId: order.orderId, status: "pending_confirmation", subscriberAdded });
  } catch (_) {
    return json({ error: "The order could not be sent. Please try again or use the email option." }, 500);
  }
}
__name(onRequestPost, "onRequestPost");

// functions/api/subscribe.js
async function onRequestPost2({ request, env }) {
  try {
    const data = await request.json();
    const email = clean(data.email, 160).toLowerCase();
    const consentText = clean(data.consentText, 300);
    const consentedAt = clean(data.consentedAt, 60) || (/* @__PURE__ */ new Date()).toISOString();
    const source = clean(data.source, 100) || "website";
    if (!validEmail(email)) return json({ error: "Please enter a valid email address." }, 400);
    if (data.consent !== true || !consentText) return json({ error: "Consent is required before joining the promotional list." }, 400);
    await addSubscriber(env, email);
    await recordConsent(env, { email, consentText, consentedAt, source });
    return json({ ok: true });
  } catch (_) {
    return json({ error: "The signup could not be completed right now." }, 500);
  }
}
__name(onRequestPost2, "onRequestPost");

// worker/index.js
function methodNotAllowed() {
  return new Response(JSON.stringify({ error: "Method not allowed." }), {
    status: 405,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
__name(methodNotAllowed, "methodNotAllowed");
var index_default = {
  async fetch(request, env, ctx) {
    const pathname = new URL(request.url).pathname.replace(/\/+$/, "") || "/";
    if (pathname === "/api/order") {
      return request.method === "POST" ? onRequestPost({ request, env, waitUntil: ctx.waitUntil.bind(ctx) }) : methodNotAllowed();
    }
    if (pathname === "/api/subscribe") {
      return request.method === "POST" ? onRequestPost2({ request, env, waitUntil: ctx.waitUntil.bind(ctx) }) : methodNotAllowed();
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  index_default as default
};
