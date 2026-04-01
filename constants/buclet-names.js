require("dotenv").config();

/* eslint-disable no-undef */

const bucketNames = {
  assetBucket: process.env.ASSETS_BUCKET,
};

module.exports = {
  bucketNames,
};
