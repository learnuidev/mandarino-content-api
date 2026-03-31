const xRay = require("x-ray");
const { cleanString } = require("../qigushi/utils/clean-string");

const deepseekParser = async ({ url }) => {
  const x = xRay();

  const title = await x(url, "h1");
  const publicationDate = await x(url, ".media-meta > span");

  const author = await x(url, ".media-name");
  // ?.split("\n")
  // ?.filter((x) => !["", "\r"]?.includes(x))?.[2];

  const relatedStories = await x(url, {
    content: x("ul.list02 > li", [
      {
        date: x("span.list-date"),
        title: x("a"),
        link: x("a@href"),

        // href: x("li > a@href"),
        // title: x("li"),
        // image: x("img@src"),
      },
    ]),
  });

  // console.log("RELATED STORIES", relatedStories);

  const children = await x(url, {
    content: x(".col--12 > *", [
      {
        // type: "string",

        hanzi: x("p"),
        style: x("p@style"),
        title: x("h3"),
        image: x("img@src"),
        video: x("iframe@src"),
      },
    ]),
  });

  const trimmedContent = await Promise.all(
    children.content.map(async (x) => {
      const hanzi = (x.hanzi || "").trim();

      // const en = await translateTo({ text: hanzi, targetLang: "en" });
      return {
        ...x,
        hanzi: cleanString(hanzi),
        title: cleanString(x?.title),
        // en,
      };
    })
  );

  return {
    title: cleanString(title),
    author: cleanString(author),
    publicationDate: cleanString(publicationDate),
    relatedArticles: relatedStories?.content?.map((item) => {
      return {
        ...item,
        title: cleanString(item?.title),
      };
    }),
    sections: trimmedContent,
  };
};

module.exports = {
  deepseekParser,
};

// deepseekParser({
//   url: "https://api-docs.deepseek.com/zh-cn/news/news1120",
// }).then((res) => {
//   console.log(JSON.stringify(res, null, 4));
// });
