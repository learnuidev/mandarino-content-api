const { tableNames } = require("../../constants/table-names");
const { getContentDetailById } = require("./get-content-details-by-id");
const { getContentInsights } = require("./get-content-insights");
const { getSeriesById } = require("./get-series-by-id");
const { listEpisodesBySeriesId } = require("./list-episodes-by-series-id");

const updateSeriesStats = async ({ seriesId }) => {
  const t0 = performance.now();

  const series = await getSeriesById(seriesId);

  if (!series) {
    throw new Error("Series not found");
  }

  let totalSeriesCharacters = [];
  let totalSeriesWords = [];
  let totalSeriesSentences = [];

  let seriesHsk1Words = [];
  let seriesHsk2Words = [];
  let seriesHsk3Words = [];
  let seriesHsk4Words = [];
  let seriesHsk5Words = [];
  let seriesHsk6Words = [];
  let seriesHsk9Words = [];
  let seriesNoNHskWords = [];

  const episodesResult = await listEpisodesBySeriesId({ seriesId });
  const episodes = episodesResult.items || [];

  if (episodes.length === 0) {
    return {
      totalCharacters: 0,
      totalSentences: 0,
      totalWords: 0,
      totalHsk1Words: 0,
      totalHsk2Words: 0,
      totalHsk3Words: 0,
      totalHsk4Words: 0,
      totalHsk5Words: 0,
      totalHsk6Words: 0,
      totalHsk9Words: 0,
      totalNonHskWords: 0,
    };
  }

  for (const episode of episodes) {
    const contentDetails = await getContentDetailById({
      id: episode.id,
      tableName: tableNames.seriesContentsTable,
    });

    if (!contentDetails) {
      continue;
    }

    const insights = getContentInsights({ content: contentDetails });

    const {
      hsk1Words,
      hsk2Words,
      hsk3Words,
      hsk4Words,
      hsk5Words,
      hsk6Words,
      hsk9Words,

      uniqueCharacters,
      hskWords,
      nonHskWords,
      sentences,
    } = insights;

    totalSeriesCharacters = [
      ...new Set([...totalSeriesCharacters, ...uniqueCharacters]),
    ];

    totalSeriesWords = [
      ...new Set([...totalSeriesWords, ...hskWords, ...nonHskWords]),
    ];
    totalSeriesSentences = [
      ...new Set([...totalSeriesSentences, ...sentences]),
    ];

    seriesHsk1Words = [...new Set([...seriesHsk1Words, ...hsk1Words])];
    seriesHsk2Words = [...new Set([...seriesHsk2Words, ...hsk2Words])];
    seriesHsk3Words = [...new Set([...seriesHsk3Words, ...hsk3Words])];

    seriesHsk4Words = [...new Set([...seriesHsk4Words, ...hsk4Words])];
    seriesHsk5Words = [...new Set([...seriesHsk5Words, ...hsk5Words])];
    seriesHsk6Words = [...new Set([...seriesHsk6Words, ...hsk6Words])];

    seriesHsk9Words = [...new Set([...seriesHsk9Words, ...hsk9Words])];

    console.log("NON HSK WORDS", nonHskWords);

    seriesNoNHskWords = [...new Set([...seriesNoNHskWords, ...nonHskWords])];
  }

  const stats = {
    averageRating: series.stats?.averageRating || 0,
    totalPlays: series.stats?.totalPlays || 0,
    totalStars: series.stats?.totalStars || 0,
    totalCharacters: totalSeriesCharacters.length || 0,
    totalSentences: totalSeriesSentences.length || 0,
    totalWords: totalSeriesWords.length || 0,
    totalHsk1Words: seriesHsk1Words.length || 0,
    totalHsk2Words: seriesHsk2Words.length || 0,
    totalHsk3Words: seriesHsk3Words.length || 0,
    totalHsk4Words: seriesHsk4Words.length || 0,
    totalHsk5Words: seriesHsk5Words.length || 0,
    totalHsk6Words: seriesHsk6Words.length || 0,
    totalHsk9Words: seriesHsk9Words.length || 0,
    totalNonHskWords: seriesNoNHskWords.length || 0,
  };

  console.log("NEW STATS", stats);

  const t1 = performance.now();
  console.log(`updateSeriesStats done. Time taken: ${t1 - t0}ms`);

  return stats;
};

// updateSeriesStats({ seriesId: "01KN2NC2KGY39MRWTERGTTFXTD" }).then((resp) => {
//   console.log("UPDATE STATS", resp);
// });

module.exports = {
  updateSeriesStats,
};
