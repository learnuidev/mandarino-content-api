const xRay = require("x-ray");
const { cleanString } = require("../qigushi/utils/clean-string");

const _12371Parser = async ({ url }) => {
  const x = xRay();

  const title = await x(url, ".big_title");
  const author = await x(url, ".zz_title");
  const publicationDate = await x(url, ".time");

  //   const audioUrl = await x(url, "audio@src");

  const children = await x(url, {
    content: x(".word > *", [
      {
        // type: "string",
        hanzi: x("p"),
        // caption: x("p@style"),
        title: x("p>strong"),
        // image: x("img@src"),
        // video: x("video@src"),
      },
    ]),
  });

  // const videoUrl = await x(url, "source@src");

  return {
    title: cleanString(title),
    author: cleanString(author),
    // videoUrl,
    // // audioUrl,
    publicationDate: cleanString(publicationDate),
    sections: children.content.map((x) => {
      return {
        ...x,
        hanzi: (x.hanzi || "").trim(),
      };
    }),
  };
};

module.exports = {
  _12371Parser,
};

// _12371Parser({
//   // url: "https://www.12371.cn/2020/10/02/VIDE1601629276047510.shtml",
//   url: "https://news.12371.cn/2017/09/01/ARTI1504217870275177.shtml",
// }).then((res) => {
//   console.log(res);
// });
