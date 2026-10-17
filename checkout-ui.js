// Checkout handlers are loaded only on the checkout page.
export function initializeCheckoutPage(api) {
 const {STORE,campaignLanguage,t,cartSubtotalCents,updateCheckoutTotals,escapeHtml,buildOrderSummary,initializeInlineValidation,renderOrderList,syncCheckoutState}=api;
 let pendingCheckout={signature:"",key:""};
function checkoutPayload(form) {
  const data = new FormData(form);
  const fulfillment = String(data.get("fulfillment") || "pickup");
  const deliveryAddress = String(data.get("deliveryAddress") || "").trim();
  const deliveryDistanceKm = Number(data.get("deliveryDistanceKm"));
  const deliveryFeeCents = Number(data.get("deliveryFeeCents"));
  return {
    language: campaignLanguage,
    firstName: String(data.get("firstName") || "").trim(),
    lastName: String(data.get("lastName") || "").trim(),
    email: String(data.get("email") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    area: fulfillment === "delivery" ? deliveryAddress : String(data.get("area") || "").trim(),
    fulfillment,
    deliveryAddress,
    deliveryPlaceId: String(data.get("deliveryPlaceId") || "").trim(),
    deliveryDistanceKm: Number.isFinite(deliveryDistanceKm) && deliveryDistanceKm > 0 ? deliveryDistanceKm : null,
    deliveryFeeCents: Number.isInteger(deliveryFeeCents) && deliveryFeeCents >= 0 ? deliveryFeeCents : null,
    payment: String(data.get("payment") || "etransfer"),
    notes: String(data.get("notes") || "").trim(),
    marketingConsent: data.get("marketingConsent") === "on",
    locale: globalThis.JBN_FR?.isFrench ? "fr" : "en",
    language: campaignLanguage,
    consentText: globalThis.JBN_FR?.isFrench ? "J'accepte de recevoir occasionnellement des nouvelles et promotions de Just B Natural. Je peux me désabonner en tout temps." : "I agree to receive occasional promotions from Just B Natural. I can unsubscribe anytime.",
    consentedAt: new Date().toISOString(),
    website: String(data.get("website") || ""),
    items: api.cart().map(item => ({ id: item.id, quantity: item.quantity }))
  };
}

function initializeDeliveryEstimator(form) {
  const panel = form.querySelector("[data-delivery-estimator]");
  const pickupArea = form.querySelector("[data-pickup-area]");
  const address = form.querySelector("[data-delivery-address]");
  const suggestions = form.querySelector("[data-delivery-suggestions]");
  const status = form.querySelector("[data-delivery-estimate-status]");
  if (!panel || !address || !suggestions || !status) return;

  const placeId = form.elements.deliveryPlaceId;
  const distance = form.elements.deliveryDistanceKm;
  const fee = form.elements.deliveryFeeCents;
  const sessionToken = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  let timer = 0;
  let requestNumber = 0;

  const closeSuggestions = () => {
    suggestions.hidden = true;
    address.setAttribute("aria-expanded", "false");
  };

  const clearEstimate = () => {
    placeId.value = "";
    distance.value = "";
    fee.value = "";
    status.textContent = "Choose the matching address from the suggestion list to confirm local delivery.";
    status.classList.remove("is-ready", "is-error");
    if (form.elements.fulfillment.value === "delivery") address.setCustomValidity("Please select a suggested address so we can confirm local delivery.");
    updateCheckoutTotals();
  };

  const showUnavailable = () => {
    closeSuggestions();
    status.textContent = "We could not confirm local delivery for this address. Choose a suggested address before placing the order.";
    status.classList.add("is-error");
    status.classList.remove("is-ready");
    address.setCustomValidity("Please select a suggested address so we can confirm local delivery.");
  };

  const estimate = async (selectedPlaceId, selectedAddress) => {
    status.textContent = "Confirming the local delivery zone…";
    status.classList.remove("is-ready", "is-error");
    try {
      const response = await fetch(STORE.deliveryEstimateEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: selectedPlaceId, address: selectedAddress, subtotalCents: cartSubtotalCents() })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Estimate unavailable");
      distance.value = String(result.distanceKm);
      fee.value = String(result.feeCents);
      status.textContent = Number(result.feeCents) === 0
        ? `Address confirmed: ${Number(result.distanceKm).toFixed(1)} km from Aylmer • Free local delivery`
        : `Address confirmed: ${Number(result.distanceKm).toFixed(1)} km from Aylmer • $10.00 local delivery`;
      status.classList.add("is-ready");
      status.classList.remove("is-error");
      address.setCustomValidity("");
      address.dispatchEvent(new Event("change", { bubbles: true }));
      updateCheckoutTotals();
    } catch (_) {
      showUnavailable();
    }
  };

  const renderSuggestions = (predictions, provider = "OpenStreetMap") => {
    if (!predictions.length) {
      closeSuggestions();
      return;
    }
    suggestions.innerHTML = `${predictions.map(prediction => `<button type="button" role="option" data-place-id="${escapeHtml(prediction.placeId)}" data-address="${escapeHtml(prediction.text)}">${escapeHtml(prediction.text)}</button>`).join("")}<p class="delivery-google">Address data © ${escapeHtml(provider)}</p>`;
    suggestions.querySelectorAll("button[data-place-id]").forEach(option => {
      const selectOption = () => {
        if (placeId.value === option.dataset.placeId && address.value === option.dataset.address) return;
        address.value = option.dataset.address || "";
        placeId.value = option.dataset.placeId || "";
        closeSuggestions();
        estimate(placeId.value, address.value);
      };
      option.addEventListener("pointerdown", event => { event.preventDefault(); selectOption(); });
      option.addEventListener("click", selectOption);
      option.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectOption(); } });
    });
    suggestions.hidden = false;
    address.setAttribute("aria-expanded", "true");
    const bounds = address.getBoundingClientRect();
    const headerClearance = window.innerWidth <= 720 ? 165 : 110;
    if (bounds.top < headerClearance || bounds.bottom > window.innerHeight - 150) address.scrollIntoView({ behavior: "auto", block: "center" });
  };

  address.addEventListener("input", () => {
    clearEstimate();
    window.clearTimeout(timer);
    const input = address.value.trim();
    if (input.length < 3) {
      closeSuggestions();
      return;
    }
    const currentRequest = ++requestNumber;
    timer = window.setTimeout(async () => {
      try {
        const response = await fetch(STORE.deliveryAutocompleteEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input, sessionToken })
        });
        const result = await response.json().catch(() => ({}));
        if (currentRequest !== requestNumber) return;
        if (!response.ok) throw new Error(result.error || "Suggestions unavailable");
        renderSuggestions(Array.isArray(result.predictions) ? result.predictions : [], result.provider || "OpenStreetMap");
      } catch (_) {
        if (currentRequest === requestNumber) showUnavailable();
      }
    }, 250);
  });

  const syncFulfillment = () => {
    const deliverySelected = form.elements.fulfillment.value === "delivery";
    panel.hidden = !deliverySelected;
    if (pickupArea) pickupArea.hidden = deliverySelected;
    address.required = deliverySelected;
    address.setCustomValidity(deliverySelected && !distance.value ? "Please select a suggested address so we can confirm local delivery." : "");
    if (!deliverySelected) {
      closeSuggestions();
      clearEstimate();
    }
    updateCheckoutTotals();
  };

  form.querySelectorAll('input[name="fulfillment"]').forEach(radio => radio.addEventListener("change", syncFulfillment));
  document.addEventListener("click", event => {
    if (!event.target.closest(".delivery-address-wrap")) closeSuggestions();
  });
  syncFulfillment();
}

