// Middlewares
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { getContent } = require("./get-content.api");

module.exports.handler = middy(async (event) => {
  const { id } = JSON.parse(event.body);
  const userId = event.requestContext.authorizer.claims.email;

  const content = await getContent({ id });

  if (!content) {
    const response = {
      statusCode: 404,
      body: JSON.stringify({ message: "Content not found" }),
    };

    return response;
  }

  if (content.author !== userId) {
    const response = {
      statusCode: 401,
      body: JSON.stringify({ message: "You dont have the permission" }),
    };

    return response;
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify(content),
  };

  return response;
}).use(cors());
