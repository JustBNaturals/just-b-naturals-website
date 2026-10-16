const CATEGORY_NAMES = {
  "artisan-soap": "Artisan soaps",
  "sugar-scrubs": "Sugar scrubs",
  "roller-oils": "Roll-on oils",
  "body-care": "Body care",
  "home-linen": "Home & linen"
};
const CATEGORY_ORDER = Object.keys(CATEGORY_NAMES);
const loginForm = document.querySelector("[data-inventory-login]");
const loginStatus = document.querySelector("[data-inventory-login-status]");
const manager = document.querySelector("[data-inventory-manager]");
const rows = document.querySelector("[data-inventory-rows]");
const saveStatus = document.querySelector("[data-inventory-save-status]");
let inventoryKey = "";
let dirty = false;

function setStatus(cell, status, date, stock) {
  if (status === "preorder") {
    cell.textContent = date ? `Preorder until ${new Date(`${date}T12:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}` : "Choose a ready date";
    cell.dataset.state = "preorder";
  } else if (stock !== "" && Number(stock) === 0) {
    cell.textContent = "Out of stock automatically";
    cell.dataset.state = "out";
  } else {
    cell.textContent = "Available to order";
    cell.dataset.state = "shown";
  }
}

async function authorizedFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${inventoryKey}`);
  headers.set("Accept", "application/json");
  return fetch(url, { cache: "no-store", ...options, headers });
}

async function openInventory(key) {
  inventoryKey = key.trim();
  loginStatus.textContent = "Opening inventory…";
  const [catalogResponse, inventoryResponse] = await Promise.all([
    fetch("catalog.json", { cache: "no-store" }),
    authorizedFetch("/api/inventory")
  ]);
  const inventoryPayload = await inventoryResponse.json().catch(() => ({}));
  if (!inventoryResponse.ok) throw new Error(inventoryPayload.error || "The inventory could not be opened.");
  await openCampaignAdmin();
  const catalog = await catalogResponse.json();
  const inventory = new Map((inventoryPayload.products || []).map(item => [item.id, item]));
  catalog.sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.name.localeCompare(b.name));
  rows.replaceChildren();
  catalog.forEach(product => {
    const row = document.createElement("tr");
    row.dataset.productId = product.id;
    const productCell = document.createElement("th");
    productCell.scope = "row";
    productCell.textContent = product.name;
    const categoryCell = document.createElement("td");
    categoryCell.dataset.label = "Category";
    categoryCell.textContent = CATEGORY_NAMES[product.category] || product.category;
    const record = inventory.get(product.id) || {};
    const statusCell = document.createElement("td");
    statusCell.dataset.label = "Status";
    const statusSelect = document.createElement("select");
    statusSelect.className = "inventory-status-select";
    statusSelect.setAttribute("aria-label", `Website status for ${product.name}`);
    statusSelect.innerHTML = '<option value="available">Available now</option><option value="preorder">Preorder</option>';
    statusSelect.value = record.availabilityStatus === "preorder" ? "preorder" : "available";
    statusCell.append(statusSelect);
    const dateCell = document.createElement("td");
    dateCell.dataset.label = "Ready date";
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.className = "inventory-date-input";
    dateInput.setAttribute("aria-label", `Ready date for ${product.name}`);
    dateInput.value = record.availableDate || "";
    dateCell.append(dateInput);
    const quantityCell = document.createElement("td");
    quantityCell.dataset.label = "Stock";
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "99999";
    input.step = "1";
    input.inputMode = "numeric";
    input.setAttribute("aria-label", `Stock for ${product.name}`);
    const current = record.stock;
    input.value = Number.isInteger(current) ? String(current) : "";
    quantityCell.append(input);
    const priceCell = document.createElement("td");
    priceCell.dataset.label = "Price";
    const priceInput = document.createElement("input");
    priceInput.type = "number";
    priceInput.min = "0";
    priceInput.max = "99999.99";
    priceInput.step = "0.01";
    priceInput.inputMode = "decimal";
    priceInput.className = "inventory-price-input";
    priceInput.setAttribute("aria-label", `Price for ${product.name} in Canadian dollars`);
    const priceCents = record.priceCents;
    priceInput.value = Number.isInteger(priceCents) ? (priceCents / 100).toFixed(2) : "";
    priceCell.append(priceInput);
    const websiteCell = document.createElement("td");
    websiteCell.dataset.label = "Website";
    websiteCell.className = "inventory-row-status";
    const syncRow = () => {
      const preorder = statusSelect.value === "preorder";
      dateInput.disabled = !preorder;
      dateCell.classList.toggle("is-disabled", !preorder);
      if (!preorder) dateInput.setCustomValidity("");
      else dateInput.setCustomValidity(dateInput.value ? "" : "Choose the date this product will be ready.");
      setStatus(websiteCell, statusSelect.value, dateInput.value, input.value);
    };
    const markDirty = () => { dirty = true; syncRow(); saveStatus.textContent = "You have changes that are not saved yet."; };
    input.addEventListener("input", () => {
      markDirty();
    });
    priceInput.addEventListener("input", markDirty);
    statusSelect.addEventListener("change", markDirty);
    dateInput.addEventListener("change", markDirty);
    syncRow();
    row.append(productCell, categoryCell, statusCell, dateCell, quantityCell, priceCell, websiteCell);
    rows.append(row);
  });
  document.querySelector("[data-inventory-count]").textContent = `${catalog.length} products`;
  sessionStorage.setItem("jbn-inventory-key", inventoryKey);
  loginForm.hidden = true;
  manager.hidden = false;
  loginStatus.textContent = "";
  import("./business-admin.js").then(module=>module.openBusinessAdmin({fetcher:authorizedFetch,catalog})).catch(()=>{saveStatus.textContent="Inventory is ready. Business tools could not load; refresh to try again.";});
}

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  try {
    await openInventory(document.querySelector("#inventory-passcode").value);
  } catch (error) {
    loginStatus.textContent = error.message;
  }
});

