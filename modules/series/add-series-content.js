const AWS = require("aws-sdk");
const { tableNames } = require("../../constants/table-names");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const addSeriesContent = async (seriesContent) => {
  await dynamodb
    .put({
      TableName: tableNames.seriesContentsTable,
      Item: seriesContent,
      ConditionExpression: "attribute_not_exists(id)",
    })
    .promise();

  return seriesContent;
};

module.exports = {
  addSeriesContent,
};
