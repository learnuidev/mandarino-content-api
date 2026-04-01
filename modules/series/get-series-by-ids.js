const { tableNames } = require("../../constants/table-names");

const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const getSeriesByIds = async (seriesIds) => {
  const batchGetParams = {
    RequestItems: {
      [tableNames.seriesTable]: {
        Keys: seriesIds.map((seriesId) => ({ id: seriesId })),
      },
    },
  };

  const batchResult = await dynamodb.batchGet(batchGetParams).promise();

  if (batchResult.Responses && batchResult.Responses[tableNames.seriesTable]) {
    return batchResult.Responses[tableNames.seriesTable];
  }

  return [];
};

module.exports = {
  getSeriesByIds,
};
