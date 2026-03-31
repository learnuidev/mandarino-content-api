const { _12371Parser } = require("./12371/12371-parser");
const { is12371 } = require("./12371/is-12371");
const { deepseekParser } = require("./deepseek/deepseek-parser");
const { isDeepseek } = require("./deepseek/utils/is-deepseek");
const {
  fChinaParserWithImages,
} = require("./f-china/f-china-parser-with-images");
const { isFChina } = require("./f-china/utils/is-fchina");
const { gitbookParser } = require("./gitbook/gitbook-parser");
// const { gitbookParser } = require("./gitbook/lili-21-parser");
const { isGitbook } = require("./gitbook/utils/is-gitbook");
const { lili21Parser } = require("./lili21/lili-21-parser");
const { isLili21 } = require("./lili21/utils/is-lili21");
const { openAiZhParser } = require("./openai-zh/openai-zh-parser");
const { isOpenAiXinishu } = require("./openai-zh/utils/is-open-ai-xiniushu");
const { pekingParser } = require("./peking-university/peking-parser");
const { isPeking } = require("./peking-university/utils/is-peking");
const { peopleCnParser } = require("./people-cn/people-cn-parser");
const { isPeopleCn } = require("./people-cn/utils/is-people-cn");
const { qiqushiParser } = require("./qigushi/qigushi-parser");
const { isQigushi } = require("./qigushi/utils/is-qigushi");
const { qqParser } = require("./qq/qq-parser");
const { isQq } = require("./qq/utils/is-qq");
const { reactParser } = require("./react/react-parser");
const { isReact } = require("./react/utils/is-react");
const { isNewsCn } = require("./xinhuanet/utils/is-news-cn");
const { isXinhuaPolitics } = require("./xinhuanet/utils/is-xinhua-politics");
const { isXinhuanet } = require("./xinhuanet/utils/is-xinhuanet");
const {
  xinhuaParserWithImages,
} = require("./xinhuanet/xinhua-parser-with-images");
const {
  xinhuaParserWithImagesAndAudio,
} = require("./xinhuanet/xinhua-parser-with-images-and-audio");
const { xinhuaPoliticsParser } = require("./xinhuanet/xinhua-politics-parser");

// eslint-disable-next-line no-unused-vars
const htmlParser = async ({ url }, options = {}) => {
  if (isDeepseek(url)) {
    return {
      sourceId: "deepseek-docs",
      url,
      data: await deepseekParser({ url }),
    };
  }
  if (isQq(url)) {
    return {
      sourceId: "qq",
      url,
      data: await qqParser({ url }),
    };
  }
  if (isPeking(url)) {
    return {
      sourceId: "peking",
      url,
      data: await pekingParser({ url }),
    };
  }
  if (is12371(url)) {
    return {
      sourceId: "12371",
      url,
      data: await _12371Parser({ url }),
    };
  }
  if (isReact(url)) {
    return {
      sourceId: "react",
      url,
      data: await reactParser({ url }),
    };
  }
  if (isGitbook(url)) {
    return {
      sourceId: "gitbook",
      url,
      data: await gitbookParser({ url }),
    };
  }
  if (isLili21(url)) {
    return {
      sourceId: "lili21",
      url,
      data: await lili21Parser({ url }),
    };
  }
  if (isOpenAiXinishu(url)) {
    return {
      sourceId: "openai",
      url,
      data: await openAiZhParser(url),
    };
  }
  if (isQigushi(url)) {
    return {
      sourceId: "qigushi",
      url,
      data: await qiqushiParser({ url }),
    };
  }

  if (isPeopleCn(url)) {
    return {
      sourceId: "people.cn",
      type: "not-supported",
      messsage:
        "Not supported. Website uses invalid charset: 'text/html;charset=GB2312'",
      url,
      data: await peopleCnParser({ url }),
    };
  }

  if (isFChina(url)) {
    return {
      sourceId: "fchina",
      url,
      data: await fChinaParserWithImages({ url }),
    };
  }

  if (isXinhuanet(url)) {
    if (isNewsCn(url)) {
      return {
        sourceId: "xinhuanet:newscn",
        url,
        data: await xinhuaParserWithImagesAndAudio({ url }),
      };
    }

    if (isXinhuaPolitics(url)) {
      return {
        sourceId: "xinhuanet:politics",
        type: "not-supported",
        message: "Not supported. Unable to parse website",
        url,
        data: await xinhuaPoliticsParser({ url }),
      };
    }
    return {
      sourceId: "xinhuanet",
      url,
      data: await xinhuaParserWithImages({ url }),
    };
  }

  return {
    sourceId: "unknown",
    url,
  };
};

module.exports = {
  htmlParser,
};

// htmlParser({
//   url: "https://news.pku.edu.cn/xwzh/dee18914f3534736801e98159a39608c.htm",
// }).then((res) => {
//   console.log("RES", res);
// });
