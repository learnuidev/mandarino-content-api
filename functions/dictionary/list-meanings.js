// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { listMeaningsApi } = require("./list-meanings.api");

const parseHtmlApi = async (event) => {
  const { text, lang } = JSON.parse(event.body);

  const meanings = await listMeaningsApi({ text, lang });

  const response = {
    statusCode: 200,
    body: JSON.stringify(meanings),
  };

  return response;
};

module.exports.handler = middy(parseHtmlApi).use(cors());
