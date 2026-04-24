const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { tableNames } = require("../../constants/table-names");
// const { tableNames } = require("../../constants/table-names");

const DocumentClient = require("aws-sdk/clients/dynamodb").DocumentClient;

const dynamodb = new DocumentClient({
  region: "us-east-1",
});

const LEGACY_CONTENTS_TABLE = tableNames.contentsTableV2;

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

const sampleResponse = [
  {
    audioId: "01KN38GACHX8H5DB7KHC3DZ7B3",
    contentType: "story",
    createdAt: 1775004831037,
    id: "ec366e39-ec00-5856-9640-f36f52a9b21d",
    lang: "zh",
    processingStatus: "SAVED_INITIAL_DATA",
    progress: 1,
    status: "TRANSLATED",
    title: "第1集-三根猴毛",
    type: "audio",
    userId: "learnuidev@gmail.com",
  },
];

const listLegacyContentsByIds = async ({ contentIds }) => {
  if (!contentIds || contentIds.length === 0) {
    return [];
  }

  const chunkedIds = chunkArray(contentIds, 25);
  let allItems = [];

  for (const idChunk of chunkedIds) {
    const requestObject = {
      RequestItems: {
        [LEGACY_CONTENTS_TABLE]: {
          Keys: idChunk.map((id) => ({
            id,
          })),
        },
      },
    };

    const resp = await dynamodb.batchGet(requestObject).promise();
    const items = resp?.Responses?.[LEGACY_CONTENTS_TABLE] || [];
    allItems = allItems.concat(items);
  }

  return allItems;
};

module.exports = {
  listLegacyContentsByIds,
};
