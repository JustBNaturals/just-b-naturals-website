/*
  STORE SETTINGS
  Cart contents stay in the shopper's browser. When published on Cloudflare Pages,
  the included /functions/api endpoints email guest orders and collect subscribers.
*/
document.documentElement.classList.add("has-js");

const STORE = Object.freeze({
  name: "Just B Naturals",
  orderEmail: "justbnaturalss@gmail.com",
  instagramUrl: "https://www.instagram.com/justb.naturals/",
  instagramDmUrl: "https://ig.me/m/justb.naturals",
  orderListEnabled: true,
  orderEndpoint: "/api/order",
  subscribeEndpoint: "/api/subscribe"
});

const DISH_SOAP_SCENTS = [
  { id: "citrus-fresh-dish-soap", scent: "Citrus Fresh", tone: "#e7e8b9", accent: "#8c9a3c", featured: true },
  { id: "lemon-eucalyptus-dish-soap", scent: "Lemon Eucalyptus", tone: "#dce8bd", accent: "#728a3d" },
  { id: "unscented-dish-soap", scent: "Unscented", tone: "#e7e3d3", accent: "#8a8069" }
];

const ARTISAN_SOAP_SCENTS = [
  { id: "lavender-oat-soap", scent: "Lavender & Oat", tone: "#ddd3e6", accent: "#77618a", featured: true },
  { id: "orange-eucalyptus-soap", scent: "Orange & Eucalyptus", tone: "#efd0ae", accent: "#c86f3b" },
  { id: "lemongrass-poppyseed-soap", scent: "Lemongrass & Poppyseed", tone: "#e5e5ae", accent: "#8f9440" },
  { id: "cedarwood-charcoal-soap", scent: "Cedarwood & Charcoal", tone: "#c8c3bb", accent: "#5f5a52" },
  { id: "rose-geranium-soap", scent: "Rose Geranium", tone: "#ead0d6", accent: "#a96173" },
  { id: "honey-almond-soap", scent: "Honey Almond", tone: "#ecd5aa", accent: "#b57f35" },
  { id: "peppermint-tea-tree-soap", scent: "Peppermint Tea Tree", tone: "#c8dfd3", accent: "#4e816a" },
  { id: "vanilla-chai-soap", scent: "Vanilla Chai", tone: "#dfc8ae", accent: "#946443" },
  { id: "unscented-gentle-soap", scent: "Unscented Gentle", tone: "#e5ded1", accent: "#8b7a66" },
  { id: "seasonal-soap", scent: "Seasonal Small-Batch", tone: "#d6b6a1", accent: "#925c42" }
];

