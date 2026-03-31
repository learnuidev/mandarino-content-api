const { tableNames } = require("../../constants/table-names");

const DocumentClient = require("aws-sdk/clients/dynamodb").DocumentClient;

const dynamodb = new DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const getUserByEmail = async (email) => {
  const user = (
    await dynamodb
      .query({
        ExpressionAttributeValues: {
          ":email": email,
        },
        KeyConditionExpression: "email = :email",
        IndexName: "byEmail",
        TableName: tableNames.usersTable,
      })
      .promise()
  ).Items[0];

  return user;
};

module.exports = {
  getUserByEmail,
};

getUserByEmail("learnuidev@gmail.com").then((user) => {
  console.log("User Exists", user);
});
