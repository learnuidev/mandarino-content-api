const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { removeNull } = require("../../libs/utils");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

module.exports.handler = middy(async (event) => {
  const { seriesId, contentIds } = JSON.parse(event.body);
  const userId = event.requestContext.authorizer.claims.email;

  try {
    const { SERIES_TABLE, SERIES_CONTENTS_TABLE, LEGACY_CONTENTS_TABLE } =
      process.env;

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

    const episodes = [];

    for (const contentId of contentIds) {
      const id = `episode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const episode = removeNull({
        id,
        sk: `series#${seriesId}`,
        seriesId,
        contentId,
        createdAt: Date.now(),
      });

      await dynamodb
        .put({
          TableName: SERIES_CONTENTS_TABLE,
          Item: episode,
        })
        .promise();

      episodes.push(episode);
    }

    const updatedStats = {
      ...seriesResult.Item.stats,
      totalCharacters:
        seriesResult.Item.stats.totalCharacters + episodes.length * 500,
      totalSentences:
        seriesResult.Item.stats.totalSentences + episodes.length * 5,
      totalWords: seriesResult.Item.stats.totalWords + episodes.length * 50,
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
        episodes,
        message: `${episodes.length} episodes added to series`,
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
