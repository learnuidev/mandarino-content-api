const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { addSentenceHandler } = require("./add-sentence.handler");

module.exports.handler = middy(async (event) => {
  const { input, lang } = JSON.parse(event.body);
  const userId = event.requestContext.authorizer.claims.email;

  return addSentenceHandler({ input, lang, userId });
}).use(cors());
