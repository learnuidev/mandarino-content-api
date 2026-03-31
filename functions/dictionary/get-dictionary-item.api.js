const { dynamodb } = require("../constants/dynamodb-client");
const { tableNames } = require("../constants/table-names");

const getDictionaryItem = async ({ input, lang }) => {
  const id = `${input}#${lang}`;

  const _dictionaryItem = await dynamodb
    .get({
      Key: {
        id: id,
      },
      TableName: tableNames.dictionaryTable,
    })
    .promise();

  const dictionaryItem = _dictionaryItem?.Item;

  return dictionaryItem;
};

module.exports = {
  getDictionaryItem,
};
