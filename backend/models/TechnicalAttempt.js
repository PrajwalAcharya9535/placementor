const mongoose = require("mongoose");

const technicalAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TechnicalQuestion"
  },
  language: String,
  score: Number,
  passedVisible: Number,
  passedHidden: Number,
  totalCases: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("TechnicalAttempt", technicalAttemptSchema);