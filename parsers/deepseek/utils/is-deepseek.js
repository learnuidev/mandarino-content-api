const isDeepseek = (url) => {
  // https://www.qigushi.com/baobao/1011.html

  return url?.includes(`api-docs.deepseek.com`);
};

module.exports = {
  isDeepseek,
};
