const { addContent } = require("./add-content.api");

const addContentHandler = async ({ input, lang, userId }) => {
  if (!lang) {
    const response = {
      statusCode: 404,
      body: JSON.stringify({ message: "Lang not found" }),
    };

    return response;
  }

  try {
    const newItem = await addContent({ input, lang, userId });

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
  addContentHandler,
};
