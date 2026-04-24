const AWS = require("aws-sdk");
const { getUserByEmail } = require("../../modules/users/get-user-by-email");
const { getSeriesById } = require("../../modules/series/get-series-by-id");
const {
  updateSeriesStats,
} = require("../../modules/series/update-series-stats");
const { tableNames } = require("../../constants/table-names");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const updateStatsApi = async ({ email, seriesId }) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error("User does not exist");
  }

  const userId = user.id;

  const series = await getSeriesById(seriesId);

  if (!series) {
    throw new Error("Series not found");
  }

  if (series.userId !== userId) {
    throw new Error("Access denied");
  }

  const stats = await updateSeriesStats({ seriesId });

  const updateParams = {
    TableName: tableNames.seriesTable,
    Key: { id: seriesId },
    UpdateExpression: "SET stats = :stats, updatedAt = :updatedAt",
    ExpressionAttributeValues: {
      ":stats": stats,
      ":updatedAt": Date.now(),
    },
  };

  await dynamodb.update(updateParams).promise();

  return {
    seriesId,
    stats,
  };
};

// updateStatsApi({
//   seriesId: "01KQ01PR3XHRGR72A3VJM9HX66",
//   email: "learnuidev@gmail.com",
// }).then((resp) => {
//   console.log("UPDATE STATS", resp);
// });

module.exports = {
  updateStatsApi,
};
