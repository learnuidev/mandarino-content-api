const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { getUserByEmail } = require("../../modules/users/get-user-by-email");
const {
  listEnrollmentsByUserId,
} = require("../../modules/enrollments/list-enrollments-by-user-id");
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
    const result = await listEnrollmentsByUserId(userId, 100);

    const enrollment = result.items.find(
      (item) => item.seriesId === seriesId && item.status === "active",
    );

    if (!enrollment) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Enrollment not found",
        }),
      };
    }

    const deletedEnrollment = await deleteEnrollmentById(enrollment.id);

    return {
      statusCode: 200,
      body: JSON.stringify({
        enrollment: deletedEnrollment,
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
