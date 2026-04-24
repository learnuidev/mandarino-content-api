const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { getUserByEmail } = require("../../modules/users/get-user-by-email");
const { getSeriesById } = require("../../modules/series/get-series-by-id");
const { updateEpisodeOrder } = require("../../modules/series/update-episode-order");

module.exports.handler = middy(async (event) => {
  const { seriesId } = event.pathParameters;
  const { episodeOrders } = JSON.parse(event.body);
  const email = event.requestContext.authorizer.claims.email;

  const user = await getUserByEmail(email);

  if (!user) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "User not found",
      }),
    };
  }

  const series = await getSeriesById(seriesId);

  if (!series) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "Series not found",
      }),
    };
  }

  if (series.userId !== user.id) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        message: "Access denied",
      }),
    };
  }

  try {
    const result = await updateEpisodeOrder({
      seriesId,
      episodeOrders,
    });

    return {
      statusCode: 200,
      body: JSON.stringify(result),
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
