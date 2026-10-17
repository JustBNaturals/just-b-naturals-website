import { initializeGrowth, scentFamilies } from "./growth.js?v=20261017-dashboard";
import { PRODUCTS } from "./product-data.js";
import { LOCAL_DELIVERY_MAX_KM, LOCAL_DELIVERY_FEE_CENTS, FREE_DELIVERY_THRESHOLD_CENTS } from "./delivery.js";
import "./fr.js";
import { CAMPAIGN_DEFAULTS, campaignActive, priceOrder } from "./promotion.js";
import { campaignLanguage, t, initializeCampaignLanguage, campaignHero, campaignPopup, octoberHomeCard, awarenessContent } from "./campaign-ui.js?v=20261016-natural-fade";
let growthTools = null;
let soapCampaign = { ...CAMPAIGN_DEFAULTS, enabled: false };
/*
  STORE SETTINGS
  Cart contents stay in the shopper's browser. The Cloudflare Worker endpoints
  email guest order requests and collect consenting subscribers.
*/
document.documentElement.classList.add("has-js");

const STORE = Object.freeze({
  name: "Just B Natural",
  orderEmail: "justbnaturalss@gmail.com",
  instagramUrl: "https://www.instagram.com/justb.naturals/",
  instagramDmUrl: "https://ig.me/m/justb.naturals",
  orderListEnabled: true,
  orderEndpoint: "/api/order",
  deliveryAutocompleteEndpoint: "/api/delivery/autocomplete",
  deliveryEstimateEndpoint: "/api/delivery/estimate",
  subscribeEndpoint: "/api/subscribe"
});



const DEFAULT_PRICES = Object.freeze({
  "artisan-soap": 8,
  "sugar-scrubs": 20,
  "roller-oils": 15,
  "body-care": 25
});
PRODUCTS.forEach(product => {
  product.price = product.id === "just-b-rested-room-spray" ? 15
    : product.id === "solid-dish-soap" ? 20
    : DEFAULT_PRICES[product.category] ?? null;
});

const NAV_ITEMS = [
  ["index.html", "Home", "home"],
  ["shop.html", "Shop all", "shop"],
  ["artisan-soap.html", "Artisan soap", "artisan-soap"],
  ["sugar-scrubs.html", "Sugar scrubs", "sugar-scrubs"],
  ["roller-oils.html", "Botanical oils", "roller-oils"],
  ["body-care.html", "Body care", "body-care"],
  ["home-linen.html", "Home & linen", "home-linen"],
  ["about.html", "About", "about"],
  ["faq.html", "FAQ", "faq"]
];

const currentPage = document.body.dataset.page || "";
const ORDER_STORAGE_KEY = "just-b-naturals-order-list-v1";
const ORDER_NOTES_KEY = "just-b-naturals-order-notes-v1";
const ORDER_COOKIE_KEY = "just-b-naturals-cart";
const generalOrderUrl = `mailto:${STORE.orderEmail}?subject=${encodeURIComponent("Product order inquiry")}`;

const CATEGORY_LABELS = Object.freeze({
  "artisan-soap": "Artisan Soaps",
  "sugar-scrubs": "Sugar Scrubs",
  "roller-oils": "Botanical Oils",
  "body-care": "Body Care",
  "home-linen": "Home & Linen"
});

function productPageUrl(productOrId) {
  const id = typeof productOrId === "string" ? productOrId : productOrId.id;
  return `product-${encodeURIComponent(id)}.html`;
}

function formatPrice(price) {
  return Number.isFinite(price) ? new Intl.NumberFormat(campaignLanguage === "fr" ? "fr-CA" : "en-CA", { style: "currency", currency: "CAD" }).format(price) : "";
}

function completeEmail(value) {
  return String(value || "").length <= 160 && /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(String(value || "").trim());
}

function formatReadyDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return "";
  return new Date(`${value}T12:00:00`).toLocaleDateString(globalThis.JBN_FR?.isFrench ? "fr-CA" : "en-CA", { month: "long", day: "numeric", year: "numeric" });
}

function productAvailabilityText(product) {
  if (product.availabilityStatus === "preorder") return product.availableDate ? `Preorder • Available ${formatReadyDate(product.availableDate)}` : "Preorder";
  if (product.stock === 0) return "Out of stock";
  if (product.availabilityStatus === "unavailable" || product.active === false) return "Currently unavailable";
  if (Number.isInteger(product.stock)) return `${product.stock} in stock`;
  return product.availability || "";
}

function productAvailabilityMarkup(product) {
  if (product.availabilityStatus === "preorder" && product.availableDate) {
    return `<span class="stock-status-kind">Preorder</span><span class="stock-status-date">Available ${escapeHtml(formatReadyDate(product.availableDate))}</span>`;
  }
  return escapeHtml(productAvailabilityText(product));
}

function availabilitySummary(products) {
  const available = products.filter(product => product.active !== false && product.availabilityStatus !== "unavailable" && product.availabilityStatus !== "preorder" && product.stock !== 0).length;
  const preorder = products.filter(product => product.active !== false && product.availabilityStatus === "preorder").length;
  const parts = [];
  if (available) parts.push(`${available} product${available === 1 ? "" : "s"} available`);
  if (preorder) parts.push(`${preorder} available for preorder`);
  return parts.length ? parts.join(" • ") : "No products currently available";
}

