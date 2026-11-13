const motion = matchMedia("(prefers-reduced-motion: reduce)");

export function twinkleLights(root) {
  for (const bulb of root.querySelectorAll(".christmas-light-bulb")) {
    function flicker() {
      if (!bulb.isConnected) return;
      if (!motion.matches && !document.hidden) {
        bulb.animate([
          {opacity: 1}, {opacity: .45, offset: .33}, {opacity: 1}
        ], {duration: 360 + Math.random() * 420, easing: "ease-in-out"});
      }
      setTimeout(flicker, 900 + Math.random() * 5100);
    }
    setTimeout(flicker, Math.random() * 3800);
  }
}

twinkleLights(document);

const headings = document.querySelectorAll(".gift-section-heading > h2");
function sizeStrands() {
  const width = document.documentElement.clientWidth;
  for (const heading of headings) {
    const bounds = heading.getBoundingClientRect();
    const section = heading.parentElement;
    section.style.setProperty("--gift-title-width", `${bounds.width}px`);
    section.style.setProperty("--gift-viewport-width", `${width}px`);
    section.style.setProperty("--gift-viewport-offset", `-${bounds.left}px`);
  }
}
if (headings.length) {
  sizeStrands();
  addEventListener("resize", sizeStrands);
  const titleWidths = new ResizeObserver(sizeStrands);
  headings.forEach(heading => titleWidths.observe(heading));
}
