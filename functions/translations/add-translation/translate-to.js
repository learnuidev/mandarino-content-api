const translateTo = async ({ text, targetLang = "en" }) => {
  const url = `https://translate-pa.googleapis.com/v1/translateHtml`;

  const xApiKey = `AIzaSyATBXajvzQLTDHEQbcpq0Ihe0vWDHmO520`;

  const payload = [[[text], "auto", targetLang], "te_lib"];

  const resp = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "x-goog-api-key": xApiKey,
      "content-type": "application/json+protobuf",
    },
  });
  const data = await resp.json();
  return data?.[0]?.[0];
};

module.exports = {
  translateTo,
};

// mandarinoOpenai.discover({ content: "bonjour" }).then((resp) => {
//   console.log("resp", resp);
// });

// translateTo({
//   text: "hello can you help me please",
//   targetLang: "zh-CN",
// }).then((resp) => {
//   console.log("RESP", resp);
// });
