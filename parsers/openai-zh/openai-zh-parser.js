// url https://openai.xiniushu.com/
const xRay = require("x-ray");
const { cleanString } = require("../qigushi/utils/clean-string");

// const { cleanString } = require("./utils/clean-string");

// const fs = require("fs");

const openAiZhParser = async ({ url }) => {
  const x = xRay();

  const title = await x(url, "h1");
  const publicationDate = (await x(url, ".title"))
    ?.split("\n")
    ?.filter((x) => !["", "\r"]?.includes(x))?.[2];

  const relatedStories = await x(url, {
    content: x(".story_list > ul > li", [
      {
        href: x("li > a@href"),
        title: x("li"),
        image: x("img@src"),
      },
    ]),
  });

  const children = await x(url, {
    content: x(".theme-doc-markdown > *", [
      {
        // type: "string",
        title: x("h1"),
        subtitle: x("h2"),
        hanzi: x("p"),
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
    relatedArticles: relatedStories?.content?.map((item) => {
      return {
        ...item,
        title: cleanString(item?.title),
      };
    }),
    sections: trimmedContent,
  };
};

// openAiZhParser({ url: "https://openai.xiniushu.com/" }).then((res) => {
//   console.log("res", res);
// });

module.exports = {
  openAiZhParser,
};
