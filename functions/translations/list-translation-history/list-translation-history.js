// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const DocumentClient = require("aws-sdk/clients/dynamodb").DocumentClient;

const dynamodb = new DocumentClient({
  region: "us-east-1",
});

// eslint-disable-next-line no-undef
const { TRANSLATIONS_HISTORY_TABLE } = process.env;

const listTranslations = async (userId, res = [], key) => {
  const params = {
    ExpressionAttributeValues: {
      ":userId": userId,
    },
    KeyConditionExpression: "userId = :userId",
    IndexName: "byUserId",
    TableName: TRANSLATIONS_HISTORY_TABLE,
    Limit: 10,
    ExclusiveStartKey: key,
    // ProjectionExpression: ["title"],
  };

  const resp = await dynamodb.query(params).promise();

  if (resp?.LastEvaluatedKey) {
    return listTranslations(
      userId,
      res.concat(resp?.Items),
      resp?.LastEvaluatedKey
    );
  }

  return res?.concat(resp?.Items);

  // return resp;
};

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;

  const translationHistory = await listTranslations(userId);

  const response = {
    statusCode: 200,
    body: JSON.stringify(translationHistory),
  };

  return response;
}).use(cors());
