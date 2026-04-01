/* eslint-disable no-undef */
const S3 = require("aws-sdk/clients/s3");
const { bucketNames } = require("../../constants/buclet-names");
const s3 = new S3({ useAccelerateEndpoint: true });

const getPresignedUrl = async ({
  bucketKey,
  bucketName = bucketNames.assetBucket,
}) => {
  const params = {
    Bucket: bucketName,
    Key: bucketKey,
    Expires: 60 * 60 * 24, // 1 day (86400 seconds = 60 * 60 * 24)
  };
  const preSignedUrl = s3.getSignedUrl("getObject", params);

  // Return Params
  return { preSignedUrl };
};

module.exports = {
  getPresignedUrl,
};
