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

const titleWidths = new ResizeObserver(entries => {
  for (const {target, contentRect} of entries) {
    target.parentElement.style.setProperty("--gift-title-width", `${contentRect.width}px`);
  }
});
document.querySelectorAll(".gift-section-heading > h2").forEach(title => titleWidths.observe(title));