const PRODUCTS = [
  ...DISH_SOAP_SCENTS.map(item => ({
    id: item.id,
    category: "dish-soap",
    name: `${item.scent} Solid Dish Soap Set`,
    kicker: item.scent,
    description: "A powerful solid dish soap made with organic oils and pure essential oils. Tough on grease, gentle on hands, and free from synthetic fragrance and dyes.",
    ingredients: ["Organic coconut oil", "Organic castor oil", "Citric acid", "Pure essential oils", "Kaolin clay", "Sodium hydroxide*"],
    note: "*Fully transformed during the soapmaking process.",
    price: "$20",
    image: "images/solid-dish-soap.jpg",
    label: item.scent,
    art: "dish",
    tone: item.tone,
    accent: item.accent,
    featured: Boolean(item.featured)
  })),
  {
    id: "harmony-roller",
    category: "roller-oils",
    name: "Calm Aromatherapy Roller Oil",
    kicker: "Breathe deep. Feel balanced.",
    description: "A fresh, floral and minty blend designed for a soothing, grounding aromatherapy ritual wherever you go.",
    ingredients: ["Organic clary sage", "Organic lavender", "Organic grapefruit", "Organic cypress", "Organic peppermint"],
    note: "Convenient roll-on application. For external use only.",
    price: "$15",
    image: "images/roller-oils-collection.png",
    art: "roller",
    tone: "#c9dcca",
    accent: "#446f57",
    featured: true
  },
  {
    id: "refresh-roller",
    category: "roller-oils",
    name: "Relieve Headache Roller Oil",
    kicker: "Refresh. Reset. Breathe.",
    description: "A cooling, revitalizing aromatherapy blend for a refreshing on-the-go ritual.",
    ingredients: ["Organic jojoba oil", "Peppermint essential oil", "Lavender essential oil", "Rosemary essential oil", "Eucalyptus essential oil"],
    note: "Avoid the eye area. For external use only.",
    price: "$15",
    image: "images/headache-roller.jpg",
    art: "roller",
    tone: "#c9dce2",
    accent: "#4b7481",
    featured: false
  },
  {
    id: "period-comfort-roller",
    category: "roller-oils",
    name: "Cycle Harmony Roller Oil",
    kicker: "Roll on. Relax. Restore.",
    description: "A comforting blend created for moments of calm, balance and self-care during your monthly cycle.",
    ingredients: ["Organic jojoba oil", "Organic geranium", "Organic lavender", "Organic Roman chamomile", "Organic frankincense"],
    note: "Roll onto the lower abdomen, wrists, temples or back of the neck.",
    price: "$15",
    image: "images/period-comfort-roller.jpg",
    art: "roller",
    tone: "#ead3db",
    accent: "#ad647b",
    featured: true
  },
  {
    id: "citrus-sugar-scrub",
    category: "sugar-scrubs",
    name: "Citrus Sunrise Organic Sugar Scrub",
    kicker: "Bright, fresh and uplifting",
    description: "A naturally luxurious exfoliating scrub that gently buffs dry skin while rich butters and oils leave it feeling soft and smooth.",
    ingredients: ["Organic cane sugar", "Organic shea butter", "Organic castor oil", "Organic vitamin E", "Organic citrus essential oils"],
    note: "Keep water out of the container. External use only.",
    price: "$20",
    image: "images/sugar-scrubs-collection.png",
    art: "jar",
    tone: "#f2c99e",
    accent: "#db7244",
    featured: true
  },
  {
    id: "woodland-sugar-scrub",
    category: "sugar-scrubs",
    name: "Woodland Escape Organic Sugar Scrub",
    kicker: "Warm, earthy and grounding",
    description: "Organic cane sugar, shea butter and nourishing oils gently exfoliate while leaving skin soft, smooth and naturally scented.",
    ingredients: ["Organic cane sugar", "Organic shea butter", "Organic castor oil", "Organic vitamin E", "Organic woodsy essential oil blend"],
    note: "Keep water out of the container. External use only.",
    price: "$20",
    image: "images/woodland-sugar-scrub.jpg",
    art: "jar",
    tone: "#bdccb0",
    accent: "#4d735a",
    featured: false
  },
  {
    id: "vanilla-tallow-balm",
    category: "body-care",
    name: "Nourished Vanilla Bean Tallow Balm",
    kicker: "Rich, velvety nourishment",
    description: "A concentrated moisturizer made with grass-fed tallow and jojoba oil, infused with the comforting aroma of Madagascar vanilla bean.",
    ingredients: ["100% grass-fed beef tallow", "Organic jojoba oil", "Madagascar vanilla bean"],
    note: "Use on the face, hands, body or dry patches. A little goes a long way.",
    price: "$25",
    image: "images/vanilla-tallow-balm.jpg",
    art: "tin",
    tone: "#eadfc8",
    accent: "#a87f51",
    featured: true
  },
  {
    id: "mango-shea-body-butter",
    category: "body-care",
    name: "Nourished Whipped Mango & Shea Body Butter",
    kicker: "Whipped by nature",
    description: "A rich yet lightweight body butter that glides on easily and helps leave dry skin feeling velvety soft and deeply nourished.",
    ingredients: ["Unrefined mango butter", "Unrefined shea butter", "Organic jojoba oil", "Organic rosehip seed oil", "Arrowroot powder", "Vitamin E"],
    note: "Store in a cool, dry place. Natural texture changes may occur.",
    price: "$25",
    image: "images/body-butter-collection.png",
    art: "jar",
    tone: "#f0d69c",
    accent: "#c88e3b",
    featured: false
  },
  ...ARTISAN_SOAP_SCENTS.map(item => ({
    id: item.id,
    category: "artisan-soap",
    name: `${item.scent} Artisan Soap`,
    kicker: item.scent,
    description: "A gentle, long-lasting traditional soap made with organic oils, nourishing butters and pure essential oils.",
    ingredients: ["Organic oils", "Natural nourishing butters", "Pure essential oils", "Sodium hydroxide*"],
    note: "*Fully reacted during saponification. Custom orders require about six weeks to cure.",
    price: "$8",
    image: "images/artisan-soap-display.png",
    label: item.scent,
    art: "bar",
    tone: item.tone,
    accent: item.accent,
    featured: Boolean(item.featured)
  })),
  {
    id: "rested-linen-spray",
    category: "home-linen",
    name: "Rested Deep Sleep Linen Spray",
    kicker: "A grounding bedtime mist",
    description: "A woodsy and floral linen spray made with organic essential oils and natural witch hazel for a calm, comforting bedtime ritual.",
    ingredients: ["Natural witch hazel", "Organic essential oil blend", "Ask for the current complete ingredient list"],
    note: "Mist lightly over linens from a safe distance. External use only.",
    price: "$15",
    image: "images/rested-linen-spray.png",
    art: "spray",
    tone: "#d8d9e5",
    accent: "#5d607c",
    featured: true
  },
  {
    id: "sourdough-crepe-mix",
    category: "pantry",
    name: "Sourdough Crêpe Mix",
    kicker: "A small-batch pantry favourite",
    description: "A ready-to-make sourdough crêpe mix with enough for approximately 8–10 servings.",
    ingredients: ["Preparation instructions included", "Ask for the current complete ingredient and allergen list"],
    note: "Food product. Please confirm dietary needs or allergies before ordering.",
    price: "$12",
    image: "images/sourdough-crepe-mix.png",
    art: "jar",
    tone: "#e8dac6",
    accent: "#916d4d",
    featured: true
  }
];

