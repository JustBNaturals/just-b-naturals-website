import { readFileSync, writeFileSync } from 'node:fs';

const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
const localized = (en, fr) => `data-en="${escape(en)}" data-fr="${escape(fr)}"`;
const format = (value, locale) => new Intl.NumberFormat(locale, {style:'currency',currency:'CAD'}).format(value);

export const christmasHeroPhoto = 'images/christmas/gift-complete-care.webp';

export function buildChristmasPage(products, french) {
  const renderCard = id => {
    const product = products.find(item => item.id === id);
    const fr = french.find(item => item.id === id);
    const name = escape(product.name);
    const url = `product-${id}.html`;
    const enPrice = format(product.price, 'en-CA');
    const frPrice = format(product.price, 'fr-CA');
    return `<article class="product-card" data-product-id="${id}" style="--tone:${product.tone};--accent:${product.accent}">
      <a class="product-art" href="${url}"><img class="product-image" src="${product.image}" width="820" height="1093" alt="${name}" loading="lazy" decoding="async"><span class="image-hint" ${localized('View product','Voir le produit')}>View product</span></a>
      <div class="product-copy">
        <div class="product-title-row"><h2><a href="${url}" ${localized(product.name,fr.name)}>${name}</a></h2><span class="product-price" ${localized(enPrice,frPrice)}>${enPrice}</span></div>
        <p class="product-description" ${localized(product.cardDescription,fr.cardDescription)}>${escape(product.cardDescription)}</p>
        ${product.imageNote ? `<small class="gift-photo-note" ${localized(product.imageNote,fr.imageNote)}>${escape(product.imageNote)}</small>` : ''}
        <p class="stock-status" data-stock-product="${id}" hidden></p>
        <div class="product-order-options"><button class="button button-dark add-order-button" type="button" data-add-order="${id}">Add to cart <span>＋</span></button><a class="product-detail-link" href="${url}" ${localized('View full details','Voir les détails')}>View full details</a></div>
      </div>
    </article>`;
  };
  const renderGrid = ids => `<div class="product-grid">${ids.map(renderCard).join('\n').replace(/^[ \t]+$/gm, '')}</div>`;
  const collection = [
    ['gift-collection','Wrapped gift sets','Coffrets prêts à offrir',['gift-soap-duo','gift-soap-trio','gift-soap-quartet','gift-soap-and-scrub','gift-soap-and-roll-on','gift-complete-care']],
    ['small-gifts','Small gifts & stocking stuffers','Petits cadeaux et surprises pour le bas de Noël',['odds-n-ends','sourdough-crepe-mix','solid-dish-soap','menthol-shower-steamer']]
  ].map(([section,title,fr,ids])=>`<section class="section shell gift-collection" id="${section}" aria-labelledby="${section}-title">
    <div class="section-heading gift-section-heading">
      <h2 id="${section}-title" ${localized(title,fr)}>${title}</h2>
      <div class="gift-section-trim" aria-hidden="true">
        <div class="gift-snow gift-snow--trim"></div>
      </div>
    </div>
    ${renderGrid(ids)}
  </section>`).join('\n');
  for (const [file, markup] of [
    ['gift-sets.html',collection],
    ['christmas.html',renderGrid(['gift-soap-duo','gift-soap-trio','gift-soap-and-scrub','gift-complete-care'])]
  ]) {
    const page = readFileSync(file,'utf8');
    writeFileSync(file,page.replace(/<!-- CHRISTMAS-CARDS -->[\s\S]*?<!-- \/CHRISTMAS-CARDS -->/,`<!-- CHRISTMAS-CARDS -->\n${markup}\n<!-- /CHRISTMAS-CARDS -->`));
  }
}
