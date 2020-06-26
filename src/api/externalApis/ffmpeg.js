const ffmpeg = require('fluent-ffmpeg');

const Tools = require('../../helpers/tools');

const trimVideo = ({
  filename, dir, startTime, duration,
}) => new Promise((resolve) => {
  const endDir = 'trim';

  Tools.createMissingFolders('trim');

  ffmpeg(`${dir}${filename}`)
    .setStartTime(startTime)
    .setDuration(duration)
    .on('start', (commandLine) => {
      console.log(`Spawned Ffmpeg with command: ${commandLine}`);
    })
    .on('progress', (progress) => {
      console.log(`Processing: ${progress.percent}% done`);
    })
    .on('error', (error) => {
      console.log(`Cannot process video: ${error.message}`);
      resolve({
        success: false,
        error: error.message,
      });
    })
    .on('end', () => {
      resolve({
        success: true,
        path: `${endDir}/${filename}.mp4`,
      });
    })
    .save(`${endDir}/${filename}.mp4`);
});

module.exports = {
  trimVideo,
};