let saving = false;

function showSavedToast(message) {
  const toast = document.querySelector("[data-inventory-toast]");
  if (!toast) return;
  toast.querySelector("span").textContent = message;
  toast.hidden = false;
  toast.classList.remove("is-visible");
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  clearTimeout(toast.hideTimer);
  toast.hideTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
    toast.hidden = true;
  }, 4200);
}

async function saveInventory() {
  if (saving || manager.hidden) return;
  const invalidDate = rows.querySelector(".inventory-date-input:invalid");
  if (invalidDate) {
    invalidDate.reportValidity();
    invalidDate.focus();
    saveStatus.textContent = "Choose a ready date for every product marked Preorder.";
    return;
  }
  const products = [...rows.querySelectorAll("tr")].map(row => {
    const stockValue = row.querySelector('input[step="1"]').value.trim();
    const priceValue = row.querySelector(".inventory-price-input").value.trim();
    return {
      id: row.dataset.productId,
      stock: stockValue === "" ? null : Number(stockValue),
      priceCents: priceValue === "" ? null : Math.round(Number(priceValue) * 100),
      availabilityStatus: row.querySelector(".inventory-status-select").value,
      availableDate: row.querySelector(".inventory-date-input").value || null
    };
  });
  saving = true;
  const buttons = [...document.querySelectorAll("[data-inventory-save]")];
  buttons.forEach(button => {
    button.disabled = true;
    button.dataset.label = button.textContent;
    button.textContent = "Saving…";
  });
  saveStatus.textContent = "Saving and updating the shop…";
  try {
    const response = await authorizedFetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "The changes could not be saved.");
    const verification = await authorizedFetch("/api/inventory");
    if (!verification.ok) throw new Error("The inventory saved, but the live update could not be verified. Refresh and try again.");
    dirty = false;
    const notificationMessage = payload.notificationsSent ? `${payload.notificationsSent} customer notification${payload.notificationsSent === 1 ? " was" : "s were"} also sent.` : "The shop now has your latest inventory.";
    saveStatus.textContent = payload.notificationsSent ? `Saved and live. ${notificationMessage}` : "Saved and live. The website inventory is up to date.";
    buttons.forEach(button => { button.textContent = "Saved ✓"; });
    showSavedToast(notificationMessage);
  } catch (error) {
    saveStatus.textContent = error.message;
  } finally {
    saving = false;
    setTimeout(() => {
      buttons.forEach(button => {
        button.disabled = false;
        button.textContent = button.dataset.label || "Save changes";
      });
    }, 900);
  }
}

document.querySelectorAll("[data-inventory-save]").forEach(button => button.addEventListener("click", saveInventory));

document.addEventListener("keydown", event => {
  if (event.key !== "Enter" || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey || manager.hidden) return;
  if (event.target.closest("button, textarea, a")) return;
  event.preventDefault();
  saveInventory();
});

window.addEventListener("beforeunload", event => {
  if (!dirty) return;
  event.preventDefault();
  event.returnValue = "";
});



