const AWS = require("aws-sdk");
const { tableNames } = require("../../constants/table-names");
const { getUserAssetById } = require("../user-assets/get-user-asset-by-id");
const { getPresignedUrl } = require("../../libs/s3/get-presigned-url");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const getSeriesContentDetails = async ({ contentId }) => {
  const contentParams = {
    TableName: tableNames.seriesContentsTable,
    Key: { id: contentId },
  };

  const contentResult = await dynamodb.get(contentParams).promise();
  const content = contentResult.Item;

  if (!content) {
    throw new Error("Content not found");
  }

  let mediaUrl;
  let transcriptions;

  if (content.mediaId) {
    const mediaAsset = await getUserAssetById(content.mediaId);
    if (mediaAsset) {
      const presignedUrlResp = await getPresignedUrl({
        bucketKey: mediaAsset.uploadBucketKey,
      });
      mediaUrl = presignedUrlResp.preSignedUrl;
    }
  } else if (content.youtubeUrl) {
    mediaUrl = content.youtubeUrl;
  }

  if (content.mediaTranscriptionsId) {
    const transcriptionAsset = await getUserAssetById(
      content.mediaTranscriptionsId,
    );
    if (transcriptionAsset) {
      const presignedUrlResp = await getPresignedUrl({
        bucketKey: transcriptionAsset.uploadBucketKey,
      });

      const contentFromS3 = await fetch(presignedUrlResp.preSignedUrl);
      const contentFromS3Json = await contentFromS3.json();
      transcriptions = contentFromS3Json.transcriptions;
    }
  }

  return {
    ...content,
    mediaUrl,
    transcriptions,
  };
};

module.exports = {
  getSeriesContentDetails,
};
