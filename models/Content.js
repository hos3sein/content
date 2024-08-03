const mongoose = require("mongoose");

const ContentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    photo: [String],
    video: [String],
    voice: [String],
    file: [String],

    input: [
      {
        index: Number,
        text: String,
        image: String,
        _id: false,
      },
    ],
    approve: {
      type: Boolean,
    },
    category: {
      type: String,
    },
    writer: {
      _id: { type: mongoose.Schema.ObjectId },
      username: { type: String },
      pictureProfile: { type: String },
    },

    like: [
      {
        _id: { type: mongoose.Schema.ObjectId },
        username: { type: String },
        pictureProfile: { type: String },
      },
    ],

    disLike: [
      {
        _id: { type: mongoose.Schema.ObjectId },
        username: { type: String },
        pictureProfile: { type: String },
      },
    ],
    comments: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Comment",
      },
    ],

    likeLength: {
      type: Number,
      default: 0,
    },
    commentLength: {
      type: Number,
      default: 0,
    },

    reportLength: {
      type: Number,
      default: 0,
    },
    isSuspend: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Content", ContentSchema);
