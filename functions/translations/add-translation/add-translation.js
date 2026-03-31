const AWS = require("aws-sdk");
const middy = require("@middy/core");
const cors = require("@middy/http-cors");
const { removeNull } = require("mandarino/src/utils/remove-null");
// const { translateTo } = require("./translate-to");
// const { pinyin } = require("pinyin-pro");
const {
  mandarinoDeepseek,
} = require("../../../libs/mandarino/mandarino-client");

const chance = require("chance").Chance();

// eslint-disable-next-line no-undef
const { TRANSLATIONS_TABLE } = process.env;

const addTranslationApi = async (event) => {
  const userId = event.requestContext.authorizer.claims.email;

  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient({
      apiVersion: "2012-08-10",
      region: "us-east-1",
    });

    // 3. Other wise regular flow
    const { input, targetLang, sourceLang, contextId } = JSON.parse(event.body);

    const createdAt = Date.now();
    const id = chance.guid();

    const resp = await mandarinoDeepseek.casualTranslate({
      content: input,
      sourceLang,
      targetLang,
    });

    const output = resp?.output;
    const _pinyin = resp?.roman;

    // const output = await translateTo({ text: input, targetLang });

    // const _pinyin =
    //   targetLang === "zh-CN"
    //     ? pinyin(output)
    //     : sourceLang === "zh-CN"
    //       ? pinyin(input)
    //       : null;

    const params = removeNull({
      id,
      userAndContextId: `${userId}#${contextId}`,
      pinyin: _pinyin,
      input,
      output,
      targetLang,
      sourceLang,
      createdAt,
      model: mandarinoDeepseek.model,
    });

    const inputParams = {
      Item: params,
      TableName: TRANSLATIONS_TABLE,
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
};

module.exports.handler = middy(addTranslationApi).use(cors());
