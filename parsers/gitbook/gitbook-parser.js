// url https://openai.xiniushu.com/
const xRay = require("x-ray");
const { cleanString } = require("../qigushi/utils/clean-string");

// const { cleanString } = require("./utils/clean-string");

// const fs = require("fs");

const gitbookParser = async ({ url }) => {
  const x = xRay();

  const title = await x(url, "h1");
  const publicationDate = (await x(url, ".title"))
    ?.split("\n")
    ?.filter((x) => !["", "\r"]?.includes(x))?.[2];

  const relatedStories = await x(url, {
    content: x("ul > li", [
      {
        href: x("a@href"),
        title: x("li"),
        image: x("img@src"),
      },
    ]),
  });

  const children = await x(url, {
    content: x(".whitespace-pre-wrap > *", [
      {
        hanzi: x("p"),
        title: x("h3"),

        image: x(".block > img@src"),

        // ul: x("ul"),
        // a: x("a"),
        href: x("a@href"),
      },
    ]),
  });

  const trimmedContent = children.content.map((x) => {
    return {
      ...x,
      hanzi: (x.hanzi || "").trim(),
    };
  });

  return {
    title: cleanString(title),
    publicationDate: cleanString(publicationDate),
    sections: trimmedContent,
    relatedArticles: relatedStories?.content?.map((item) => {
      return {
        ...item,
        title: cleanString(item?.title),
      };
    }),
  };
};

// gitbookParser({
//   url: "https://jiewang.gitbook.io/chan-pin-jing-li-de-wu-xian-you-xi/mu-lu",
// }).then((res) => {
//   console.log("res", res);
// });

module.exports = {
  gitbookParser,
};
