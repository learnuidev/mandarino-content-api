const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { removeNull } = require("../../libs/utils");
const { getSourceById } = require("../../modules/sources/get-source-by-id");
const { tableNames } = require("../../constants/table-names");
const { getUserByEmail } = require("../../modules/users/get-user-by-email");
const {
  getUserAssetById,
} = require("../../modules/assets/get-user-asset-by-id");
const { ulid } = require("ulid");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

module.exports.handler = middy(async (event) => {
  const { title, topicType, sourceId, backgroundImageAssetId } = JSON.parse(
    event.body,
  );
  const email = event.requestContext.authorizer.claims.email;

  const user = await getUserByEmail(email);

  if (!user) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "User does not exist",
      }),
    };
  }

  try {
    const source = await getSourceById(sourceId);

    if (!source) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Source not found",
        }),
      };
    }

    if (backgroundImageAssetId) {
      const asset = await getUserAssetById(backgroundImageAssetId);

      if (!asset) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Background image asset not found",
          }),
        };
      }
    }

    const id = ulid();

    const series = removeNull({
      id,
      userId: user.id,
      title,
      topicType,
      sourceId: source?.id,
      source,
      backgroundImageAssetId,
      backgroundImage: null,
      stats: {
        averageRating: 0,
        totalPlays: 0,
        totalStars: 0,
        totalCharacters: 0,
        totalSentences: 0,
        totalWords: 0,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const params = {
      TableName: tableNames.seriesTable,
      Item: series,
    };

    await dynamodb.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(series),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: err.message,
      }),
    };
  }
}).use(cors());