function updateAvailabilitySummaries() {
  document.querySelectorAll("[data-category-summary]").forEach(node => {
    const category = node.dataset.categorySummary;
    const visibleIds = String(node.dataset.visibleProductIds || "").split(",").filter(Boolean);
    const products = visibleIds.length || node.hasAttribute("data-visible-product-ids")
      ? visibleIds.map(id => PRODUCTS.find(product => product.id === id)).filter(Boolean)
      : category === "all" ? PRODUCTS : PRODUCTS.filter(product => product.category === category);
    node.textContent = availabilitySummary(products);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function orderLineKey(itemOrId) {
  return typeof itemOrId === "string" ? itemOrId : itemOrId.id;
}

function findOrderLine(productId) {
  return orderList.find(item => item.id === productId);
}

function readOrderCookie() {
  try {
    const prefix = `${ORDER_COOKIE_KEY}=`;
    const entry = document.cookie.split("; ").find(value => value.startsWith(prefix));
    return entry ? JSON.parse(decodeURIComponent(entry.slice(prefix.length))) : [];
  } catch (_) {
    return [];
  }
}

function writeOrderCookie(items) {
  try {
    const value = encodeURIComponent(JSON.stringify(items));
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${ORDER_COOKIE_KEY}=${value}; Max-Age=2592000; Path=/; SameSite=Lax${secure}`;
  } catch (_) {
    // The in-memory cart still works if cookies are unavailable.
  }
}

function loadOrderList() {
  let saved = [];
  try {
    const stored = localStorage.getItem(ORDER_STORAGE_KEY);
    saved = stored === null ? readOrderCookie() : JSON.parse(stored);
  } catch (_) {
    saved = readOrderCookie();
  }
  if (!Array.isArray(saved)) return [];
  return saved
    .filter(item => PRODUCTS.some(product => product.id === item.id))
    .map(item => ({
      id: item.id,
      quantity: Math.min(99, Math.max(1, Number(item.quantity) || 1))
    }));
}

function loadOrderNotes() {
  try {
    return localStorage.getItem(ORDER_NOTES_KEY) || "";
  } catch (_) {
    return "";
  }
}

let orderList = loadOrderList();
let orderNotes = loadOrderNotes();
let orderDrawerOpener = null;

function saveOrderList() {
  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orderList));
    localStorage.setItem(ORDER_NOTES_KEY, orderNotes);
  } catch (_) {
    // The cookie fallback below keeps the cart between pages.
  }
  writeOrderCookie(orderList);
  growthTools?.refresh();
}

function orderItemCount() {
  return orderList.reduce((total, item) => total + item.quantity, 0);
}

function cartPricing(items = orderList) {
  return priceOrder(items.map(item => {
    const product=PRODUCTS.find(p=>p.id===item.id);
    return {id:item.id,quantity:item.quantity,priceCents:Math.round((product?.price||0)*100)};
  }),soapCampaign);
}
function cartSubtotalCents() { return cartPricing().itemSubtotalCents; }
function promotionMessage(pricing) {
  if (!pricing.active) return "";
  if (!pricing.qualifyingPairs) return pricing.eligibleQuantity===1?t("Add one more artisan soap to unlock 2 for $14.","Ajoutez un savon artisanal pour obtenir 2 savons pour 14 $.").replace('14',String(soapCampaign.pairPriceCents/100)):"";
  return `${t("October soap offer applied")} · ${t("Just B will donate","Just B versera")} ${formatPrice(pricing.donationCommitmentCents/100)} ${t("to Ruban Rose after payment. No extra charge.","au Ruban Rose après paiement. Aucun supplément.")}`;
}
function updateCheckoutTotals() {
  const form = document.querySelector("[data-checkout-form]");
  const pricing=cartPricing();
  const subtotal = pricing.itemSubtotalCents;
  document.querySelectorAll("[data-promotion-row]").forEach(node=>{node.hidden=!pricing.qualifyingPairs;});
  document.querySelectorAll("[data-promotion-discount]").forEach(node=>{node.textContent=`−${formatPrice(pricing.discountCents/100)}`;});
  document.querySelectorAll("[data-promotion-message]").forEach(node=>{node.textContent=promotionMessage(pricing);node.hidden=!node.textContent;});
  document.querySelectorAll("[data-cart-total]").forEach(node=>{node.textContent=formatPrice(subtotal/100);});
  const deliverySelected = form?.elements.fulfillment?.value === "delivery";
  const deliveryDistance = Number(form?.elements.deliveryDistanceKm?.value);
  const hasConfirmedAddress = deliverySelected && Number.isFinite(deliveryDistance) && deliveryDistance > 0 && deliveryDistance <= LOCAL_DELIVERY_MAX_KM;
  const deliveryFee = hasConfirmedAddress ? (subtotal >= FREE_DELIVERY_THRESHOLD_CENTS ? 0 : LOCAL_DELIVERY_FEE_CENTS) : 0;
  if (form?.elements.deliveryFeeCents) form.elements.deliveryFeeCents.value = hasConfirmedAddress ? String(deliveryFee) : "";
  document.querySelectorAll("[data-checkout-subtotal]").forEach(node => { node.textContent = formatPrice(pricing.regularSubtotalCents / 100); });
  document.querySelectorAll("[data-checkout-delivery-row]").forEach(node => { node.hidden = !deliverySelected; });
  document.querySelectorAll("[data-checkout-delivery]").forEach(node => { node.textContent = hasConfirmedAddress ? (deliveryFee === 0 ? t("Free","Gratuit") : formatPrice(deliveryFee / 100)) : t("Select an address"); });
  document.querySelectorAll("[data-checkout-total]").forEach(node => { node.textContent = hasConfirmedAddress || !deliverySelected ? formatPrice((subtotal + (hasConfirmedAddress ? deliveryFee : 0)) / 100) : t("Pending address"); });
}

function buildOrderSummary(details = {}) {
  const selectedItems = Array.isArray(details.items) ? details.items : orderList;
  const lines = selectedItems.map((item, index) => {
    const product = PRODUCTS.find(candidate => candidate.id === item.id);
    if (!product) return "";
    return `${index + 1}. ${product.name}\n   Quantity: ${item.quantity}${Number.isFinite(product.price) ? `\n   Line total: ${formatPrice(product.price * item.quantity)}` : ""}`;
  }).filter(Boolean);

  const pricing=cartPricing(selectedItems);
  const subtotalCents=pricing.itemSubtotalCents;
  const deliveryFeeCents = Number.isInteger(details.deliveryFeeCents) ? details.deliveryFeeCents : 0;

  const customerLines = details.email ? [
    `Customer: ${[details.firstName, details.lastName].filter(Boolean).join(" ")}`,
    `Email: ${details.email}`,
    details.phone ? `Phone: ${details.phone}` : "",
    details.area ? `Area: ${details.area}` : "",
    details.deliveryAddress ? `Delivery address: ${details.deliveryAddress}` : "",
    Number.isFinite(details.deliveryDistanceKm) ? `Estimated driving distance: ${details.deliveryDistanceKm.toFixed(1)} km` : "",
    Number.isInteger(details.deliveryFeeCents) ? `Local delivery: ${details.deliveryFeeCents === 0 ? "Free" : `${formatPrice(details.deliveryFeeCents / 100)} CAD`}` : "",
    `Fulfillment: ${details.fulfillment === "delivery" ? "Local delivery" : "Local pickup"}`,
    `Payment: ${details.payment === "cash" ? "Cash" : "Interac e-Transfer"}`,
    details.marketingConsent ? "Promotional emails: Yes, consent given" : "Promotional emails: No"
  ].filter(Boolean) : [];

  return [
    `Hello ${STORE.name},`,
    "",
    details.email ? "A guest order request was submitted:" : "I would like to request:",
    ...(customerLines.length ? ["", ...customerLines] : []),
    "",
    lines.join("\n\n"),
    "",
    `Products subtotal: ${formatPrice(pricing.regularSubtotalCents / 100)}`,
    ...(pricing.qualifyingPairs?[`October soap offer: −${formatPrice(pricing.discountCents/100)}`,`Business donation commitment after payment: ${formatPrice(pricing.donationCommitmentCents/100)} to Ruban Rose (no customer charge)`]:[]),
    `Subtotal after promotion: ${formatPrice(subtotalCents/100)}`,
    ...(details.fulfillment === "delivery" ? [Number.isInteger(details.deliveryFeeCents) ? `Estimated delivery: ${formatPrice(deliveryFeeCents / 100)}` : "Estimated delivery: pending address", `Estimated order total: ${formatPrice((subtotalCents + deliveryFeeCents) / 100)}`] : [`Estimated order total: ${formatPrice(subtotalCents / 100)}`]),
    "",
    details.notes?.trim() ? `Notes:\n${details.notes.trim()}\n` : (orderNotes.trim() ? `Notes:\n${orderNotes.trim()}\n` : "Notes:\n"),
    "",
    "I understand this is a request only and I will wait for confirmation before paying.",
    "",
    "Please confirm availability and pickup or delivery details. Thank you!"
  ].join("\n");
}

function fullOrderEmailUrl() {
  if (!orderList.length) return generalOrderUrl;
  const count = orderItemCount();
  const subject = `Order request – ${count} item${count === 1 ? "" : "s"}`;
  return `mailto:${STORE.orderEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildOrderSummary())}`;
}

function navMarkup(mobile = false) {
  return NAV_ITEMS.map(([href, label, page]) => `<a href="${href}"${currentPage === page ? ' class="active" aria-current="page"' : ""}>${t(label)}${mobile ? "<span>→</span>" : ""}</a>`).join("");
}

function renderSiteChrome() {
  const header = document.querySelector("[data-site-header]");
  const footer = document.querySelector("[data-site-footer]");

  if (header) header.innerHTML = `
    <div class="scroll-progress" aria-hidden="true"><span></span></div>
    <div class="announcement pink-announcement" data-pink-announcement hidden></div>
    <header class="site-header">
      <div class="shell header-inner">
        <button class="menu-button" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span><span></span></button>
        <a class="brand" href="index.html" aria-label="${STORE.name} home"><img class="brand-logo" src="images/just-b-logo-192.webp" alt=""><span>JUST B<br>NATURAL</span></a>
        <nav class="desktop-nav" aria-label="Main navigation">${navMarkup()}</nav>
        <div class="header-actions"><a class="header-order header-order-instagram" href="${STORE.instagramUrl}" target="_blank" rel="noreferrer">Instagram</a><button class="header-order header-order-list" type="button" data-order-list-open>${t("Cart")} <span class="order-count" data-order-count>0</span></button></div>
      </div>
    </header>
    <nav class="mobile-category-nav" aria-label="Browse product categories">${navMarkup()}</nav>
    <aside class="mobile-menu" id="mobile-menu" aria-hidden="true"><div class="mobile-menu-top"><a class="mobile-menu-brand" href="index.html"><img src="images/just-b-logo-192.webp" alt="Just B Natural"><strong>Browse Just B</strong></a><button type="button" aria-label="Close menu">&times;</button></div><nav>${navMarkup(true)}<a href="${STORE.instagramUrl}" target="_blank" rel="noreferrer">Follow @justb.naturals <span>↗</span></a></nav><div class="mobile-order-options"><button class="button button-order-list" type="button" data-order-list-open>View cart <span data-order-count>0</span></button></div></aside>
    <button class="menu-backdrop" type="button" aria-label="Close menu" hidden></button>
    <nav class="mobile-bottom-nav" aria-label="Quick navigation"><a href="index.html"><span aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="m3 10 9-7 9 7v10H3V10Z"/><path d="M9 20v-8h6v8"/></svg></span>Home</a><a href="shop.html"><span aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M6 8h12l1 12H5L6 8Zm3 1V6a3 3 0 0 1 6 0v3"/></svg></span>Products</a><a href="${STORE.instagramUrl}" target="_blank" rel="noreferrer"><span aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle class="icon-fill" cx="17.5" cy="6.5" r="1"/></svg></span>Instagram</a><button type="button" data-order-list-open><span class="mobile-list-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M3 3h2l2.4 12h10.9l2-8H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg><b data-order-count>0</b></span>${t('Cart')}</button></nav>
    <button class="order-drawer-backdrop" type="button" aria-label="Close cart" data-order-list-close hidden></button>
    <aside class="order-drawer" id="order-drawer" aria-hidden="true" aria-labelledby="order-drawer-title">
      <div class="order-drawer-header"><div><p class="eyebrow">${t('Your selections')}</p><h2 id="order-drawer-title" data-order-drawer-title tabindex="-1">${t('Cart')}</h2></div><button class="order-drawer-close" type="button" aria-label="Close cart" data-order-list-close>&times;</button></div>
      <div class="order-drawer-body">
        <div class="order-empty" data-order-empty><span>＋</span><h3>${t('Your cart is empty')}</h3><p>Add a few favourites, then send an order request. Payment comes only after confirmation.</p><a class="button button-outline" href="shop.html">${t('Browse products')}</a></div>
        <div class="order-list-items" data-order-items></div><section class="cart-suggestions" data-cart-suggestions aria-label="${t("Suggestions for your cart","Suggestions pour votre panier")}" hidden></section>
      </div>
      <div class="order-drawer-footer" data-order-footer hidden><dl class="pink-cart-totals"><div><dt>${t("Products subtotal")}</dt><dd data-checkout-subtotal></dd></div><div data-promotion-row hidden><dt>${t("October soap offer applied")}</dt><dd data-promotion-discount></dd></div><div><dt>${t("Subtotal after promotion")}</dt><dd data-cart-total></dd></div></dl><p class="pink-cart-message" data-promotion-message aria-live="polite" hidden></p>
        <p class="order-confirmation-note">${t('No payment is taken now. Availability is confirmed before you pay.')}</p>
        <div class="order-send-options"><a class="button button-dark" href="checkout.html">Review request <span>→</span></a><a class="button button-outline" href="shop.html">${t('Keep shopping')}</a></div>
        <button class="clear-order-list" type="button" data-order-clear>${t('Clear cart')}</button>
      </div>
    </aside>
    <button class="order-list-fab" type="button" data-order-list-open hidden>${t("Cart")} <span data-order-count>0</span></button>
    <div class="order-toast" role="status" aria-live="polite" aria-atomic="true"></div>
    <dialog class="notify-dialog" data-notify-dialog aria-labelledby="notify-title">
      <form method="dialog" class="notify-dialog-close-form"><button type="submit" aria-label="Close notification form">×</button></form>
      <form class="notify-form" data-notify-form novalidate>
        <p class="eyebrow">One-time product update</p><h2 id="notify-title">Let me know when it’s ready</h2>
        <p>We’ll send one email when <strong data-notify-product-name>this product</strong> becomes available. No promotional emails are added from this request.</p>
        <input type="hidden" name="productId"><label for="notify-email">${t('Email address')}</label>
        <input id="notify-email" name="email" type="email" inputmode="email" autocomplete="email" maxlength="160" placeholder="you@example.com" required>
        <label class="consent-check"><input type="checkbox" name="notifyConsent" required><span>${t('Email me once when this product is available.','Envoyez-moi un courriel lorsque ce produit sera disponible.')}</span></label>
        <p class="notify-status" data-notify-status aria-live="polite"></p>
        <button class="button button-dark" type="submit">Notify me <span>→</span></button>
      </form>
    </dialog>`;

  if (footer) footer.innerHTML = `
    <section class="email-band newsletter-band"><div class="shell email-band-inner"><div><p class="eyebrow">Stay in the loop</p><h2>Small-batch news,<br>sent occasionally.</h2></div><form class="newsletter-form" data-newsletter-form><label for="newsletter-email">Email address</label><div class="newsletter-row"><input id="newsletter-email" name="email" type="email" inputmode="email" autocomplete="email" maxlength="160" pattern="[^@ ]+@[^@ ]+[.][A-Za-z]{2,}" title="Enter a complete email address, such as name@example.com." placeholder="you@example.com" required><button class="button button-light" type="submit">Join the list</button></div><label class="consent-check"><input name="consent" type="checkbox" required><span>I agree to receive occasional promotions from Just B Natural. I can unsubscribe anytime.</span></label><p class="newsletter-status" data-newsletter-status aria-live="polite"></p></form></div></section>
    <footer><div class="shell footer-grid"><div class="footer-brand"><a class="brand brand-light" href="index.html"><img class="brand-logo footer-logo" src="images/just-b-logo-192.webp" alt=""><span>JUST B<br>NATURAL</span></a><p>Handcrafted in Gatineau. For everyday rituals across Outaouais and nearby Ottawa.</p></div><div><h2>Explore</h2><a href="shop.html">All products</a><a href="artisan-soap.html">Artisan soaps</a><a href="sugar-scrubs.html">Sugar scrubs</a><a href="roller-oils.html">Botanical oils</a><a href="body-care.html">Body care</a><a href="home-linen.html">Home & linen</a><a href="faq.html">Ingredients & FAQ</a><a href="gift-sets.html">Gift combinations</a><a href="local-pickup.html">Pickup & delivery</a></div><div><h2>Connect</h2><a href="checkout.html">Request an order</a><a href="${STORE.instagramUrl}" target="_blank" rel="noreferrer">Follow @justb.naturals ↗</a><a href="mailto:${STORE.orderEmail}">${STORE.orderEmail}</a><a href="privacy.html">Privacy</a></div></div><div class="shell footer-bottom"><p>© 2026 ${STORE.name}.</p><p>For external use only unless otherwise stated.</p></div></footer>
    <button class="back-to-top" type="button" aria-label="Back to top">↑</button>`;
}

function fallbackArtMarkup(product) {
  if (product.art === "roller") return `<div class="art-object roller-object"><span class="roller-cap"></span><span class="art-label">${product.name.split(" ")[0]}</span></div>`;
  if (product.art === "dish") return `<div class="art-object dish-object"><span class="dish-brush"></span><span class="art-label">${product.label || "Dish Soap"}</span></div>`;
  if (product.art === "tin") return `<div class="art-object tin-object"><span class="art-label">Vanilla<br>Balm</span></div>`;
  if (product.art === "bar") return `<div class="art-object bar-object"><span class="art-label">${product.label || "Natural Soap"}</span></div>`;
  if (product.art === "spray") return `<div class="art-object spray-object"><span class="spray-nozzle"></span><span class="art-label">Rested<br>Linen Spray</span></div>`;
  const jarLabel = product.category === "pantry" ? "Crêpe<br>Mix" : product.name.includes("Scrub") ? "Sugar<br>Scrub" : "Body<br>Butter";
  return `<div class="art-object jar-object"><span class="jar-lid"></span><span class="art-label">${jarLabel}</span></div>`;
}

const PRODUCT_IMAGE_POSITIONS = Object.freeze({
  "almond-milk-mocha-soap": "50% 69%",
  "blue-cedar-soap": "50% 91%",
  "chamomile-soap": "50% 93%",
  "mint-eucalyptus-spa-soap": "50% 93%",
  "forest-soap": "50% 93%",
  "coconut-lavender-soap": "50% 93%",
  "chocolate-pumpkin-pie-soap": "50% 58%",
  "harvest-spa-scrub": "50% 72%",
  "honey-oat-comfort-soap": "50% 93%",
  "ocean-soap": "50% 92%",
  "rose-matter-soap": "50% 92%",
  "spiced-banana-soap": "50% 93%",
  "sweater-weather-soap": "50% 76%",
  "just-b-calm": "50% 50%",
  "just-b-relieved": "50% 54%",
  "cycle-harmony": "50% 50%"
});

const ARTISAN_DISPLAY_ORDER = Object.freeze([
  "matcha-lavender-soap",
  "blue-cedar-soap",
  "rosemary-sage-soap",
  "chamomile-soap",
  "lemon-rosemary-soap",
  "forest-soap",
  "ember-ash-soap",
  "ocean-soap",
  "whisper-citrus-soap",
  "rose-matter-soap",
  "charcoal-blush-soap",
  "sweater-weather-soap",
  "cedar-eucalyptus-loofah-soap",
  "mint-eucalyptus-spa-soap",
  "lemongrass-lavender-soap",
  "spiced-banana-soap",
  "ylang-ylang-soap",
  "coconut-lavender-soap",
  "unscented-loofah-soap",
  "honey-oat-comfort-soap",
  "cedar-lemon-soap",
  "chocolate-pumpkin-pie-soap",
  "almond-milk-mocha-soap"
]);

function productImageStyle(product) {
  return `object-position:${PRODUCT_IMAGE_POSITIONS[product.id] || "50% 50%"}`;
}

function artMarkup(product) {
  return `<img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy" style="${productImageStyle(product)}"><div class="art-fallback" hidden>${fallbackArtMarkup(product)}</div>${product.imageNote ? `<span class="photo-note">${product.imageNote}</span>` : ""}<span class="product-image-tagline" aria-hidden="true">Pure · Natural · Handcrafted</span>`;
}

function productCard(product) {
  const availabilityText = productAvailabilityText(product);
  const availability = availabilityText ? `<p class="stock-status${product.availabilityStatus === "preorder" ? " is-preorder" : ""}" data-stock-product="${product.id}">${productAvailabilityMarkup(product)}</p>` : `<p class="stock-status" data-stock-product="${product.id}" hidden></p>`;
  return `<article class="product-card" data-product-id="${product.id}" style="--tone:${product.tone};--accent:${product.accent}">
    <a class="product-art" href="${productPageUrl(product)}" aria-label="View ${product.name}"><span class="art-ring"></span>${artMarkup(product)}<span class="image-hint">View product</span></a>
    <div class="product-copy">
      <p class="product-kicker">${product.kicker}</p>
      <div class="product-title-row"><h2><a href="${productPageUrl(product)}">${product.name}</a></h2>${Number.isFinite(product.price) ? `<span class="product-price">${formatPrice(product.price)}</span>` : ""}</div>
      <p class="product-description">${product.cardDescription || product.description}</p>
      ${availability}
      <div class="product-order-options"><button class="button button-dark add-order-button" type="button" data-add-order="${product.id}">${product.availabilityStatus === "preorder" ? t("Preorder") : t("Add to cart")} <span>＋</span></button><button class="notify-product-button" type="button" data-notify-product="${product.id}" hidden>Notify me when available</button><a class="product-detail-link" href="${productPageUrl(product)}">${t("View full details")}</a></div>
    </div>
  </article>`;
}

function activateImageFallbacks(scope = document) {
  scope.querySelectorAll(".product-image").forEach(image => {
    image.addEventListener("error", () => {
      image.hidden = true;
      const fallback = image.nextElementSibling;
      if (fallback) fallback.hidden = false;
    }, { once: true });
  });
}

function renderProductGrid(grid, matches) {
  grid.innerHTML = matches.map(productCard).join("");
  grid.dataset.productIds = matches.map(product => product.id).join(",");
  const count = grid.closest("section")?.querySelector("[data-product-count]");
  if (count?.hasAttribute("data-category-summary")) {
    count.dataset.visibleProductIds = matches.map(product => product.id).join(",");
    count.textContent = availabilitySummary(matches);
  } else if (count) {
    count.textContent = `${matches.length} product${matches.length === 1 ? "" : "s"}`;
  }
  const empty = grid.closest("section")?.querySelector("[data-catalog-empty]");
  if (empty) empty.hidden = matches.length !== 0;
  activateImageFallbacks(grid);
  observeRevealItems(grid);
  if (STORE.orderListEnabled) renderOrderList();
}

function renderCatalogues() {
  document.querySelectorAll("[data-catalog], [data-category]").forEach(grid => {
    const category = grid.dataset.category;
    const catalogue = grid.dataset.catalog;
    let matches = PRODUCTS;
    if (category) matches = PRODUCTS.filter(product => product.category === category);
    if (catalogue === "featured") matches = featuredProducts();
    renderProductGrid(grid, matches);
    if (catalogue === "featured") initializeFeaturedCarousel(grid);
  });
}

function featuredProducts() {
  return PRODUCTS
    .filter(product => product.active !== false && product.availabilityStatus !== "preorder" && product.availabilityStatus !== "unavailable" && product.stock !== 0)
    .sort(() => Math.random() - .5);
}

function initializeFeaturedCarousel(grid) {
  if (typeof grid._featuredCarouselCleanup === "function") grid._featuredCarouselCleanup();
  grid.classList.add("featured-carousel");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const originals = [...grid.querySelectorAll(":scope > .product-card")];
  if (originals.length < 2 || grid.scrollWidth <= grid.clientWidth) return;
  const clones = originals.map(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("a, button, input, select, textarea").forEach(control => control.setAttribute("tabindex", "-1"));
    grid.append(clone);
    return clone;
  });
  let paused = false;
  let resumeTimer = 0;
  let frame = 0;
  let previousTime = 0;
  let position = grid.scrollLeft;
  const tick = time => {
    if (!paused && previousTime) {
      const elapsed = Math.min(time - previousTime, 40);
      const speed = window.matchMedia("(max-width: 620px)").matches ? .034 : .027;
      position += elapsed * speed;
      const loopWidth = clones[0].offsetLeft - originals[0].offsetLeft;
      if (loopWidth > 0 && position >= loopWidth) position -= loopWidth;
      grid.scrollLeft = position;
    }
    previousTime = time;
    frame = requestAnimationFrame(tick);
  };
  const pause = () => {
    window.clearTimeout(resumeTimer);
    paused = true;
    position = grid.scrollLeft;
  };
  const resume = () => {
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => {
      paused = false;
      position = grid.scrollLeft;
      previousTime = performance.now();
    }, 900);
  };
  const syncPosition = () => { if (paused) position = grid.scrollLeft; };
  const handleVisibility = () => { if (document.hidden) pause(); else resume(); };
  grid.addEventListener("focusin", pause);
  grid.addEventListener("focusout", resume);
  grid.addEventListener("pointerdown", pause);
  grid.addEventListener("pointerup", resume);
  grid.addEventListener("pointercancel", resume);
  grid.addEventListener("touchstart", pause, { passive: true });
  grid.addEventListener("touchend", resume, { passive: true });
  grid.addEventListener("scroll", syncPosition, { passive: true });
  document.addEventListener("visibilitychange", handleVisibility);
  frame = requestAnimationFrame(tick);
  grid._featuredCarouselCleanup = () => {
    cancelAnimationFrame(frame);
    window.clearTimeout(resumeTimer);
    grid.removeEventListener("focusin", pause);
    grid.removeEventListener("focusout", resume);
    grid.removeEventListener("pointerdown", pause);
    grid.removeEventListener("pointerup", resume);
    grid.removeEventListener("pointercancel", resume);
    grid.removeEventListener("touchstart", pause);
    grid.removeEventListener("touchend", resume);
    grid.removeEventListener("scroll", syncPosition);
    document.removeEventListener("visibilitychange", handleVisibility);
    clones.forEach(clone => clone.remove());
    delete grid._featuredCarouselCleanup;
  };
}

function orderItemMarkup(item) {
  const product = PRODUCTS.find(candidate => candidate.id === item.id);
  if (!product) return "";
  const key = orderLineKey(item);
  return `<article class="order-list-item" data-order-item="${escapeHtml(key)}">
    <a href="${productPageUrl(product)}" aria-label="View ${product.name}"><img src="${product.image}" alt="" loading="lazy"></a>
    <div class="order-item-copy"><h3><a href="${productPageUrl(product)}">${product.name}</a></h3><p>${t(CATEGORY_LABELS[product.category] || "Just B Natural")}${Number.isFinite(product.price) ? ` · ${formatPrice(product.price * item.quantity)}` : ""}</p>
      <div class="order-item-controls"><div class="quantity-control" aria-label="Quantity for ${product.name}"><button type="button" data-order-quantity="-1" data-order-key="${escapeHtml(key)}" aria-label="Remove one ${product.name}">−</button><strong aria-live="polite">${item.quantity}</strong><button type="button" data-order-quantity="1" data-order-key="${escapeHtml(key)}" aria-label="Add one ${product.name}">+</button></div><button class="remove-order-item" type="button" data-order-remove="${escapeHtml(key)}">${t("Remove")}</button></div>
    </div>
  </article>`;
}

function updateAddButton(button) {
  const product = PRODUCTS.find(candidate => candidate.id === button.dataset.addOrder);
  const unavailable = product && (product.availabilityStatus === "unavailable" || product.active === false || (product.stock === 0 && product.availabilityStatus !== "preorder"));
  const item = findOrderLine(button.dataset.addOrder);
  button.disabled = false;
  button.hidden = Boolean(unavailable);
  button.classList.toggle("is-added", Boolean(item));
  const base = product?.availabilityStatus === "preorder" ? t("Preorder") : t("Add to cart");
  button.innerHTML = `${item ? `${t("Added","Ajouté")} ✓ · ${item.quantity} ${t("in cart","au panier")}` : base} <span>＋</span>`;
}

function renderOrderList() {
  const count = orderItemCount();
  document.querySelectorAll("[data-order-count]").forEach(node => { node.textContent = count; });
  document.querySelectorAll("[data-order-email]").forEach(link => { link.href = fullOrderEmailUrl(); });

  const items = document.querySelectorAll("[data-order-items]");
  const empty = document.querySelectorAll("[data-order-empty]");
  const footer = document.querySelectorAll("[data-order-footer]");
  const notes = document.querySelector("[data-order-notes]");
  const fab = document.querySelector(".order-list-fab");
  items.forEach(node => { node.innerHTML = orderList.map(orderItemMarkup).join(""); });
  empty.forEach(node => { node.hidden = orderList.length > 0; });
  footer.forEach(node => { node.hidden = orderList.length === 0; });
  if (notes && notes.value !== orderNotes) notes.value = orderNotes;
  if (fab) fab.hidden = count === 0;

  document.querySelectorAll("[data-add-order]").forEach(updateAddButton);
  updateCheckoutTotals();
  syncCheckoutState();
}

function showOrderToast(message, checkout = false) {
  const toast = document.querySelector(".order-toast");
  if (!toast) return;
  toast.replaceChildren();
  const text=document.createElement('span');text.textContent=message;toast.append(text);
  if(checkout){const link=document.createElement('a');link.href='checkout.html'+(campaignLanguage==='fr'?'?lang=fr':'');link.textContent=t('Checkout →','Commander →');toast.append(link);}

  toast.classList.add("is-visible");
  window.clearTimeout(showOrderToast.timeout);
  showOrderToast.timeout = window.setTimeout(() => {if(!toast.matches(":focus-within"))toast.classList.remove("is-visible");}, checkout ? 6500 : 2800);
}

function addToOrderList(productId) {
  const product = PRODUCTS.find(candidate => candidate.id === productId);
  if (!product || product.availabilityStatus === "unavailable" || product.active === false || (product.stock === 0 && product.availabilityStatus !== "preorder")) return null;
  const existing = findOrderLine(productId);
  if(product.availabilityStatus!=="preorder"&&Number.isInteger(product.stock)&&(existing?.quantity||0)>=product.stock){showOrderToast(t("That is all the stock available right now.","C’est tout le stock disponible pour le moment."));return null;}
  if (existing) existing.quantity = Math.min(99, existing.quantity + 1);
  else orderList.push({ id: productId, quantity: 1 });
  saveOrderList();
  renderOrderList();
  document.dispatchEvent?.(new CustomEvent("jbn:cart-add",{detail:{id:productId}}));
  showOrderToast(t(`Added ✓ · ${product.name}`,`Ajouté ✓ · ${product.name}`), true);
  const fab = document.querySelector(".order-list-fab");
  if (fab) {
    fab.classList.remove("is-bumping");
    requestAnimationFrame(() => fab.classList.add("is-bumping"));
  }
  return existing || orderList[orderList.length - 1];
}

function changeOrderQuantity(key, change) {
  const item = orderList.find(candidate => orderLineKey(candidate) === key);
  if (!item) return;
  const product=PRODUCTS.find(p=>p.id===item.id);
  if(change>0&&product?.availabilityStatus!=="preorder"&&Number.isInteger(product?.stock)&&item.quantity>=product.stock)return;
  item.quantity += change;
  if (item.quantity < 1) orderList = orderList.filter(candidate => orderLineKey(candidate) !== key);
  else item.quantity = Math.min(99, item.quantity);
  saveOrderList();
  renderOrderList();
}

function openOrderDrawer(opener) {
  const drawer = document.querySelector(".order-drawer");
  const backdrop = document.querySelector(".order-drawer-backdrop");
  if (!drawer || !backdrop) return;
  orderDrawerOpener = opener || document.activeElement;

  const menu = document.querySelector(".mobile-menu");
  const menuBackdrop = document.querySelector(".menu-backdrop");
  const menuButton = document.querySelector(".menu-button");
  if (menu) { menu.classList.remove("is-open"); menu.setAttribute("aria-hidden", "true"); }
  if (menuBackdrop) menuBackdrop.hidden = true;
  if (menuButton) menuButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");

  renderOrderList();
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
  document.body.classList.add("order-open");
  drawer.querySelector(".order-drawer-close")?.focus();
}

function closeOrderDrawer() {
  const drawer = document.querySelector(".order-drawer");
  const backdrop = document.querySelector(".order-drawer-backdrop");
  if (!drawer || !backdrop) return;
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  backdrop.hidden = true;
  document.body.classList.remove("order-open");
  if (orderDrawerOpener instanceof HTMLElement) orderDrawerOpener.focus();
}

function copyOrderSummary(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  return new Promise((resolve, reject) => {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    try {
      document.execCommand("copy") ? resolve() : reject(new Error("Copy failed"));
    } catch (error) {
      reject(error);
    } finally {
      field.remove();
    }
  });
}

function initializeOrderList() {
  if (!STORE.orderListEnabled) return;
  renderOrderList();

  document.addEventListener("click", event => {
    const addButton = event.target.closest("[data-add-order]");
    if (addButton) {
      event.preventDefault();
      const item = addToOrderList(addButton.dataset.addOrder);
      if (addButton.classList.contains("dialog-add-order")) {
        const status = addButton.closest("dialog")?.querySelector("[data-dialog-add-status]");
        if (status) {
          status.hidden = false;
          const quantity = status.querySelector("[data-dialog-add-quantity]");
          if (quantity) quantity.textContent = item?.quantity || 1;
        }
      }
      return;
    }

    const opener = event.target.closest("[data-order-list-open]");
    if (opener) {
      event.preventDefault();
      openOrderDrawer(opener);
      return;
    }

    if (event.target.closest("[data-order-list-close]")) {
      closeOrderDrawer();
      return;
    }

    const quantityButton = event.target.closest("[data-order-quantity]");
    if (quantityButton) {
      changeOrderQuantity(quantityButton.dataset.orderKey, Number(quantityButton.dataset.orderQuantity));
      return;
    }

    const removeButton = event.target.closest("[data-order-remove]");
    if (removeButton) {
      orderList = orderList.filter(item => orderLineKey(item) !== removeButton.dataset.orderRemove);
      saveOrderList();
      renderOrderList();
      return;
    }

    if (event.target.closest("[data-order-clear]")) {
      if (window.confirm("Clear every item from your cart?")) {
        orderList = [];
        orderNotes = "";
        saveOrderList();
        renderOrderList();
      }
      return;
    }

    if (event.target.closest("[data-order-instagram]")) {
      if (!orderList.length) return;
      const copyPromise = copyOrderSummary(buildOrderSummary());
      window.open(STORE.instagramDmUrl, "_blank", "noopener,noreferrer");
      copyPromise.then(
        () => showOrderToast("Order copied. Paste it into the Instagram DM."),
        () => showOrderToast("Instagram opened. Please copy your order details manually.")
      );
    }
  });

  document.addEventListener("input", event => {
    if (!event.target.matches("[data-order-notes]")) return;
    orderNotes = event.target.value;
    saveOrderList();
    document.querySelectorAll("[data-order-email]").forEach(link => { link.href = fullOrderEmailUrl(); });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && document.body.classList.contains("order-open")) closeOrderDrawer();
  });
}

