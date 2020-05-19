const aws = require('aws-sdk');

module.exports = {
  load: () => aws.config.update({
    region: 'sa-east-1', // Put your aws region here
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey,
    signature: 'v4',
  }),
};