function checkoutEmailUrl(details) {
  const subject = `Guest order – ${details.firstName || "Customer"}`;
  return `mailto:${STORE.orderEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildOrderSummary(details))}`;
}

function focusFirstInvalidCheckoutField(form) {
  const field = [...form.elements].find(control => control.willValidate && !control.checkValidity() && control.type !== "hidden");
  if (!(field instanceof HTMLElement)) return;
  const headerClearance = window.innerWidth <= 900 ? 150 : 105;
  const targetTop = Math.max(0, field.getBoundingClientRect().top + window.scrollY - headerClearance);
  field.focus({ preventScroll: true });
  window.scrollTo({ top: targetTop, behavior: "smooth" });
  window.setTimeout(() => {
    field.focus({ preventScroll: true });
    if (field instanceof HTMLInputElement && typeof field.setSelectionRange === "function") {
      try { field.setSelectionRange(field.value.length, field.value.length); } catch (_) {}
    }
  }, 360);
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
  api.clearCart();
  renderOrderList();
}

function initializeCheckout() {
  const checkout = document.querySelector("[data-checkout]");
  const form = document.querySelector("[data-checkout-form]");
  if (!checkout || !form) return;
  initializeDeliveryEstimator(form);
  const updateValidation = initializeInlineValidation(form);
  renderOrderList();
  syncCheckoutState();

  form.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.target.closest("textarea, button")) event.preventDefault();
  });

  let invalidFocusQueued = false;
  form.addEventListener("invalid", () => {
    form.classList.add("was-validated");
    if (invalidFocusQueued) return;
    invalidFocusQueued = true;
    requestAnimationFrame(() => {
      updateValidation(true);
      focusFirstInvalidCheckoutField(form);
      const invalidStatus = form.querySelector("[data-checkout-status]");
      if (invalidStatus) {
        invalidStatus.textContent = "Please correct the highlighted information before sending your request.";
        invalidStatus.classList.add("is-error");
      }
      invalidFocusQueued = false;
    });
  }, true);

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!event.submitter?.matches(".checkout-submit")) return;
    form.classList.add("was-validated");
    if (!form.reportValidity() || !api.cart().length) {
      updateValidation(true);
      focusFirstInvalidCheckoutField(form);
      const invalidStatus = form.querySelector("[data-checkout-status]");
      if (invalidStatus) {
        invalidStatus.textContent = "Please correct the highlighted information before sending your request.";
        invalidStatus.classList.add("is-error");
      }
      return;
    }
    const details = checkoutPayload(form);
    const signature=JSON.stringify({...details,consentedAt:undefined});
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(signature)))).map(b=>b.toString(16).padStart(2,'0')).join('');
    try{const saved=JSON.parse(sessionStorage.getItem('jbn-pending-request')||'null');if(saved?.signature===hash)pendingCheckout=saved;}catch(_){}
    if(pendingCheckout.signature!==hash)pendingCheckout={signature:hash,key:crypto.randomUUID()};
    try{sessionStorage.setItem('jbn-pending-request',JSON.stringify(pendingCheckout));}catch(_){}
    details.requestKey=pendingCheckout.key;
    const button = form.querySelector('[type="submit"]');
    const status = form.querySelector("[data-checkout-status]");
    const fallback = form.querySelector("[data-checkout-fallback]");
    button.disabled = true;
    button.textContent = "Sending request…";
    if (status) { status.textContent = ""; status.classList.remove("is-error"); }
    if (fallback) fallback.hidden = true;

    if (window.location.protocol === "file:") {
      if (status) status.textContent = "This saved copy cannot submit automatically. Use the prepared email to send your request; no payment is due yet.";
      if (fallback) {
        fallback.href = checkoutEmailUrl(details);
        fallback.hidden = false;
      }
      button.disabled = false;
      button.textContent = "Request order";
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
      try{sessionStorage.removeItem('jbn-pending-request');}catch(_){}
      if(result.emailPending){const message=document.querySelector('.checkout-success>p:last-of-type');if(message)message.textContent=t('Your request is saved. The receipt email is delayed; please do not submit again. We will confirm availability and payment separately.','Votre demande est enregistrée. Le courriel est retardé; ne soumettez pas une nouvelle demande. Nous confirmerons la disponibilité et le paiement séparément.');}
    } catch (error) {
      if (status) { status.textContent = error.message || "We could not send the request automatically. You can send the prepared request by email instead."; status.classList.add("is-error"); }
      if (fallback) {
        fallback.href = checkoutEmailUrl(details);
        fallback.hidden = false;
      }
    } finally {
      button.disabled = false;
      button.textContent = "Request order";
    }
  });
}


initializeCheckout();
}
