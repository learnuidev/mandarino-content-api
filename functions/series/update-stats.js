const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { updateStatsApi } = require("./update-stats-api");

module.exports.handler = middy(async (event) => {
  const { seriesId } = event.pathParameters;
  const email = event.requestContext.authorizer.claims.email;

  try {
    const stats = await updateStatsApi({ email, seriesId });

    return {
      statusCode: 200,
      body: JSON.stringify(stats),
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: err.message,
      }),
    };
  }
}).use(cors());
