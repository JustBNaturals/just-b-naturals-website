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
  } else if (status === "unavailable") {
    cell.textContent = "Ordering is off";
    cell.dataset.state = "out";
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
  return fetch(url, { ...options, headers });
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
    statusSelect.innerHTML = '<option value="available">Available now</option><option value="preorder">Preorder</option><option value="unavailable">Unavailable</option>';
    statusSelect.value = record.availabilityStatus || (record.active === false ? "unavailable" : "available");
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
}

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  try {
    await openInventory(document.querySelector("#inventory-passcode").value);
  } catch (error) {
    loginStatus.textContent = error.message;
  }
});

document.querySelectorAll("[data-inventory-save]").forEach(button => {
  button.addEventListener("click", async () => {
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
    button.disabled = true;
    saveStatus.textContent = "Saving…";
    try {
      const response = await authorizedFetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "The changes could not be saved.");
      dirty = false;
      saveStatus.textContent = payload.notificationsSent ? `Saved. ${payload.notificationsSent} customer notification${payload.notificationsSent === 1 ? " was" : "s were"} sent.` : "Saved. The website inventory is up to date.";
    } catch (error) {
      saveStatus.textContent = error.message;
    } finally {
      document.querySelectorAll("[data-inventory-save]").forEach(item => { item.disabled = false; });
    }
  });
});

window.addEventListener("beforeunload", event => {
  if (!dirty) return;
  event.preventDefault();
  event.returnValue = "";
});

const rememberedKey = sessionStorage.getItem("jbn-inventory-key");
if (rememberedKey) openInventory(rememberedKey).catch(() => sessionStorage.removeItem("jbn-inventory-key"));
