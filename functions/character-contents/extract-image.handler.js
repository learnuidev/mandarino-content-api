const AWS = require("aws-sdk");
const { removeNull } = require("mandarino/src/utils/remove-null");
const { mandarinoApi, chineseConverter } = require("mandarino");
const { moonshotApiKey, openaiEnv } = require("../../constants/openai-env");
const { constructParams } = require("mandarino/src/utils/construct-params");
const { tableNames } = require("../../constants/table-names");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

const mando = mandarinoApi({
  variant: "openai",
  apiKey: openaiEnv.apiKey,
});

// const mando = mandarinoApi({
//   variant: "moonshot",
//   apiKey: moonshotApiKey,
// });

const extractImageHandler = async ({ id, userId }) => {
  try {
    // 1. First check if component exists
    const resp = await dynamodb
      .get({
        TableName: tableNames.characterContentsTableV2,
        Key: {
          id: id,
        },
      })
      .promise();

    const content = resp.Item;

    // 2. If content does not exist, throw error
    if (!content || !content?.sourceUrl) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Content does not exist",
        }),
      };
    }

    if (
      ![
        "image/png",
        "image/jpg",
        "image/jpeg",
        "image/gif",
        "image/webp",
      ].includes(content?.contentType)
    ) {
      return {
        statusCode: 422,
        body: JSON.stringify({
          message: `You uploaded an unsupported image. Please make sure your image has of one the following formats: ['png', 'jpeg', 'gif', 'webp'].`,
        }),
      };
    }

    if (content?.userId !== userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: "Unauthorized",
        }),
      };
    }

    if (content.imageMetadata && content?.imageMetadata?.details?.length > 0) {
      const response = {
        statusCode: 200,
        body: JSON.stringify(content),
      };
      return response;
    }

    const extractedResponse = await mando.extractImage({
      imageUrl: content?.sourceUrl,
    });

    const params = removeNull({
      ...content,
      imageMetadata: {
        originalResponse: extractedResponse.originalResponse,
        model: extractedResponse.model,
        createdAt: Date.now(),
        ...extractedResponse,
      },
      updatedAt: Date.now(),
    });

    // 5. Update component
    var updatedComponentInput = constructParams({
      tableName: tableNames.characterContentsTableV2,
      attributes: params,
    });
    await dynamodb.update(updatedComponentInput).promise();

    // 6. Return Params
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
};

module.exports = {
  extractImageHandler,
};

// const requestObject = {
//   userId: "learnuidev@gmail.com",
//   id: "a09e9739-09ae-5013-b1d3-1c67380b6dac",
// };

// extractImageHandler(requestObject).then((info) => {
//   console.log("info", info);
// });
