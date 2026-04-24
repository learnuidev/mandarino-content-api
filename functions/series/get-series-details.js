const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { getSeriesDetailsApi } = require("./get-series-details-api");

module.exports.handler = middy(async (event) => {
  const { seriesId } = event.pathParameters;
  const email = event.requestContext.authorizer.claims.email;

  try {
    const resp = await getSeriesDetailsApi({ email, seriesId });

    return {
      statusCode: 200,
      body: JSON.stringify(resp),
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
