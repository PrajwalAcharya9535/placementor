const mongoose = require("mongoose");

const technicalResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TechnicalQuestion",
    required: true
  },
  code: {
    type: String,
    required: true
  },
  totalTestCases: Number,
  passed: Number,
  score: Number,
  status: String,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("TechnicalResult", technicalResultSchema);