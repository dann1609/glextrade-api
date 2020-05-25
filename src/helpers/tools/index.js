const { Duplex } = require('stream');
const fs = require('fs');

const deepClone = (object) => JSON.parse(JSON.stringify(object));
const bufferToStream = (buffer) => {
  const duplexStream = new Duplex();
  duplexStream.push(buffer);
  duplexStream.push(null);
  return duplexStream;
};
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
