const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { getUserByEmail } = require("../../modules/users/get-user-by-email");
const { getSeriesById } = require("../../modules/series/get-series-by-id");
const {
  updateSeriesStats,
} = require("../../modules/series/update-series-stats");
const { tableNames } = require("../../constants/table-names");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

module.exports.handler = middy(async (event) => {
  const { seriesId } = event.pathParameters;
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

    const stats = await updateSeriesStats({ seriesId });

    const updateParams = {
      TableName: tableNames.seriesTable,
      Key: { id: seriesId },
      UpdateExpression: "SET stats = :stats, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":stats": stats,
        ":updatedAt": Date.now(),
      },
    };

    await dynamodb.update(updateParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        seriesId,
        stats,
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
