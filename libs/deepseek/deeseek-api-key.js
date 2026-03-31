require("dotenv").config();

const deepSeekApiKey = process.env.DEEPSEEK_API_KEY;
const moonshotApiKey = process.env.MOONSHOT_API_KEY;

const qwenApiKey = process.env.QWEN_API_KEY;

const mistralApiKey = process.env.MISTRAL_API_KEY;
const openAIApiKey = process.env.OPENAI_API_KEY;

module.exports = {
  deepSeekApiKey,
  openAIApiKey,
  qwenApiKey,
  moonshotApiKey,
  mistralApiKey,
};
