const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { getUserByEmail } = require("../../modules/users/get-user-by-email");

const { portEpisodes } = require("../../modules/series/port-episodes");
const { getSeriesById } = require("../../modules/series/get-series-by-id");
const {
  listEpisodesBySeriesId,
} = require("../../modules/series/list-episodes-by-series-id");

module.exports.handler = middy(async (event) => {
  const { seriesId } = event.pathParameters;
  const { contentIds } = JSON.parse(event.body);
  const email = event.requestContext.authorizer.claims.email;

  const user = await getUserByEmail(email);

  if (!user) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "User does not exist",
      }),
    };
  }

  const userId = user.id;

  try {
    const series = await getSeriesById(seriesId);

    if (!series) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Series not found",
        }),
      };
    }

    if (series.userId !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "Access denied",
        }),
      };
    }

    const existingSeriesEpisodes = await listEpisodesBySeriesId({ seriesId });
    const existingContentIds = new Set(
      existingSeriesEpisodes.items?.map((item) => item.contentId) || []
    );

    const newContentIds = contentIds.filter(
      (contentId) => !existingContentIds.has(contentId)
    );

    if (newContentIds.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          episodes: [],
          message: "No new episodes to add (all already in series)",
        }),
      };
    }

    await portEpisodes({
      seriesId,
      contentIds,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        seriesId,
        contentIds,
      }),
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
