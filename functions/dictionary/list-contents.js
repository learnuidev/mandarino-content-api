// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { tableNames } = require("../constants/table-names");
const { dynamodb } = require("../constants/dynamodb-client");
const { constructContentSk } = require("./utils/construct-contents-sk");

const queryBySk = async (sk, res = [], key = null) => {
  const params = {
    ExpressionAttributeValues: {
      ":sk": sk,
    },
    ExclusiveStartKey: key,
    KeyConditionExpression: "sk = :sk",
    IndexName: "bySk",
    TableName: tableNames.contentTable,
  };

  const resp = await dynamodb.query(params).promise();

  if (resp?.LastEvaluatedKey) {
    return queryBySk(sk, res.concat(resp?.Items), resp?.LastEvaluatedKey);
  }
  return res?.concat(resp?.Items);
};

module.exports.handler = middy(async (event) => {
  const { lang } = JSON.parse(event.body);
  const userId = event.requestContext.authorizer.claims.email;

  if (!lang) {
    const response = {
      statusCode: 404,
      body: JSON.stringify({ message: "Lang not found" }),
    };

    return response;
  }

  const sk = constructContentSk({ lang, userId });

  const dictionary = await queryBySk(sk);

  const response = {
    statusCode: 200,
    body: JSON.stringify(dictionary),
  };

  return response;
}).use(cors());
