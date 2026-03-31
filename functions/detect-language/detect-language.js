// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { mandarinoDeepseek } = require("../../libs/mandarino/mandarino-client");

const detectLanguageApi = async (event) => {
  const { content } = JSON.parse(event.body);

  const lang = await mandarinoDeepseek.detectLanguage({ content });

  const response = {
    statusCode: 200,
    body: JSON.stringify({ lang }),
  };

  return response;
};

module.exports.handler = middy(detectLanguageApi).use(cors());
