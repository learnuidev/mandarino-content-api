const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { getUserByEmail } = require("../../modules/users/get-user-by-email");
const {
  getEnrollmentById,
} = require("../../modules/enrollments/get-enrollment-by-id");
const { getSeriesById } = require("../../modules/series/get-series-by-id");
const {
  getUserAssetById,
} = require("../../modules/user-assets/get-user-asset-by-id");

module.exports.handler = middy(async (event) => {
  const { enrollmentId } = event.pathParameters;
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
    const enrollment = await getEnrollmentById(enrollmentId);

    if (!enrollment) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Enrollment not found",
        }),
      };
    }

    if (enrollment.userId !== userId) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "Access denied",
        }),
      };
    }

    const series = await getSeriesById(enrollment.seriesId);

    if (series) {
      const asset = await getUserAssetById(series.backgroundImageAssetId);
      series.backgroundImage = asset?.sourceUrl;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        enrollment: {
          ...enrollment,
          series,
        },
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
