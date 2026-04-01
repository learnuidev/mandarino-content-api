const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { getUserByEmail } = require("../../modules/users/get-user-by-email");
const {
  createEnrollment,
} = require("../../modules/enrollments/create-enrollment");
const { getSeriesById } = require("../../modules/series/get-series-by-id");

module.exports.handler = middy(async (event) => {
  const { seriesId } = JSON.parse(event.body);
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

    const enrollment = await createEnrollment(userId, seriesId);

    return {
      statusCode: 201,
      body: JSON.stringify({
        enrollment,
      }),
    };
  } catch (err) {
    if (err.message === "Enrollment already exists") {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: "Already enrolled in this series",
        }),
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: err.message,
      }),
    };
  }
}).use(cors());