const campaignForm=document.querySelector('[data-campaign-settings]');
const campaignStatus=document.querySelector('[data-campaign-admin-status]');
const campaignMoney=cents=>new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD'}).format(cents/100);
async function openCampaignAdmin(){
  const response=await fetch('/api/campaign',{cache:'no-store'}),payload=await response.json();
  if(!response.ok){campaignStatus.textContent=payload.error||'Campaign unavailable.';return;}
  const c=payload.config;
  campaignForm.elements.enabled.checked=c.enabled;
  campaignForm.elements.startDate.value=c.startDate;
  campaignForm.elements.endDate.value=c.endDate;
  campaignForm.elements.pairPrice.value=(c.pairPriceCents/100).toFixed(2);
  campaignForm.elements.donation.value=(c.donationPerPairCents/100).toFixed(2);
  await loadDonationOrders();
}
async function loadDonationOrders(){
  const response=await authorizedFetch('/api/campaign/orders'),payload=await response.json();
  if(!response.ok){document.querySelector('[data-campaign-orders-status]').textContent=payload.error;return;}
  document.querySelector('[data-donation-pending]').textContent=campaignMoney(payload.pendingCents);
  document.querySelector('[data-donation-earned]').textContent=campaignMoney(payload.earnedCents);
  const list=document.querySelector('[data-campaign-orders]');list.replaceChildren();
  if(!payload.orders.length){list.textContent='New website order requests will appear here.';return;}
  for(const row of payload.orders){
    const form=document.createElement('form');form.className='campaign-order-row';
    const info=document.createElement('div');
    const title=document.createElement('strong');title.textContent=row.order_id;info.append(title);
    const details=document.createElement('p');details.textContent=`${new Date(row.created_at).toLocaleDateString('en-CA')} · ${campaignMoney(row.order.estimatedTotalCents)} · ${row.order.qualifyingPairs} qualifying pair(s)`;info.append(details);
    if(row.email_status!=='sent'){const warning=document.createElement('p');warning.textContent='Email delivery incomplete — check inbox before confirming this request.';warning.style.color='#914861';info.append(warning);}
    const items=document.createElement('p');items.textContent=row.order.items.map(i=>`${i.name} × ${i.quantity}`).join(', ');info.append(items);form.append(info);
    const statusLabel=document.createElement('label');statusLabel.textContent='Order status';
    const select=document.createElement('select');select.name='status';
    for(const [value,label] of [['pending','Pending payment'],['paid','Paid'],['completed','Completed'],['cancelled','Cancelled'],['refunded','Full refund'],['partial_refund','Partial refund']]){const option=new Option(label,value);select.add(option);}select.value=row.status;statusLabel.append(select);form.append(statusLabel);
    const pairLabel=document.createElement('label');pairLabel.textContent='Pairs kept after partial refund';
    const pairs=document.createElement('input');pairs.type='number';pairs.min=0;pairs.max=row.order.qualifyingPairs;pairs.step=1;pairs.value=row.retained_pairs;pairs.disabled=select.value!=='partial_refund';pairLabel.append(pairs);form.append(pairLabel);
    select.addEventListener('change',()=>pairs.disabled=select.value!=='partial_refund');
    const button=document.createElement('button');button.className='button button-dark';button.type='submit';button.textContent='Save status';form.append(button);
    form.addEventListener('submit',async event=>{event.preventDefault();button.disabled=true;const status=document.querySelector('[data-campaign-orders-status]');
      try{const response=await authorizedFetch('/api/campaign/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:row.order_id,status:select.value,retainedPairs:Number(pairs.value)})});const result=await response.json();if(!response.ok)throw new Error(result.error);status.textContent=`${row.order_id} updated.`;await loadDonationOrders();}catch(error){status.textContent=error.message;}finally{button.disabled=false;}});
    list.append(form);
  }
}
campaignForm?.addEventListener('submit',async event=>{event.preventDefault();const button=campaignForm.querySelector('button');button.disabled=true;campaignStatus.textContent='Saving campaign…';
  try{const response=await authorizedFetch('/api/campaign',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({config:{enabled:campaignForm.elements.enabled.checked,startDate:campaignForm.elements.startDate.value,endDate:campaignForm.elements.endDate.value,pairPriceCents:Math.round(Number(campaignForm.elements.pairPrice.value)*100),donationPerPairCents:Math.round(Number(campaignForm.elements.donation.value)*100)}})});const result=await response.json();if(!response.ok)throw new Error(result.error);campaignStatus.textContent='Campaign saved. Refresh the shop to see the changes.';}catch(error){campaignStatus.textContent=error.message;}finally{button.disabled=false;}});

const rememberedKey = sessionStorage.getItem("jbn-inventory-key");
if (rememberedKey) openInventory(rememberedKey).catch(() => sessionStorage.removeItem("jbn-inventory-key"));

const emailPreviewForm=document.querySelector('[data-email-preview-form]');
emailPreviewForm?.addEventListener('submit',async event=>{
  event.preventDefault();if(!emailPreviewForm.reportValidity())return;
  const button=emailPreviewForm.querySelector('button[type="submit"]');const status=emailPreviewForm.querySelector('[data-email-preview-status]');
  button.disabled=true;status.textContent='Sending your test email…';
  try{
    const response=await authorizedFetch('/api/campaign/email-preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:emailPreviewForm.elements.email.value.trim()})});
    const result=await response.json();if(!response.ok)throw new Error(result.error||'The preview could not be sent.');
    status.textContent='Test email sent. Check your inbox.';
  }catch(error){status.textContent=error.message;}finally{button.disabled=false;}
});

document.addEventListener("jbn:orders-changed",()=>loadDonationOrders().catch(()=>{}));
