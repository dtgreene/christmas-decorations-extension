'use strict';

// create root
const root = document.createElement('div');
root.className = 'xmas-lights';
// append to the dom
document.body.appendChild(root);

let snowStorm = null;

const storage = window.browser ? browser.storage.local : chrome.storage.local;
const runtime = window.browser ? browser.runtime : chrome.runtime;

const defaultSettings = {
  colors: ['#c501e2', '#2ef8a0', '#ff0534', '#f82d97', '#01c4e7'],
  sides: { top: true, right: false, bottom: false, left: false },
  snow: { enabled: false, density: 0.2 },
};
const settings = defaultSettings;

const spacing = 64;
const shadow = 8;

// radius
const snowMinRadius = 2;
const snowMaxRadius = 5;
// x speed
const snowMinXSpeed = 1;
const snowMaxXSpeed = 4;
// y speed
const snowMinYSpeed = 1;
const snowMaxYSpeed = 4;
// opacity
const snowMinOpacity = 0.2;
const snowMaxOpacity = 0.8;

// perform setup
init();

// a slightly-reduced version of this: https://github.com/IceCreamYou/MainLoop.js/
// for some reason there was a problem using MainLoop.js when loaded externally in Firefox
class MainLoop {
  // runs. See `MainLoop.setSimulationTimestep()` for details.
  simulationTimestep = 1000 / 60;
  // See the comments inside animate() for details.
  frameDelta = 0;
  // Used to compute the time elapsed between frames.
  lastFrameTimeMs = 0;
  fps = 60;
  // performance when calculating the average frames per second. Valid values
  // recent seconds more heavily.
  fpsAlpha = 0.9;
  // Higher values increase accuracy, but result in slower updates.
  fpsUpdateInterval = 1000;
  // average was updated.
  lastFpsUpdate = 0;
  // average was updated (i.e. since `lastFpsUpdate`).
  framesSinceLastFpsUpdate = 0;
  // relevant inside of animate(), but a reference is held externally so that
  // loop runs.
  numUpdateSteps = 0;
  // frame was executed before another frame can be executed. The
  running = false;
  // was called has not been followed by a call to `MainLoop.stop()`. This is
  // after `MainLoop.start()` is called before the application is considered
  started = false;
  // Specifically, `panic` will be set to `true` if too many updates occur in
  // held externally so that this variable is not marked for garbage
  panic = false;
  // See `MainLoop.setUpdate()` for details.
  update = () => {};
  // stopping the loop.
  rafHandle = null;
  resetFrameDelta = () => {
    const oldFrameDelta = this.frameDelta;
    this.frameDelta = 0;
    return oldFrameDelta;
  };
  setUpdate = (fun) => {
    this.update = fun || this.update;
    return this;
  };
  start = () => {
    if (!this.started) {
      // whether this function was called and use that to keep it from
      this.started = true;
      // entered the main loop immediately, we would never render the
      // frame where all we do is draw, and then start the main loop with
      this.rafHandle = requestAnimationFrame((timestamp) => {
        // application starts drawing.
        this.running = true;
        // don't simulate time passed while the application was paused.
        this.lastFrameTimeMs = timestamp;
        this.lastFpsUpdate = timestamp;
        this.framesSinceLastFpsUpdate = 0;
        this.rafHandle = requestAnimationFrame(this.animate);
      });
    }
    return this;
  };
  stop = () => {
    this.running = false;
    this.started = false;
    cancelAnimationFrame(this.rafHandle);
    return this;
  };
  isRunning = () => {
    return this.running;
  };
  animate = (timestamp) => {
    // We set rafHandle immediately so that the next frame can be canceled
    this.rafHandle = requestAnimationFrame(this.animate);
    // `MainLoop.setMaxAllowedFPS()`).
    if (timestamp < this.lastFrameTimeMs) {
      return;
    }
    // simulated yet. Add the time since the last frame. We need to track total
    // last frame) because not all actually elapsed time is guaranteed to be
    this.frameDelta += timestamp - this.lastFrameTimeMs;
    this.lastFrameTimeMs = timestamp;
    // second, the number of frames that occurred in that second are included
    // that more recent seconds affect the estimated frame rate more than older
    if (timestamp > this.lastFpsUpdate + this.fpsUpdateInterval) {
      this.fps =
        // amount of time that has passed to get the mean frames per second
        // second has likely passed since the last update.
        (this.fpsAlpha * this.framesSinceLastFpsUpdate * 1000) /
          (timestamp - this.lastFpsUpdate) +
        (1 - this.fpsAlpha) * this.fps;
      // latest values have now been incorporated into the FPS estimate.
      this.lastFpsUpdate = timestamp;
      this.framesSinceLastFpsUpdate = 0;
    }
    // happens after the previous section because the previous section
    // refers to a time just before the current frame was delivered.
    this.framesSinceLastFpsUpdate++;
    this.numUpdateSteps = 0;
    while (this.frameDelta >= this.simulationTimestep) {
      this.update(this.simulationTimestep);
      this.frameDelta -= this.simulationTimestep;
      if (++this.numUpdateSteps >= 240) {
        this.panic = true;
        break;
      }
    }

    this.panic = false;
  };
}

