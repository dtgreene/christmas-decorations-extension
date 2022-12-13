// create root
const root = document.createElement('div');
root.className = 'xmas-lights';
// append to the dom
document.body.appendChild(root);

const defaultColors = prepareColors([
  '#c501e2',
  '#2ef8a0',
  '#ff0534',
  '#f82d97',
  '#01c4e7',
]);
const defaultSides = { top: true, right: false, bottom: false, left: false };

const settings = {
  colors: defaultColors,
  sides: defaultSides,
};

const spacing = 64;
const shadow = 8;

// perform setup
init();

async function init() {
  await getSettings();

  const { colors } = settings;

  // set the color CSS variables
  colors.forEach(([color1, color2], index) => {
    const prefix = `--xmas-color-${index + 1}`;
    document.body.style.setProperty(prefix, color1);
    document.body.style.setProperty(`${prefix}-fade`, color2);
  });

  // set the spacing CSS variable
  document.body.style.setProperty('--xmas-spacing', `${spacing}px`);
  document.body.style.setProperty('--xmas-shadow', `${shadow}px`);

  // add resize listener
  window.addEventListener('resize', createLights, false);

  // initially create the lights
  createLights();
}

function createLights() {
  const cols = Math.floor(window.innerWidth / spacing);
  const rows = Math.floor(window.innerHeight / spacing) - 1;

  const { sides } = settings;

  // reset the root HTML
  root.innerHTML = '';

  if (sides.top) {
    root.innerHTML = root.innerHTML.concat(createLightGroup(cols));
  }
  if (sides.right) {
    root.innerHTML = root.innerHTML.concat(createLightGroup(rows, 'col'));
  }
  if (sides.bottom) {
    root.innerHTML = root.innerHTML.concat(
      createLightGroup(rows, 'col', 'end')
    );
  }
  if (sides.left) {
    root.innerHTML = root.innerHTML.concat(
      createLightGroup(cols, 'row', 'end')
    );
  }
}

function createLightGroup(count, orientation = 'row', position = 'start') {
  const lights = [];

  for (let i = 0; i < count; i++) {
    lights.push(
      [
        '<div class="xmas-container">',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="xmas-wire">',
        '<path fill="none" stroke="#294b29" strokeWidth="2" d="M0,32 Q32,64 64,32" />',
        '</svg>',
        '<div class="xmas-socket"></div>',
        '<div class="xmas-bulb"></div>',
        '</div>',
      ].join('')
    );
  }

  return [
    `<div class="xmas-light-group xmas-${orientation} xmas-${position}">`,
    lights.join(''),
    '</div>',
  ].join('');
}

async function getSettings() {
  const { colors, sides } = await browser.storage.local.get([
    'colors',
    'sides',
  ]);

  if (colors) {
    settings.colors = prepareColors(colors);
  }
  if (sides) {
    settings.sides = sides;
  }
}

function prepareColors(colors) {
  return colors.map((color1) => [color1, shadeHexColor(color1, -0.2)]);
}

function shadeHexColor(color, percent) {
  const f = parseInt(color.slice(1), 16),
    t = percent < 0 ? 0 : 255,
    p = percent < 0 ? percent * -1 : percent,
    R = f >> 16,
    G = (f >> 8) & 0x00ff,
    B = f & 0x0000ff;
  return (
    '#' +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  );
}
