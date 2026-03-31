const DocumentClient = require("aws-sdk/clients/dynamodb").DocumentClient;

const dynamodb = new DocumentClient({
  region: "us-east-1",
});

const scanAllContents = async ({ tableName, key, res = [] }) => {
  const scanResp = await dynamodb
    .scan({ TableName: tableName, Limit: 500, ExclusiveStartKey: key })
    ?.promise();

  const resp = {
    items: scanResp?.Items,
    lastEvaulatedKey: scanResp?.LastEvaluatedKey,
  };

  if (resp?.lastEvaulatedKey) {
    return scanAllContents({
      tableName,
      key: resp?.lastEvaulatedKey,
      res: res.concat(resp?.items),
    });
  } else {
    res = res.concat(resp?.items);
  }

  return res;
};

module.exports = {
  scanAllContents,
};
