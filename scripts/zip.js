const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { readJSON } = require('./utils');

if (!fs.pathExistsSync('dist')) {
  console.log(
    'Distribution directory does not exist; execute "npm run prepare" first'
  );
  process.exit(1);
}

const manifest = readJSON(path.resolve('src/common/manifest.json'));

zipExtension('chrome');
zipExtension('firefox');

function zipExtension(name) {
  const output = fs.createWriteStream(
    path.resolve(`dist/${name}-${manifest.version}.zip`)
  );
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });
  archive.pipe(output);
  archive.directory(path.resolve(`dist/${name}`), false);
  archive.finalize();
}
