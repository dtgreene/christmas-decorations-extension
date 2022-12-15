'use strict';

const defaultSettings = {
  colors: ['#c501e2', '#2ef8a0', '#ff0534', '#f82d97', '#01c4e7'],
  sides: { top: true, right: false, bottom: false, left: false },
  snow: { enabled: false, density: 0.2 },
};
const settings = defaultSettings;

// setup aliases for chrome or firefox
const storage = window.browser ? browser.storage.local : chrome.storage.local;
const tabs = window.browser ? browser.tabs : chrome.tabs;

async function init() {
  // load and parse settings
  await loadSettings(['colors', 'sides', 'snow']);

  // init side checkboxes
  initSideCheckbox(0, settings.sides.top);
  initSideCheckbox(1, settings.sides.right);
  initSideCheckbox(2, settings.sides.bottom);
  initSideCheckbox(3, settings.sides.left);

  // init color inputs
  initColorInput(0);
  initColorInput(1);
  initColorInput(2);
  initColorInput(3);
  initColorInput(4);

  // init snow fields
  const checkbox = document.getElementById('snow-check');
  checkbox.checked = settings.snow.enabled;
  checkbox.addEventListener('change', handleSnowCheckChange);
  const range = document.getElementById('snow-range');
  range.value = settings.snow.density;
  range.addEventListener('change', handleSnowDensityChange);

  // listener for the update button
  const updateButton = document.getElementById('update-btn');
  updateButton.addEventListener('click', handleUpdateClick, false);
}

async function loadSettings(keys) {
  const storedSettings = await storage.get(keys);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (storedSettings[key]) {
      settings[key] = storedSettings[key];
    } else {
      settings[key] = defaultSettings[key];
      await storage.set({ [key]: defaultSettings[key] });
    }
  }
}

function initSideCheckbox(index, defaultValue = false) {
  const element = document.getElementById(`side-${index}-check`);
  element.addEventListener('change', handleSideChange, false);
  element.checked = defaultValue;
}

function initColorInput(index) {
  const element = document.getElementById(`color-${index}-input`);
  element.addEventListener('change', handleColorChange, false);
  element.value = settings.colors[index];
  const previewElement = document.getElementById(`color-${index}-preview`);
  previewElement.style.background = settings.colors[index];
}

async function handleSideChange(event) {
  const index = Number(event.target.id.match(/\d+/)[0]);
  const keys = ['top', 'right', 'bottom', 'left'];

  const key = keys[index];

  if (key) {
    // set settings
    settings.sides[key] = event.target.checked;
    // save settings
    await storage.set({ sides: settings.sides });
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
    await storage.set({ colors: settings.colors });
  }
}

async function handleSnowCheckChange(event) {
  settings.snow.enabled = event.target.checked;
  // save settings
  await storage.set({ snow: settings.snow });
}

async function handleSnowDensityChange(event) {
  settings.snow.density = event.target.value;
  // save settings
  await storage.set({ snow: settings.snow });
}

async function handleUpdateClick() {
  // get the active tab(s)
  const queryResult = await tabs.query({
    currentWindow: true,
    active: true,
  });

  // send update message
  for (let i = 0; i < queryResult.length; i++) {
    try {
      tabs.sendMessage(queryResult[i].id, 'HO_HO_HO');
    } catch (e) {
      console.log(`Failed to send message to tab; with error: ${e}`);
    }
  }
}

window.onload = init;
