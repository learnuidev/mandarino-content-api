const { tableNames } = require("../../constants/table-names");

const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const deleteEnrollment = async (enrollmentId) => {
  if (!enrollmentId || enrollmentId === "") {
    throw new Error("Invalid enrollment ID");
  }

  const params = {
    TableName: tableNames.enrollmentsTable,
    Key: { id: enrollmentId },
  };

  await dynamodb.delete(params).promise();
};

module.exports = {
  deleteEnrollment,
};
