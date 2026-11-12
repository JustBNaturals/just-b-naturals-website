import { readFileSync, writeFileSync } from 'node:fs';

const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
const localized = (en, fr) => `data-en="${escape(en)}" data-fr="${escape(fr)}"`;
const format = value => new Intl.NumberFormat('en-CA', {style:'currency',currency:'CAD'}).format(value);

export const christmasHeroPhoto = 'images/christmas/gift-complete-care.webp';

export function buildChristmasPage(products, french) {
  const renderCard = id => {
    const product = products.find(item => item.id === id);
    const fr = french.find(item => item.id === id);
    const name = escape(product.name);
    const url = `product-${id}.html`;
    return `<article class="holiday-card product-card" data-product-id="${id}">
      <a class="holiday-card-photo" href="${url}"><img src="${product.image}" width="1000" height="1333" alt="${name}" ${localized(product.name,fr.name)} loading="lazy" decoding="async"></a>
      <div class="holiday-card-copy">
        <div class="product-title-row"><h3><a href="${url}" ${localized(product.name,fr.name)}>${name}</a></h3><span class="product-price">${format(product.price)}</span></div>
        <p ${localized(product.cardDescription,fr.cardDescription)}>${escape(product.cardDescription)}</p>
        ${product.imageNote ? `<small class="holiday-photo-note" ${localized(product.imageNote,fr.imageNote)}>${escape(product.imageNote)}</small>` : ''}
        <p class="stock-status" data-stock-product="${id}" hidden></p>
        <div class="product-order-options"><button class="button button-dark add-order-button" type="button" data-add-order="${id}">Add to cart <span>＋</span></button></div>
      </div>
    </article>`;
  };
  const markup = [
    ['gift-collection','Wrapped gift sets','Coffrets prêts à offrir',['gift-soap-duo','gift-soap-trio','gift-soap-quartet','gift-soap-and-scrub','gift-soap-and-roll-on','gift-complete-care']],
    ['small-gifts','Small gifts & stocking stuffers','Petits cadeaux et surprises pour le bas de Noël',['odds-n-ends','sourdough-crepe-mix','solid-dish-soap','menthol-shower-steamer']]
  ].map(([section,title,fr,ids])=>`<section class="shell holiday-collection" id="${section}" aria-labelledby="${section}-title">
    <h2 id="${section}-title" ${localized(title,fr)}>${title}</h2>
    <div class="holiday-grid">${ids.map(renderCard).join('\n').replace(/^[ \t]+$/gm, '')}</div>
  </section>`).join('\n');
  const page = readFileSync('gift-sets.html','utf8');
  writeFileSync('gift-sets.html',page.replace(/<!-- CHRISTMAS-CARDS -->[\s\S]*?<!-- \/CHRISTMAS-CARDS -->/,`<!-- CHRISTMAS-CARDS -->\n${markup}\n<!-- /CHRISTMAS-CARDS -->`));
}
