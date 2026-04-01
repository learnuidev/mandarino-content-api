const AWS = require("aws-sdk");

const { tableNames } = require("../../constants/table-names");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const listEpisodesBySeriesId = async ({ seriesId }) => {
  const existingEpisodesParams = {
    TableName: tableNames.seriesContentsTable,
    IndexName: "bySeriesId",
    KeyConditionExpression: "seriesId = :seriesId",
    ExpressionAttributeValues: {
      ":seriesId": seriesId,
    },
  };

  const existingEpisodesResult = await dynamodb
    .query(existingEpisodesParams)
    .promise();

  return {
    items: existingEpisodesResult.Items,
    lastEvaluatedKey: existingEpisodesResult.LastEvaluatedKey,
  };
};

module.exports = {
  listEpisodesBySeriesId,
};
