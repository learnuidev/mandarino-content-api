const AWS = require("aws-sdk");
const { tableNames } = require("../../constants/table-names");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const getSourceById = async (id) => {
  const sourceParams = {
    TableName: tableNames.sourceTable,
    Key: { id },
  };

  const sourceResult = await dynamodb.get(sourceParams).promise();

  return sourceResult.Item;
};

module.exports = {
  getSourceById,
};
