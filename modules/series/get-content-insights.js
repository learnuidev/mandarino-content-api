const totalHskWords = require("../../data/hsk-words").totalHskWords;

function getFrequency({ content, input }) {
  const transcriptions = content?.transcriptions?.filter((transcription) => {
    return (transcription?.hanzi || transcription?.input)?.includes(input);
  });

  return transcriptions?.length || 0;
}

function filterNonEnglishAlphabets(char) {
  return /[a-zA-Z]/.test(char) ? char : "";
}

function filterNonHanYu(char) {
  return /[\u4e00-\u9fff]/.test(char) ? char : "";
}

function getContentInsightsNew({
  content,
  learnedCharacters = {},
  hskWords = totalHskWords,
  sortType = "default",
}) {
  const lesson = content;
  const lang = lesson?.lang || lesson?.transcriptions?.[0]?.lang;

  const transcriptions = lesson?.transcriptions || [];

  // Calculate totals
  const allText = transcriptions
    .map((t) => t?.hanzi || t?.input || "")
    .join(" ");

  const totalSentences = transcriptions.length;
  const totalWords = allText.split(/\s+/).filter(Boolean).length;

  const allUniqueChars = new Set();
  transcriptions.forEach((t) => {
    const text = t?.hanzi || t?.input || "";
    [...text].forEach((char) => allUniqueChars.add(char));
  });
  const totalCharacters = allUniqueChars.size;

  // Language-specific unique characters (existing logic)
  const uniqueCharacters =
    lang === "zh"
      ? [
          ...new Set(
            transcriptions
              .map((answer) => answer?.hanzi || answer?.input)
              .join("")
          ),
        ]
          .join("")
          .toLocaleLowerCase()
          .split("")
          .filter(filterNonHanYu)
      : lang === "en"
        ? [
            ...new Set(
              transcriptions
                .map((answer) => answer?.hanzi || answer?.input?.split(" "))
                .flat()
                .map((word) => {
                  let newWord = word
                    ?.replaceAll(", ", "")
                    ?.replaceAll(":", "")
                    ?.replaceAll("-", "")
                    ?.replaceAll("?", "")
                    ?.replaceAll(",", "");

                  const indexOfSingleQuote = newWord?.indexOf("'");

                  if (
                    indexOfSingleQuote === 0 ||
                    indexOfSingleQuote + 1 === newWord?.length
                  ) {
                    newWord = newWord?.replaceAll("'", "");
                  }

                  return newWord;
                })
                .filter(Boolean)
            ),
          ]
        : [
            ...new Set(
              transcriptions
                .map((answer) => answer?.hanzi || answer?.input?.split(" "))
                .flat()
                .map(filterNonEnglishAlphabets)
                .filter(Boolean)
            ),
          ];

  const totalNewCharacters = uniqueCharacters.filter((char) => {
    return !!learnedCharacters?.[char];
  }).length;

  const totalMasteryCharacters = uniqueCharacters.filter((char) => {
    const isLearned = learnedCharacters?.[char];
    return isLearned?.status?.toLowerCase() === "forgotten";
  }).length;

  // HSK word categorization (counts only)
  const hskCounts = {
    hsk1Words: 0,
    hsk2Words: 0,
    hsk3Words: 0,
    hsk4Words: 0,
    hsk5Words: 0,
    hsk6Words: 0,
    hsk9Words: 0,
    nonHskWords: 0,
  };

  // Get all unique words from content
  const allUniqueWords = new Set(
    allText
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.trim())
  );

  allUniqueWords.forEach((word) => {
    const matchingHskWord = hskWords.find(
      (hskWord) =>
        (hskWord?.hanzi || hskWord?.input || "").includes(word) ||
        word.includes(hskWord?.hanzi || hskWord?.input || "")
    );

    if (matchingHskWord) {
      const level = matchingHskWord.level || matchingHskWord.hskLevel;
      if (level === 1) hskCounts.hsk1Words++;
      else if (level === 2) hskCounts.hsk2Words++;
      else if (level === 3) hskCounts.hsk3Words++;
      else if (level === 4) hskCounts.hsk4Words++;
      else if (level === 5) hskCounts.hsk5Words++;
      else if (level === 6) hskCounts.hsk6Words++;
      else if (level === 9 || level === "9") hskCounts.hsk9Words++;
      else hskCounts.nonHskWords++;
    } else {
      hskCounts.nonHskWords++;
    }
  });

  const uniqueCharactersMemo = (() => {
    const res = uniqueCharacters.map((char) => {
      const frequency = getFrequency({
        content: lesson,
        input: char?.hanzi || char?.input || char,
      });

      const isLearned = learnedCharacters?.[char];

      return {
        input: char,
        ...isLearned,
        isLearned: !!isLearned,
        frequency,
      };
    });

    if (sortType === "popular") {
      return res.sort((first, second) => second?.frequency - first?.frequency);
    }
    return res;
  })();

  const filteredHskWords = (() => {
    const res = hskWords
      .filter((word) => {
        const transcription = lesson?.transcriptions?.filter(
          (transcription) => {
            return (transcription?.hanzi || transcription?.input)?.includes(
              word?.hanzi
            );
          }
        );

        return transcription?.length > 0;
      })
      .map((char) => {
        const frequency = getFrequency({
          content: lesson,
          input: char?.hanzi || char?.input,
        });

        const transcription = lesson?.transcriptions?.find((transcription) =>
          (transcription?.hanzi || transcription?.input)?.includes(
            char?.hanzi || char?.input
          )
        );

        const wordIndex =
          lesson?.transcriptions?.findIndex((transcription) =>
            (transcription?.hanzi || transcription?.input)?.includes(
              char?.hanzi || char?.input
            )
          ) * 10;

        const characterIndex = (
          transcription?.hanzi || transcription?.input
        )?.indexOf(char?.hanzi || char?.input);

        return {
          ...char,
          wordIndex: (wordIndex || 0) + (characterIndex || 0),
          frequency,
        };
      });

    if (sortType === "popular") {
      return res.sort((first, second) => second?.frequency - first?.frequency);
    }
    return res.sort((first, second) => first?.wordIndex - second?.wordIndex);
  })();

  const numberFormatter = new Intl.NumberFormat("en-GB", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });

  const understandingRate = numberFormatter.format(
    totalNewCharacters / (uniqueCharacters?.length || 1)
  );

  const masteryRate = numberFormatter.format(
    totalMasteryCharacters / (uniqueCharacters?.length || 1)
  );

  return {
    // Totals
    totalCharacters,
    totalSentences,
    totalWords,

    // HSK word counts (numbers only)
    hsk1Words: hskCounts.hsk1Words,
    hsk2Words: hskCounts.hsk2Words,
    hsk3Words: hskCounts.hsk3Words,
    hsk4Words: hskCounts.hsk4Words,
    hsk5Words: hskCounts.hsk5Words,
    hsk6Words: hskCounts.hsk6Words,
    hsk9Words: hskCounts.hsk9Words,
    nonHskWords: hskCounts.nonHskWords,

    // Existing insights
    uniqueCharacters,
    understandingRate,
    totalNewCharacters,
    filteredHskWords,
    uniqueCharactersMemo,
    masteryRate,
  };
}

module.exports = {
  getContentInsights: getContentInsightsNew,
};
