const bulbColours = ["#e54d55", "#ffc44c", "#54b77e", "#639be8"];
const bulbAngles = [-15, -10, -3, 1, 4, 7, 9, 7, -4];

const bulbs = bulbAngles.map((tilt, index) => {
  // Place each socket directly on the wire's quadratic curve.
  const t = (index + .65) / 9.3;
  const x = 710 * t;
  const y = 5 + 106 * t * (1 - t);
  return [x.toFixed(1), y.toFixed(1), tilt, bulbColours[index % bulbColours.length]];
});

export const christmasLights = `<svg class="christmas-lights" viewBox="0 0 710 75" aria-hidden="true" focusable="false">
  <path class="christmas-light-wire" d="M0 5 Q355 58 710 5"/>
  ${bulbs.map(([x,y,tilt,colour],index)=>`<g transform="translate(${x} ${y}) rotate(${tilt})">
    <rect class="christmas-light-socket" x="-3.5" y="-2" width="7" height="8" rx="1"/>
    <g class="christmas-light-bulb" style="--bulb-color:${colour};--bulb-delay:-${index * .79}s;--bulb-duration:${4.3 + index * .47}s">
      <path d="M-4 5 C-8 9 -7 15 -4 19 L0 24 4 19 C7 15 8 9 4 5Z"/>
      <path class="christmas-light-highlight" d="M-2 9 Q-4.5 12 -2.5 16"/>
    </g>
  </g>`).join("")}
</svg>`;
