// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const DocumentClient = require("aws-sdk/clients/dynamodb").DocumentClient;

const dynamodb = new DocumentClient({
  region: "us-east-1",
});

// eslint-disable-next-line no-undef
const { TRANSLATIONS_HISTORY_TABLE } = process.env;

const getTranslation = async (id, userId) => {
  const resp = await dynamodb
    .get({
      TableName: TRANSLATIONS_HISTORY_TABLE,
      Key: {
        id,
      },
    })
    .promise();

  const item = resp?.Item;

  if (item?.userId === userId) {
    return item;
  }

  // return resp;
};

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;

  const { id } = JSON.parse(event.body);

  const translationHistory = await getTranslation(id, userId);

  const response = {
    statusCode: 200,
    body: JSON.stringify(translationHistory),
  };

  return response;
}).use(cors());
