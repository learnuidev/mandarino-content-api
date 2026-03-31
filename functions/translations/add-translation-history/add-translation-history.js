const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { removeNull } = require("mandarino/src/utils/remove-null");

const chance = require("chance").Chance();

// eslint-disable-next-line no-undef
const { TRANSLATIONS_HISTORY_TABLE } = process.env;

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;

  const { targetLang, sourceLang, title } = JSON.parse(event.body);

  if (!title) {
    const response = {
      statusCode: 400,
      body: JSON.stringify({ message: "Title is required" }),
    };

    return response;
  }

  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient({
      apiVersion: "2012-08-10",
      region: "us-east-1",
    });

    const createdAt = Date.now();
    const id = chance.guid();

    const params = removeNull({
      id,
      userId: userId,
      title,
      createdAt,
      targetLang,
      sourceLang,
    });

    const inputParams = {
      Item: params,
      TableName: TRANSLATIONS_HISTORY_TABLE,
    };

    await dynamodb.put(inputParams).promise();

    const response = {
      statusCode: 200,
      body: JSON.stringify(params),
    };
    return response;
  } catch (err) {
    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: err.message,
      }),
    };
    return response;
  }
}).use(cors());
