const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");

// eslint-disable-next-line no-undef
const { TRANSLATIONS_TABLE } = process.env;

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const getTranslation = async ({ id, userAndContextId }) => {
  const resp = await dynamodb
    .get({
      TableName: TRANSLATIONS_TABLE,
      Key: {
        id,
      },
    })
    .promise();

  const item = resp?.Item;

  if (item?.userAndContextId === userAndContextId) {
    return item;
  }

  // return resp;
};

async function deleteTranslation(id) {
  const params = {
    TableName: TRANSLATIONS_TABLE,
    Key: {
      id: id, // Assuming 'id' is the partition key
    },
    ConditionExpression: "attribute_exists(id)",
  };

  try {
    const data = await dynamodb.delete(params).promise();
    console.log("Delete succeeded:", data);
  } catch (error) {
    console.error("Unable to delete item. Error:", error);
  }
}

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;

  const { id, contextId } = JSON.parse(event.body);

  const userAndContextId = `${userId}#${contextId}`;

  const translation = await getTranslation({ id, userAndContextId });

  if (!translation) {
    const response = {
      statusCode: 404,
      body: JSON.stringify({
        message: "Not found",
      }),
    };

    return response;
  }

  try {
    // 3. Other wise regular flow
    await deleteTranslation(id);

    const response = {
      statusCode: 200,
      body: JSON.stringify({
        id,
        deletedAt: Date.now(),
      }),
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
