const AWS = require("aws-sdk");
const chance = require("chance").Chance();

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const { chineseConverter } = require("mandarino");
const { tableNames } = require("../../constants/table-names");
const { removeNull } = require("../../libs/utils");
const { getUserAssetById } = require("../user-assets/get-user-asset-by-id");
const { getPresignedUrl } = require("../../libs/s3/get-presigned-url");

const convertInputAndHanzi = (transcription) => {
  return {
    ...transcription,
    input: transcription?.input ? chineseConverter(transcription?.input) : null,
    hanzi: transcription?.hanzi ? chineseConverter(transcription?.hanzi) : null,
  };
};

const getContentById = async (contentId) => {
  try {
    const resp = await dynamodb
      .get({
        Key: {
          id: contentId,
        },
        TableName: tableNames.contentsTableV2,
      })
      .promise();

    return resp.Item;
  } catch (err) {
    return null;
  }
};

const getContentDetailByIdV2 = async ({ id: contentId }) => {
  const content = await getContentById(contentId);

  const contentDetailsItem = await dynamodb
    .get({
      Key: {
        id: contentId,
      },
      TableName: tableNames.contentDetailsTable,
    })
    .promise();

  const contentDetails = contentDetailsItem?.Item;

  let audio;

  if (
    contentDetails?.generatedAudioId ||
    content?.audioId ||
    content?.videoId
  ) {
    const userAssetId =
      contentDetails?.generatedAudioId || content?.audioId || content?.videoId;
    const userAsset = await getUserAssetById(userAssetId);

    const presignedUrlResp = await getPresignedUrl({
      bucketKey: userAsset.uploadBucketKey,
    });

    audio = presignedUrlResp.preSignedUrl;
  } else {
    audio = content.audio;
  }

  let transcriptions = contentDetails?.transcriptions;

  if (contentDetails?.mediaTranscriptionsId) {
    const userAsset = await getUserAssetById(
      contentDetails?.mediaTranscriptionsId,
    );

    const presignedUrlResp = await getPresignedUrl({
      bucketKey: userAsset.uploadBucketKey,
    });

    const contentFromS3 = await fetch(presignedUrlResp.preSignedUrl);

    const contentFromS3Json = await contentFromS3.json();

    transcriptions = contentFromS3Json.transcriptions;
  }

  if (!transcriptions && (contentDetails?.sourceUrl || content?.sourceUrl)) {
    let contentFromS3 = await fetch(
      content?.sourceUrl || contentDetails?.sourceUrl,
    );

    const contentFromS3Json = await contentFromS3.json();

    transcriptions = contentFromS3Json.transcriptions;
  }

  let asset;
  if (content?.backgroundImageId) {
    asset = await getUserAssetById(content?.backgroundImageId);
  }

  const response = removeNull({
    ...contentDetails,
    ...content,
    audio,
    backgroundImageUrl: asset?.sourceUrl,
    coverPhotoUrl: asset?.sourceUrl,
    transcriptions: (
      transcriptions ||
      contentDetails?.transcriptions ||
      []
    ).map((transcription) => {
      if (transcription.id) {
        return removeNull({
          ...convertInputAndHanzi(transcription),
        });
      }
      return removeNull({
        ...convertInputAndHanzi(transcription),
        id: chance.guid(),
      });
    }),
  });

  return response;
};

module.exports = {
  getContentDetailByIdV2,
};
