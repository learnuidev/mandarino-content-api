const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { getUserByEmail } = require("../../modules/users/get-user-by-email");
const {
  getUserAssetById,
} = require("../../modules/user-assets/get-user-asset-by-id");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

module.exports.handler = middy(async (event) => {
  const {
    topicType,
    sourceId,
    sourceUsername,
    limit = 10,
    direction = "desc",
    exclusiveStartKey,
  } = event.queryStringParameters || {};
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
    const { SERIES_TABLE } = process.env;

    let params;
    let items = [];

    if (topicType) {
      params = {
        TableName: SERIES_TABLE,
        IndexName: "byTopicType",
        KeyConditionExpression: "topicType = :topicType",
        ExpressionAttributeValues: {
          ":topicType": topicType,
        },
        ScanIndexForward: direction === "asc",
        Limit: parseInt(limit, 10),
      };
    } else if (sourceId) {
      params = {
        TableName: SERIES_TABLE,
        IndexName: "bySourceId",
        KeyConditionExpression: "sourceId = :sourceId",
        ExpressionAttributeValues: {
          ":sourceId": sourceId,
        },
        ScanIndexForward: direction === "asc",
        Limit: parseInt(limit, 10),
      };
    } else {
      params = {
        TableName: SERIES_TABLE,
        IndexName: "byUserId",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
        ScanIndexForward: direction === "asc",
        Limit: parseInt(limit, 10),
      };
    }

    if (exclusiveStartKey) {
      params.ExclusiveStartKey = JSON.parse(
        Buffer.from(exclusiveStartKey, "base64").toString()
      );
    }

    const result = await dynamodb.query(params).promise();
    items = Promise.all(
      (result.Items || [])?.map(async (item) => {
        const asset = await getUserAssetById(item.backgroundImageAssetId);

        return {
          ...item,
          backgroundImage: asset?.sourceUrl,
        };
      })
    );

    if (!topicType && !sourceId) {
      items = items.filter((item) => item.userId === userId);
    }

    if (sourceUsername) {
      items = items.filter((item) => item.source?.username === sourceUsername);
    }

    const hasMore = result.LastEvaluatedKey ? true : false;
    const nextToken = hasMore
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
      : null;

    return {
      statusCode: 200,
      body: JSON.stringify({
        items,
        pagination: {
          direction,
          limit: parseInt(limit, 10),
          hasMore,
          nextToken,
        },
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
