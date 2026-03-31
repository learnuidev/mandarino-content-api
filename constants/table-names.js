require("dotenv").config();

/* eslint-disable no-undef */

const tableNames = {
  characterContentsTable: process.env.CHARACTER_CONTENTS_TABLE,
  characterContentsTableV2: process.env.CHARACTER_CONTENTS_TABLE_V2,
  translationsHistoryTable: process.env.TRANSLATIONS_HISTORY_TABLE,
  translationsTable: process.env.TRANSLATIONS_TABLE,
};

module.exports = {
  tableNames,
};
