const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  atsScore: Number,
  categoryScores: {
    skills: Number,
    structure: Number,
    experience: Number,
    impact: Number
  },
  suggestions: [String],
  extractedSkills: {
    programming: [String],
    frameworks: [String],
    databases: [String],
    cloud: [String],
    tools: [String]
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Resume", resumeSchema);