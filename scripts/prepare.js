// this file is used to prepare the extensions
const fs = require('fs-extra');
const path = require('path');
const { readJSON } = require('./utils');

// setup dist directory
if (fs.pathExistsSync('dist')) {
  // delete dist contents
  fs.readdirSync('dist').forEach((file) => {
    fs.rmSync(path.resolve('dist', file), { recursive: true });
  });
} else {
  // otherwise create dist
  fs.mkdirSync('dist');
}

// create the browser folders
fs.mkdirSync('dist/chrome');
fs.mkdirSync('dist/firefox');

// copy the common source to the different browser folders
fs.copySync('src/common', 'dist/chrome', { recursive: true });
fs.copySync('src/common', 'dist/firefox', { recursive: true });

// manifest paths
const manifestPaths = {
  common: path.resolve('src/common/manifest.json'),
  chrome: path.resolve('src/manifest_chrome.json'),
  firefox: path.resolve('src/manifest_firefox.json'),
};

// read and parse the manifests
const manifests = {
  common: readJSON(manifestPaths.common),
  chrome: readJSON(manifestPaths.chrome),
  firefox: readJSON(manifestPaths.firefox),
};

// merge and write the manifests
writeManifest('dist/chrome/manifest.json', manifests.common, manifests.chrome);
writeManifest(
  'dist/firefox/manifest.json',
  manifests.common,
  manifests.firefox
);

function writeManifest(filePath, source1, source2) {
  fs.writeFileSync(
    filePath,
    JSON.stringify(Object.assign({}, source1, source2), undefined, 2)
  );
}