const NAV_ITEMS = [
  ["index.html", "Home", "home"],
  ["shop.html", "Shop all", "shop"],
  ["dish-soap.html", "Dish soap", "dish-soap"],
  ["roller-oils.html", "Roller oils", "roller-oils"],
  ["sugar-scrubs.html", "Sugar scrubs", "sugar-scrubs"],
  ["body-care.html", "Body care", "body-care"],
  ["artisan-soap.html", "Artisan soap", "artisan-soap"],
  ["home-linen.html", "Home & linen", "home-linen"],
  ["pantry.html", "Pantry", "pantry"],
  ["about.html", "About", "about"]
];

const currentPage = document.body.dataset.page || "";
const ORDER_STORAGE_KEY = "just-b-naturals-order-list-v1";
const ORDER_NOTES_KEY = "just-b-naturals-order-notes-v1";
const generalOrderUrl = `mailto:${STORE.orderEmail}?subject=${encodeURIComponent("Product order inquiry")}`;

const CATEGORY_LABELS = Object.freeze({
  "dish-soap": "Solid Dish Soap",
  "roller-oils": "Roller Oils",
  "sugar-scrubs": "Sugar Scrubs",
  "body-care": "Body Care",
  "artisan-soap": "Artisan Soaps",
  "home-linen": "Home & Linen",
  pantry: "Pantry"
});

function productPageUrl(productOrId) {
  const id = typeof productOrId === "string" ? productOrId : productOrId.id;
  return `product-${encodeURIComponent(id)}.html`;
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

function loadOrderList() {
  try {
    const saved = JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved
      .filter(item => PRODUCTS.some(product => product.id === item.id))
      .map(item => {
        return {
          id: item.id,
          quantity: Math.min(99, Math.max(1, Number(item.quantity) || 1))
        };
      });
  } catch (_) {
    return [];
  }
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
    // The order still works for this visit if private browsing blocks storage.
  }
}

function productPriceNumber(product) {
  return Number(String(product.price).replace(/[^0-9.]/g, "")) || 0;
}

function money(value) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 0 }).format(value);
}

function orderItemCount() {
  return orderList.reduce((total, item) => total + item.quantity, 0);
}

