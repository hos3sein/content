const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: false,
    },

    permissions: [
      {
        name: { type: String },
        serviceName: { type: String },
        prefixName: { type: String },
        funcName: { type: String },
      },
    ],
 
    autoApprove: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", GroupSchema);
