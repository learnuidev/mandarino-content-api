const isXinhuanet = (url) => {
  return url?.includes("www.news.cn") || url?.includes("www.xinhuanet.com");
};

module.exports = {
  isXinhuanet,
};
