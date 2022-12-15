const fs = require('fs-extra');

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath).toString());
}

module.exports = {
  readJSON,
};
