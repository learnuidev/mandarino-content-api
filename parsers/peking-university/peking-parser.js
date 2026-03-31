const xRay = require("x-ray");
const { cleanString } = require("../qigushi/utils/clean-string");
// const { translateTo } = require("../../utils/google/translate-to");

// const fs = require("fs");

const pekingParser = async ({ url }) => {
  const x = xRay();

  // const options = {
  //   title: ".articleTitle",
  //   publicationDate: ".articleAuthor > p > span",
  //   relatedArticles: {
  //     selector: "#list02 > ul",
  //     children: {
  //       href: "li > a@href",
  //       title: "li",
  //       image: "img@src",
  //     },
  //   },
  //   sections: {
  //     selector: ".article > *",
  //     children: {
  //       // type: "string",
  //       hanzi: "p",
  //       style: "p@style",
  //       title: "p>strong",
  //       image: "img@src",
  //       video: "iframe@src",
  //     },
  //   },
  // };

  const title = await x(url, ".articleTitle");
  const publicationDate = (await x(url, ".articleAuthor > p > span"))
    ?.split("\n")
    ?.filter((x) => !["", "\r"]?.includes(x))?.[2];

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
    content: x(".article > *", [
      {
        // type: "string",
        hanzi: x("p"),
        style: x("p@style"),
        title: x("p>strong"),
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
        hanzi,
        // en,
      };
    })
  );

  return {
    title: cleanString(title),
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
  pekingParser,
};

// pekingParser({
//   url: "https://news.pku.edu.cn/xwzh/dee18914f3534736801e98159a39608c.htm",
// }).then((res) => {
//   console.log(JSON.stringify(res, null, 4));
// });
