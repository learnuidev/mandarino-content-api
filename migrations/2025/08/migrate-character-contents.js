const { tableNames } = require("../../../constants/table-names");
const { scanAllContents } = require("../../../libs/dynamodb/scan-all-contents");

const DocumentClient = require("aws-sdk/clients/dynamodb").DocumentClient;

const dynamodb = new DocumentClient({
  region: "us-east-1",
});

const migrateCharacterContents = async () => {
  const characterContents = await scanAllContents({
    tableName: tableNames.characterContentsTable,
  });

  let res = [];

  for (const characterContent of characterContents) {
    const [userId, content] = characterContent.userIdAndContent.split(
      `_${characterContent.content}`
    );

    const params = {
      ...characterContent,
      userId,
    };

    await dynamodb
      .put({
        TableName: tableNames.characterContentsTableV2,
        Item: params,
      })
      .promise();

    res.push(content);

    console.log(
      `Done: `,
      ((res?.length / characterContents?.length) * 100)?.toFixed(1)
    );
  }

  // console.log("cc", characterContents);
};

migrateCharacterContents();
