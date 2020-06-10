const fs = require('fs');

const errorCallback = (err) => {
  if (err) {
    console.error(err);
  }
};
const createMissingFolder = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
};
const createMissingFolders = (path) => {
  createMissingFolder(path);
};

const Tools = {
  errorCallback,
  createMissingFolders,
};

module.exports = Tools;
