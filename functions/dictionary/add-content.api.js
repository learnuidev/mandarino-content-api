const removeNull = require("./libs/utils").removeNull;

const { dynamodb } = require("../constants/dynamodb-client");
const { tableNames } = require("../constants/table-names");
const { constructContentSk } = require("./utils/construct-contents-sk");
const chance = require("chance").Chance();

const addContent = async ({ input, lang, userId }) => {
  const id = chance.guid();

  const createdAt = Date.now();

  const sk = constructContentSk({ lang, userId });

  const snippet = input.slice(0, 32);

  const params = removeNull({
    id,
    input,
    snippet,
    lang,
    sk,
    status: "UNPROCESSED",
    author: userId,
    createdAt,
  });

  const inputParams = removeNull({
    Item: params,
    TableName: tableNames.contentTable,
  });

  await dynamodb.put(inputParams).promise();

  return params;
};

module.exports = {
  addContent,
};
