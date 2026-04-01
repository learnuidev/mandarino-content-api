const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { removeNull } = require("../../libs/utils");
const { tableNames } = require("../../constants/table-names");
const { getUserByEmail } = require("../../modules/users/get-user-by-email");
const { getSeriesById } = require("../../modules/series/get-series-by-id");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const portEpisodesHandler = async ({ seriesId, contentIds }, { email }) => {
  const user = await getUserByEmail(email);

  if (!user) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "User does not exist",
      }),
    };
  }

  const userId = user.id;

  try {
    const series = await getSeriesById(seriesId);

    if (!series) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Series not found",
        }),
      };
    }

    if (series.userId !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "Access denied",
        }),
      };
    }

    // Here check for legacty content and its content details

    const existingEpisodesParams = {
      TableName: tableNames.seriesContentsTable,
      IndexName: "bySk",
      KeyConditionExpression: "sk = :sk",
      ExpressionAttributeValues: {
        ":sk": `series#${seriesId}`,
      },
    };

    const existingEpisodesResult = await dynamodb
      .query(existingEpisodesParams)
      .promise();
    const existingContentIds = new Set(
      existingEpisodesResult.Items?.map((item) => item.contentId) || []
    );

    const newContentIds = contentIds.filter(
      (contentId) => !existingContentIds.has(contentId)
    );

    if (newContentIds.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          episodes: [],
          message: "No new episodes to add (all already in series)",
        }),
      };
    }

    const episodes = [];

    for (const contentId of newContentIds) {
      const id = `episode_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const episode = removeNull({
        id,
        sk: `series#${seriesId}`,
        seriesId,
        contentId,
        createdAt: Date.now(),
      });

      await dynamodb
        .put({
          TableName: tableNames.seriesContentsTable,
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
        TableName: tableNames.seriesTable,
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
};

module.exports.handler = middy(async (event) => {
  const { seriesId } = event.pathParameters;
  const { contentIds } = JSON.parse(event.body);
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

  const userId = user.id;

  try {
    const seriesParams = {
      TableName: tableNames.seriesTable,
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

    const existingEpisodesParams = {
      TableName: tableNames.seriesContentsTable,
      IndexName: "bySk",
      KeyConditionExpression: "sk = :sk",
      ExpressionAttributeValues: {
        ":sk": `series#${seriesId}`,
      },
    };

    const existingEpisodesResult = await dynamodb
      .query(existingEpisodesParams)
      .promise();
    const existingContentIds = new Set(
      existingEpisodesResult.Items?.map((item) => item.contentId) || []
    );

    const newContentIds = contentIds.filter(
      (contentId) => !existingContentIds.has(contentId)
    );

    if (newContentIds.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          episodes: [],
          message: "No new episodes to add (all already in series)",
        }),
      };
    }

    const episodes = [];

    for (const contentId of newContentIds) {
      const id = `episode_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const episode = removeNull({
        id,
        sk: `series#${seriesId}`,
        seriesId,
        contentId,
        createdAt: Date.now(),
      });

      await dynamodb
        .put({
          TableName: tableNames.seriesContentsTable,
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
        TableName: tableNames.seriesTable,
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
