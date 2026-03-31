const xRay = require("x-ray");

const xinhuaParserWithImagesAndAudio = async ({ url }) => {
  const x = xRay();

  const title = await x(url, "h1");
  const publicationDate = await x(url, ".header-time");

  const audioUrl = await x(url, "audio@src");

  const children = await x(url, {
    content: x("#detail > span > p", [
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
    audioUrl,
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
  xinhuaParserWithImagesAndAudio,
};

// xinhuaParserWithImagesAndAudio({
//   url: "http://www.news.cn/20241020/d5e4fbd29eb643dea0401ba6724b8878/c.html",
// }).then((res) => {
//   console.log(res);
// });
// xinhuaParserWithImagesAndAudio({
//   url: "http://www.news.cn/20240623/1823b4d43cff4a26ae207077167b920e/c.html",
// }).then((res) => {
//   console.log(res);
// });
// xinhuaParserWithImagesAndAudio({
//   url: "http://www.news.cn/tech/20240909/eaa70248963e4e758310fca6d0eefc63/c.html",
// }).then((res) => {
//   console.log(res);
// });