function initializeMenu() {
  const opener = document.querySelector(".menu-button");
  const menu = document.querySelector(".mobile-menu");
  const backdrop = document.querySelector(".menu-backdrop");
  if (!opener || !menu || !backdrop) return;

  const setOpen = open => {
    menu.classList.toggle("is-open", open);
    backdrop.hidden = !open;
    document.body.classList.toggle("menu-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    opener.setAttribute("aria-expanded", String(open));
  };
  opener.addEventListener("click", () => setOpen(true));
  menu.querySelector("button").addEventListener("click", () => setOpen(false));
  backdrop.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", event => { if (event.key === "Escape") setOpen(false); });
}

function initializeCatalogueFeatures() {
  const search = document.querySelector("[data-product-search]");
  const sort = document.querySelector("[data-product-sort]");
  const shopGrid = document.querySelector('[data-catalog="all"]');
  const categoryGrid = document.querySelector("[data-category]");
  const requestedSearch = new URLSearchParams(location.search).get("search");
  if (search && requestedSearch && !search.value) search.value = requestedSearch;

  const selectAndSortProducts = (products, query, categoryContext = "") => {
    const matches = products.filter(product => {
      const searchable = [product.name, product.kicker, product.description, ...product.ingredients, ...productTags(product)].join(" ").toLowerCase();
      return searchable.includes(query) && (!document.body.dataset.scent || document.body.dataset.scent === "all" || scentFamilies(product).includes(document.body.dataset.scent));
    });
    if (sort?.value === "name") matches.sort((a, b) => a.name.localeCompare(b.name));
    if (sort?.value === "featured" && categoryContext === "artisan-soap") {
      matches.sort((a, b) => ARTISAN_DISPLAY_ORDER.indexOf(a.id) - ARTISAN_DISPLAY_ORDER.indexOf(b.id));
    } else if (sort?.value === "featured") {
      matches.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    if (sort?.value === "price-low") matches.sort((a, b) => (Number.isFinite(a.price) ? a.price : Infinity) - (Number.isFinite(b.price) ? b.price : Infinity) || a.name.localeCompare(b.name));
    if (sort?.value === "price-high") matches.sort((a, b) => (Number.isFinite(b.price) ? b.price : -Infinity) - (Number.isFinite(a.price) ? a.price : -Infinity) || a.name.localeCompare(b.name));
    return sort?.value === "preorder"
      ? matches.filter(product => product.active !== false && product.availabilityStatus === "preorder")
      : matches;
  };

  if (shopGrid) {
    const filterButtons = [...document.querySelectorAll("[data-category-filter]")];
    const hashCategory = window.location.hash.replace("#", "");
    let activeCategory = filterButtons.some(button => button.dataset.categoryFilter === hashCategory) ? hashCategory : "all";

    const updateShopGrid = () => {
      const query = search?.value.trim().toLowerCase() || "";
      const products = PRODUCTS.filter(product => activeCategory === "all" || product.category === activeCategory);
      const visibleMatches = selectAndSortProducts(products, query, activeCategory);
      renderProductGrid(shopGrid, visibleMatches);
      filterButtons.forEach(button => {
        const selected = button.dataset.categoryFilter === activeCategory;
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
    };

    filterButtons.forEach(button => {
      button.addEventListener("click", () => {
        activeCategory = button.dataset.categoryFilter || "all";
        updateShopGrid();
      });
    });
    search?.addEventListener("input", updateShopGrid);
    sort?.addEventListener("change", updateShopGrid);
    updateShopGrid();
  } else if (categoryGrid) {
    const category = categoryGrid.dataset.category;
    const updateCategoryGrid = () => {
      const query = search?.value.trim().toLowerCase() || "";
      const products = PRODUCTS.filter(product => product.category === category);
      renderProductGrid(categoryGrid, selectAndSortProducts(products, query, category));
    };
    search?.addEventListener("input", updateCategoryGrid);
    sort?.addEventListener("change", updateCategoryGrid);
    updateCategoryGrid();
  }


  const dialog = document.querySelector("[data-image-dialog]");
  document.addEventListener("click", event => {
    const imageButton = event.target.closest("[data-image-open]");
    if (!imageButton || !dialog) return;
    const product = PRODUCTS.find(item => item.id === imageButton.dataset.imageOpen);
    if (!product) return;
    const image = dialog.querySelector("img");
    image.src = product.image;
    image.alt = product.name;
    dialog.querySelector("h2").textContent = product.name;
    const dialogAdd = dialog.querySelector(".dialog-add-order");
    dialogAdd.dataset.addOrder = product.id;
    const status = dialog.querySelector("[data-dialog-add-status]");
    if (status) status.hidden = true;
    renderOrderList();
    dialog.showModal();
  });

  if (dialog) {
    dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  }

  const backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    window.addEventListener("scroll", () => backToTop.classList.toggle("is-visible", window.scrollY > 700), { passive: true });
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
}

function productGuidance(product) {
  const guidance = {
    "roller-oils": {
      use: "Roll lightly onto pulse points such as wrists or the back of the neck. Use only as directed and avoid the eye area.",
      care: "Store upright in a cool, dry place away from direct sunlight. Patch test before first use.",
      detail: "A portable aromatherapy blend for simple, personal everyday rituals."
    },
    "sugar-scrubs": {
      use: "Massage a small amount over damp skin using gentle circular motions, then rinse well.",
      care: "Keep water out of the jar and store closed in a cool, dry place. Use caution on slippery surfaces.",
      detail: "Organic cane sugar and rich plant oils create a softly polishing, nourishing texture."
    },
    "body-care": {
      use: "Warm a small amount between clean hands and massage into dry skin as needed. A little goes a long way.",
      care: "Store closed in a cool, dry place. Natural products may soften or change texture with temperature.",
      detail: "A concentrated, small-batch moisturizer designed for a simple daily care routine."
    },
    "artisan-soap": {
      use: "Lather with water, wash, and rinse thoroughly. Suitable for everyday cleansing unless otherwise noted.",
      care: "Allow the bar to dry fully between uses to help it stay firm and last longer.",
      detail: "A traditionally made bar cured slowly for a mild, firm and long-lasting soap."
    },
    "home-linen": {
      use: "Shake gently and mist lightly over linens from a safe distance. Test a hidden area before wider use.",
      care: "Store upright away from heat and direct sunlight. Keep away from children and pets.",
      detail: "Thoughtfully selected products for simple home and linen care."
    }
  };
  const selected = guidance[product.category] || {
    use: "Follow the directions provided with the current product.",
    care: "Store in a cool, dry place and confirm current care instructions before use.",
    detail: "Handcrafted in a small batch with thoughtfully selected ingredients."
  };
  if (product.use) selected.use = product.use;
  if (product.safety) selected.care = product.safety;
  return selected;
}

function conciseProductUse(product) {
  const french = Boolean(globalThis.JBN_FR?.isFrench);
  const specific = {
    "solid-dish-soap": french ? "Mouiller la brosse, la frotter sur le savon pour créer une mousse, laver, puis bien rincer." : "Wet the brush, swirl it over the soap to create a lather, wash, then rinse thoroughly.",
    "just-b-rested-room-spray": french ? "Agiter doucement, puis vaporiser légèrement à une distance sécuritaire. Tester d'abord sur une zone peu visible." : "Shake gently and mist lightly from a safe distance. Test a hidden area first."
  };
  if (specific[product.id]) return specific[product.id];
  const byCategory = {
    "artisan-soap": french ? "Faire mousser avec de l'eau, laver, puis bien rincer. Convient au nettoyage quotidien, sauf indication contraire." : "Lather with water, wash and rinse thoroughly. Suitable for everyday cleansing unless otherwise noted.",
    "sugar-scrubs": french ? "Masser une petite quantité sur la peau humide en mouvements circulaires, puis bien rincer." : "Massage a small amount over damp skin using gentle circular motions, then rinse well.",
    "roller-oils": french ? "Appliquer sur les points de pulsation, respirer les arômes, puis renouveler au besoin." : "Apply to pulse points, breathe in the aroma, and reapply as needed.",
    "body-care": french ? "Réchauffer une petite quantité entre les mains, puis masser sur la peau sèche. Une petite quantité suffit." : "Warm a small amount between clean hands, then massage into dry skin. A little goes a long way.",
    "home-linen": french ? "Utiliser une petite quantité selon les besoins et suivre les indications propres au produit." : "Use a small amount as needed and follow the product-specific directions."
  };
  return byCategory[product.category] || product.use || "Follow the directions provided with the product.";
}

function productDetailCards(product, sections) {
  const french = Boolean(globalThis.JBN_FR?.isFrench);
  const labels = {
    "artisan-soap": french ? ["Mousse et fabrication", "Senteur et caractère", "Rituel quotidien"] : ["Craft & lather", "Scent & character", "Daily ritual"],
    "sugar-scrubs": french ? ["Texture et soin", "Senteur et fini", "Rituel quotidien"] : ["Texture & care", "Scent & finish", "Daily ritual"],
    "roller-oils": french ? ["Mélange et intention", "Arômes et rituel", "À emporter"] : ["Blend & purpose", "Aroma & ritual", "Made to travel"],
    "body-care": french ? ["Texture et soin", "Formule simple", "Rituel quotidien"] : ["Texture & care", "Simple formula", "Daily ritual"],
    "home-linen": french ? ["Usage et caractère", "Formule réfléchie", "Au quotidien"] : ["Purpose & character", "Thoughtful formula", "Everyday use"]
  };
  const fallback = french ? ["Ce qui le distingue", "Caractère", "Au quotidien"] : ["What makes it special", "Character", "Everyday use"];
  const headings = labels[product.category] || fallback;
  const paragraphs = sections.flatMap(section => section.paragraphs || []).slice(0, 3);
  return paragraphs.map((paragraph, index) => {
    const sentences = String(paragraph).trim().split(/(?<=[.!?])\s+/).filter(Boolean);
    const copy = sentences.slice(0, 2).join(" ");
    return { heading: headings[index] || headings[headings.length - 1], copy };
  });
}

const PRODUCT_TAG_RULES = Object.freeze([
  { pattern: /calm|sooth|relax|comfort|apais|calm|réconfort/i, en: "Calming", fr: "Apaisant" },
  { pattern: /refresh|cool|peppermint|eucalyptus|mint|frais|menthe|eucalyptus/i, en: "Refreshing", fr: "Rafraîchissant" },
  { pattern: /floral|lavender|rose|geranium|ylang|chamomile|fleur|lavande|géranium|camomille/i, en: "Floral", fr: "Floral" },
  { pattern: /citrus|grapefruit|lemon|orange|agrum|pamplemousse|citron/i, en: "Citrus", fr: "Agrumes" },
  { pattern: /woody|wood|cedar|forest|frankincense|bois|boisé|cèdre|forêt|encens/i, en: "Woody", fr: "Boisé" },
  { pattern: /earthy|resin|patchouli|terreux|résine/i, en: "Earthy", fr: "Terreux" },
  { pattern: /botanical|herbal|rosemary|sage|plant|botanique|herbac|romarin|sauge/i, en: "Botanical", fr: "Botanique" },
  { pattern: /soft|gentle|mild|doux|douce|délicat/i, en: "Soft", fr: "Doux" },
  { pattern: /warm|spice|cinnamon|pumpkin|cocoa|coffee|vanilla|chaleur|épic|cannelle|citrouille|cacao|café|vanille/i, en: "Warm", fr: "Chaleureux" },
  { pattern: /unscented|fragrance.free|essential.oil.free|au naturel/i, en: "Unscented", fr: "Au naturel" }
]);

function productTags(product) {
  const french = Boolean(globalThis.JBN_FR?.isFrench);
  const floralProducts = new Set(["coconut-lavender-soap", "ylang-ylang-soap"]);
  const excludedTags = {
    "rosemary-sage-soap": new Set(["Botanical"]),
    "ember-ash-soap": new Set(["Citrus"]),
    "vanilla-infused-tallow": new Set(["Woody", "Earthy"]),
    "unscented-tallow": new Set(["Botanical", "Soft", "Warm"])
  };
  const overrides = {
    "just-b-rested-room-spray": french ? ["Apaisant", "Boisé", "Terreux", "Botanique", "Doux"] : ["Calming", "Woody", "Earthy", "Botanical", "Soft"],
    "just-b-calm": french ? ["Apaisant", "Ancrant", "Agrumes", "Floral", "Herbacé"] : ["Calming", "Grounding", "Citrus", "Floral", "Herbal"],
    "just-b-relieved": french ? ["Rafraîchissant", "Mentholé", "Herbacé", "Ancrant", "Portatif"] : ["Cooling", "Minty", "Herbal", "Grounding", "Portable"],
    "cycle-harmony": french ? ["Apaisant", "Floral", "Herbacé", "Ancrant", "Soin du cycle"] : ["Soothing", "Floral", "Herbal", "Grounding", "Cycle care"]
  };
  if (overrides[product.id]) return overrides[product.id];
  const categoryTags = {
    "artisan-soap": french ? ["Mousse crémeuse"] : ["Creamy lather"],
    "sugar-scrubs": french ? ["Exfoliant", "Nourrissant"] : ["Exfoliating", "Nourishing"],
    "roller-oils": french ? ["Huile botanique", "Portatif"] : ["Botanical oil", "Portable"],
    "body-care": french ? ["Hydratant", "Sans eau"] : ["Moisturizing", "Water-free"],
    "home-linen": french ? ["Pratique", "Zéro déchet"] : ["Practical", "Zero-waste"]
  };
  const source = [product.name, product.description, product.cardDescription, ...(product.ingredients || []), ...(product.details || [])].join(" ");
  const tags = [...(categoryTags[product.category] || [])];
  PRODUCT_TAG_RULES.forEach(rule => {
    if (rule.en === "Floral" && !floralProducts.has(product.id)) return;
    if (excludedTags[product.id]?.has(rule.en)) return;
    const label = french ? rule.fr : rule.en;
    if (rule.pattern.test(source) && !tags.includes(label)) tags.push(label);
  });
  return tags.slice(0, 5);
}

function renderProductPage() {
  const mount = document.querySelector("[data-product-page]");
  if (!mount) return;
  const product = PRODUCTS.find(item => item.id === document.body.dataset.productId);
  if (!product) {
    mount.innerHTML = `<section class="product-not-found shell"><p class="eyebrow">Product not found</p><h1>This product page is unavailable.</h1><a class="button button-dark" href="shop.html">Browse all products</a></section>`;
    return;
  }

  const guide = productGuidance(product);
  const productSections = Array.isArray(product.sections) && product.sections.length
    ? product.sections
    : [{ title: "About this product", paragraphs: [product.description, ...(product.details || [])] }];
  const fullDescription = String(product.description || "").trim();
  const cardDescription = String(product.cardDescription || "").trim();
  const firstSentence = fullDescription.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || fullDescription;
  const heroDescription = fullDescription.length > 360
    ? (cardDescription && !/[.…]$/.test(cardDescription) ? cardDescription : firstSentence)
    : fullDescription;
  const normalizeCopy = value => String(value || "").trim().replace(/\s+/g, " ");
  const storySections = productSections
    .filter(section => !["How to use", "Before using"].includes(section.title))
    .map(section => ({
      ...section,
      paragraphs: section.paragraphs.map(paragraph => {
        if (normalizeCopy(paragraph) !== normalizeCopy(fullDescription)) return paragraph;
        if (normalizeCopy(heroDescription) === normalizeCopy(fullDescription)) return "";
        return fullDescription.startsWith(heroDescription) ? fullDescription.slice(heroDescription.length).trim() : paragraph;
      }).filter(Boolean)
    }))
    .filter(section => section.paragraphs.length);
  const howTo = conciseProductUse(product);
  const beforeUsing = productSections.find(section => section.title === "Before using")?.paragraphs.join(" ") || product.safety || "Review the complete ingredient list before use. Stop use if irritation occurs. For external use only.";
  const availabilityText = productAvailabilityText(product);
  const stockMarkup = availabilityText ? `<p class="stock-status product-detail-stock${product.availabilityStatus === "preorder" ? " is-preorder" : ""}" data-stock-product="${product.id}">${productAvailabilityMarkup(product)}</p>` : `<p class="stock-status product-detail-stock" data-stock-product="${product.id}" hidden></p>`;
  const categoryLabel = CATEGORY_LABELS[product.category] || "Just B Natural";
  const related = PRODUCTS.filter(item => item.category === product.category && item.id !== product.id).slice(0, 3);
  const ingredientsText = product.ingredients.join(" ");
  const tags = productTags(product);
  const useDetailsOpen = window.matchMedia("(max-width: 620px)").matches ? "" : " open";
  const detailCards = productDetailCards(product, storySections);
  const storyMarkup = storySections.length ? `
    <section class="product-story-section">
      <details class="shell product-more-details">
        <summary><span><small>Product details</small><strong>More about this product</strong></span><b aria-hidden="true">＋</b></summary>
        <div class="product-more-copy product-more-copy--${Math.min(detailCards.length, 3)}">${detailCards.map(card => `<article class="product-detail-highlight"><strong>${card.heading}</strong><p>${card.copy}</p></article>`).join("")}</div>
      </details>
    </section>` : "";
  document.title = `${product.name} | ${STORE.name}`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = product.description;

  mount.innerHTML = `
    <div class="shell product-detail-shell">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a href="shop.html#${product.category}">${categoryLabel}</a><span>/</span><span>${product.name}</span></nav>
      <section class="product-detail-hero" style="--tone:${product.tone};--accent:${product.accent}">
        <div class="product-detail-media"><span class="product-detail-ring" aria-hidden="true"></span><img src="${product.image}" alt="${product.name}" style="${productImageStyle(product)}"><span class="product-image-tagline product-image-tagline--detail" aria-hidden="true">Pure · Natural · Handcrafted</span></div>
        <div class="product-detail-purchase">
          <p class="eyebrow">${product.kicker}</p>
          <h1>${product.name}</h1>
          <p class="product-detail-kicker">${categoryLabel}</p>
          ${Number.isFinite(product.price) ? `<p class="product-detail-price" data-price-product="${product.id}">${formatPrice(product.price)}</p>` : `<p class="product-detail-price" data-price-product="${product.id}" hidden></p>`}
          <p class="product-detail-description">${heroDescription}</p>
          <div class="product-ingredients-card">
            <strong>Ingredients</strong>
            <p>${ingredientsText}</p>
            ${product.note ? `<small>${product.note}</small>` : ""}
          </div>
          ${stockMarkup}
          <button class="button button-dark product-detail-add" type="button" data-add-order="${product.id}">${product.availabilityStatus === "preorder" ? t("Preorder") : t("Add to cart")} <span>＋</span></button>
          <button class="notify-product-button notify-product-button--detail" type="button" data-notify-product="${product.id}" hidden>Notify me when available</button>
          <div class="product-detail-tags" aria-label="Product tags">${tags.map(tag => `<a href="shop.html?search=${encodeURIComponent(tag)}">${tag}</a>`).join("")}</div>
        </div>
      </section>
    </div>
    ${storyMarkup}
    <section class="shell product-use-section">
      <details class="product-use-item"${useDetailsOpen}><summary><h2>How to use</h2><span aria-hidden="true">＋</span></summary><p>${howTo}</p></details>
      <details class="product-use-item"${useDetailsOpen}><summary><h2>Care & storage</h2><span aria-hidden="true">＋</span></summary><p>${guide.care}</p></details>
      <details class="product-use-item"${useDetailsOpen}><summary><h2>Before using</h2><span aria-hidden="true">＋</span></summary><p>${beforeUsing}</p></details>
    </section>
    <section class="related-products section shell" ${related.length ? "" : "hidden"}>
      <div class="section-heading"><div><p class="eyebrow">You may also like</p><h2>More from ${categoryLabel}</h2></div><a class="text-link" href="shop.html#${product.category}">View category <span>→</span></a></div>
      <div class="product-grid">${related.map(productCard).join("")}</div>
    </section>`;
  activateImageFallbacks(mount);
}

function initializeInlineValidation(form) {
  const fields = [...form.elements].filter(field => field.willValidate && !["radio", "checkbox", "hidden", "submit"].includes(field.type));

  const fieldName = field => {
    const names = { firstName: "First name", lastName: "Last name", email: "Email address", phone: "Phone number", area: "Neighbourhood or general area", deliveryAddress: "Delivery address", notes: "Order notes" };
    return names[field.name] || "This field";
  };

  const messageFor = field => {
    const validity = field.validity;
    if (validity.valid) return "";
    if (validity.customError) return field.validationMessage;
    if (validity.valueMissing) return `${fieldName(field)} is required.`;
    if (field.type === "email" || field.name === "email") return "Enter a complete email address, such as name@example.com.";
    if (field.name === "firstName" || field.name === "lastName") return `${fieldName(field)} must use letters, spaces, apostrophes or hyphens.`;
    if (field.name === "phone") return "Enter a valid phone number using numbers and standard phone punctuation.";
    if (validity.tooShort) return `${fieldName(field)} is too short.`;
    if (validity.tooLong) return `${fieldName(field)} is too long.`;
    return field.validationMessage || `Check ${fieldName(field).toLowerCase()} and try again.`;
  };

  const errorFor = (field, index) => {
    const parent = field.closest("label") || field.parentElement;
    let error = parent?.querySelector(":scope > .field-error");
    if (!error && parent) {
      error = document.createElement("small");
      error.className = "field-error";
      error.id = `field-error-${field.name || index}-${index}`;
      error.setAttribute("aria-live", "polite");
      parent.append(error);
      const describedBy = new Set((field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
      describedBy.add(error.id);
      field.setAttribute("aria-describedby", [...describedBy].join(" "));
    }
    return error;
  };

  const controls = fields.map((field, index) => ({ field, error: errorFor(field, index) }));
  const update = (field, error, force = false) => {
    const message = messageFor(field);
    const visible = Boolean(message) && (force || form.classList.contains("was-validated") || document.activeElement !== field);
    error.textContent = visible ? message : "";
    error.classList.toggle("is-visible", visible);
    field.setAttribute("aria-invalid", visible ? "true" : "false");
  };

  controls.forEach(({ field, error }) => {
    field.addEventListener("invalid", event => { event.preventDefault(); update(field, error, true); });
    field.addEventListener("input", () => update(field, error));
    field.addEventListener("change", () => update(field, error));
    field.addEventListener("blur", () => update(field, error, Boolean(field.value)));
  });

  return (force = false) => controls.forEach(({ field, error }) => update(field, error, force));
}

function syncCheckoutState() {
  const checkout = document.querySelector("[data-checkout]");
  if (!checkout) return;
  const empty = checkout.querySelector("[data-checkout-empty]");
  const content = checkout.querySelector("[data-checkout-content]");
  if (checkout.dataset.completed === "true") {
    if (empty) empty.hidden = true;
    if (content) content.hidden = true;
    return;
  }
  if (empty) empty.hidden = orderList.length > 0;
  if (content) content.hidden = orderList.length === 0;
  checkout.querySelectorAll("[data-checkout-count]").forEach(node => { node.textContent = orderItemCount(); });
  updateCheckoutTotals();
  const submit = checkout.querySelector('.checkout-submit');
  if (submit && !submit.disabled) submit.textContent = "Request order";
}

function initializeNewsletter() {
  document.querySelectorAll("[data-newsletter-form]").forEach(form => {
    const updateValidation = initializeInlineValidation(form);
    form.addEventListener("submit", async event => {
      event.preventDefault();
      form.classList.add("was-validated");
      if (!form.reportValidity()) {
        updateValidation(true);
        return;
      }
      const button = form.querySelector('[type="submit"]');
      const status = form.querySelector("[data-newsletter-status]");
      const email = String(new FormData(form).get("email") || "").trim();
      button.disabled = true;
      status.textContent = "Joining…";

      if (window.location.protocol === "file:") {
        status.textContent = "The signup form is ready and will collect emails once the website is published.";
        button.disabled = false;
        return;
      }

      try {
        const response = await fetch(STORE.subscribeEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            consent: true,
            consentText: "I agree to receive occasional promotions from Just B Natural. I can unsubscribe anytime.",
            consentedAt: new Date().toISOString(),
            source: "website-footer"
          })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Signup could not be completed.");
        status.textContent = "You are on the list. Thank you.";document.dispatchEvent?.(new CustomEvent("jbn:signup"));
        form.reset();
      } catch (error) {
        status.textContent = `We could not add this email right now. Please contact ${STORE.orderEmail}.`;
      } finally {
        button.disabled = false;
      }
    });
  });
}

let revealObserver;

function observeRevealItems(scope = document) {
  const selectors = [
    ".section-heading",
    ".category-card",
    ".product-card",
    ".instagram-copy",
    ".instagram-menu-card",
    ".order-steps > li",
    ".category-icon-card",
    ".category-note > *",
    "[data-reveal]"
  ].join(",");
  const items = [...scope.querySelectorAll(selectors)].filter(item => !item.dataset.revealBound);
  if (!items.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!revealObserver && "IntersectionObserver" in window && !reducedMotion) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8%" });
  }

  items.forEach((item, index) => {
    item.dataset.revealBound = "true";
    item.classList.add("reveal-item");
    item.style.setProperty("--reveal-delay", `${(index % 4) * 65}ms`);
    if (revealObserver) revealObserver.observe(item);
    else item.classList.add("is-revealed");
  });
}

function initializeScrollLife() {
  observeRevealItems();
  const progress = document.querySelector(".scroll-progress span");
  const header = document.querySelector(".site-header");
  const heroArt = document.querySelector(".hero-art");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ticking = false;

  const updateScrollEffects = () => {
    const scrollTop = window.scrollY;
    const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    if (progress) progress.style.transform = `scaleX(${Math.min(scrollTop / scrollable, 1)})`;
    if (header) header.classList.toggle("is-scrolled", scrollTop > 45);
    if (heroArt && !reducedMotion) {
      const drift = Math.min(scrollTop, 780);
      heroArt.style.setProperty("--drift-main", `${drift * -0.035}px`);
      heroArt.style.setProperty("--drift-left", `${drift * 0.018}px`);
      heroArt.style.setProperty("--drift-right", `${drift * -0.016}px`);
    }
    ticking = false;
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScrollEffects);
  };
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  updateScrollEffects();

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reducedMotion) {
    document.querySelectorAll(".category-card").forEach(card => {
      card.addEventListener("pointermove", event => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
        card.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.removeProperty("--pointer-x");
        card.style.removeProperty("--pointer-y");
      });
    });
  }
}

async function loadInventory() {
  try {
    const response = await fetch("/api/products", { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) return;
    const payload = await response.json();
    const inventory = new Map((payload.products || []).map(item => [item.id, item]));
    PRODUCTS.forEach(product => {
      const record = inventory.get(product.id);
      if (!record) return;
      product.stock = Number.isInteger(record.stock) ? record.stock : null;
      product.price = Number.isInteger(record.priceCents) ? record.priceCents / 100 : product.price;
      product.active = record.active !== false;
      product.availabilityStatus = record.availabilityStatus || (record.active === false ? "unavailable" : "available");
      product.availableDate = record.availableDate || null;
      product.availability = productAvailabilityText(product);
    });
    const catalogueSort = document.querySelector("[data-product-sort]");
    if (catalogueSort) catalogueSort.dispatchEvent(new Event("change"));
    document.querySelectorAll('[data-catalog="featured"]').forEach(grid => {
      renderProductGrid(grid, featuredProducts());
      initializeFeaturedCarousel(grid);
    });
    document.querySelectorAll(".product-card").forEach(card => {
      const product = PRODUCTS.find(item => item.id === card.dataset.productId);
      if (!product) return;
      const titleRow = card.querySelector(".product-title-row");
      let price = titleRow?.querySelector(".product-price");
      if (!Number.isFinite(product.price)) { if (price) price.remove(); return; }
      if (!price) { price = document.createElement("span"); price.className = "product-price"; titleRow?.append(price); }
      price.textContent = formatPrice(product.price);
    });
    document.querySelectorAll("[data-price-product]").forEach(node => {
      const product = PRODUCTS.find(item => item.id === node.dataset.priceProduct);
      node.textContent = product && Number.isFinite(product.price) ? formatPrice(product.price) : "";
      node.hidden = !node.textContent;
    });
    document.querySelectorAll("[data-stock-product]").forEach(node => {
      const product = PRODUCTS.find(item => item.id === node.dataset.stockProduct);
      if (!product) return;
      const text = productAvailabilityText(product);
      node.innerHTML = productAvailabilityMarkup(product);
      node.classList.toggle("is-preorder", product.availabilityStatus === "preorder" && Boolean(product.availableDate));
      node.hidden = !text;
    });
    document.querySelectorAll("[data-notify-product]").forEach(button => {
      const product = PRODUCTS.find(item => item.id === button.dataset.notifyProduct);
      const unavailable = product && (product.availabilityStatus === "unavailable" || product.active === false || (product.stock === 0 && product.availabilityStatus !== "preorder"));
      const show = product && unavailable;
      button.hidden = !show;
      button.textContent = "Notify me when available";
      button.classList.toggle("notify-product-button--primary", Boolean(unavailable));
    });
    document.querySelectorAll("[data-add-order]").forEach(updateAddButton);
    growthTools?.setInventory(payload.products||[]);
    updateAvailabilitySummaries();
    renderCampaignProducts();
    renderOrderList();
  } catch (_) {
    // The catalog remains usable if inventory status is temporarily unavailable.
  }
}

function initializeAvailabilityNotifications() {
  const dialog = document.querySelector("[data-notify-dialog]");
  const form = dialog?.querySelector("[data-notify-form]");
  if (!dialog || !form) return;
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-notify-product]");
    if (!button) return;
    const product = PRODUCTS.find(item => item.id === button.dataset.notifyProduct);
    if (!product) return;
    form.reset();
    form.elements.productId.value = product.id;
    form.querySelector("[data-notify-product-name]").textContent = product.name;
    form.querySelector("[data-notify-status]").textContent = product.availableDate ? `Currently expected ${formatReadyDate(product.availableDate)}.` : "";
    dialog.showModal();
    form.elements.email.focus();
  });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const email = form.elements.email;
    const status = form.querySelector("[data-notify-status]");
    email.setCustomValidity(completeEmail(email.value) ? "" : "Enter a complete email address, such as name@example.com.");
    if (!form.reportValidity()) return;
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    status.textContent = "Saving your notification…";
    try {
      const response = await fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ productId: form.elements.productId.value, email: email.value.trim(), consent: form.elements.notifyConsent.checked }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "The notification could not be saved.");
      status.textContent = "You’re all set. Check your inbox for confirmation.";
      submit.hidden = true;
    } catch (error) {
      status.textContent = error.message;
    } finally { submit.disabled = false; }
  });
  dialog.addEventListener("close", () => { form.querySelector('button[type="submit"]').hidden = false; });
}

