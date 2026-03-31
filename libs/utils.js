/* eslint-disable no-unused-vars */
const removeNull = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, v]) => {
      if (typeof v === "boolean") {
        return true;
      }
      return Boolean(v);
    })
  );
};

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
  }
}

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = "BadRequestError";
  }
}

module.exports = {
  removeNull,
  NotFoundError,
  BadRequestError,
};
