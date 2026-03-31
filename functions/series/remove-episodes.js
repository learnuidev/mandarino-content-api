const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

module.exports.handler = middy(async (event) => {
  const { seriesId, episodeIds } = JSON.parse(event.body);
  const userId = event.requestContext.authorizer.claims.email;

  try {
    const { SERIES_TABLE, SERIES_CONTENTS_TABLE } = process.env;

    const seriesParams = {
      TableName: SERIES_TABLE,
      Key: { id: seriesId },
    };

    const seriesResult = await dynamodb.get(seriesParams).promise();

    if (!seriesResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Series not found",
        }),
      };
    }

    if (seriesResult.Item.userId !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "Access denied",
        }),
      };
    }

    let removedCount = 0;

    for (const episodeId of episodeIds) {
      await dynamodb
        .delete({
          TableName: SERIES_CONTENTS_TABLE,
          Key: {
            id: episodeId,
          },
          ConditionExpression: "seriesId = :seriesId",
          ExpressionAttributeValues: {
            ":seriesId": seriesId,
          },
        })
        .promise()
        .then(() => {
          removedCount++;
        })
        .catch((err) => {
          if (err.code !== "ConditionalCheckFailedException") {
            throw err;
          }
        });
    }

    const updatedStats = {
      ...seriesResult.Item.stats,
      totalCharacters: Math.max(
        0,
        seriesResult.Item.stats.totalCharacters - removedCount * 500,
      ),
      totalSentences: Math.max(
        0,
        seriesResult.Item.stats.totalSentences - removedCount * 5,
      ),
      totalWords: Math.max(
        0,
        seriesResult.Item.stats.totalWords - removedCount * 50,
      ),
    };

    await dynamodb
      .update({
        TableName: SERIES_TABLE,
        Key: { id: seriesId },
        UpdateExpression: "SET stats = :stats, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":stats": updatedStats,
          ":updatedAt": Date.now(),
        },
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        removedCount,
        message: `${removedCount} episodes removed from series`,
      }),
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
