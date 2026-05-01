const mongoose = require("mongoose");

const technicalQuestionSchema = new mongoose.Schema({
  title: String,
  description: String,
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"]
  },
  sampleInput: String,
  sampleOutput: String,

  // ✅ ADD THIS
  solution: {
    python: String,
    java: String,
    cpp: String
  },

  visibleTestCases: [
    {
      input: String,
      expectedOutput: String
    }
  ],
  hiddenTestCases: [
    {
      input: String,
      expectedOutput: String
    }
  ]
});

module.exports = mongoose.model("TechnicalQuestion", technicalQuestionSchema);