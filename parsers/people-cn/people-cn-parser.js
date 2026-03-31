const xRay = require("x-ray");

const peopleCnParser = async ({ url }) => {
  const x = xRay();

  const title = await x(url, "h1");
  //   const publicationDate = await x(url, ".header-time");

  //   const audioUrl = await x(url, "audio@src");

  //   const children = await x(url, {
  //     content: x("#detail > span > p", [
  //       {
  //         // type: "string",
  //         hanzi: x("p"),
  //         caption: x("p@style"),
  //         title: x("p>strong"),
  //         image: x("img@src"),
  //         video: x("iframe@src"),
  //       },
  //     ]),
  //   });

  return {
    title: title,
    // audioUrl,
    // publicationDate,
    // sections: children.content.map((x) => {
    //   return {
    //     ...x,
    //     hanzi: (x.hanzi || "").trim(),
    //   };
    // }),
  };
};

module.exports = {
  peopleCnParser,
};

peopleCnParser({
  url: "http://politics.people.com.cn/n1/2024/1206/c1001-40377172.html",
}).then((res) => {
  console.log(res);
});
