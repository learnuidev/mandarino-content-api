const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { getUserByEmail } = require("../../modules/users/get-user-by-email");
const { getSourceById } = require("../../modules/sources/get-source-by-id");
const { tableNames } = require("../../constants/table-names");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

module.exports.handler = middy(async (event) => {
  const { id, userName, title, status } = JSON.parse(event.body);
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
    const existingSource = await getSourceById(id);

    if (!existingSource || existingSource.userId !== user.id) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Source not found",
        }),
      };
    }

    const updateParams = {
      TableName: tableNames.sourceTable,
      Key: { id },
      UpdateExpression: "SET updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":updatedAt": Date.now(),
      },
      ReturnValues: "ALL_NEW",
    };

    if (userName) {
      updateParams.UpdateExpression += ", userName = :userName";
      updateParams.ExpressionAttributeValues[":userName"] = userName;
    }

    if (title) {
      updateParams.UpdateExpression += ", #title = :title";
      updateParams.ExpressionAttributeValues[":title"] = title;
      updateParams.ExpressionAttributeNames =
        updateParams.ExpressionAttributeNames || {};
      updateParams.ExpressionAttributeNames["#title"] = "title";
    }

    if (status) {
      updateParams.UpdateExpression += ", status = :status";
      updateParams.ExpressionAttributeValues[":status"] = status;
    }

    const result = await dynamodb.update(updateParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
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