function orderTotal() {
  return orderList.reduce((total, item) => {
    const product = PRODUCTS.find(candidate => candidate.id === item.id);
    return total + (product ? productPriceNumber(product) * item.quantity : 0);
  }, 0);
}

function buildOrderSummary(details = {}) {
  const selectedItems = Array.isArray(details.items) ? details.items : orderList;
  const lines = selectedItems.map((item, index) => {
    const product = PRODUCTS.find(candidate => candidate.id === item.id);
    if (!product) return "";
    const lineTotal = productPriceNumber(product) * item.quantity;
    return `${index + 1}. ${product.name}\n   Quantity: ${item.quantity}\n   ${product.price} each · ${money(lineTotal)}`;
  }).filter(Boolean);

  const total = selectedItems.reduce((sum, item) => {
    const product = PRODUCTS.find(candidate => candidate.id === item.id);
    return sum + (product ? productPriceNumber(product) * item.quantity : 0);
  }, 0);

  const customerLines = details.email ? [
    `Customer: ${[details.firstName, details.lastName].filter(Boolean).join(" ")}`,
    `Email: ${details.email}`,
    details.phone ? `Phone: ${details.phone}` : "",
    details.area ? `Area: ${details.area}` : "",
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
    `Product total: ${money(total)} CAD`,
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
  return NAV_ITEMS.map(([href, label, page]) => `<a href="${href}"${currentPage === page ? ' class="active" aria-current="page"' : ""}>${label}${mobile ? "<span>→</span>" : ""}</a>`).join("");
}

function renderSiteChrome() {
  const header = document.querySelector("[data-site-header]");
  const footer = document.querySelector("[data-site-footer]");

  if (header) header.innerHTML = `
    <div class="scroll-progress" aria-hidden="true"><span></span></div>
    <div class="announcement">Just B pure • Just B natural • Handmade in Aylmer, Quebec</div>
    <header class="site-header">
      <div class="shell header-inner">
        <button class="menu-button" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span><span></span></button>
        <a class="brand" href="index.html" aria-label="${STORE.name} home"><img class="brand-logo" src="images/just-b-logo.jpg" alt=""><span>JUST B<br>NATURALS</span></a>
        <nav class="desktop-nav" aria-label="Main navigation">${navMarkup()}</nav>
        <div class="header-actions"><a class="header-order header-order-instagram" href="${STORE.instagramUrl}" target="_blank" rel="noreferrer">Instagram</a><button class="header-order header-order-list" type="button" data-order-list-open>Cart <span class="order-count" data-order-count>0</span></button></div>
      </div>
    </header>
    <nav class="mobile-category-nav" aria-label="Browse product categories">${navMarkup()}</nav>
    <aside class="mobile-menu" id="mobile-menu" aria-hidden="true"><div class="mobile-menu-top"><a class="mobile-menu-brand" href="index.html"><img src="images/just-b-logo.jpg" alt="Just B Naturals"><strong>Browse Just B</strong></a><button type="button" aria-label="Close menu">&times;</button></div><nav>${navMarkup(true)}<a href="${STORE.instagramUrl}" target="_blank" rel="noreferrer">Follow @justb.naturals <span>↗</span></a></nav><div class="mobile-order-options"><button class="button button-order-list" type="button" data-order-list-open>View cart <span data-order-count>0</span></button></div></aside>
    <button class="menu-backdrop" type="button" aria-label="Close menu" hidden></button>
    <nav class="mobile-bottom-nav" aria-label="Quick navigation"><a href="index.html"><span aria-hidden="true">⌂</span>Home</a><a href="shop.html"><span aria-hidden="true">◇</span>Products</a><a href="${STORE.instagramUrl}" target="_blank" rel="noreferrer"><span aria-hidden="true">◎</span>Instagram</a><button type="button" data-order-list-open><span class="mobile-list-icon" aria-hidden="true">≡<b data-order-count>0</b></span>Cart</button></nav>
    <button class="order-drawer-backdrop" type="button" aria-label="Close cart" data-order-list-close hidden></button>
    <aside class="order-drawer" id="order-drawer" aria-hidden="true" aria-labelledby="order-drawer-title">
      <div class="order-drawer-header"><div><p class="eyebrow">Your selections</p><h2 id="order-drawer-title">Cart</h2></div><button class="order-drawer-close" type="button" aria-label="Close cart" data-order-list-close>&times;</button></div>
      <div class="order-drawer-body">
        <div class="order-empty" data-order-empty><span>＋</span><h3>Your cart is empty</h3><p>Add a few favourites, then send an order request. Payment comes only after confirmation.</p><a class="button button-outline" href="shop.html">Browse products</a></div>
        <div class="order-list-items" data-order-items></div>
      </div>
      <div class="order-drawer-footer" data-order-footer hidden>
        <div class="order-total"><span>Subtotal</span><strong data-order-total>$0</strong></div>
        <p class="order-confirmation-note">No payment is taken now. Availability is confirmed before you pay.</p>
        <div class="order-send-options"><a class="button button-dark" href="checkout.html">Review request <span>→</span></a><a class="button button-outline" href="shop.html">Keep shopping</a></div>
        <button class="clear-order-list" type="button" data-order-clear>Clear cart</button>
      </div>
    </aside>
    <button class="order-list-fab" type="button" data-order-list-open hidden>Cart <span data-order-count>0</span></button>
    <div class="order-toast" role="status" aria-live="polite" aria-atomic="true"></div>`;

  if (footer) footer.innerHTML = `
    <section class="email-band newsletter-band"><div class="shell email-band-inner"><div><p class="eyebrow">Stay in the loop</p><h2>Small-batch news,<br>sent occasionally.</h2></div><form class="newsletter-form" data-newsletter-form><label for="newsletter-email">Email address</label><div class="newsletter-row"><input id="newsletter-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required><button class="button button-light" type="submit">Join the list</button></div><label class="consent-check"><input name="consent" type="checkbox" required><span>I agree to receive occasional promotions from Just B Naturals. I can unsubscribe anytime.</span></label><p class="newsletter-status" data-newsletter-status aria-live="polite"></p></form></div></section>
    <footer><div class="shell footer-grid"><div class="footer-brand"><a class="brand brand-light" href="index.html"><img class="brand-logo footer-logo" src="images/just-b-logo.jpg" alt=""><span>JUST B<br>NATURALS</span></a><p>Small-batch, handcrafted soaps and natural care made in Aylmer, Quebec.</p></div><div><h2>Explore</h2><a href="shop.html">All products</a><a href="about.html">About Just B</a><a href="roller-oils.html">Roller oils</a><a href="body-care.html">Body care</a><a href="home-linen.html">Home & linen</a><a href="pantry.html">Pantry</a></div><div><h2>Connect</h2><a href="checkout.html">Request an order</a><a href="${STORE.instagramUrl}" target="_blank" rel="noreferrer">Follow @justb.naturals ↗</a><a href="mailto:${STORE.orderEmail}">${STORE.orderEmail}</a><a href="privacy.html">Privacy</a></div></div><div class="shell footer-bottom"><p>© 2026 ${STORE.name}.</p><p>For external use only unless otherwise stated.</p></div></footer>
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

function artMarkup(product) {
  return `<img class="product-image" src="${product.image}" alt="Product photo representing ${product.name}" loading="lazy"><div class="art-fallback" hidden>${fallbackArtMarkup(product)}</div>`;
}

function productCard(product) {
  return `<article class="product-card" data-product-id="${product.id}" style="--tone:${product.tone};--accent:${product.accent}">
    <a class="product-art" href="${productPageUrl(product)}" aria-label="View ${product.name}"><span class="art-ring"></span>${artMarkup(product)}<span class="image-hint">View product</span></a>
    <div class="product-copy">
      <p class="product-kicker">${product.kicker}</p>
      <div class="product-title-row"><h2><a href="${productPageUrl(product)}">${product.name}</a></h2><strong class="product-price">${product.price}</strong></div>
      <p class="product-description">${product.description}</p>
      <details><summary>Ingredients & details <span>+</span></summary><ul>${product.ingredients.map(item => `<li>${item}</li>`).join("")}</ul><p>${product.note}</p></details>
      <div class="product-order-options"><button class="button button-dark add-order-button" type="button" data-add-order="${product.id}">Add to cart <span>＋</span></button><a class="product-detail-link" href="${productPageUrl(product)}">View full details</a></div>
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
  if (count) count.textContent = matches.length;
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
    if (catalogue === "featured") matches = PRODUCTS.filter(product => product.featured).slice(0, 4);
    renderProductGrid(grid, matches);
  });
}

