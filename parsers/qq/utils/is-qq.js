const isQq = (url) => {
  // https://www.qigushi.com/baobao/1011.html

  return url?.includes(`news.qq.com`);
};

module.exports = {
  isQq,
};
