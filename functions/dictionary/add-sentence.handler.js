const { addSentence } = require("./add-sentence.api");

const addSentenceHandler = async ({ input, lang, contentId }) => {
  if (!lang) {
    const response = {
      statusCode: 404,
      body: JSON.stringify({ message: "Lang not found" }),
    };

    return response;
  }
  if (!contentId) {
    const response = {
      statusCode: 404,
      body: JSON.stringify({ message: "Content ID not found" }),
    };

    return response;
  }

  try {
    const newItem = await addSentence({ input, contentId, lang });

    const response = {
      statusCode: 200,
      body: JSON.stringify(newItem),
    };
    return response;
  } catch (err) {
    const response = {
      statusCode: 400,
      body: JSON.stringify({
        message: err.message,
      }),
    };
    return response;
  }
};

module.exports = {
  addSentenceHandler,
};
