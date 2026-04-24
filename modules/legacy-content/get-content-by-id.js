const { tableNames } = require("../../constants/table-names");

const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const item = {
  createdAt: 1775004831223,
  id: "ec366e39-ec00-5856-9640-f36f52a9b21d",
  lang: "zh",
  mediaTranscriptionsId: "01KN38GKE990MMV86W3WWG8R0C",
  translationsAddedAt: 1775004887140,
  updatedAt: 1775004887140,
};

const getLegacyContentById = async (id) => {
  const seriesParams = {
    TableName: tableNames.contentsTableV2,
    Key: { id },
  };

  const resp = await dynamodb.get(seriesParams).promise();

  return resp.Item;
};

module.exports = {
  getLegacyContentById,
};
