export function startSnow(root) {
  const snowLayers = root.querySelectorAll(".gift-snow");
  if (!snowLayers.length) return;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const between = (min, max) => min + Math.random() * (max - min);

  function fillLayer(snow) {
    snow.replaceChildren();
    if (reducedMotion.matches) return;

    const isTrim = snow.classList.contains("gift-snow--trim");
    const count = isTrim ? 12 : snow.clientWidth < 680 ? 24 : 48;
    const flakes = document.createDocumentFragment();
    for (let index = 0; index < count; index += 1) {
      const flake = document.createElement("span");
      const duration = between(9, 19);
      flake.className = "gift-snowflake";
      flake.style.setProperty("--left", `${between(0, 100)}%`);
      flake.style.setProperty("--size", `${between(1.5, isTrim ? 3 : 5)}px`);
      flake.style.setProperty("--opacity", between(0.28, 0.78));
      flake.style.setProperty("--duration", `${duration}s`);
      flake.style.setProperty("--delay", `${-between(0, duration)}s`);
      flake.style.setProperty("--drift", `${between(-34, 34)}px`);
      flakes.append(flake);
    }
    snow.append(flakes);
  }

  const updateSnow = () => snowLayers.forEach(fillLayer);
  updateSnow();
  reducedMotion.addEventListener("change", updateSnow);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({target, isIntersecting}) => {
        target.toggleAttribute("data-paused", !isIntersecting);
      });
    });
    snowLayers.forEach(layer => observer.observe(layer));
  }
}

startSnow(document);
