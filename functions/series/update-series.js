const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { removeNull } = require("../../libs/utils");
const { getUserByEmail } = require("../../modules/users/get-user-by-email");
const { getSourceById } = require("../../modules/sources/get-source-by-id");
const { tableNames } = require("../../constants/table-names");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

module.exports.handler = middy(async (event) => {
  const { id, title, topicType, sourceId, backgroundImageAssetId, stats } =
    JSON.parse(event.body);
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
    if (sourceId) {
      const source = await getSourceById(sourceId);

      if (!source) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Source not found",
          }),
        };
      }
    }

    const updateParams = {
      TableName: tableNames.seriesTable,
      Key: { id },
      UpdateExpression: "SET updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":updatedAt": Date.now(),
      },
      ReturnValues: "ALL_NEW",
    };

    if (title) {
      updateParams.UpdateExpression += ", #title = :title";
      updateParams.ExpressionAttributeValues[":title"] = title;
      updateParams.ExpressionAttributeNames =
        updateParams.ExpressionAttributeNames || {};
      updateParams.ExpressionAttributeNames["#title"] = "title";
    }

    if (topicType) {
      updateParams.UpdateExpression += ", topicType = :topicType";
      updateParams.ExpressionAttributeValues[":topicType"] = topicType;
    }

    if (sourceId) {
      const source = await getSourceById(sourceId);
      updateParams.UpdateExpression +=
        ", source = :source, sourceId = :sourceId";
      updateParams.ExpressionAttributeValues[":source"] = source;
      updateParams.ExpressionAttributeValues[":sourceId"] = sourceId;
    }

    if (backgroundImageAssetId) {
      updateParams.UpdateExpression +=
        ", backgroundImageAssetId = :backgroundImageAssetId";
      updateParams.ExpressionAttributeValues[":backgroundImageAssetId"] =
        backgroundImageAssetId;
    }

    if (stats) {
      updateParams.UpdateExpression += ", stats = :stats";
      updateParams.ExpressionAttributeValues[":stats"] = stats;
    }

    const result = await dynamodb.update(updateParams).promise();

    if (!result.Attributes || result.Attributes.userId !== user.id) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Series not found",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
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
