const mongoose = require("mongoose");

const BadWords = new mongoose.Schema(
  {
    badWords:[
      {
        id:{type:Number},
        word:{type:String},
        lang:{type:String},
        _id:false
      }
    ]
  },
);

module.exports = mongoose.model("BadWords",BadWords);
