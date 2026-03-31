// eslint-disable-next-line no-undef
const { SERIES_TABLE, SERIES_EPISODES_TABLE, CONTENTS_TABLE } = process.env;

const seriesConstants = {
  seriesTable: SERIES_TABLE,
  seriesEpisodesTable: SERIES_EPISODES_TABLE,
  contentsTable: CONTENTS_TABLE,
};

module.exports = {
  seriesConstants,
};
