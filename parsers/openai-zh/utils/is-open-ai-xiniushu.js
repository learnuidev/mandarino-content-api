// https://openai.xiniushu.com/

const isOpenAiXinishu = (url) => {
  return url?.includes("openai.xiniushu");
};

module.exports = {
  isOpenAiXinishu,
};
