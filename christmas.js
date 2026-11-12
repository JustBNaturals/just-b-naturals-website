import { t, campaignLanguage } from "./campaign-ui.js?v=20261016-natural-fade";

const torontoToday = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit"
}).format(new Date());
const announcement = document.querySelector("[data-christmas-announcement]");

if (announcement && torontoToday >= "2026-11-12" && torontoToday <= "2026-12-31") {
  const french = campaignLanguage === "fr";
  const splashUrl = "christmas.html" + (french ? "?lang=fr" : "");
  const open = announcement.querySelector("[data-christmas-open]");
  open.href = splashUrl;
  open.textContent = t("Christmas at Just B Natural →", "Noël chez Just B Natural →");
  announcement.hidden = false;

  const key = "jbn-christmas-2026-seen";
  let shown = false;
  try { shown = sessionStorage.getItem(key) === "1"; } catch {}

  function showChristmasPopup() {
    let dialog = document.querySelector("[data-christmas-popup]");
    if (!dialog) {
      document.body.insertAdjacentHTML("beforeend", `<dialog class="pink-promo-popup christmas-popup" data-christmas-popup aria-labelledby="christmas-popup-title">
        <button type="button" class="pink-popup-close" data-christmas-close aria-label="${t("Close Christmas popup", "Fermer la fenêtre de Noël")}">×</button>
        <div class="pink-popup-grid">
          <img class="pink-popup-photo" src="images/christmas/gift-soap-duo.webp" width="820" height="1093" alt="${t("A soap gift box under the Christmas tree", "Un coffret de savons sous le sapin de Noël")}">
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

  open.addEventListener("click", event => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || typeof HTMLDialogElement === "undefined") return;
    event.preventDefault();
    showChristmasPopup();
  });
  if (!shown && typeof HTMLDialogElement !== "undefined") setTimeout(showChristmasPopup, 700);
}
