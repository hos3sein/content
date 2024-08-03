const mongoose = require("mongoose");

const SearchHistorySchema = new mongoose.Schema(
  {
    me: {
      type: mongoose.Schema.ObjectId,
    },
    history: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SearchHistory", SearchHistorySchema);
