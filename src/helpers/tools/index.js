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

const timemarkToSeconds = (timemark) => {
  const seconds = timemark.replace('[^0-9.]', '').split(':')[2];
  return seconds;
};

const Tools = {
  errorCallback,
  createMissingFolders,
  timemarkToSeconds,
};

module.exports = Tools;
