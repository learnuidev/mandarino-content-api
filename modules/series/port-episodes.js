const {
  getLegacyContentDetailById,
} = require("../legacy-content/get-legacy-content-details-by-id");
const {
  listLegacyContentsByIds,
} = require("../legacy-content/list-legacy-contents-by-ids");
const { getContentInsights } = require("./get-content-insights");
const { getSeriesById } = require("./get-series-by-id");

const portEpisodes = async ({ seriesId, contentIds }) => {
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

  const totalCharacters = [];
  const totalWords = [];
  const totalSentences = [];

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
    console.log("total chars", insights);

    // TODO: Calculate total words

    // TODO. Calculate total sentences

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

      stats: {
        averageRating: 0,
        totalPlays: 0,
        totalStars: 0,

        totalCharacters: "todo",
        totalSentences: "todo",
        totalWords: "todo",

        hsk1Words: "",
        hsk2Words: "",
        hsk3Words: "",
        hsk4Words: "",
        hsk5Words: "",
        hsk6Words: "",
        hsk9Words: "",
        nonHskWords: "",
      },
    };

    // console.log("NEW PARAMS", newParams);

    // console.log("content details", contentDetails);
  }
};

portEpisodes({
  seriesId: "01KN2NC2KGY39MRWTERGTTFXTD",
  contentIds: ["ec366e39-ec00-5856-9640-f36f52a9b21d"],
}).then((resp) => {
  console.log("todo");
});
