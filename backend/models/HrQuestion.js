const mongoose = require("mongoose");

const hrQuestionSchema = new mongoose.Schema({

  skill: {
    type: String,
    required: true
  },

  question: {
    type: String,
    required: true
  },

  difficulty: {
    type: String,
    enum: ["easy","medium","hard"],
    required: true
  }

});

module.exports = mongoose.model("HrQuestion", hrQuestionSchema);