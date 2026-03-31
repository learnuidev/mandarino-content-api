// http://www.xinhuanet.com/politics/2019-02/02/c_1124079912.htm

const isXinhuaPolitics = (url) => {
  return url?.includes("www.xinhuanet.com/politics");
};

module.exports = {
  isXinhuaPolitics,
};
