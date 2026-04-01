const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { getUserByEmail } = require("../../modules/users/get-user-by-email");
const {
  getEnrollmentByUserAndSeries,
} = require("../../modules/enrollments/get-enrollment-by-user-and-series");
const {
  deleteEnrollment: deleteEnrollmentById,
} = require("../../modules/enrollments/delete-enrollment");

module.exports.handler = middy(async (event) => {
  const { seriesId } = event.pathParameters;
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
    const enrollment = await getEnrollmentByUserAndSeries(userId, seriesId);

    if (!enrollment) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Enrollment not found",
        }),
      };
    }

    await deleteEnrollmentById(enrollment.id);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Enrollment deleted successfully",
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
