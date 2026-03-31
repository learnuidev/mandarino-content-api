require("dotenv").config();

/* eslint-disable no-undef */
const tableNames = {
  dictionaryTable: "nomad-method-v2-dev-DictionaryTable-POQFBYDGBQ7G",
  clipboardTranslationsTable:
    "nomad-method-v2-dev-ClipboardTranslationsTable-1UEPFCJQLGKY1",
  sentenceTable: "nomad-method-v2-dev-SentencesTable-1VXFJLT0D3DO2",
  contentTable: "nomad-method-v2-dev-ContentTableV2-ZCHGJLS18BOP",
};
// const tableNames = {
//   dictionaryTable: process.env.DICTIONARY_TABLE,
//   clipboardTranslationsTable: process.env.CLIPBOARD_TRANSLATIONS_TABLE,
//   contentTable: process.env.CONTENT_TABLE,
//   sentenceTable: process.env.SENTENCE_TABLE,

// };

module.exports = {
  tableNames,
};
