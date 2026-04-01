const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { tableNames } = require("../../constants/table-names");
const { getUserByEmail } = require("../../modules/users/get-user-by-email");
const {
  getSeriesContentDetails,
} = require("../../modules/series/get-series-content-details");
const {
  getEnrollmentByUserAndSeries,
} = require("../../modules/enrollments/get-enrollment-by-user-and-series");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

module.exports.handler = middy(async (event) => {
  const { contentId } = event.pathParameters;
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
    const contentParams = {
      TableName: tableNames.seriesContentsTable,
      Key: { id: contentId },
    };

    const contentResult = await dynamodb.get(contentParams).promise();
    const content = contentResult.Item;

    if (!content) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Content not found",
        }),
      };
    }

    const enrollment = await getEnrollmentByUserAndSeries(
      userId,
      content.seriesId,
    );

    if (!enrollment) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message:
            "Access denied. You must be enrolled in this series to view this content.",
        }),
      };
    }

    const contentDetails = await getSeriesContentDetails({ contentId });

    return {
      statusCode: 200,
      body: JSON.stringify({
        content: contentDetails,
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
