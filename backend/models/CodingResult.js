const mongoose = require("mongoose");

const codingResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CodingQuestion"
  },
  language: String,
  passed: Number,
  total: Number,
  score: Number,
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("CodingResult", codingResultSchema);