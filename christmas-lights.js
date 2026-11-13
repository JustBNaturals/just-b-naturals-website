const colours = ["#ed6268", "#ffc65b", "#68c991", "#83b8ff"];
const angles = [-15, -10, -6, -3, 0, 4, 7, 10, 14];

export const christmasLights = `<div class="christmas-lights" aria-hidden="true">
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
    <path class="christmas-light-wire" d="M0 6 Q50 78 100 6"/>
  </svg>
  ${angles.map((angle, index) => {
    const point = (index + .5) / angles.length;
    const height = 6 + 144 * point * (1 - point);
    return `<span class="christmas-light-socket" style="--x:${point * 100}%;--y:${height}%;--angle:${angle}deg;--bulb-color:${colours[index % colours.length]}"><i class="christmas-light-bulb"></i></span>`;
  }).join("")}
</div>`;
