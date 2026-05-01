const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false   // keep false until login fully connected
  },

  score: {
    type: Number,
    required: true
  },

  totalQuestions: {
    type: Number,
    required: true
  },

  percentage: {
    type: Number,
    required: true
  },

  results: [
    {
      questionId: mongoose.Schema.Types.ObjectId,
      questionText: String,
      options: [String],
      selectedOption: String,
      correctAnswer: String,
      explanation: String,
      difficulty: String,
      isCorrect: Boolean
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Result", resultSchema);