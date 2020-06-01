const fetch = require('node-fetch');
const aws = require('aws-sdk');

const signS3 = async (fileName, fileType) => {
  const S3_BUCKET = process.env.Bucket;
  const s3 = new aws.S3(); // Create a new instance of S3
  // Set up the payload of what we are sending to the S3 api
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 500,
    ContentType: fileType,
    ACL: 'public-read',
  };

  return new Promise((resolve) => {
    try {
      // Make a request to the S3 API to get a signed URL which we can use to upload our file
      s3.getSignedUrl('putObject', s3Params, (error, data) => {
        if (error) {
          console.error(error);
          resolve({ success: false, error });
        }

        // Send it all back
        resolve({
          success: true,
          signedRequest: data,
          url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`,
        });
      });
    } catch (error) {
      console.error(error);
      resolve({ error: 'Unexpected error' });
    }
  });
};

const uploadVideo = (data) => fetch(data.signedRequest, {
  method: 'Put',
  headers: {
    'Content-Type': data.fileType,
  },
  mode: 'cors',
  body: data.file,
}).then((response) => {
  if (response.status === 200) {
    return {
      success: true,
    };
  }
  return {
    success: false,
    error: {
      message: 'There was an issue with file.',
    },
  };
})
  .catch((error) => {
    console.log('api error');
    console.error(error);
    return {
      error: {
        message: "Can't reach server",
      },
    };
  });


module.exports = {
  signS3,
  uploadVideo,
};
