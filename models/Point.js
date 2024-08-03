const mongoose = require("mongoose");

const PointSchema = new mongoose.Schema(
  {
    like: {
      type: Number,
    },
    comment: {
      type: Number,
    },

    createForum: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Point", PointSchema);
