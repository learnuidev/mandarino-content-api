require("dotenv").config();

/* eslint-disable no-undef */

const tableNames = {
  seriesTable: process.env.SERIES_TABLE,
  seriesContentsTable: process.env.SERIES_CONTENTS_TABLE,
  contentsTable: process.env.CONTENTS_TABLE,

  usersTable: process.env.USERS_TABLE,
  sourceTable: process.env.SOURCE_TABLE,
  userAssetsTable: process.env.USER_ASSETS_TABLE,
};

module.exports = {
  tableNames,
};
