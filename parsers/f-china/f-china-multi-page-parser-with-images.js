const { fChinaParserWithImages } = require("./f-china-parser-with-images");

const fChinaMultiPageParserWithImages = async ({ urls }) => {
  const sections = await Promise.all(
    urls.map((url) => {
      return fChinaParserWithImages({ url });
    })
  );

  return {
    title: sections?.[0]?.title,
    sections: sections.map((sec) => sec.sections).flat(),
  };
};

module.exports = {
  fChinaMultiPageParserWithImages,
};

// fChinaMultiPageParserWithImages({
//   urls: [
//     "http://f.china.com.cn/2021-03/08/content_77283299.htm",
//     "http://f.china.com.cn/2021-03/08/content_77283299_2.htm",
//     "http://f.china.com.cn/2021-03/08/content_77283299_3.htm",
//     "http://f.china.com.cn/2021-03/08/content_77283299_4.htm",
//     "http://f.china.com.cn/2021-03/08/content_77283299_5.htm",
//     "http://f.china.com.cn/2021-03/08/content_77283299_6.htm",
//     "http://f.china.com.cn/2021-03/08/content_77283299_7.htm",
//     "http://f.china.com.cn/2021-03/08/content_77283299_8.htm",
//     "http://f.china.com.cn/2021-03/08/content_77283299_9.htm",
//     "http://f.china.com.cn/2021-03/08/content_77283299_10.htm",
//   ],
// }).then((res) => {
//   console.log(res);
// });
