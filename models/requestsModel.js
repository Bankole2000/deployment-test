const mongoose = require("mongoose");

const requestsModel = new mongoose.Schema({
  addedAt: { type: Date, default: Date.now },
  song: {
    type: String,
  },
  singer: {
    type: String,
  },
  isFulfilled: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("requests", requestsModel);
