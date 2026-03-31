// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { tableNames } = require("../constants/table-names");
const { dynamodb } = require("../constants/dynamodb-client");

const queryByLang = async ({ lang, key }) => {
  const params = {
    ExpressionAttributeValues: {
      ":lang": lang,
    },
    ExclusiveStartKey: key,
    KeyConditionExpression: "lang = :lang",
    IndexName: "byLang",
    TableName: tableNames.dictionaryTable,
    Limit: 500,
  };

  const resp = await dynamodb.query(params).promise();

  return {
    items: resp?.Items,
    key: resp?.LastEvaluatedKey,
  };
};

module.exports.handler = middy(async (event) => {
  try {
    const { lang, key } = JSON.parse(event.body);

    if (!lang) {
      const response = {
        statusCode: 404,
        body: JSON.stringify({ message: "Lang not found" }),
      };

      return response;
    }

    const dictionary = await queryByLang({ lang, key });

    const response = {
      statusCode: 200,
      body: JSON.stringify(dictionary),
    };

    return response;
  } catch (err) {
    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: err?.message,
      }),
    };
    return response;
  }
}).use(cors());

// queryByLang({ lang: "zh" }).then((resp) => {
//   console.log("yoo", JSON.stringify(resp, null, 4));
// });
