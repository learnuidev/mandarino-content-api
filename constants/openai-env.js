/* eslint-disable no-undef */
require("dotenv").config();

const openaiEnv = {
  apiKey: process.env.OPENAI_API_KEY,
};

const moonshotApiKey = process.env.MOONSHOT_API_KEY;

module.exports = {
  openaiEnv,
  moonshotApiKey,
};
