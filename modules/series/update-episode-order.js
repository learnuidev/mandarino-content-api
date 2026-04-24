const AWS = require("aws-sdk");
const { tableNames } = require("../../constants/table-names");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const updateEpisodeOrder = async ({ seriesId, episodeOrders }) => {
  for (const { episodeId, sortOrder } of episodeOrders) {
    await dynamodb
      .update({
        TableName: tableNames.seriesContentsTable,
        Key: { id: episodeId },
        UpdateExpression: "SET sortOrder = :sortOrder, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":sortOrder": sortOrder,
          ":updatedAt": Date.now(),
          ":seriesId": seriesId,
        },
        ConditionExpression: "seriesId = :seriesId",
      })
      .promise();
  }

  const episodesParams = {
    TableName: tableNames.seriesContentsTable,
    IndexName: "bySeriesId",
    KeyConditionExpression: "seriesId = :seriesId",
    ExpressionAttributeValues: {
      ":seriesId": seriesId,
    },
  };

  const episodesResult = await dynamodb.query(episodesParams).promise();

  return {
    seriesId,
    episodes: episodesResult.Items.sort((a, b) => {
      const aSort = a.sortOrder ?? 0;
      const bSort = b.sortOrder ?? 0;
      return aSort - bSort;
    }),
    message: "Episode order updated successfully",
  };
};

module.exports = {
  updateEpisodeOrder,
};
