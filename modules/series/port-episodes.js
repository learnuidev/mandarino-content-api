const {
  getLegacyContentDetailById,
} = require("../legacy-content/get-legacy-content-details-by-id");
const {
  listLegacyContentsByIds,
} = require("../legacy-content/list-legacy-contents-by-ids");
const { getSeriesById } = require("./get-series-by-id");

const portEpisodes = async ({ seriesId, contentIds }, { email, userId }) => {
  // list legacy contents
  const series = await getSeriesById(seriesId);
  console.log("series", series);
  const contents = await listLegacyContentsByIds({
    contentIds: contentIds,
  });

  if (contents.length === 0) {
    throw new Error("Contents not found");
  }

  //   data prep
  for (const content of contents) {
    console.log("content", content);

    const contentDetails = await getLegacyContentDetailById(content.id);

    if (content.type === "audio") {
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

      const newParams = {
        id: content.id,
        lang: content.lang,
        format: content.type,
        status: content.status,
        title: content.title,
        mediaTranscriptionId: contentDetails.mediaTranscriptionId,
        mediaId: content.mediaId,
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

      console.log("NEW PARAMS", newParams);
    }

    console.log("content details", contentDetails);
  }
};

portEpisodes({
  seriesId: "01KN2NC2KGY39MRWTERGTTFXTD",
  contentIds: ["ec366e39-ec00-5856-9640-f36f52a9b21d"],
}).then((resp) => {
  console.log("todo");
});
