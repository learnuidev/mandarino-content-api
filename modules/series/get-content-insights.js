const totalHskWords = require("../../data/hsk").hskWords2;

const hskWordsMap = require("../../data/hsk-words").hskWordsMap;

// === UTILITIES ===
function filterHanCharacters(char) {
  return /[\u4e00-\u9fff]/.test(char) ? char : "";
}

function getUniqueChars(texts) {
  const chars = new Set();
  texts.forEach((text) => [...text].forEach((char) => chars.add(char)));
  return chars.size;
}

function cleanEnglishWord(word) {
  if (!word) return "";
  return word.replaceAll(/[,:?-]/g, "").replace(/^'|'$/g, "");
}

// === LANGUAGE-SPECIFIC ===
function extractUniqueCharsForZh(transcriptions) {
  return [...new Set(transcriptions.map((t) => t?.hanzi || t?.input).join(""))]
    .join("")
    .toLocaleLowerCase()
    .split("")
    .filter(filterHanCharacters);
}

function extractUniqueCharsForEn(transcriptions) {
  return [
    ...new Set(
      transcriptions
        .map((t) => (t?.hanzi || t?.input || "").split(" "))
        .flat()
        .map(cleanEnglishWord)
        .filter(Boolean)
    ),
  ];
}

function extractUniqueChars(lang, transcriptions) {
  return lang === "zh"
    ? extractUniqueCharsForZh(transcriptions)
    : extractUniqueCharsForEn(transcriptions);
}

// === FREQUENCY & MATCHING ===
function getFrequency({ content, input }) {
  return (
    content?.transcriptions?.filter((t) =>
      (t?.hanzi || t?.input || "").includes(input)
    )?.length || 0
  );
}

function findHskWordsInContent(content) {
  return totalHskWords.filter((word) =>
    content.transcriptions.some((t) =>
      (t?.hanzi || t?.input || "").includes(word.hanzi)
    )
  );
}

function addHskWordMetrics(hskWords, content, sortType) {
  return hskWords
    .map((word) => {
      const freq = getFrequency({ content, input: word.hanzi });
      const transcription = content.transcriptions.find((t) =>
        (t?.hanzi || t?.input || "").includes(word.hanzi)
      );
      const wordIndex =
        content.transcriptions.findIndex((t) =>
          (t?.hanzi || t?.input || "").includes(word.hanzi)
        ) *
          10 +
        (transcription?.hanzi || "").indexOf(word.hanzi);

      return { ...word, frequency: freq, wordIndex };
    })
    .sort(
      sortType === "popular"
        ? (a, b) => b.frequency - a.frequency
        : (a, b) => a.wordIndex - b.wordIndex
    );
}

// === AGGREGATORS ===
function countHskLevels(hskWords) {
  const counts = {
    // hsk1Words: [],
    // hsk2Words: [],
    // hsk3Words: [],
    // hsk4Words: [],
    // hsk5Words: [],
    // hsk6Words: [],
    // hsk9Words: [],
    totalHsk1Words: 0,
    totalHsk2Words: 0,
    totalHsk3Words: 0,
    totalHsk4Words: 0,
    totalHsk5Words: 0,
    totalHsk6Words: 0,
    totalHsk9Words: 0,
  };

  hskWords.forEach((word) => {
    const level = word.hskLevel;
    if (level === 1) {
      counts.totalHsk1Words++;
      // counts.hsk1Words.push(word);
    } else if (level === 2) {
      counts.totalHsk2Words++;
      // counts.hsk2Words.push(word);
    } else if (level === 3) {
      counts.totalHsk3Words++;
      // counts.hsk3Words.push(word);
    } else if (level === 4) {
      counts.totalHsk4Words++;
      // counts.hsk4Words.push(word);
    } else if (level === 5) {
      counts.totalHsk5Words++;
      // counts.hsk5Words.push(word);
    } else if (level === 6) {
      counts.totalHsk6Words++;
      // counts.hsk6Words.push(word);
    } else if (level === 9 || level === "9") {
      counts.totalHsk9Words++;
      // counts.hsk9Words.push(word);
    }
  });

  return counts;
}

function addCharacterMetrics(
  uniqueChars,
  content,
  learnedCharacters,
  sortType
) {
  return uniqueChars
    .map((char) => ({
      input: char,
      ...learnedCharacters?.[char],
      isLearned: !!learnedCharacters?.[char],
      frequency: getFrequency({ content, input: char }),
    }))
    .sort(
      sortType === "popular" ? (a, b) => b.frequency - a.frequency : () => 0
    );
}

function calculateRates(newChars, masteryChars, totalChars) {
  const total = totalChars || 1;
  return {
    understandingRate: newChars / total, // e.g. 0.75
    masteryRate: masteryChars / total, // e.g. 0.42
  };
}

function listNonHskWords({ content }) {
  const containsWords = content.transcriptions?.[0]?.words?.length > 0;

  if (containsWords) {
    const totalContentWordsRaw = content.transcriptions
      .map((transcription) => transcription.words)
      .flat();

    const nonHskWords = [
      ...new Set(totalContentWordsRaw?.map((word) => word.input)),
    ]
      .filter((item) => filterHanCharacters(item))
      .filter((item) => {
        return !hskWordsMap[item];
      });

    return nonHskWords;
  }
  return [];
}

// === MAIN ORCHESTRATOR ===
function getContentInsights({
  content,
  learnedCharacters = {},
  hskWords = totalHskWords,
  sortType = "default",
}) {
  const transcriptions = content?.transcriptions || [];
  const lang = content?.lang || transcriptions[0]?.lang;

  const totals = {
    totalSentences: transcriptions.length,

    totalCharacters: getUniqueChars(
      transcriptions.map((t) => t?.hanzi || t?.input || "")
    ),
  };

  // Characters
  const uniqueCharacters = extractUniqueChars(lang, transcriptions);
  const totalNewCharacters = uniqueCharacters.filter(
    (char) => !!learnedCharacters[char]
  ).length;
  const totalMasteryCharacters = uniqueCharacters.filter(
    (char) => learnedCharacters?.[char]?.status?.toLowerCase() === "forgotten"
  ).length;

  const rates = calculateRates(
    totalNewCharacters,
    totalMasteryCharacters,
    uniqueCharacters.length
  );

  // HSK
  const filteredHskWords = findHskWordsInContent(content);
  const hskWordsWithMetrics = addHskWordMetrics(
    filteredHskWords,
    content,
    sortType
  );
  const hskCounts = countHskLevels(hskWordsWithMetrics);

  // Character memo
  const uniqueCharactersMemo = addCharacterMetrics(
    uniqueCharacters,
    content,
    learnedCharacters,
    sortType
  );

  const nonHskWords = listNonHskWords({ content, hskWords });

  const _hskWords = [
    ...new Set(
      hskWordsWithMetrics?.map((item) => {
        return item.hanzi;
      })
    ),
  ];

  const _uniqueCharacters = [
    ...new Set(uniqueCharactersMemo.map((item) => item.input)),
  ];

  const sentences = transcriptions.map((item) => item.input);

  const insights = {
    hskWords: _hskWords,
    uniqueCharacters: _uniqueCharacters,
    totalNewCharacters,
    nonHskWords,
    sentences,

    totalUniqueCharacters: _uniqueCharacters.length,
    ...rates,
    ...totals,
    ...hskCounts,

    totalWords: [...new Set([..._hskWords, ...nonHskWords])].length,

    totalNonHskWords: nonHskWords.length,
    totalCharacters: uniqueCharacters.length,

    totalSentences: sentences.length,
  };

  return insights;
}

module.exports = {
  getContentInsights,
};
