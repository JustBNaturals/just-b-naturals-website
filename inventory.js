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
function inventoryRowValue(row){
 const stock=row.querySelector('input[step="1"]').value.trim(),price=row.querySelector('.inventory-price-input').value.trim();
 return {id:row.dataset.productId,stock:stock===''?null:Number(stock),priceCents:price===''?null:Math.round(Number(price)*100),availabilityStatus:row.querySelector('.inventory-status-select').value,availableDate:row.querySelector('.inventory-date-input').value||null};
}
function refreshDirtyState(){
 let count=0;rows.querySelectorAll('tr').forEach(row=>{const changed=JSON.stringify(inventoryRowValue(row))!==row.dataset.savedValues;row.classList.toggle('is-dirty',changed);if(changed)count++;});dirty=count>0;
 const badge=document.querySelector('[data-inventory-dirty]');if(badge){badge.textContent=count?`${count} product${count===1?'':'s'} with unsaved changes`:'All changes saved ✓';badge.classList.toggle('has-changes',dirty);}
 document.querySelectorAll('[data-inventory-save]').forEach(button=>{if(!saving)button.disabled=!dirty;});
}
function filterInventory(){
 const query=(document.querySelector('[data-inventory-search]')?.value||'').trim().toLowerCase(),category=document.querySelector('[data-inventory-category]')?.value||'all',filter=document.querySelector('[data-inventory-filter]')?.value||'all';let visible=0;const all=[...rows.querySelectorAll('tr')];
 for(const row of all){const product=inventoryRowValue(row),name=row.querySelector('th').textContent.toLowerCase();const match=filter==='all'||(filter==='changed'&&row.classList.contains('is-dirty'))||(filter==='preorder'&&product.availabilityStatus==='preorder')||(filter==='out'&&product.stock===0&&product.availabilityStatus!=='preorder')||(filter==='low'&&product.stock!==null&&product.stock<=3&&product.availabilityStatus!=='preorder');row.hidden=!(name.includes(query)&&(category==='all'||row.dataset.category===category)&&match);if(!row.hidden)visible++;}
 const label=document.querySelector('[data-inventory-visible]');if(label)label.textContent=`Showing ${visible} of ${all.length} products`;const empty=document.querySelector('[data-inventory-empty]');if(empty)empty.hidden=visible>0;
}


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
    fetch("inventory-catalog.json", { cache: "no-store" }),
    authorizedFetch("/api/inventory")
  ]);
  const inventoryPayload = await inventoryResponse.json().catch(() => ({}));
  if (!inventoryResponse.ok) throw new Error(inventoryPayload.error || "The inventory could not be opened.");
  const catalog = await catalogResponse.json();
  const inventory = new Map((inventoryPayload.products || []).map(item => [item.id, item]));
  catalog.sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.name.localeCompare(b.name));
  rows.replaceChildren();
  catalog.forEach(product => {
    const row = document.createElement("tr");
    row.dataset.productId = product.id;
    row.dataset.category = product.category;
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
    const markDirty = () => { syncRow(); refreshDirtyState(); saveStatus.textContent = dirty ? "Highlighted rows have changes. Save when you’re ready." : "All changes match the live shop."; };
    input.addEventListener("input", () => {
      markDirty();
    });
    priceInput.addEventListener("input", markDirty);
    statusSelect.addEventListener("change", markDirty);
    dateInput.addEventListener("change", markDirty);
    syncRow();
    row.append(productCell, categoryCell, statusCell, dateCell, quantityCell, priceCell, websiteCell);
    rows.append(row);
    row.dataset.savedValues=JSON.stringify(inventoryRowValue(row));
  });
  document.querySelector("[data-inventory-count]").textContent = `${catalog.length} products`;
  refreshDirtyState();filterInventory();
  sessionStorage.setItem("jbn-inventory-key", inventoryKey);
  loginForm.hidden = true;
  manager.hidden = false;
  loginStatus.textContent = "";
  import("./business-admin.js?v=20261017-portal").then(module=>module.openBusinessAdmin({fetcher:authorizedFetch,catalog})).catch(()=>{saveStatus.textContent="Inventory is ready. Business tools could not load; refresh to try again.";});
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
  if (saving || manager.hidden || !dirty) return;
  const invalidDate = rows.querySelector("tr.is-dirty .inventory-date-input:invalid");
  if (invalidDate) {
    invalidDate.reportValidity();
    invalidDate.focus();
    saveStatus.textContent = "Choose a ready date for every product marked Preorder.";
    return;
  }
  const changed=[...rows.querySelectorAll('tr.is-dirty')];
  const invalid=changed.flatMap(row=>[...row.querySelectorAll('input,select')]).find(input=>!input.checkValidity());
  if(invalid){invalid.reportValidity();invalid.focus();saveStatus.textContent='Please check the highlighted value before saving.';return;}
  const products=changed.map(inventoryRowValue);
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
    products.forEach(product=>{const row=[...rows.querySelectorAll('tr')].find(row=>row.dataset.productId===product.id);if(row)row.dataset.savedValues=JSON.stringify(product);});
    refreshDirtyState();filterInventory();
    document.dispatchEvent(new Event("jbn:inventory-saved"));
    const notificationMessage = payload.notificationsSent ? `${payload.notificationsSent} customer notification${payload.notificationsSent === 1 ? " was" : "s were"} also sent.` : "The shop now has your latest inventory.";
    saveStatus.textContent = payload.notificationsSent ? `Saved and live. ${notificationMessage}` : "Saved and live. The website inventory is up to date.";
    buttons.forEach(button => { button.textContent = "Saved ✓"; });
    showSavedToast(dirty ? "Saved. You also have newer edits to save." : notificationMessage);
  } catch (error) {
    saveStatus.textContent = error.message;
  } finally {
    saving = false;
    setTimeout(() => {
      buttons.forEach(button => {
        button.disabled = !dirty;
        button.textContent = button.dataset.label || "Save changes";
      });
    }, 900);
  }
}

document.querySelectorAll("[data-inventory-save]").forEach(button => button.addEventListener("click", saveInventory));

document.addEventListener("keydown", event => {
  if (event.key !== "Enter" || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey || manager.hidden) return;
  if (!event.target.closest("[data-inventory-rows]") || event.target.closest("button, textarea, a")) return;
  event.preventDefault();
  saveInventory();
});

window.addEventListener("beforeunload", event => {
  if (!dirty) return;
  event.preventDefault();
  event.returnValue = "";
});



document.querySelector('[data-inventory-search]')?.addEventListener('input',filterInventory);
document.querySelectorAll('[data-inventory-category],[data-inventory-filter]').forEach(field=>field.addEventListener('change',filterInventory));
document.addEventListener('jbn:inventory-filter',filterInventory);
const rememberedKey = sessionStorage.getItem("jbn-inventory-key");
if (rememberedKey) openInventory(rememberedKey).catch(() => sessionStorage.removeItem("jbn-inventory-key"));
