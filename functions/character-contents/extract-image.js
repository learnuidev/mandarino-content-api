const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { extractImageHandler } = require("./extract-image.handler");

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;

  const { id } = JSON.parse(event.body);

  const response = await extractImageHandler({ id, userId });

  return response;
}).use(cors());
