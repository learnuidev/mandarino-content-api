const { tableNames } = require("../../constants/table-names");

const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const getEnrollmentById = async (enrollmentId) => {
  const params = {
    TableName: tableNames.enrollmentsTable,
    Key: { id: enrollmentId },
  };

  const result = await dynamodb.get(params).promise();
  return result.Item;
};

module.exports = {
  getEnrollmentById,
};