function orderItemMarkup(item) {
  const product = PRODUCTS.find(candidate => candidate.id === item.id);
  if (!product) return "";
  const key = orderLineKey(item);
  return `<article class="order-list-item" data-order-item="${escapeHtml(key)}">
    <a href="${productPageUrl(product)}" aria-label="View ${product.name}"><img src="${product.image}" alt="" loading="lazy"></a>
    <div class="order-item-copy"><h3><a href="${productPageUrl(product)}">${product.name}</a></h3><p>${product.price} each</p>
      <div class="order-item-controls"><div class="quantity-control" aria-label="Quantity for ${product.name}"><button type="button" data-order-quantity="-1" data-order-key="${escapeHtml(key)}" aria-label="Remove one ${product.name}">−</button><strong aria-live="polite">${item.quantity}</strong><button type="button" data-order-quantity="1" data-order-key="${escapeHtml(key)}" aria-label="Add one ${product.name}">+</button></div><button class="remove-order-item" type="button" data-order-remove="${escapeHtml(key)}">Remove</button></div>
    </div>
    <strong class="order-item-total">${money(productPriceNumber(product) * item.quantity)}</strong>
  </article>`;
}

function updateAddButton(button) {
  const item = findOrderLine(button.dataset.addOrder);
  button.classList.toggle("is-added", Boolean(item));
  button.innerHTML = `${item ? `Add another (${item.quantity})` : "Add to cart"} <span>＋</span>`;
}

