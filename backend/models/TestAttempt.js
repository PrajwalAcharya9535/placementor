const mongoose = require("mongoose");

const testAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  score: Number,
  totalQuestions: Number,
  percentage: Number,
  timeTaken: Number,
  performanceMessage: String,
  answers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    selectedAnswer: String,
    isCorrect: Boolean
  }],
  completed: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("TestAttempt", testAttemptSchema);