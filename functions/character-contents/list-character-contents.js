// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { tableNames } = require("../../constants/table-names");

const DocumentClient = require("aws-sdk/clients/dynamodb").DocumentClient;

const dynamodb = new DocumentClient({
  region: "us-east-1",
});

const listCharacterContents = async (userIdAndContent, res = [], key) => {
  const params = {
    ExpressionAttributeValues: {
      ":userIdAndContent": userIdAndContent,
    },
    KeyConditionExpression: "userIdAndContent = :userIdAndContent",
    IndexName: "byUserIdAndContent",
    TableName: tableNames.characterContentsTableV2,
    Limit: 10,
    ExclusiveStartKey: key,
    // ProjectionExpression: ["title"],
  };

  const resp = await dynamodb.query(params).promise();

  if (resp?.LastEvaluatedKey) {
    return listCharacterContents(
      userIdAndContent,
      res.concat(resp?.Items),
      resp?.LastEvaluatedKey
    );
  }

  return res?.concat(resp?.Items);
};

const listCharacterContentsAll = async (userId, res = [], key) => {
  const params = {
    ExpressionAttributeValues: {
      ":userId": userId,
    },
    KeyConditionExpression: "userId = :userId",
    IndexName: "byUserId",
    TableName: tableNames.characterContentsTableV2,
    Limit: 10,
    ExclusiveStartKey: key,
  };

  const resp = await dynamodb.query(params).promise();

  if (resp?.LastEvaluatedKey) {
    return listCharacterContentsAll(
      userId,
      res.concat(resp?.Items),
      resp?.LastEvaluatedKey
    );
  }

  return res?.concat(resp?.Items);
};

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;

  const { content, fetchType = "content" } = JSON.parse(event.body);

  const userIdAndContent = `${userId}_${content}`;

  let characterContents = [];

  if (fetchType === "content") {
    characterContents = await listCharacterContents(userIdAndContent);
  }

  if (fetchType === "user") {
    characterContents = await listCharacterContentsAll(userId);
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify(characterContents),
  };

  return response;
}).use(cors());
