const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    text: {
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

    contentId: {
      type: mongoose.Schema.ObjectId,
      ref: "Content",
    },

    responseTo: {
      _id: { type: mongoose.Schema.ObjectId },
      writerResponseToId: { type: mongoose.Schema.ObjectId },
      username: { type: String },
      pictureProfile: { type: String },
    },

    replay: [
      {
        replayWriter: { type: mongoose.Schema.ObjectId },
        replayId: { type: mongoose.Schema.ObjectId},
        username: { type: String },
        pictureProfile: { type: String },
        text:{type:String},
        createdAt:{type:String},
        _id: false,  
      },
      
    ],

    replayLength: {
      type: Number,
      default: 0,
    },

    likeLength: {
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

module.exports = mongoose.model("Comment", CommentSchema);