class SnowStorm {
  canvas = null;
  ctx = null;
  snow = [];
  alpha = 0;
  constructor() {
    // cleanup any canvas that exists
    cleanupCanvas();

    // create the canvas
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'xmas-canvas';
    // get the context
    this.ctx = this.canvas.getContext('2d');

    // append to the body
    document.body.appendChild(this.canvas);

    // listeners
    window.addEventListener('resize', this.onResize, false);
    document.addEventListener(
      'visibilitychange',
      this.onVisibilityChange,
      false
    );

    // initially call resize to set the size
    this.onResize();

    Loop.setUpdate(this.update).start();
  }
  onVisibilityChange = () => {
    if (document.hidden) {
      Loop.stop();
    } else {
      Loop.start();
    }
  };
  onResize = () => {
    // set width and height
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.snow = createSnow();
  };
  update = () => {
    try {
      // slowly make the snow storm visible
      if (this.alpha < 1) {
        this.alpha += 0.005;
      }

      const ctx = this.ctx;
      // clear canvas
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = '#fff';

      // update positions
      for (let i = 0; i < this.snow.length; i++) {
        const { x, y, xSpeed, ySpeed, radius, opacity } = this.snow[i];
        this.snow[i].x += xSpeed;
        this.snow[i].y += ySpeed;

        if (x > window.innerWidth) {
          this.snow[i].x = 0;
        } else if (x < 0) {
          this.snow[i].x = window.innerWidth;
        }

        if (y > window.innerHeight) {
          this.snow[i].y = 0;
        } else if (y < 0) {
          this.snow[i].y = window.innerHeight;
        }

        // draw snow flake
        ctx.globalAlpha = Math.min(opacity, this.alpha);
        ctx.fillRect(this.snow[i].x, this.snow[i].y, radius, radius);
      }
    } catch (e) {
      console.log(`Snow storm update failed; with error: ${e}`);
    }
  };
  destroy = () => {
    try {
      document.body.removeChild(this.canvas);
      window.removeEventListener('resize', this.onResize, false);
      document.removeEventListener(
        'visibilitychange',
        this.onVisibilityChange,
        false
      );

      Loop.stop();
      Loop.setUpdate(() => {});
    } catch (e) {
      console.log(`Failed to cleanup snow storm instance; with error: ${e}`);
    }
  };
}

async function init() {
  // initialize the settings
  await initSettings();

  // set the spacing CSS variable
  document.body.style.setProperty('--xmas-spacing', `${spacing}px`);
  document.body.style.setProperty('--xmas-shadow', `${shadow}px`);

  // add resize listener
  window.addEventListener('resize', createLights, false);
  window.Loop = new MainLoop();

  // create the lights
  createLights();

  // create the snow storm
  if (settings.snow.enabled) {
    snowStorm = new SnowStorm();
  }

  // add message listener to hear messages from the popup window
  runtime.onMessage.addListener(async (message) => {
    // the popup is requesting that the decorations be updated
    if (message === 'HO_HO_HO') {
      // re-initialize the settings to get the updated values
      await initSettings();
      // re-create the lights with the new settings
      createLights();

      // update snow
      if (!settings.snow.enabled) {
        if (snowStorm) {
          // if the snow is disabled but there's a snow storm instance, destroy it
          snowStorm.destroy();
          snowStorm = null;
        }
      } else {
        if (!snowStorm) {
          // if the snow is enabled but there's not a snow storm instance, create it
          snowStorm = new SnowStorm();
        } else {
          // otherwise, force a resize on the existing instance to use the latest settings
          snowStorm.onResize();
        }
      }
    }
  });
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

async function loadSettings(keys) {
  const storedSettings = await storage.get(keys);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (storedSettings[key]) {
      settings[key] = storedSettings[key];
    } else {
      settings[key] = defaultSettings[key];
    }
  }
}

async function initSettings() {
  await loadSettings(['colors', 'sides', 'snow']);

  const { colors } = settings;

  // set the color CSS variables
  colors.forEach((color1, index) => {
    const prefix = `--xmas-color-${index + 1}`;
    document.body.style.setProperty(prefix, color1);
  });
}

function createSnow() {
  let result = [];

  // determine snow amount
  const snowCount = Math.floor(window.innerWidth * settings.snow.density);

  for (let i = 0; i < snowCount; i++) {
    result.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: randomBetween(snowMinRadius, snowMaxRadius),
      xSpeed: randomBetween(snowMinXSpeed, snowMaxXSpeed),
      ySpeed: randomBetween(snowMinYSpeed, snowMaxYSpeed),
      opacity: randomBetween(snowMinOpacity, snowMaxOpacity),
    });
  }

  return result;
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function cleanupCanvas() {
  const canvas = document.querySelector('#xmas-canvas');

  if (canvas) {
    canvas.parentNode.removeChild(canvas);
  }
}
