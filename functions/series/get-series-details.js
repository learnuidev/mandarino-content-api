const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { tableNames } = require("../../constants/table-names");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

module.exports.handler = middy(async (event) => {
  const { seriesId } = event.pathParameters;
  const userId = event.requestContext.authorizer.claims.email;

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

    const episodesParams = {
      TableName: tableNames.seriesContentsTable,
      IndexName: "bySk",
      KeyConditionExpression: "sk = :sk",
      ExpressionAttributeValues: {
        ":sk": `series#${seriesId}`,
      },
    };

    const episodesResult = await dynamodb.query(episodesParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        series: seriesResult.Item,
        episodes: episodesResult,
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
