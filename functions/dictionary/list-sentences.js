// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { tableNames } = require("../constants/table-names");
const { dynamodb } = require("../constants/dynamodb-client");

const queryByContentId = async (contentId, res = [], key = null) => {
  const params = {
    ExpressionAttributeValues: {
      ":contentId": contentId,
    },
    ExclusiveStartKey: key,
    KeyConditionExpression: "contentId = :contentId",
    IndexName: "byContent",
    TableName: tableNames.contentTable,
  };

  const resp = await dynamodb.query(params).promise();

  if (resp?.LastEvaluatedKey) {
    return queryByContentId(
      contentId,
      res.concat(resp?.Items),
      resp?.LastEvaluatedKey
    );
  }
  return res?.concat(resp?.Items);
};

module.exports.handler = middy(async (event) => {
  const { lang, contentId } = JSON.parse(event.body);

  if (!lang) {
    const response = {
      statusCode: 404,
      body: JSON.stringify({ message: "Lang not found" }),
    };

    return response;
  }

  const sentences = await queryByContentId(contentId);

  const response = {
    statusCode: 200,
    body: JSON.stringify(sentences),
  };

  return response;
}).use(cors());
