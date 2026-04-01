const {
  getLegacyContentDetailById,
} = require("../legacy-content/get-legacy-content-details-by-id");
const {
  listLegacyContentsByIds,
} = require("../legacy-content/list-legacy-contents-by-ids");
const { addSeriesContent } = require("./add-series-content");
const { getContentInsights } = require("./get-content-insights");
const { getSeriesById } = require("./get-series-by-id");

const portEpisodes = async ({ seriesId, contentIds }) => {
  const t0 = performance.now();
  // 1. Get Series by Id
  const series = await getSeriesById(seriesId);
  // console.log("series", series);

  // 2. Get Legacy Contents
  const contents = await listLegacyContentsByIds({
    contentIds: contentIds,
  });

  // 3. IF legacy contents is not found, throw error
  if (contents.length === 0) {
    throw new Error("Contents not found");
  }

  // let totalSeriesCharacters = [];
  // let totalSeriesWords = [];
  // let totalSeriesSentences = [];

  // 4. Loop over contents and prepare data
  for (const content of contents) {
    // console.log("content", content);

    // Fetch Content details
    const contentDetails = await getLegacyContentDetailById(content.id);

    // export interface ContentV2 extends CreatedAndUpdatedAt {
    //     id: string;
    //     lang: string;

    //     format: ContentFormat;
    //     status: ContentStatus;
    //     title: string;
    //     mediaUrl: string;
    //     thumbnailUrl: string;
    //     stats: ContentStats;

    //     mediaTranscriptionsId: string;
    //     mediaId: string;
    //   }

    // TODO: Calculate total characters
    const insights = getContentInsights({ content: contentDetails });

    const {
      totalSentences,
      totalCharacters,
      totalHsk1Words,
      totalHsk2Words,
      totalHsk3Words,
      totalHsk4Words,
      totalHsk5Words,
      totalHsk6Words,
      totalHsk9Words,

      totalWords,
      totalNonHskWords,
    } = insights;

    // totalSeriesCharacters = [
    //   ...new Set([...totalSeriesCharacters, ...uniqueCharacters]),
    // ];

    // totalSeriesWords = [
    //   ...new Set([...totalSeriesWords, ...hskWords, ...nonHskWords]),
    // ];
    // totalSeriesSentences = [
    //   ...new Set([...totalSeriesSentences, ...sentences]),
    // ];

    // TODO: Calculate total words

    // TODO. Calculate total sentences

    const stats = {
      averageRating: 0,
      totalPlays: 0,
      totalStars: 0,
      // totalNewCharacters,

      totalCharacters,
      totalSentences,
      totalWords,

      totalHsk1Words,
      totalHsk2Words,
      totalHsk3Words,
      totalHsk4Words,
      totalHsk5Words,
      totalHsk6Words,
      totalHsk9Words,
      totalNonHskWords,
    };

    console.log("stats", stats);

    const newParams = {
      id: content.id,
      lang: content.lang,
      format: content.type,
      status: content.status,
      title: content.title,
      mediaTranscriptionsId: contentDetails.mediaTranscriptionsId,
      mediaId: content.audioId,
      seriesId: series.id,
      createdAt: contentDetails.createdAt,
      updatedAt: contentDetails.updatedAt,

      stats,
    };

    await addSeriesContent(newParams);

    console.log("new params", newParams);

    // console.log("NEW PARAMS", newParams);

    // console.log("content details", contentDetails);
  }

  const t1 = performance.now();

  console.log(`Done. Time taken: `, t1 - t0);
};

module.exports = {
  portEpisodes,
};

// portEpisodes({
//   seriesId: "01KN2NC2KGY39MRWTERGTTFXTD",
//   contentIds: [
//     "b604699b-bf57-5f8d-bab3-e9af7e735c0c",
//     "ec366e39-ec00-5856-9640-f36f52a9b21d",
//     "9bb15585-472f-5e6a-a308-a1fc12df82ca",
//     "968ee9a1-ca28-5268-8b82-2300b01e8ae3",
//   ],
// }).then((resp) => {
//   console.log("todo");
// });