globalThis.JBN_FR?.prepare(PRODUCTS);
renderSiteChrome();
initializeCampaignLanguage();
renderCampaign();
renderCatalogues();
renderProductPage();
initializeMenu();
initializeOrderList();
if(document.querySelector('[data-checkout]')){
 const submit=document.querySelector('.checkout-submit');if(submit)submit.disabled=true;
 import('./checkout-ui.js?v=20261017-shopping').then(({initializeCheckoutPage})=>{
  initializeCheckoutPage({STORE,campaignLanguage,t,cartSubtotalCents,updateCheckoutTotals,escapeHtml,buildOrderSummary,initializeInlineValidation,renderOrderList,syncCheckoutState,cart:()=>orderList,clearCart(){orderList=[];orderNotes="";saveOrderList();}});
  if(submit)submit.disabled=false;
 }).catch(()=>{const status=document.querySelector('[data-checkout-status]');if(status)status.textContent=t('Please refresh to load the order form.','Actualisez la page pour charger le formulaire.');});
}
initializeCatalogueFeatures();
initializeNewsletter();
initializeScrollLife();
initializeAvailabilityNotifications();
loadInventory();



function renderCampaignProducts(){
  const grid=document.querySelector('[data-campaign-products]');
  if(!grid)return;
  const products=PRODUCTS.filter(p=>p.category==='artisan-soap'&&p.active!==false&&p.availabilityStatus!=='unavailable'&&p.availabilityStatus!=='preorder'&&p.stock!==0);
  renderProductGrid(grid,products);
  const stock=document.querySelector('[data-campaign-stock-note]');
  if(stock){stock.hidden=products.length>0;stock.textContent=products.length?'':t('No soaps are available right now. Please check back soon.','Aucun savon disponible en ce moment. Revenez bientôt.');}
  grid.querySelectorAll('[data-stock-product]').forEach(n=>{const p=PRODUCTS.find(p=>p.id===n.dataset.stockProduct);n.hidden=false;n.textContent=Number.isInteger(p.stock)?t(`${p.stock} in stock`,`${p.stock} en stock`):t('Available to order','Disponible à commander');});
  initializeFeaturedCarousel(grid);
}
function renderCampaign(){
  const active=campaignActive(soapCampaign);
  const announcement=document.querySelector('[data-pink-announcement]');
  if(announcement){announcement.hidden=!active;announcement.innerHTML=`<a href="artisan-soap.html" data-promo-open>${t('October with love','Octobre, avec amour')} · ${t('2 artisan soaps for','2 savons artisanaux pour')} ${formatPrice(soapCampaign.pairPriceCents/100)} · ${formatPrice(soapCampaign.donationPerPairCents/100)} ${t('to Ruban Rose per pair','au Ruban Rose par paire')} <span aria-hidden="true">→</span></a>`;}
  const home=document.querySelector('[data-home-campaign]');
  if(home){home.hidden=!active;const regular=document.querySelector('.home-hero');if(regular)regular.hidden=false;const key=JSON.stringify(soapCampaign);if(active&&home.dataset.campaign!==key){home._carouselAbort?.abort();home._carouselAbort=new AbortController();home.innerHTML=octoberHomeCard(soapCampaign);home.dataset.campaign=key;let slide=0;home.addEventListener('click',event=>{const button=event.target.closest('[data-october-step]');if(!button)return;slide=(slide+Number(button.dataset.octoberStep)+2)%2;const image=home.querySelector('[data-october-photo]');image.src=`images/october/slide-${slide===0?1:6}.webp`;image.alt=slide===0?t('Handmade soaps arranged as a pink awareness ribbon','Savons artisanaux disposés en ruban rose'):t('Handmade soaps with pink ribbons','Savons artisanaux avec des rubans roses');home.querySelector('[data-october-position]').textContent=`${slide+1} / 2`;},{signal:home._carouselAbort?.signal});}if(active)initializePromotionPopup();}
  const hero=document.querySelector('[data-campaign-hero]');
  if(hero)hero.innerHTML=campaignHero(soapCampaign,{active});
  const awareness=document.querySelector('[data-awareness-gallery]');
  if(awareness&&!awareness.dataset.rendered){const content=awarenessContent();awareness.innerHTML=content.slides.map((slide,i)=>`<button type="button" data-awareness-slide="${slide}" aria-label="${t('Enlarge','Agrandir')} ${content.labels[i]}"><img src="images/october/slide-${slide}.webp" width="1080" height="1350" loading="lazy" alt="${content.labels[i]}. ${t('Full text and current guidance below.','Texte complet et conseils actuels ci-dessous.')}"/><span>${content.labels[i]} · ${t('Tap to enlarge','Agrandir')} ↗</span></button>`).join('');document.querySelector('[data-awareness-text]').innerHTML=content.text;awareness.dataset.rendered='true';
    const dialog=document.querySelector('[data-awareness-dialog]');
    awareness.addEventListener('click',event=>{const button=event.target.closest('[data-awareness-slide]');if(!button)return;const image=dialog.querySelector('img');image.src=`images/october/slide-${button.dataset.awarenessSlide}.webp`;image.alt=button.getAttribute('aria-label');dialog.showModal();});
    dialog?.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  }
  const step=document.querySelector('.pink-steps .shell>div:last-child p');
  if(step)step.textContent=t(`Just B donates ${formatPrice(soapCampaign.donationPerPairCents/100)} per qualifying pair after payment.`,`Just B verse ${formatPrice(soapCampaign.donationPerPairCents/100)} par paire admissible après paiement.`);
  renderCampaignProducts();
  updateCheckoutTotals();
  growthTools?.refresh();
}
async function loadCampaign(){
  try{const response=await fetch('/api/campaign',{cache:'no-store'});if(!response.ok)throw new Error('unavailable');const payload=await response.json();soapCampaign=payload.config;}
  catch(_){soapCampaign={...CAMPAIGN_DEFAULTS,enabled:false};}
  renderCampaign();
}
loadCampaign();
// Refresh date-sensitive pricing in tabs left open across midnight or inventory edits.
setInterval(()=>{loadCampaign();},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadCampaign();});

