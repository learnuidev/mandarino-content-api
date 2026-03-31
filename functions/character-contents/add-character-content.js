const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { removeNull } = require("mandarino/src/utils/remove-null");
const { tableNames } = require("../../constants/table-names");

const chance = require("chance").Chance();

module.exports.handler = middy(async (event) => {
  const userId = event.requestContext.authorizer.claims.email;

  try {
    // TODO: Migrate to v3
    const dynamodb = new AWS.DynamoDB.DocumentClient({
      apiVersion: "2012-08-10",
      region: "us-east-1",
    });

    // 3. Other wise regular flow

    const {
      content,
      contentType,
      name,
      extension,
      sourceUrl,
      uploadBucketKey,
      //   ...rest
    } = JSON.parse(event.body);

    // const id = chance.guid();

    const createdAt = Date.now();
    const id = chance.guid();

    const params = removeNull({
      id,
      userIdAndContent: `${userId}_${content}`,
      userId,
      contentType,
      content,
      name,
      extension,
      sourceUrl,
      uploadBucketKey,
      createdAt,
      //   ...rest,
    });

    const inputParams = {
      Item: params,
      TableName: tableNames.characterContentsTableV2,
    };

    await dynamodb.put(inputParams).promise();

    const response = {
      statusCode: 200,
      body: JSON.stringify(params),
    };
    return response;
  } catch (err) {
    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: err.message,
      }),
    };
    return response;
  }
}).use(cors());
