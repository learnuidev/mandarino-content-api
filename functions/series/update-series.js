const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { removeNull } = require("../../libs/utils");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

module.exports.handler = middy(async (event) => {
  const { id, title, topicType, source, backgroundImage, stats } = JSON.parse(
    event.body,
  );
  const userId = event.requestContext.authorizer.claims.email;

  try {
    const { SERIES_TABLE, SOURCE_TABLE } = process.env;

    if (source?.id) {
      const sourceParams = {
        TableName: SOURCE_TABLE,
        Key: { id: source.id },
      };
      const sourceResult = await dynamodb.get(sourceParams).promise();

      if (!sourceResult.Item) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Source not found",
          }),
        };
      }
    }

    const updateParams = {
      TableName: SERIES_TABLE,
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

    if (source) {
      updateParams.UpdateExpression +=
        ", source = :source, sourceId = :sourceId";
      updateParams.ExpressionAttributeValues[":source"] = source;
      updateParams.ExpressionAttributeValues[":sourceId"] = source?.id;
    }

    if (backgroundImage) {
      updateParams.UpdateExpression += ", backgroundImage = :backgroundImage";
      updateParams.ExpressionAttributeValues[":backgroundImage"] =
        backgroundImage;
    }

    if (stats) {
      updateParams.UpdateExpression += ", stats = :stats";
      updateParams.ExpressionAttributeValues[":stats"] = stats;
    }

    const result = await dynamodb.update(updateParams).promise();

    if (!result.Attributes || result.Attributes.userId !== userId) {
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
