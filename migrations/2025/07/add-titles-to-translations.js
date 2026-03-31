const DocumentClient = require("aws-sdk/clients/dynamodb").DocumentClient;
const OpenAI = require("openai");
const { openAIApiKey } = require("../../../libs/deepseek/deeseek-api-key");
const { removeNull } = require("mandarino/src/utils/remove-null");
const { constructParams } = require("mandarino/src/utils/construct-params");
const { tableNames } = require("../../../constants/table-names");

const dynamodb = new DocumentClient({
  region: "us-east-1",
});

const listTranslations = async (userAndContextId, res = [], key) => {
  const params = {
    ExpressionAttributeValues: {
      ":userAndContextId": userAndContextId,
    },
    KeyConditionExpression: "userAndContextId = :userAndContextId",
    IndexName: "byUserAndContextId",
    TableName: tableNames.translationsTable,
    Limit: 10,
    ExclusiveStartKey: key,
    // ProjectionExpression: ["title"],
  };

  const resp = await dynamodb.query(params).promise();

  if (resp?.LastEvaluatedKey) {
    return listTranslations(
      userAndContextId,
      res.concat(resp?.Items),
      resp?.LastEvaluatedKey
    );
  }

  return res?.concat(resp?.Items);

  // return resp;
};

// - [x] fetch all translations
// - [x] for each translations fetch their conversations
// - [x] give transaltions to ai and ask ai to come up with a title
// - [x] update each translations with title

const generateTitle = async (content) => {
  const openai = new OpenAI({
    apiKey: openAIApiKey,
  });
  const prompt = `

  You are a title generating expert, given the list of conversation, please come up with a title

 
  Please provide in stringified JSON format like so:
  {"title": "..."}
 
 
     
     `;
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: prompt,
      },
      { role: "user", content: `content: ${content}` },
    ],
    model: "gpt-4o-mini",
  });

  const resp = await JSON.parse(chatCompletion?.choices?.[0]?.message?.content);

  return resp;
};

const addTitlesToTranslations = async () => {
  const userId = `learnuidev@gmail.com`;
  const translationsHistory = (
    await dynamodb
      .scan({
        TableName: tableNames.translationsHistoryTable,
        Limit: 500,
      })
      .promise()
  )?.Items;

  for (const translation of translationsHistory) {
    if (translation.title) {
      console.log("SKIPPED translation already exists");
    } else {
      const conversationsList = await listTranslations(
        `${userId}#${translation.id}`
      );

      const title = await generateTitle(
        JSON.stringify(conversationsList?.map((item) => item?.input))
      );

      const params = removeNull({
        id: translation.id,
        title: title?.title,
        updatedAt: Date.now(),
      });

      // 5. Update component
      var updatedComponentInput = constructParams({
        tableName: tableNames.translationsHistoryTable,
        attributes: params,
      });
      await dynamodb.update(updatedComponentInput).promise();

      console.log("title", title);
    }
  }

  console.log("DONE");
};

addTitlesToTranslations();
