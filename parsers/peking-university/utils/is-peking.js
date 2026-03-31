const isPeking = (url) => {
  // https://www.qigushi.com/baobao/1011.html

  return url?.includes(`pku.edu`);
};

module.exports = {
  isPeking,
};
