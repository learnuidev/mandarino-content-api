const { tableNames } = require("../../constants/table-names");

const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const deleteEnrollment = async (enrollmentId) => {
  const params = {
    TableName: tableNames.enrollmentsTable,
    Key: { id: enrollmentId },
    ReturnValues: "ALL_OLD",
  };

  const result = await dynamodb.delete(params).promise();
  return result.Attributes;
};

module.exports = {
  deleteEnrollment,
};
