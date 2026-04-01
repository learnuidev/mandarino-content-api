const { tableNames } = require("../../constants/table-names");

const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const getEnrollmentByUserAndSeries = async (userId, seriesId) => {
  const params = {
    TableName: tableNames.enrollmentsTable,
    IndexName: "byUserIdSeriesId",
    KeyConditionExpression: "userId = :userId AND seriesId = :seriesId",
    ExpressionAttributeValues: {
      ":userId": userId,
      ":seriesId": seriesId,
    },
  };

  const result = await dynamodb.query(params).promise();
  return result.Items[0];
};

module.exports = {
  getEnrollmentByUserAndSeries,
};
