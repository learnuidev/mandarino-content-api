const isQigushi = (url) => {
  // https://www.qigushi.com/baobao/1011.html

  return url?.includes(`www.qigushi.com`);
};

module.exports = {
  isQigushi,
};
