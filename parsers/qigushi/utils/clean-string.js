const cleanString = (str) =>
  str
    ?.replaceAll("\r", "")
    ?.replaceAll("\n", "")
    ?.replaceAll("\t", "")
    ?.replaceAll("\u0000", "");

module.exports = {
  cleanString,
};
