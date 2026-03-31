const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { getUserByEmail } = require("../../modules/users/get-user-by-email");
const { tableNames } = require("../../constants/table-names");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

module.exports.handler = middy(async (event) => {
  const {
    filter,
    limit = 10,
    direction = "desc",
    exclusiveStartKey,
  } = event.queryStringParameters || {};
  const email = event.requestContext.authorizer?.claims?.email;

  const user = email ? await getUserByEmail(email) : null;

  const isMe = filter === "me";
  const isPublic = filter === "public";

  try {
    let params = {
      TableName: tableNames.sourceTable,
      ScanIndexForward: direction === "asc",
      Limit: parseInt(limit, 10),
    };

    if (isMe) {
      params.IndexName = "byUserId";
      params.KeyConditionExpression = "userId = :userId";
      params.ExpressionAttributeValues = {
        ":userId": user.id,
      };
    } else if (isPublic) {
      params.IndexName = "bySk";
      params.KeyConditionExpression = "sk = :sk";
      params.ExpressionAttributeValues = {
        ":sk": "public",
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message:
            "Must provide either filter=me or filter=public query parameter",
        }),
      };
    }

    if (exclusiveStartKey) {
      params.ExclusiveStartKey = JSON.parse(
        Buffer.from(exclusiveStartKey, "base64").toString(),
      );
    }

    const result = await dynamodb.query(params).promise();

    const hasMore = result.LastEvaluatedKey ? true : false;
    const nextToken = hasMore
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
      : null;

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: result.Items || [],
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
