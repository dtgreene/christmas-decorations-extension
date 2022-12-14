// create root
const root = document.createElement('div');
root.className = 'xmas-lights';
// append to the dom
document.body.appendChild(root);

const storage = window.browser ? browser.storage.local : chrome.storage.local;

const defaultColors = ['#c501e2', '#2ef8a0', '#ff0534', '#f82d97', '#01c4e7'];
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
  colors.forEach((color1, index) => {
    const prefix = `--xmas-color-${index + 1}`;
    document.body.style.setProperty(prefix, color1);
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
    root.innerHTML = root.innerHTML.concat(
      createLightGroup(rows, 'col', 'end')
    );
  }
  if (sides.bottom) {
    root.innerHTML = root.innerHTML.concat(
      createLightGroup(cols, 'row', 'end')
    );
  }
  if (sides.left) {
    root.innerHTML = root.innerHTML.concat(createLightGroup(rows, 'col'));
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
  const { colors, sides } = await storage.get(['colors', 'sides']);

  if (colors) {
    settings.colors = colors;
  }
  if (sides) {
    settings.sides = sides;
  }
}
