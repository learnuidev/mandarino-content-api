require("dotenv").config();

/* eslint-disable no-undef */

const tableNames = {
  seriesTable: process.env.SERIES_TABLE,
  contentTable: process.env.SERIES_CONTENT_TABLE,
};

module.exports = {
  tableNames,
};
