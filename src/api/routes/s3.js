const { Router } = require('express');
const multer = require('multer');
const fs = require('fs');

const { Auth } = require('../middlewares');
const ApiHelper = require('../../helpers/apiHelper');
const s3 = require('../externalApis/s3');
const ffmpeg = require('../externalApis/ffmpeg');
const Tools = require('../../helpers/tools');

const multerInstance = multer({ dest: 'uploads/' });
const uploadCompanyVideo = multerInstance.single('companyVideo');
const route = Router();

const signS3 = async (req, res) => {
  const { fileName, fileType } = req.body;

  const sign = await s3.signS3(fileName, fileType);

  if (sign.success) {
    return res.send(sign);
  }

  return ApiHelper.statusBadRequest(res, 'Unexpected Error');
};

const receiveVideo = (req, res, next) => {
  Tools.createMissingFolders('uploads');

  uploadCompanyVideo(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError) {
        return ApiHelper.statusBadRequest(res, error.message);
      }
      return ApiHelper.statusInternalServerError(res, error.message);
    }
    return next();
  });
};

const processVideo = async (req, res, next) => {
  const { filename, destination, mimetype } = req.file;

  const sign = await s3.signS3(filename, mimetype);

  const trimOptions = {
    filename,
    dir: destination,
    startTime: 0,
    duration: 300,
  };

  const editedVideo = await ffmpeg.trimVideo(trimOptions);

  fs.unlink(`${destination}/${filename}`, Tools.errorCallback);

  if (editedVideo.success) {
    const file = fs.readFileSync(editedVideo.path);

    const data = {
      file,
      signedRequest: sign.signedRequest,
      fileName: filename,
      fileType: mimetype,
    };

    const uploadResponse = await s3.uploadVideo(data);

    fs.unlink(editedVideo.path, Tools.errorCallback);

    if (uploadResponse.success) {
      req.videoUrl = sign.url;

      return next();
    }

    req.error = 'Video cant be uploaded to S3 bucket';

    return next();
  }

  req.error = 'File not supported or corrupted';

  return next();
};

const linkRoute = (app, path) => {
  app.use(path, route);

  route.post('/sign_s3', signS3);

  route.post('/upload_video', Auth.needAuth, receiveVideo, processVideo);
};

module.exports = {
  linkRoute,
  receiveVideo,
  processVideo,
};
