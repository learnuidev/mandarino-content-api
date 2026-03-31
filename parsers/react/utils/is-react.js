// https://openai.xiniushu.com/

const isReact = (url) => {
  return url?.includes("zh-hans.react.dev");
};

module.exports = {
  isReact,
};
