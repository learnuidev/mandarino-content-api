const xRay = require("x-ray");
const { cleanString } = require("./utils/clean-string");

// const fs = require("fs");

const qiqushiParser = async ({ url }) => {
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
    content: x(".article_content > p", [
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

module.exports = {
  qiqushiParser,
};

// qiqushiParser({
//   url: "https://www.qigushi.com/baobao/1011.html",
// }).then((res) => {
//   console.log(fs.writeFileSync(`./${Date.now()}.json`, JSON.stringify(res)));
//   console.log(JSON.stringify(res, null, 4));
// });
