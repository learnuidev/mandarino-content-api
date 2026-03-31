const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { addToDictionaryHandler } = require("./add-to-dictionary.handler");

module.exports.handler = middy(async (event) => {
  const { input, lang, context } = JSON.parse(event.body);
  const userId = event.requestContext.authorizer.claims.email;

  return addToDictionaryHandler({ input, lang, userId, context });
}).use(cors());
