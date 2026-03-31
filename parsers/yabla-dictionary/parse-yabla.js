const chineseYablaDictionaryUrl = `https://chinese.yabla.com/chinese-english-pinyin-dictionary.php`;

const xRay = require("x-ray");
const x = xRay();

const trimString = (str) => str.replaceAll("↵", "").trim();

const MAX_LENGTH = 200;

const listYablaSingle = async (hanzi) => {
  const searchParams = new URLSearchParams();

  searchParams.set("define", hanzi);
  const url = `${chineseYablaDictionaryUrl}?${searchParams?.toString()}`;

  const children = await x(url, {
    content: x(".new_word", [
      {
        // type: "string",
        hanzi: x("tr > .word"),
        pinyin: x("tr > .pinyin"),
        en: x("tr > .meaning"),
      },
    ]),
  });

  const dictionary = children.content;

  if (!dictionary?.length) {
    const children = await x(url, {
      content: x("#search_results > *", [
        {
          // type: "string",
          hanzi: x(".word"),
          pinyin: x(".pinyin"),
          en: x(".meaning"),
        },
      ]),
    });

    return children.content;
  }

  return dictionary;
};

async function listYablaBatch(hanzi) {
  const sents = hanzi?.split("。").map((x) => `${x}。`);

  const sentsDict = await Promise.all(
    sents?.map(async (sent) => {
      return await listYablaSingle(sent);
    })
  );

  return sentsDict.flat();
}

const listYablaDictionary = async (hanzi) => {
  if (hanzi?.length > MAX_LENGTH) {
    return listYablaBatch(hanzi);
  }

  return listYablaSingle(hanzi);
};

const parseYabla = async (hanzi) => {
  const dictionary = await listYablaDictionary(hanzi);

  if (dictionary?.length === 1) {
    return dictionary?.map((dict) => {
      return {
        ...dict,
        hanzi: trimString(hanzi),
        startingIndex: 0,
        endingIndex: hanzi?.length - 1,
      };
    });
  }

  const dictionaryWithIndex = dictionary?.reduce(
    (acc, curr) => {
      const remainingString = hanzi?.slice(acc?.startingIndex, hanzi?.length);

      const indexOf = remainingString?.indexOf(curr?.hanzi) + acc.startingIndex;

      const res = {
        ...curr,
        startingIndex: indexOf,
        endingIndex: curr?.hanzi?.length + indexOf - 1,
        offset: curr?.hanzi?.length,
      };

      return {
        ...acc,
        acc: acc.acc.concat(res),
        hanzi: acc?.hanzi?.slice(curr?.hanzi?.length),
        startingIndex: acc?.startingIndex + curr?.hanzi?.length,
        previousIndex: acc?.previousIndex + indexOf,
      };
    },
    {
      acc: [],
      hanzi,
      startingIndex: 0,
      previousIndex: 0,
    }
  )?.acc;

  const _missingIndexes = hanzi
    ?.split("")
    .map((x, idx) => {
      const isFound = dictionaryWithIndex?.find(
        (dict) => dict?.startingIndex <= idx && idx <= dict?.endingIndex
      );
      if (isFound) {
        return null;
      }

      return {
        hanzi: x,
        startingIndex: idx,
        endingIndex: idx + x?.length - 1,
        offset: x?.length,
      };
    })
    .reduce(
      (acc, curr, idx, ctx) => {
        if (!curr && !acc?.curr) {
          return acc;
        }

        if (!curr && acc?.curr) {
          return {
            ...acc,
            acc: acc?.acc?.concat(acc?.curr),
            curr: null,
          };
        }

        if (curr && !acc?.curr) {
          return {
            ...acc,
            curr: {
              ...curr,
              startingIndex: curr?.startingIndex,
              endingIndex: curr?.endingIndex,
            },
          };
        }

        if (curr && acc?.curr) {
          return {
            ...acc,
            curr: {
              ...acc?.curr,
              hanzi: `${acc?.curr?.hanzi}${curr?.hanzi}`,
              startingIndex: acc?.curr?.startingIndex,
              endingIndex: acc?.curr?.endingIndex + curr?.hanzi?.length,
            },
          };
        }
      },
      {
        curr: null,
        acc: [],
      }
    );

  const missingIndexes = _missingIndexes?.acc?.concat(_missingIndexes?.curr);

  const tones = [
    ...new Set(
      [...dictionaryWithIndex, ...missingIndexes]
        .sort((a, b) => a?.startingIndex - b?.startingIndex)
        ?.map((val) => JSON.stringify(val))
    ),
  ]
    .map((x) => JSON.parse(x))
    ?.map((item, idx, vals) => {
      if (item?.en) {
        return item;
      }

      const containsItem = vals?.filter((v) => v?.hanzi === item?.hanzi)?.[0];

      if (containsItem) {
        return {
          ...containsItem,
          ...item,
        };
      }

      return item;
    })
    ?.filter((item) => item?.hanzi)
    ?.map((x) => {
      return {
        ...x,
        hanzi: trimString(x.hanzi),
      };
    });

  if (tones.every((tone) => tone?.hanzi === hanzi)) {
    return [tones?.[0]];
  }

  return tones;
};

module.exports = {
  parseYabla,
};

// console.log("crypto", crypto.randomUUID());

// parseYabla(
//   // `饮水机每天能服务多少用户数，当然要靠自我奋斗，但也要考虑摆放的位置。放在家里就是一家人用，放在公司里就是一个公司的人用，怎么才能让更多人来使用它呢？没错，把它放到地铁站。广州体育西路站是中国最繁忙的地铁站之一，2017 年单日客运量最高近 85 万人次，每月 2550 万人次。`
//   `狐假虎威`
// ).then((res) => {
//   console.log("RES", JSON.stringify(res, null, 4));
// });
