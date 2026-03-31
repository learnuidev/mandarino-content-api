// url https://openai.xiniushu.com/
const xRay = require("x-ray");
const { cleanString } = require("../qigushi/utils/clean-string");

// const { cleanString } = require("./utils/clean-string");

// const fs = require("fs");

const lili21Parser = async ({ url }) => {
  const x = xRay();

  const title = await x(url, "h1");
  const publicationDate = (await x(url, ".title"))
    ?.split("\n")
    ?.filter((x) => !["", "\r"]?.includes(x))?.[2];

  const children = await x(url, {
    content: x("article > *", [
      {
        // type: "string",
        hanzi: x("p"),
        title: x("h1"),
        // caption: x("p@style"),
        // title: x("p>strong"),
        image: x("img@src"),
        // video: x("iframe@src"),
        ul: x("ul"),
        a: x("a"),
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
  };
};

// lili21Parser({ url: "https://blog.lili21.me/posts/35" }).then((res) => {
//   console.log("res", res);
// });

module.exports = {
  lili21Parser,
};
