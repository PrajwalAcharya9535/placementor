const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    validate: v => v.length === 4
  },
  correctAnswer: {
    type: Number,   // 🔥 FIXED
    required: true
  },
  explanation: {
    type: String,
    required: true
  }

});

module.exports = mongoose.model("Question", questionSchema);