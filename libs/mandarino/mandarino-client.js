const { mandarinoApi } = require("mandarino");
const { deepSeekApiKey, qwenApiKey } = require("../deepseek/deeseek-api-key");
const { openaiEnv } = require("../../constants/openai-env");

const mandarinoDeepseek = mandarinoApi({
  apiKey: deepSeekApiKey,
  variant: "deepseek",
});

const mandarinoOpenai = mandarinoApi({
  variant: "openai",
  apiKey: openaiEnv.apiKey,
  // apiKey: qwenApiKey,
  // variant: "qwen",
});
const mandarinoQwen = mandarinoApi({
  apiKey: qwenApiKey,
  variant: "qwen",
});

module.exports = {
  mandarinoClient: mandarinoDeepseek,
  mandarinoOpenai,
  mandarinoQwen,
  mandarinoDeepseek,
};