function initializePromotionPopup(){
  let dialog=document.querySelector('[data-promo-popup]');
  if(!dialog){document.body.insertAdjacentHTML('beforeend',campaignPopup(soapCampaign));dialog=document.querySelector('[data-promo-popup]');dialog.querySelectorAll('[data-promo-close]').forEach(button=>button.addEventListener('click',()=>dialog.close()));dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});}
  const key=`jbn-promo-seen-${soapCampaign.startDate}-${soapCampaign.endDate}`;
  let seen=initializePromotionPopup.seen;try{seen=seen||sessionStorage.getItem(key);}catch(_){}
  if(!seen){initializePromotionPopup.seen=true;try{sessionStorage.setItem(key,'1');}catch(_){}dialog.showModal();}
}
document.addEventListener('click',event=>{const opener=event.target.closest('[data-promo-open]');if(!opener||!campaignActive(soapCampaign))return;event.preventDefault();initializePromotionPopup();document.querySelector('[data-promo-popup]').showModal();});

growthTools=initializeGrowth({products:PRODUCTS,t,language:campaignLanguage,add:addToOrderList,cart:()=>orderList,config:()=>soapCampaign});

// Keep selections consistent when a shopper uses more than one tab.
window.addEventListener('storage',event=>{
 if(event.key!==ORDER_STORAGE_KEY&&event.key!==ORDER_NOTES_KEY&&event.key!==null)return;
 orderList=loadOrderList();orderNotes=loadOrderNotes();renderOrderList();growthTools?.refresh();
});

if(document.querySelector('[data-instagram-gallery]'))import('./instagram-gallery.js?v=20261017-latest-six').then(module=>module.initializeInstagramGallery()).catch(()=>{});
