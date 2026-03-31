const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

module.exports.handler = middy(async (event) => {
  const {
    topicType,
    sourceUsername,
    limit = 10,
    direction = "desc",
    exclusiveStartKey,
  } = event.queryStringParameters || {};
  const userId = event.requestContext.authorizer.claims.email;

  try {
    const { SERIES_TABLE } = process.env;

    const params = {
      TableName: SERIES_TABLE,
      IndexName: "byUserId",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
      ScanIndexForward: direction === "asc",
      Limit: parseInt(limit, 10),
    };

    if (exclusiveStartKey) {
      params.ExclusiveStartKey = JSON.parse(
        Buffer.from(exclusiveStartKey, "base64").toString(),
      );
    }

    const result = await dynamodb.query(params).promise();
    let items = result.Items || [];

    if (topicType) {
      items = items.filter((item) => item.topicType === topicType);
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
