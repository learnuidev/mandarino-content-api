const middy = require("@middy/core");
const cors = require("@middy/http-cors");

const { pinyin } = require("pinyin-pro");
const { translateTo } = require("../add-translation/translate-to");
const { dynamodb } = require("../../constants/dynamodb-client");
const { tableNames } = require("../../constants/table-names");

const { removeNull } = require("mandarino/src/utils/remove-null");
const {
  mandarinoDeepseek,
} = require("../../../libs/mandarino/mandarino-client");

const formattedOutput = (item) =>
  item?.replaceAll(/&quot;/g, '"')?.replaceAll(/&#39;/g, "'");

const getTranslation = async (event) => {
  const { input, targetLang, sourceLang, tableName } = JSON.parse(event.body);

  const lang = `${sourceLang}#${targetLang}`;

  const id = `${input}#${sourceLang}#${targetLang}`;

  const resp = await dynamodb
    .get({
      Key: {
        id,
        lang,
      },
      TableName: tableName || tableNames.clipboardTranslationsTable,
    })
    .promise();

  const translatedText = resp.Item;

  return translatedText;
};

module.exports.handler = middy(async (event) => {
  try {
    // 3. Other wise regular flow

    const { input, targetLang, sourceLang } = JSON.parse(event.body);

    const lang = `${sourceLang}#${targetLang}`;

    const id = `${input}#${sourceLang}#${targetLang}`;

    const translatedText = await getTranslation(event);

    if (translatedText) {
      const response = {
        statusCode: 200,
        body: JSON.stringify(translatedText),
      };

      return response;
    }

    const output = await translateTo({ text: input, targetLang });

    const _pinyin =
      targetLang === "zh-CN"
        ? pinyin(output)
        : sourceLang === "zh-CN"
          ? pinyin(input)
          : null;

    const roman = await mandarinoDeepseek.genPinyin({ content: input });

    const params = removeNull({
      id,
      input,
      pinyin: _pinyin,
      roman,
      lang,
      targetLang,
      sourceLang,
      output: formattedOutput(output),
      createdAt: Date.now(),
    });

    const inputParams = {
      Item: params,
      TableName: tableNames.clipboardTranslationsTable,
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

// getTranslation({
//   body: JSON.stringify({
//     sourceLang: "ru",
//     targetLang: "en",
//     input: "Одним совсем обыкновенным утром петушок Петя завтракает на кухне.",
//     tableName: "nomad-method-v2-dev-ClipboardTranslationsTable-1UEPFCJQLGKY1",
//   }),
// }).then((resp) => {
//   console.log("yoo", resp);
// });
