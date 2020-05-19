const { Router } = require('express');
const aws = require('aws-sdk');
const ApiHelper = require('../../helpers/apiHelper');

const route = Router();

const signS3 = (req, res) => {
  const S3_BUCKET = process.env.Bucket;

  const s3 = new aws.S3(); // Create a new instance of S3
  const { fileName, fileType } = req.body;
  // Set up the payload of what we are sending to the S3 api
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 500,
    ContentType: fileType,
    ACL: 'public-read',
  };
  try {
    // Make a request to the S3 API to get a signed URL which we can use to upload our file
    s3.getSignedUrl('putObject', s3Params, (err, data) => {
      if (err) {
        console.error(err);
        res.json({ success: false, error: err });
      }

      // Send it all back
      return res.send({
        success: true,
        signedRequest: data,
        url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`,
      });
    });
  } catch (e) {
    console.error(e);
    return ApiHelper.statusBadRequest(res, 'Unexpected error');
  }
  return false;
};

const linkRoute = (app) => {
  app.use('/s3', route);

  route.post('/sign_s3', signS3);
};

module.exports = {
  linkRoute,
};
