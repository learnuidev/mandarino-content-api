const { mandarinoDeepseek } = require("../../libs/mandarino/mandarino-client");
const { dynamodb } = require("../constants/dynamodb-client");
const { tableNames } = require("../constants/table-names");
const { removeNull } = require("mandarino/src/utils/remove-null");

const addDictionaryItem = async ({
  input,
  lang,
  userId,
  tableName,
  context,
}) => {
  const id = `${input}#${lang}`;

  const discovered =
    lang === "zh"
      ? await mandarinoDeepseek.discover({
          content: input,
          lang: lang,
        })
      : await mandarinoDeepseek.discover({
          content: input,
          lang: lang,
        });

  const createdAt = Date.now();

  const params = removeNull({
    id,
    ...discovered,
    context,
    lang,
    author: userId,
    createdAt,
  });

  const inputParams = removeNull({
    Item: params,
    TableName: tableName || tableNames.dictionaryTable,
  });

  await dynamodb.put(inputParams).promise();

  return params;
};

// addDictionaryItem({
//   input: "你好",
//   lang: "zh",
//   userId: "learnuidev@gmail.com",
//   tableName: "nomad-method-v2-dev-DictionaryTable-POQFBYDGBQ7G",
// }).then((resp) => {
//   console.log("yooo", resp);
// });

module.exports = {
  addDictionaryItem,
};
