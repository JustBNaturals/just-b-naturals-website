const CATEGORY_NAMES = {
  "artisan-soap": "Artisan soaps",
  "sugar-scrubs": "Sugar scrubs",
  "roller-oils": "Roller oils",
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

function setStatus(cell, value) {
  if (value === "") {
    cell.textContent = "Count hidden";
    cell.dataset.state = "hidden";
  } else if (Number(value) === 0) {
    cell.textContent = "Out of stock";
    cell.dataset.state = "out";
  } else {
    cell.textContent = "Shown on site";
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
  const quantities = new Map((inventoryPayload.products || []).map(item => [item.id, item.stock]));
  catalog.sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.name.localeCompare(b.name));
  rows.replaceChildren();
  catalog.forEach(product => {
    const row = document.createElement("tr");
    row.dataset.productId = product.id;
    const productCell = document.createElement("th");
    productCell.scope = "row";
    productCell.textContent = product.name;
    const categoryCell = document.createElement("td");
    categoryCell.textContent = CATEGORY_NAMES[product.category] || product.category;
    const quantityCell = document.createElement("td");
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "99999";
    input.step = "1";
    input.inputMode = "numeric";
    input.setAttribute("aria-label", `Stock for ${product.name}`);
    const current = quantities.get(product.id);
    input.value = Number.isInteger(current) ? String(current) : "";
    quantityCell.append(input);
    const websiteCell = document.createElement("td");
    websiteCell.className = "inventory-row-status";
    setStatus(websiteCell, input.value);
    input.addEventListener("input", () => {
      dirty = true;
      setStatus(websiteCell, input.value);
      saveStatus.textContent = "You have changes that are not saved yet.";
    });
    row.append(productCell, categoryCell, quantityCell, websiteCell);
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
    const products = [...rows.querySelectorAll("tr")].map(row => {
      const value = row.querySelector("input").value.trim();
      return { id: row.dataset.productId, stock: value === "" ? null : Number(value) };
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
      saveStatus.textContent = "Saved. The website inventory is up to date.";
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

