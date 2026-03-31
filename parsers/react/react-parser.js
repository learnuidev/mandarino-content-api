// url https://openai.xiniushu.com/
const xRay = require("x-ray");
const { cleanString } = require("../qigushi/utils/clean-string");

const prettier = require("prettier");
const parserBabel = require("prettier/parser-babel");
const parserTypescript = require("prettier/parser-typescript");

async function formatCode(currentCode) {
  return prettier.format(
    currentCode?.code,

    {
      parser: "typescript",
      plugins: [parserBabel, parserTypescript],
      singleQuote: true,
    }
  );
}

const reactParser = async ({ url }) => {
  const x = xRay();

  const title = await x(url, "h1");
  const publicationDate = (await x(url, ".title"))
    ?.split("\n")
    ?.filter((x) => !["", "\r"]?.includes(x))?.[2];

  const children = await x(url, {
    content: x(".max-w-4xl > *", [
      {
        hanzi: x("p"),
        title: x("h2"),
        h3Title: x("h3"),
        code: x(".sandpack--codeblock"),

        image: x(".block > img@src"),

        ul: x("ul > *", [
          {
            hanzi: x("li"),
          },
        ]),
        // a: x("a"),
        href: x("a@href"),
      },
    ]),
  });

  const trimmedContent = await Promise.all(
    children.content.map(async (x) => {
      let resp = {
        ...x,
        hanzi: (x.hanzi || "").trim(),
      };

      try {
        if (x.code) {
          return {
            ...resp,
            code: await formatCode(x),
          };
        }
      } catch (err) {
        return {
          ...resp,
          error: err?.message,
        };
      }
      return resp;
    })
  );

  return {
    title: cleanString(title),
    publicationDate: cleanString(publicationDate),
    sections: trimmedContent,
    // relatedArticles: relatedStories?.content?.map((item) => {
    //   return {
    //     ...item,
    //     title: cleanString(item?.title),
    //   };
    // }),
  };
};

// reactParser({
//   url: "https://zh-hans.react.dev/learn",
// }).then((res) => {
//   console.log("res", JSON.stringify(res, null, 4));
// });

module.exports = {
  reactParser,
};
