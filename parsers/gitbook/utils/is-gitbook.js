// https://openai.xiniushu.com/

const isGitbook = (url) => {
  return url?.includes("gitbook.io");
};

module.exports = {
  isGitbook,
};
