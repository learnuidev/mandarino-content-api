const isPeopleCn = (url) => {
  // http://politics.people.com.cn/n1/2020/0520/c1001-31715445.html

  return url?.includes(`people.com.cn`);
};

module.exports = {
  isPeopleCn,
};
