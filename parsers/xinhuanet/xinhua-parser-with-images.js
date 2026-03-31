const xRay = require("x-ray");

const xinhuaParserWithImages = async ({ url }) => {
  const x = xRay();

  const title = await x(url, ".h-title");
  const publicationDate = await x(url, ".h-time");

  const children = await x(url, {
    content: x(".main-aticle > p", [
      {
        // type: "string",
        hanzi: x("p"),
        caption: x("p@style"),
        title: x("p>strong"),
        image: x("img@src"),
        video: x("iframe@src"),
      },
    ]),
  });

  return {
    title,
    publicationDate,
    sections: children.content.map((x) => {
      return {
        ...x,
        hanzi: (x.hanzi || "").trim(),
      };
    }),
  };
};

module.exports = {
  xinhuaParserWithImages,
};

// xinhuaParserWithImages({
//   url: "http://www.xinhuanet.com/politics/leaders/2020-05/19/c_1126006686.htm",
// }).then((res) => {
//   console.log(res);
// });
