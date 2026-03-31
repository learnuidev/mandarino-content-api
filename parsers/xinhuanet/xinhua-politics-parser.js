const xRay = require("x-ray");

const xinhuaPoliticsParser = async ({ url }) => {
  const x = xRay();

  const title = await x(url, ".h-title");
  const publicationDate = await x(url, ".h-time");

  const body = await x(url, ".p-detail");

  const children = await x(url, {
    content: x(".p-detail", [
      {
        // type: "string",
        hanzi: x("p"),
        // caption: x("p@style"),
        // title: x("p>strong"),
        // image: x("img@src"),
        // video: x("iframe@src"),
      },
    ]),
  });

  return {
    title,
    body,
    publicationDate,
    sections: children.content.map((x) => {
      return {
        ...x,
        hanzi: (x.hanzi || "").trim(),
      };
    }),
    // sections: children.content.map((x) => {
    //   return {
    //     ...x,
    //     hanzi: (x.hanzi || "").trim(),
    //   };
    // }),
  };
};
module.exports = {
  xinhuaPoliticsParser,
};

// xinhuaPoliticsParser({
//   url: "http://www.xinhuanet.com/politics/2019-02/02/c_1124079912.htm",
// }).then((res) => {
//   console.log(res);
// });
