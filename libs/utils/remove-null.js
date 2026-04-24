/* eslint-disable no-unused-vars */
const removeNull = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, v]) => {
      if (typeof v === "boolean") {
        return true;
      }
      return Boolean(v);
    }),
  );
};
