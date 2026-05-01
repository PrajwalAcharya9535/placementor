const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema({
  input: String,
  expected: String,
  type: String // "visible" or "hidden"
});

const codingQuestionSchema = new mongoose.Schema({
  title: String,
  description: String,
  example: String,
  testCases: [testCaseSchema]
});

module.exports = mongoose.model("CodingQuestion", codingQuestionSchema);