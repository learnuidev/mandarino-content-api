const constructContentSk = ({ lang, userId }) => {
  const sk = `${lang}#${userId}`;

  return sk;
};

module.exports = {
  constructContentSk,
};
