// These cards are direct doors into Instagram, without an embed or tracking script.
export function initializeInstagramGallery(){
 const fr=new URLSearchParams(location.search).get('lang')==='fr';
 document.querySelectorAll('[data-instagram-gallery] [data-social-alt]').forEach(img=>{img.alt=fr?img.dataset.fr:img.dataset.en;});
}
