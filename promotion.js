// Shared by the storefront and Cloudflare Worker. Prices are integer CAD cents.
export const CAMPAIGN_DEFAULTS = Object.freeze({
  enabled: true, startDate: "2026-10-01", endDate: "2026-10-31",
  pairPriceCents: 1400, donationPerPairCents: 100, timezone: "America/Toronto"
});
export const SOAP_IDS = Object.freeze([
  "matcha-lavender-soap", "rosemary-sage-soap", "lemon-rosemary-soap", "ember-ash-soap",
  "sweater-weather-soap", "coconut-lavender-soap", "whisper-citrus-soap", "charcoal-blush-soap",
  "cedar-eucalyptus-loofah-soap", "lemongrass-lavender-soap", "ylang-ylang-soap",
  "honey-oat-comfort-soap", "chocolate-pumpkin-pie-soap", "unscented-loofah-soap",
  "mint-eucalyptus-spa-soap", "spiced-banana-soap", "cedar-lemon-soap", "blue-cedar-soap",
  "chamomile-soap", "forest-soap", "lavender-oat-soap", "ocean-soap", "rose-matter-soap"
]);
export function campaignConfig(value = {}) {
  const result = { ...CAMPAIGN_DEFAULTS, ...value, timezone: CAMPAIGN_DEFAULTS.timezone };
  for (const key of ["startDate", "endDate"]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(result[key]) || new Date(`${result[key]}T12:00:00Z`).toISOString().slice(0,10) !== result[key]) throw new Error("Use valid campaign dates.");
  }
  if (result.startDate > result.endDate) throw new Error("The end date must follow the start date.");
  if (typeof result.enabled !== "boolean") throw new Error("Choose whether the campaign is enabled.");
  for (const key of ["pairPriceCents", "donationPerPairCents"]) {
    if (!Number.isInteger(result[key]) || result[key] < 0 || result[key] > 100000) throw new Error("Use valid campaign amounts.");
  }
  return result;
}
export function torontoDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {timeZone: "America/Toronto", year:"numeric", month:"2-digit", day:"2-digit"}).formatToParts(now);
  const part = type => parts.find(p => p.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function campaignActive(config = CAMPAIGN_DEFAULTS, now = new Date()) {
  const today = torontoDate(now);
  return config.enabled && today >= config.startDate && today <= config.endDate;
}
export function priceOrder(items, config = CAMPAIGN_DEFAULTS, now = new Date()) {
  const active = campaignActive(config, now), soaps = [];
  let regularSubtotalCents = 0;
  for (const item of items) {
    if (!Number.isInteger(item.priceCents) || item.priceCents < 0 || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new Error("Invalid order price or quantity.");
    regularSubtotalCents += item.priceCents * item.quantity;
    if (SOAP_IDS.includes(item.id)) for (let n = 0; n < item.quantity; n++) soaps.push(item.priceCents);
  }
  // Highest-priced bars pair first: maximum customer saving, cheapest odd bar stays regular.
  soaps.sort((a,b) => b-a);
  const qualifyingPairs = active ? Math.floor(soaps.length / 2) : 0;
  let discountCents = 0;
  for (let p = 0; p < qualifyingPairs; p++) discountCents += Math.max(0, soaps[p*2] + soaps[p*2+1] - config.pairPriceCents);
  return { active, eligibleQuantity: soaps.length, qualifyingPairs, regularSubtotalCents, discountCents,
    itemSubtotalCents: regularSubtotalCents - discountCents,
    donationCommitmentCents: qualifyingPairs * config.donationPerPairCents };
}
