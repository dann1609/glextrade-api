const { Router } = require('express');
const multer = require('multer');
const fs = require('fs');

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

const processVideo = async (req, res) => {
  const { filename, destination, mimetype } = req.file;

  const sign = await s3.signS3(filename, mimetype);

  const trimOptions = {
    filename,
    dir: destination,
    startTime: 0,
    duration: 30,
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
      return res.send({
        success: true,
        url: sign.url,
      });
    }

    return ApiHelper.statusInternalServerError(res, 'Video cant be uploaded to S3 bucket');
  }

  return ApiHelper.statusBadRequest(res, 'File not supported or corrupted');
};

const linkRoute = (app, path) => {
  app.use(path, route);

  route.post('/sign_s3', signS3);

  route.post('/upload_video', receiveVideo, processVideo);
};

module.exports = {
  linkRoute,
};
