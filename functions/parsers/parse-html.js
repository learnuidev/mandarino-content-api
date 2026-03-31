// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { htmlParser } = require("../../parsers/html-parser");

const parseHtmlApi = async (event) => {
  //   const userId = event.requestContext.authorizer.claims.email;

  const { url, options = {} } = JSON.parse(event.body);

  const parsedHtml = await htmlParser({ url }, options);

  const response = {
    statusCode: 200,
    body: JSON.stringify(parsedHtml),
  };

  return response;
};

module.exports.handler = middy(parseHtmlApi).use(cors());
