const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { removeNull } = require("../../libs/utils");
const { getUserByEmail } = require("../../modules/users/get-user-by-email");
const { tableNames } = require("../../constants/table-names");
const { ulid } = require("ulid");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

module.exports.handler = middy(async (event) => {
  const { userName, title, status } = JSON.parse(event.body);
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

  try {
    const id = ulid();

    const source = removeNull({
      id,
      userId: user.id,
      userName,
      title,
      status: status || "unclaimed",
      sk: "public",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const params = {
      TableName: tableNames.sourceTable,
      Item: source,
    };

    await dynamodb.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(source),
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
