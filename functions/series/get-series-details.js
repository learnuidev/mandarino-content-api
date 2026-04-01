const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { tableNames } = require("../../constants/table-names");
const { getUserByEmail } = require("../../modules/users/get-user-by-email");
const {
  getUserAssetById,
} = require("../../modules/user-assets/get-user-asset-by-id");
const { getSeriesById } = require("../../modules/series/get-series-by-id");

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

  // const userId = user.id;

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

    const asset = await getUserAssetById(series.backgroundImageAssetId);

    // if (seriesResult.Item.userId !== userId) {
    //   return {
    //     statusCode: 403,
    //     body: JSON.stringify({
    //       message: "Access denied",
    //     }),
    //   };
    // }
    // //

    const episodesParams = {
      TableName: tableNames.seriesContentsTable,
      IndexName: "bySeriesId",
      KeyConditionExpression: "seriesId = :seriesId",
      ExpressionAttributeValues: {
        ":seriesId": seriesId,
      },
    };

    const episodesResult = await dynamodb.query(episodesParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        series: { ...series, backgroundImage: asset.sourceUrl },
        episodes: episodesResult.Items || [],
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
