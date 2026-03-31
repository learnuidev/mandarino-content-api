// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { seriesConstants } = require("./series-constants");

const DocumentClient = require("aws-sdk/clients/dynamodb").DocumentClient;

const dynamodb = new DocumentClient({
  region: "us-east-1",
});

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;

  //   const { contextId } = JSON.parse(event.body);

  const response = {
    statusCode: 200,
    body: JSON.stringify(seriesConstants),
  };

  return response;
}).use(cors());
