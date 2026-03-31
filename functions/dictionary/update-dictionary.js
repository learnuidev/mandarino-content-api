const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { getDictionaryItem } = require("./get-dictionary-item.api");
const { removeNull } = require("mandarino/src/utils/remove-null");
const { constructParams } = require("mandarino/src/utils/construct-params");
const { tableNames } = require("../constants/table-names");
const { dynamodb } = require("../constants/dynamodb-client");

module.exports.handler = middy(async (event) => {
  const { input, lang, ...updatedItems } = JSON.parse(event.body);

  const id = `${input}#${lang}`;

  if (!lang) {
    const response = {
      statusCode: 404,
      body: JSON.stringify({ message: "Lang not found" }),
    };

    return response;
  }

  const dictionaryItem = await getDictionaryItem({ input, lang });

  if (!dictionaryItem) {
    const response = {
      statusCode: 404,
      body: JSON.stringify({ message: "Dictionary item not found" }),
    };

    return response;
  }

  const params = removeNull({
    id,
    ...dictionaryItem,
    ...updatedItems,
    updatedAt: Date.now(),
  });

  // 5. Update component
  const updatedStepParams = constructParams({
    tableName: tableNames.dictionaryTable,
    attributes: params,
  });
  await dynamodb.update(updatedStepParams).promise();

  const response = {
    statusCode: 200,
    body: JSON.stringify(params),
  };

  return response;
}).use(cors());
