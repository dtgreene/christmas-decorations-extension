const defaultColors = ['#c501e2', '#2ef8a0', '#ff0534', '#f82d97', '#01c4e7'];
const defaultSides = { top: true, right: false, bottom: false, left: false };

let settings = {
  colors: defaultColors,
  sides: defaultSides,
};

async function init() {
  const { colors, sides } = await browser.storage.local.get([
    'colors',
    'sides',
  ]);

  // set default colors
  if (!colors) {
    settings.colors = defaultColors;
    await browser.storage.local.set({ colors: defaultColors });
  } else {
    // otherwise, use the value from storage
    settings.colors = colors;
  }
  // set default sides
  if (!sides) {
    settings.sides = defaultSides;
    await browser.storage.local.set({ sides: defaultSides });
  } else {
    // otherwise, use the value from storage
    settings.sides = sides;
  }

  // init side checkboxes
  initSideCheckbox(0, settings.sides.top);
  initSideCheckbox(1, settings.sides.right);
  initSideCheckbox(2, settings.sides.bottom);
  initSideCheckbox(3, settings.sides.left);

  // init color inputs
  initColorInput(0, settings.colors[0]);
  initColorInput(1, settings.colors[1]);
  initColorInput(2, settings.colors[2]);
  initColorInput(3, settings.colors[3]);
  initColorInput(4, settings.colors[4]);
}

function initSideCheckbox(index, defaultValue = false) {
  const element = document.getElementById(`side-${index}-check`);
  element.addEventListener('change', handleSideChange, false);
  element.checked = defaultValue;
}

function initColorInput(index, defaultValue = '') {
  const element = document.getElementById(`color-${index}-input`);
  element.addEventListener('change', handleColorChange, false);
  element.value = defaultValue;
  const previewElement = document.getElementById(`color-${index}-preview`);
  previewElement.style.background = defaultValue;
}

async function handleSideChange(event) {
  const index = Number(event.target.id.match(/\d+/)[0]);
  const keys = ['top', 'right', 'bottom', 'left'];

  const key = keys[index];

  if (key) {
    // set settings
    settings.sides[key] = event.target.checked;
    // save settings
    await browser.storage.local.set({ sides: settings.sides });
  }
}

async function handleColorChange(event) {
  const index = Number(event.target.id.match(/\d+/)[0]);

  if (index >= 0 && index <= 4) {
    // set preview
    const previewElement = document.getElementById(`color-${index}-preview`);
    previewElement.style.background = event.target.value;
    // set settings
    settings.colors[index] = event.target.value;
    // save settings
    await browser.storage.local.set({ colors: settings.colors });
  }
}

window.onload = init;
