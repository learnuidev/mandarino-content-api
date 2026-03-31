/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const AWS = require("aws-sdk");
const DynamoDB = require("aws-sdk/clients/dynamodb");

const { constructParams } = require("mandarino/src/utils/construct-params");
const { removeNull } = require("mandarino/src/utils/remove-null");
const { tableNames } = require("../constants/table-names");
const { addSentence } = require("./add-sentence.api");

const dynamodb = new AWS.DynamoDB.DocumentClient({
  apiVersion: "2012-08-10",
  region: "us-east-1",
});

module.exports.handler = async (event) => {
  const t0 = performance.now();

  for (const record of event.Records) {
    if (record.eventName === "INSERT") {
      const content = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);

      const sentences = content.input
        .split("\n")
        .filter(Boolean)
        .map((item) =>
          item
            .split(".")
            .filter(Boolean)
            .map((item) => `${item}.`)
        )
        .flat();

      for (const sentence of sentences) {
        await addSentence({
          input: sentence,
          lang: content.lang,
          contentId: content.id,
          sentenceTable: tableNames.sentenceTable,
        });
      }

      const params = removeNull({
        id: content?.id,
        updatedAt: Date.now(),
        status: "TRANSLATED",
      });

      // 5. Update user
      const updatedContent = constructParams({
        tableName: tableNames.contentTable,
        attributes: params,
      });

      await dynamodb.update(updatedContent).promise();

      console.log("Succesfully translated items");
      // }
    }
  }

  const t1 = performance.now();

  console.log("Time Taken: ", t1 - t0);
};
