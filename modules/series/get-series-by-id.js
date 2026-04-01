const { tableNames } = require("../../constants/table-names");

const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const getSeriesById = async (seriesId) => {
  const seriesParams = {
    TableName: tableNames.seriesTable,
    Key: { id: seriesId },
  };

  const resp = await dynamodb.get(seriesParams).promise();

  return resp.Item;
};

module.exports = {
  getSeriesById,
};
