const removeNull = require("./libs/utils").removeNull;

const { mandarinoDeepseek } = require("../../libs/mandarino/mandarino-client");
const { dynamodb } = require("../constants/dynamodb-client");
const { tableNames } = require("../constants/table-names");
const chance = require("chance").Chance();

const addSentence = async ({ input, lang, contentId, sentenceTable }) => {
  const id = chance.guid();

  const createdAt = Date.now();

  // const resp = await mandarino
  const resp = await mandarinoDeepseek.discover({ content: input, lang });

  const params = removeNull({
    ...resp,
    id,

    contentId,
    input,
    lang,
    createdAt,
  });

  const inputParams = removeNull({
    Item: params,
    TableName: sentenceTable || tableNames.sentenceTable,
  });

  await dynamodb.put(inputParams).promise();

  return params;
};

module.exports = {
  addSentence,
};
