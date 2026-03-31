const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { removeNull } = require("../../libs/utils");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

module.exports.handler = middy(async (event) => {
  const { title, topicType, source, backgroundImage } = JSON.parse(event.body);
  const userId = event.requestContext.authorizer.claims.email;

  try {
    const { SERIES_TABLE } = process.env;
    const id = `series_${Date.now()}`;

    const series = removeNull({
      id,
      userId,
      title,
      topicType,
      source,
      backgroundImage,
      stats: {
        averageRating: 0,
        totalPlays: 0,
        totalStars: 0,
        totalCharacters: 0,
        totalSentences: 0,
        totalWords: 0,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const params = {
      TableName: SERIES_TABLE,
      Item: series,
    };

    await dynamodb.put(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(series),
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
