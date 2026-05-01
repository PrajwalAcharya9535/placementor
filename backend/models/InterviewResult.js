const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  skill: String,

  knowledge: Number,

  confidence: Number,

  communication: Number,

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("InterviewResult", resultSchema);