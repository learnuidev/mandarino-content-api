const { parseHtml } = require("./parse-html");

const fChinaSimpleParser = ({ url }) => {
  return parseHtml({
    url,
    returns: {
      title: {
        selector: "h1",
      },

      sections: {
        selector: ".left > .content",
        children: ["p"],
      },
    },
  });
};

module.exports = {
  fChinaSimpleParser,
};

// fChinaSimpleParser({
//   url: "http://f.china.com.cn/2021-02/09/content_77203266.htm",
// }).then((res) => {
//   console.log(fs.writeFileSync("./test.json", JSON.stringify(res)));
// });
