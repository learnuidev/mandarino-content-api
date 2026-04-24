const AWS = require("aws-sdk");
const { tableNames } = require("../../constants/table-names");
const { getUserByEmail } = require("../../modules/users/get-user-by-email");
const {
  getUserAssetById,
} = require("../../modules/user-assets/get-user-asset-by-id");
const { getSeriesById } = require("../../modules/series/get-series-by-id");
const {
  listContentsByContentIds,
} = require("../contents/list-contents-by-content-ids");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const getSeriesDetailsApi = async ({ email, seriesId }) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new Error(`User not found`);
  }

  const series = await getSeriesById(seriesId);

  if (!series) {
    throw new Error(`Series not found`);
  }

  const asset = await getUserAssetById(series.backgroundImageAssetId);

  console.log("TABLE NAMES", tableNames);
  const episodesParams = {
    TableName: tableNames.seriesContentsTable,
    IndexName: "bySeriesId",
    KeyConditionExpression: "seriesId = :seriesId",
    ExpressionAttributeValues: {
      ":seriesId": seriesId,
    },
  };

  const episodesResult = await dynamodb.query(episodesParams).promise();

  const seriesEpisodes = episodesResult?.Items;

  // console.log("SE", seriesEpisodes);
  const episodes = await listContentsByContentIds(seriesEpisodes);

  return {
    series: { ...series, backgroundImage: asset.sourceUrl },
    episodes: episodes || [],
  };
};

module.exports = {
  getSeriesDetailsApi,
};

// getSeriesDetailsApi({
//   email: "learnuidev@gmail.com",
//   seriesId: "01KQ01PR3XHRGR72A3VJM9HX66",
// }).then((resp) => {
//   console.log("yoo", resp);
// });
