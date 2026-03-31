const { getDictionaryItem } = require("./get-dictionary-item.api");
const { addDictionaryItem } = require("./add-dictionary-item.api");

const addToDictionaryHandler = async ({ input, lang, userId, context }) => {
  if (!lang) {
    const response = {
      statusCode: 404,
      body: JSON.stringify({ message: "Lang not found" }),
    };

    return response;
  }

  const dictionaryItem = await getDictionaryItem({ input, lang });

  if (dictionaryItem) {
    const response = {
      statusCode: 200,
      body: JSON.stringify(dictionaryItem),
    };

    return response;
  }

  try {
    const newItem = await addDictionaryItem({ input, lang, userId, context });

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
  addToDictionaryHandler,
};
