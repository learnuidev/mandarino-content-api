const { tableNames } = require("../../constants/table-names");
const { groupBy } = require("../../libs/utils/group-by");

const DocumentClient = require("aws-sdk/clients/dynamodb").DocumentClient;

const dynamodb = new DocumentClient({
  region: "us-east-1",
});

const listContentsByContentIds = async (episodes) => {
  const contentIds = episodes.map((item) => item.id);

  const uniqueContentIds = [...new Set(contentIds)];

  const chunkedItems = groupBy(uniqueContentIds, 100);

  let respChunked = [];

  for (const itemList of chunkedItems) {
    const requestObjectContent = {
      RequestItems: {
        [tableNames.contentsTableV2]: {
          Keys: itemList?.map((item) => {
            return {
              id: item,
            };
          }),
        },
      },
    };

    const respNew = await dynamodb.batchGet(requestObjectContent).promise();

    const itemsVal = respNew?.Responses?.[tableNames.contentsTableV2];

    respChunked = respChunked.concat(itemsVal);
  }

  return respChunked.map((item) => {
    const episode = episodes.map((e) => e.id === item.id);

    return {
      ...episode,
      ...item,
    };
  });
};

module.exports = {
  listContentsByContentIds,
};
