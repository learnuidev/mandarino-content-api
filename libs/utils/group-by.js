function groupBy(arr, option = 5) {
  const result = [];
  for (let i = 0; i < arr.length; i += option) {
    result.push(arr.slice(i, i + option));
  }
  return result;
}

module.exports = {
  groupBy,
};
