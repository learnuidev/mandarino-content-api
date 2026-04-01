const { tableNames } = require("../../constants/table-names");

const AWS = require("aws-sdk");
const { getLegacyContentById } = require("../legacy-content/get-content-by-id");
const { getUserAssetById } = require("../user-assets/get-user-asset-by-id");
const { getPresignedUrl } = require("../../libs/s3/get-presigned-url");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const item = {
  createdAt: 1775004831223,
  id: "ec366e39-ec00-5856-9640-f36f52a9b21d",
  lang: "zh",
  mediaTranscriptionsId: "01KN38GKE990MMV86W3WWG8R0C",
  translationsAddedAt: 1775004887140,
  updatedAt: 1775004887140,
};

const getContentDetailById = async ({
  id,
  tableName = tableNames.legacyContentDetailsTable,
}) => {
  const content = await getLegacyContentById(id);

  const seriesParams = {
    TableName: tableName,
    Key: { id },
  };

  const resp = await dynamodb.get(seriesParams).promise();

  const contentDetail = resp.Item;

  let audio;
  let transcriptions;

  if (contentDetail?.generatedAudioId || content?.audioId || content?.videoId) {
    const userAssetId =
      contentDetail?.generatedAudioId || content?.audioId || content?.videoId;
    const userAsset = await getUserAssetById(userAssetId);

    const presignedUrlResp = await getPresignedUrl({
      bucketKey: userAsset.uploadBucketKey,
    });

    audio = presignedUrlResp.preSignedUrl;
  } else {
    audio = content.audio;
  }

  if (contentDetail?.mediaTranscriptionsId) {
    const userAsset = await getUserAssetById(
      contentDetail?.mediaTranscriptionsId
    );

    const presignedUrlResp = await getPresignedUrl({
      bucketKey: userAsset.uploadBucketKey,
    });

    const contentFromS3 = await fetch(presignedUrlResp.preSignedUrl);

    const contentFromS3Json = await contentFromS3.json();

    transcriptions = contentFromS3Json.transcriptions;
  }

  contentDetail.audioUrl = audio;
  contentDetail.transcriptions = transcriptions;

  return contentDetail;
};

module.exports = {
  getContentDetailById,
};
