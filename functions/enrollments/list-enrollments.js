const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { getUserByEmail } = require("../../modules/users/get-user-by-email");
const {
  listEnrollmentsByUserId,
} = require("../../modules/enrollments/list-enrollments-by-user-id");
const { getSeriesByIds } = require("../../modules/series/get-series-by-ids");
const {
  getUserAssetById,
} = require("../../modules/user-assets/get-user-asset-by-id");

module.exports.handler = middy(async (event) => {
  const { limit = 50, exclusiveStartKey } = event.queryStringParameters || {};
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
    const result = await listEnrollmentsByUserId(
      userId,
      parseInt(limit, 10),
      exclusiveStartKey,
    );

    const activeEnrollments = result.items.filter(
      (enrollment) => enrollment.status === "active",
    );

    const seriesIds = activeEnrollments.map(
      (enrollment) => enrollment.seriesId,
    );

    let enrollmentsWithSeries = [];

    if (seriesIds.length > 0) {
      const seriesList = await getSeriesByIds(seriesIds);
      const seriesMap = {};

      for (const series of seriesList) {
        const asset = await getUserAssetById(series.backgroundImageAssetId);
        seriesMap[series.id] = {
          ...series,
          backgroundImage: asset?.sourceUrl,
        };
      }

      enrollmentsWithSeries = await Promise.all(
        activeEnrollments.map(async (enrollment) => {
          const series = seriesMap[enrollment.seriesId];
          return {
            ...enrollment,
            series,
          };
        }),
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        enrollments: enrollmentsWithSeries,
        pagination: result.pagination,
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
