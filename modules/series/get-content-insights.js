const totalHskWords = require("../../data/hsk-words").totalHskWords;

const hskWordsMap = require("../../data/hsk-words-map").hskWordsMap;

// === UTILITIES ===
function filterHanCharacters(char) {
  return /[\u4e00-\u9fff]/.test(char) ? char : "";
}

function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
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
    if (level === 1) counts.totalHsk1Words++;
    else if (level === 2) counts.totalHsk2Words++;
    else if (level === 3) counts.totalHsk3Words++;
    else if (level === 4) counts.totalHsk4Words++;
    else if (level === 5) counts.totalHsk5Words++;
    else if (level === 6) counts.totalHsk6Words++;
    else if (level === 9 || level === "9") counts.totalHsk9Words++;
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
  const formatter = new Intl.NumberFormat("en-GB", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });

  return {
    understandingRate: formatter.format(newChars / (totalChars || 1)),
    masteryRate: formatter.format(masteryChars / (totalChars || 1)),
  };
}

function listNonHskWords({ content, hskwords }) {
  // console.log("CONNTENT", content.transcriptions[0]);

  const containsWords = content.transcriptions?.[0]?.words?.length > 0;

  if (containsWords) {
    const totalContentWordsRaw = content.transcriptions
      .map((transcription) => transcription.words)
      .flat();

    const totalContentWords = totalContentWordsRaw
      .filter((item) => filterHanCharacters(item.input))
      .filter((item) => {
        return !hskWordsMap[item.input];
      });

    return totalContentWords;
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

  // Totals
  const allText = transcriptions
    .map((t) => t?.hanzi || t?.input || "")
    .join(" ");
  const totals = {
    totalSentences: transcriptions.length,
    totalWords: countWords(allText),
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

  return {
    totalNewCharacters,
    filteredHskWords: hskWordsWithMetrics,
    uniqueCharacters: uniqueCharactersMemo,
    nonHskWords,

    ...rates,
    ...totals,
    ...hskCounts,
    totalNonHskWords: nonHskWords.length,
  };
}

module.exports = {
  getContentInsights,
};
