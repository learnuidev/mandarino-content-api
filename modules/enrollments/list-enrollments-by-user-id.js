const { tableNames } = require("../../constants/table-names");

const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const listEnrollmentsByUserId = async (
  userId,
  limit = 50,
  exclusiveStartKey,
) => {
  const params = {
    TableName: tableNames.enrollmentsTable,
    IndexName: "byUserId",
    KeyConditionExpression: "userId = :userId AND begins_with(id, :idPrefix)",
    ExpressionAttributeValues: {
      ":userId": userId,
      ":idPrefix": "",
    },
    ScanIndexForward: false,
    Limit: limit,
  };

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
    items: result.Items,
    pagination: {
      limit,
      hasMore,
      nextToken,
    },
  };
};

module.exports = {
  listEnrollmentsByUserId,
};
