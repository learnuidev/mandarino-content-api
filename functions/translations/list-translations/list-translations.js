// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const DocumentClient = require("aws-sdk/clients/dynamodb").DocumentClient;

const dynamodb = new DocumentClient({
  region: "us-east-1",
});

// eslint-disable-next-line no-undef
const { TRANSLATIONS_TABLE } = process.env;

const listTranslations = async (userAndContextId, res = [], key) => {
  const params = {
    ExpressionAttributeValues: {
      ":userAndContextId": userAndContextId,
    },
    KeyConditionExpression: "userAndContextId = :userAndContextId",
    IndexName: "byUserAndContextId",
    TableName: TRANSLATIONS_TABLE,
    Limit: 10,
    ExclusiveStartKey: key,
    // ProjectionExpression: ["title"],
  };

  const resp = await dynamodb.query(params).promise();

  if (resp?.LastEvaluatedKey) {
    return listTranslations(
      userAndContextId,
      res.concat(resp?.Items),
      resp?.LastEvaluatedKey
    );
  }

  return res?.concat(resp?.Items);

  // return resp;
};

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;

  const { contextId } = JSON.parse(event.body);

  const characterContents = await listTranslations(`${userId}#${contextId}`);

  const response = {
    statusCode: 200,
    body: JSON.stringify(characterContents),
  };

  return response;
}).use(cors());