function renderOrderList() {
  const count = orderItemCount();
  document.querySelectorAll("[data-order-count]").forEach(node => { node.textContent = count; });
  document.querySelectorAll("[data-order-email]").forEach(link => { link.href = fullOrderEmailUrl(); });

  const items = document.querySelectorAll("[data-order-items]");
  const empty = document.querySelectorAll("[data-order-empty]");
  const footer = document.querySelectorAll("[data-order-footer]");
  const total = document.querySelectorAll("[data-order-total]");
  const notes = document.querySelector("[data-order-notes]");
  const fab = document.querySelector(".order-list-fab");
  items.forEach(node => { node.innerHTML = orderList.map(orderItemMarkup).join(""); });
  empty.forEach(node => { node.hidden = orderList.length > 0; });
  footer.forEach(node => { node.hidden = orderList.length === 0; });
  total.forEach(node => { node.textContent = `${money(orderTotal())} CAD`; });
  if (notes && notes.value !== orderNotes) notes.value = orderNotes;
  if (fab) fab.hidden = count === 0;

  document.querySelectorAll("[data-add-order]").forEach(updateAddButton);
  syncCheckoutState();
}

function showOrderToast(message) {
  const toast = document.querySelector(".order-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showOrderToast.timeout);
  showOrderToast.timeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function addToOrderList(productId) {
  const product = PRODUCTS.find(candidate => candidate.id === productId);
  if (!product) return null;
  const existing = findOrderLine(productId);
  if (existing) existing.quantity = Math.min(99, existing.quantity + 1);
  else orderList.push({ id: productId, quantity: 1 });
  saveOrderList();
  renderOrderList();
  showOrderToast(`${product.name} added to your cart.`);
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
        () => showOrderToast("Order copied — paste it into the Instagram DM."),
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
  if (shopGrid) {
    const filterButtons = [...document.querySelectorAll("[data-category-filter]")];
    const hashCategory = window.location.hash.replace("#", "");
    let activeCategory = filterButtons.some(button => button.dataset.categoryFilter === hashCategory) ? hashCategory : "all";

    const updateShopGrid = () => {
      const query = search?.value.trim().toLowerCase() || "";
      const matches = PRODUCTS.filter(product => {
        const searchable = [product.name, product.kicker, product.description, ...product.ingredients].join(" ").toLowerCase();
        const matchesCategory = activeCategory === "all" || product.category === activeCategory;
        return matchesCategory && searchable.includes(query);
      });
      if (sort?.value === "name") matches.sort((a, b) => a.name.localeCompare(b.name));
      if (sort?.value === "price") matches.sort((a, b) => productPriceNumber(a) - productPriceNumber(b));
      if (sort?.value === "featured") matches.sort((a, b) => Number(b.featured) - Number(a.featured));
      renderProductGrid(shopGrid, matches);
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
  }

  document.querySelectorAll("[data-surprise]").forEach(button => {
    button.addEventListener("click", () => {
      const section = button.closest("section") || document;
      const cards = [...section.querySelectorAll(".product-card")];
      if (!cards.length) return;
      const card = cards[Math.floor(Math.random() * cards.length)];
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.remove("is-highlighted");
      requestAnimationFrame(() => card.classList.add("is-highlighted"));
      window.setTimeout(() => card.classList.remove("is-highlighted"), 1800);
    });
  });

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
    "dish-soap": {
      use: "Wet the dish brush, rub it over the solid soap to create a lather, then wash and rinse dishes as usual.",
      care: "Let the soap and brush dry between uses. Keep the set out of standing water.",
      detail: "A low-waste kitchen staple made in small batches for everyday dishwashing."
    },
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
      detail: "A light botanical mist created to make the evening routine feel calm and considered."
    },
    pantry: {
      use: "Follow the preparation directions included with the current package.",
      care: "Store sealed in a cool, dry pantry. Confirm the current ingredient and allergen list before ordering.",
      detail: "A small-batch pantry mix prepared for an easy homemade favourite."
    }
  };
  return guidance[product.category] || {
    use: "Follow the directions provided with the current product.",
    care: "Store in a cool, dry place and confirm current care instructions before use.",
    detail: "Handcrafted in a small batch with thoughtfully selected ingredients."
  };
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
  const categoryLabel = CATEGORY_LABELS[product.category] || "Just B Naturals";
  const related = PRODUCTS.filter(item => item.category === product.category && item.id !== product.id).slice(0, 3);
  document.title = `${product.name} | ${STORE.name}`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = product.description;

  mount.innerHTML = `
    <div class="shell product-detail-shell">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a href="shop.html#${product.category}">${categoryLabel}</a><span>/</span><span>${product.name}</span></nav>
      <section class="product-detail-hero" style="--tone:${product.tone};--accent:${product.accent}">
        <div class="product-detail-media"><span class="product-detail-ring" aria-hidden="true"></span><img src="${product.image}" alt="${product.name}"></div>
        <div class="product-detail-purchase">
          <p class="eyebrow">${categoryLabel}</p>
          <h1>${product.name}</h1>
          <p class="product-detail-kicker">${product.kicker}</p>
          <p class="product-detail-description">${product.description}</p>
          <div class="product-detail-price"><strong>${product.price}</strong><span>CAD</span></div>
          <button class="button button-dark product-detail-add" type="button" data-add-order="${product.id}">Add to cart <span>＋</span></button>
          <p class="product-detail-confirmation">Exact size and current batch availability are confirmed before payment.</p>
          <div class="product-detail-badges"><span>Small batch</span><span>Handmade in Aylmer</span><span>Pay after approval</span></div>
        </div>
      </section>
    </div>
    <section class="product-story-section">
      <div class="shell product-story-grid">
        <article><p class="eyebrow">About this product</p><h2>Simple care, thoughtfully made.</h2><p>${guide.detail}</p><p>${product.description}</p></article>
        <aside class="ingredient-panel"><p class="eyebrow">Ingredients</p><h2>What is inside</h2><ul>${product.ingredients.map(ingredient => `<li>${ingredient}</li>`).join("")}</ul><p>${product.note}</p></aside>
      </div>
    </section>
    <section class="shell product-use-section">
      <article><span>01</span><h2>How to use</h2><p>${guide.use}</p></article>
      <article><span>02</span><h2>Care & storage</h2><p>${guide.care}</p></article>
      <article><span>03</span><h2>Before using</h2><p>Review the complete ingredient list and current batch information. Stop use if irritation occurs. External use only unless this is clearly identified as a food product.</p></article>
    </section>
    <section class="related-products section shell" ${related.length ? "" : "hidden"}>
      <div class="section-heading"><div><p class="eyebrow">You may also like</p><h2>More from ${categoryLabel}</h2></div><a class="text-link" href="shop.html#${product.category}">View category <span>→</span></a></div>
      <div class="product-grid">${related.map(productCard).join("")}</div>
    </section>`;
  activateImageFallbacks(mount);
}

function checkoutPayload(form) {
  const data = new FormData(form);
  return {
    firstName: String(data.get("firstName") || "").trim(),
    lastName: String(data.get("lastName") || "").trim(),
    email: String(data.get("email") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    area: String(data.get("area") || "").trim(),
    fulfillment: String(data.get("fulfillment") || "pickup"),
    payment: String(data.get("payment") || "etransfer"),
    notes: String(data.get("notes") || "").trim(),
    marketingConsent: data.get("marketingConsent") === "on",
    consentText: "I agree to receive occasional promotions from Just B Naturals. I can unsubscribe anytime.",
    consentedAt: new Date().toISOString(),
    website: String(data.get("website") || ""),
    items: orderList.map(item => ({ id: item.id, quantity: item.quantity }))
  };
}

function checkoutEmailUrl(details) {
  const subject = `Guest order – ${details.firstName || "Customer"}`;
  return `mailto:${STORE.orderEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildOrderSummary(details))}`;
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
  const submit = checkout.querySelector('.checkout-submit');
  if (submit && !submit.disabled) submit.textContent = `Request order — ${money(orderTotal())}`;
}

function showCheckoutSuccess(orderId) {
  const checkout = document.querySelector("[data-checkout]");
  const content = document.querySelector("[data-checkout-content]");
  const success = document.querySelector("[data-checkout-success]");
  if (checkout) checkout.dataset.completed = "true";
  if (content) content.hidden = true;
  if (success) {
    success.hidden = false;
    const id = success.querySelector("[data-order-id]");
    if (id) id.textContent = orderId;
    success.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  orderList = [];
  orderNotes = "";
  saveOrderList();
  renderOrderList();
}

function initializeCheckout() {
  const checkout = document.querySelector("[data-checkout]");
  const form = document.querySelector("[data-checkout-form]");
  if (!checkout || !form) return;
  renderOrderList();
  syncCheckoutState();

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!form.reportValidity() || !orderList.length) return;
    const details = checkoutPayload(form);
    const button = form.querySelector('[type="submit"]');
    const status = form.querySelector("[data-checkout-status]");
    const fallback = form.querySelector("[data-checkout-fallback]");
    button.disabled = true;
    button.textContent = "Sending request…";
    if (status) status.textContent = "";
    if (fallback) fallback.hidden = true;

    if (window.location.protocol === "file:") {
      if (status) status.textContent = "This saved copy cannot submit automatically. Use the prepared email to send your request—no payment is due yet.";
      if (fallback) {
        fallback.href = checkoutEmailUrl(details);
        fallback.hidden = false;
      }
      button.disabled = false;
      button.textContent = `Request order — ${money(orderTotal())}`;
      return;
    }

    try {
      const response = await fetch(STORE.orderEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Order could not be sent.");
      showCheckoutSuccess(result.orderId || "Submitted");
    } catch (error) {
      if (status) status.textContent = "We could not send the request automatically. You can send the prepared request by email instead.";
      if (fallback) {
        fallback.href = checkoutEmailUrl(details);
        fallback.hidden = false;
      }
    } finally {
      button.disabled = false;
      button.textContent = `Request order — ${money(orderTotal())}`;
    }
  });
}

function initializeNewsletter() {
  document.querySelectorAll("[data-newsletter-form]").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
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
            consentText: "I agree to receive occasional promotions from Just B Naturals. I can unsubscribe anytime.",
            consentedAt: new Date().toISOString(),
            source: "website-footer"
          })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Signup could not be completed.");
        status.textContent = "You are on the list. Thank you.";
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

renderSiteChrome();
renderCatalogues();
renderProductPage();
initializeMenu();
initializeOrderList();
initializeCheckout();
initializeCatalogueFeatures();
initializeNewsletter();
initializeScrollLife();
