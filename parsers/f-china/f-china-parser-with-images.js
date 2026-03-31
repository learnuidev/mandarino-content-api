const { parseHtml } = require("./parse-html");

const getPageIndex = (url) => {
  const urlArray = url.split("_");
  const lastItem = urlArray?.[urlArray?.length - 1];
  const numba = lastItem?.split(".")?.[0];

  return numba?.length > 2 ? 0 : numba - 1;
};

const fChinaParserWithImages = async ({ url }) => {
  const pageIndex = getPageIndex(url);

  const resp = await parseHtml({
    url,
    returns: {
      title: {
        selector: "h1",
      },

      sections: {
        selector: ".content",
        children: ["p"],
      },

      autoLinks: {
        selector: "#autopage",
        children: ["a@href"],
      },

      images: {
        selector: ".content",
        children: ["p img@src"],
      },
    },
  });

  const { sections, images } = resp;

  const intermediateSections = sections
    .map((section, idx, ctx) => {
      if (!section && !ctx?.[idx + 1]) {
        return section;
      }

      if (!section) {
        return "img";
      }

      return section;
    })
    .filter(Boolean);

  let unformattedLinks = resp?.autoLinks?.map((link) => {
    const index = getPageIndex(link);
    return {
      idx: index,
      href: link,
    };
  });

  if (pageIndex === 0) {
    unformattedLinks = [
      {
        idx: 0,
        href: url,
      },
      ...unformattedLinks,
    ];
  } else {
    unformattedLinks.push({
      href: url,
      idx: pageIndex,
    });
  }

  const _sectionsWithImgs = intermediateSections.reduce(
    (acc, curr) => {
      if (curr === "img") {
        return {
          ...acc,
          imgIdx: acc?.imgIdx + 1,
          acc: acc.acc.concat({ img: images?.[acc?.imgIdx] }),
        };
      }

      return {
        ...acc,
        acc: acc.acc.concat({ hanzi: curr }),
      };
    },
    {
      acc: [],
      imgIdx: 0,
    }
  )?.acc;

  return {
    title: resp.title,
    // links: resp?.autoLinks,

    // link: autoLinks?.content,
    links: unformattedLinks

      ?.sort((a, b) => a.idx - b?.idx)
      ?.map((link, idx) => {
        return {
          ...link,

          title: `${idx + 1}`,
        };
      }),
    sections: _sectionsWithImgs,
  };
};

module.exports = {
  fChinaParserWithImages,
};

// fChinaParserWithImages({
//   url: "http://f.china.com.cn/2020-08/31/content_76653794.htm",
// }).then((res) => {
//   console.log(res);
// });

// fChinaParserWithImages({
//   url: "http://f.china.com.cn/2021-03/08/content_77283299.htm",
// }).then((res) => {
//   console.log(res);
// });
// fChinaParserWithImages({
//   url: "http://f.china.com.cn/2017-07/12/content_41198128.htm",
// }).then((res) => {
//   console.log(res);
// });
