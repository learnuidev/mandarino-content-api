const { dynamodb } = require("../constants/dynamodb-client");
const { tableNames } = require("../constants/table-names");

const getContent = async ({ id }) => {
  const _dictionaryItem = await dynamodb
    .get({
      Key: {
        id: id,
      },
      TableName: tableNames.contentTable,
    })
    .promise();

  const dictionaryItem = _dictionaryItem?.Item;

  return dictionaryItem;
};

module.exports = {
  getContent,
};
