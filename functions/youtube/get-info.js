// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { listSubtitles } = require("./get-info.api");

const getYoutubeInfoHttpHandler = async (event) => {
  //   const userId = event.requestContext.authorizer.claims.email;

  const { id, lang } = JSON.parse(event.body);

  const meanings = await listSubtitles({ id, lang });

  const response = {
    statusCode: 200,
    body: JSON.stringify(meanings),
  };

  return response;
};

// getYoutubeInfoHttpHandler({
//   body: JSON.stringify({
//     id: "https://www.youtube.com/watch?v=87tHecsCjtE",
//     lang: "zh",
//   }),
// }).then((res) => {
//   console.log("RES", res);
// });

module.exports.handler = middy(getYoutubeInfoHttpHandler).use(cors());
