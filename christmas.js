import { twinkleLights } from "./christmas-twinkle.js?v=20261113-snowman";
import { startSnow } from "./gift-snow.js?v=20261112-wide";
import { christmasLights } from "./christmas-lights.js?v=20261112-wide";
import { t, campaignLanguage } from "./campaign-ui.js?v=20261016-natural-fade";

const torontoToday = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit"
}).format(new Date());
const announcement = document.querySelector("[data-christmas-announcement]");

if (announcement && torontoToday >= "2026-11-12" && torontoToday <= "2026-12-31") {
  const french = campaignLanguage === "fr";
  const splashUrl = "christmas.html" + (french ? "?lang=fr" : "");
  const giftUrl = "gift-sets.html" + (french ? "?lang=fr" : "");
  const shopLink = announcement.querySelector("[data-christmas-shop-link]");
  shopLink.href = giftUrl;
  shopLink.textContent = t("Shop Christmas gifts →", "Magasiner les cadeaux de Noël →");
  announcement.hidden = false;

  const homeCard = document.querySelector("[data-christmas-home-card]");
  if (homeCard) {
    const photos = [
      {src: "holiday-promo-20261113.webp", wide: true, alt: t("Handmade Christmas gift sets arranged around a tree", "Coffrets de Noël faits à la main disposés autour d’un sapin")},
      {src: "gift-complete-care.webp", alt: t("A kraft gift bag with soaps and body care", "Un sac-cadeau kraft avec des savons et des soins corporels")}
    ];
    homeCard.innerHTML = `<section class="shell pink-index-section christmas-home-card" aria-labelledby="christmas-home-title">
      <div class="pink-index-card">
        <div class="gift-snow" aria-hidden="true"></div>
        ${christmasLights}
        <div class="pink-index-gallery">
          <img data-christmas-photo data-wide-photo src="images/christmas/${photos[0].src}" width="820" height="1093" alt="${photos[0].alt}">
          <div class="pink-index-controls">
            <button type="button" data-christmas-step="-1" aria-label="${t("Previous photo", "Photo précédente")}">←</button>
            <span data-christmas-position aria-live="polite">1 / ${photos.length}</span>
            <button type="button" data-christmas-step="1" aria-label="${t("Next photo", "Photo suivante")}">→</button>
          </div>
        </div>
        <div class="pink-index-copy">
          <p class="eyebrow">${t("Christmas at Just B Natural", "Noël chez Just B Natural")}</p>
          <h2 id="christmas-home-title">${t("Handmade gifts, ready to give.", "Des cadeaux faits à la main, prêts à offrir.")}</h2>
          <p>${t("Ribbon-tied soap sets, care bundles and stocking stuffers, wrapped in Aylmer.", "Des coffrets de savons, des ensembles de soins et de petits cadeaux, emballés à Aylmer.")}</p>
          <div class="christmas-home-actions">
            <div class="hero-actions"><a class="button button-dark" href="${giftUrl}">${t("Shop Christmas gift sets", "Magasiner les coffrets de Noël")} <span aria-hidden="true">→</span></a></div>
            <div class="christmas-snowman" aria-hidden="true">
              <span class="christmas-snowman-shadow"></span>
              <span class="christmas-snowman-arm"></span>
              <span class="christmas-snowman-body"></span>
              <span class="christmas-snowman-head">
                <span class="christmas-snowman-hat"></span>
                <span class="christmas-snowman-eyes"></span>
                <span class="christmas-snowman-nose"></span>
              </span>
              <span class="christmas-snowman-scarf"></span>
            </div>
          </div>
        </div>
      </div>
    </section>`;
    const image = homeCard.querySelector("[data-christmas-photo]");
    const position = homeCard.querySelector("[data-christmas-position]");
    let slide = 0;
    homeCard.addEventListener("click", event => {
      const control = event.target.closest("[data-christmas-step]");
      if (!control) return;
      slide = (slide + Number(control.dataset.christmasStep) + photos.length) % photos.length;
      image.src = "images/christmas/" + photos[slide].src;
      image.alt = photos[slide].alt;
      image.toggleAttribute("data-wide-photo", Boolean(photos[slide].wide));
      position.textContent = `${slide + 1} / ${photos.length}`;
    });
    homeCard.hidden = false;
    startSnow(homeCard);
    twinkleLights(homeCard);
  }


  const key = "jbn-christmas-2026-seen";
  let shown = false;
  try { shown = sessionStorage.getItem(key) === "1"; } catch {}

  function showChristmasPopup() {
    let dialog = document.querySelector("[data-christmas-popup]");
    if (!dialog) {
      document.body.insertAdjacentHTML("beforeend", `<dialog class="pink-promo-popup christmas-popup" data-christmas-popup aria-labelledby="christmas-popup-title">
        <button type="button" class="pink-popup-close" data-christmas-close aria-label="${t("Close Christmas popup", "Fermer la fenêtre de Noël")}">×</button>
        <div class="pink-popup-grid">
          <img class="pink-popup-photo" src="images/christmas/gift-soap-duo-20261113.webp" width="820" height="1093" alt="${t("A soap gift box under the Christmas tree", "Un coffret de savons sous le sapin de Noël")}">
          <div class="pink-popup-copy">
            <p class="eyebrow">${t("Christmas at Just B Natural", "Noël chez Just B Natural")}</p>
            <h2 id="christmas-popup-title">${t("Handmade Christmas gifts", "Des cadeaux de Noël faits à la main")}</h2>
            <p class="pink-popup-note">${t("Shop ribbon-tied gift sets, artisan soaps, and little gifts made in Aylmer.", "Découvrez nos coffrets noués d’un ruban, nos savons artisanaux et nos petits cadeaux faits à Aylmer.")}</p>
            <a class="button button-dark" href="${splashUrl}">${t("Explore Christmas gifts", "Découvrir les cadeaux de Noël")} <span aria-hidden="true">→</span></a>
            <button type="button" class="pink-popup-skip" data-christmas-close>${t("Keep browsing", "Continuer à explorer")}</button>
          </div>
        </div>
      </dialog>`);
      dialog = document.querySelector("[data-christmas-popup]");
      dialog.querySelectorAll("[data-christmas-close]").forEach(button =>
        button.addEventListener("click", () => dialog.close())
      );
      dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
    }
    if (!dialog.open && !document.querySelector("dialog[open]")) {
      dialog.showModal();
      try { sessionStorage.setItem(key, "1"); } catch {}
    }
  }

  if (!shown && typeof HTMLDialogElement !== "undefined") setTimeout(showChristmasPopup, 700);
}
