const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  // Basic Info
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  // Resume Data
  resume: {
    type: String
  },

  skills: [
    {
      type: String
    }
  ],

  // Basic ATS Score (Generic Resume Analysis)
  atsScore: {
    type: Number
  },

  // Job Matching System
  jobDescription: {
    type: String
  },

  matchedSkills: [
    {
      type: String
    }
  ],

  missingSkills: [
    {
      type: String
    }
  ],

  matchScore: {
    type: Number
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);