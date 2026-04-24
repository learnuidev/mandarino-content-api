require("dotenv").config();

/* eslint-disable no-undef */

const tableNames = {
  seriesTable: process.env.SERIES_TABLE,
  seriesContentsTable: process.env.SERIES_CONTENTS_TABLE,
  contentsTable: process.env.CONTENTS_TABLE,

  usersTable: process.env.USERS_TABLE,
  sourceTable: process.env.SOURCE_TABLE,
  userAssetsTable: process.env.USER_ASSETS_TABLE,

  contentsTableV2: process.env.LEGACY_CONTENTS_TABLE,
  contentDetailsTable: process.env.LEGACY_CONTENT_DETAILS_TABLE,

  enrollmentsTable: process.env.ENROLLMENTS_TABLE,
};

module.exports = {
  tableNames,
};
