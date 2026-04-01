const { tableNames } = require("../../constants/table-names");

const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const createEnrollment = async (userId, seriesId) => {
  const { ulid } = require("ulid");

  const enrollmentId = ulid();
  const timestamp = new Date().toISOString();

  const params = {
    TableName: tableNames.enrollmentsTable,
    Item: {
      id: enrollmentId,
      userId,
      seriesId,
      enrolledAt: timestamp,
      updatedAt: timestamp,
      status: "active",
    },
    ConditionExpression: "attribute_not_exists(id)",
  };

  try {
    await dynamodb.put(params).promise();
    return {
      id: enrollmentId,
      userId,
      seriesId,
      enrolledAt: timestamp,
      updatedAt: timestamp,
      status: "active",
    };
  } catch (err) {
    if (err.code === "ConditionalCheckFailedException") {
      throw new Error("Enrollment already exists");
    }
    throw err;
  }
};

module.exports = {
  createEnrollment,
};
