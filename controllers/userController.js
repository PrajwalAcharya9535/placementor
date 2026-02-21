const User = require("../models/User");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const pdf = require("pdf-parse");

// ================= SKILL DATABASE =================
const skillDatabase = [
  "Java",
  "Python",
  "C",
  "C++",
  "JavaScript",
  "React",
  "Node.js",
  "MongoDB",
  "MySQL",
  "HTML",
  "CSS",
  "Express",
  "Machine Learning",
  "Data Structures",
  "Spring Boot",
  "SQL",
  "Git",
  "Angular",
  "TypeScript",
  "Bootstrap",
  "AWS",
  "Docker",
  "PHP"
];

// ================= REGISTER =================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      userId: user._id
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= UPLOAD RESUME + ATS =================
const uploadResume = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = `uploads/${req.file.filename}`;
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text.toLowerCase();

    // Skill Extraction
    const detectedSkills = skillDatabase.filter(skill =>
      text.includes(skill.toLowerCase())
    );

    // ===== ATS SCORING =====
    let keywordScore = Math.min(detectedSkills.length * 5, 40);

    let sectionScore = 0;
    if (text.includes("education")) sectionScore += 5;
    if (text.includes("skills")) sectionScore += 5;
    if (text.includes("project")) sectionScore += 5;
    if (text.includes("experience")) sectionScore += 5;

    let lengthScore = 10; // basic resume length assumption

    const atsScore = keywordScore + sectionScore + lengthScore;

    // Suggestions
    let suggestions = [];
    if (detectedSkills.length < 5)
      suggestions.push("Add more relevant technical skills.");
    if (!text.includes("project"))
      suggestions.push("Include a projects section.");
    if (!text.includes("experience"))
      suggestions.push("Add internship or work experience.");

    // Update DB
    const user = await User.findByIdAndUpdate(
      userId,
      {
        resume: req.file.filename,
        skills: detectedSkills,
        atsScore: atsScore
      },
      { returnDocument: "after" }
    );

    res.status(200).json({
      message: "Resume uploaded & analyzed successfully",
      skills: detectedSkills,
      atsScore,
      analysis: {
        keywordScore,
        sectionScore,
        lengthScore,
        suggestions
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= JOB MATCH ENGINE =================
const matchJobDescription = async (req, res) => {
  try {
    const userId = req.params.id;
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resumeSkills = user.skills || [];
    const jdText = jobDescription.toLowerCase();

    const matchedSkills = resumeSkills.filter(skill =>
      jdText.includes(skill.toLowerCase())
    );

    const missingSkills = skillDatabase.filter(skill =>
      jdText.includes(skill.toLowerCase()) &&
      !resumeSkills.includes(skill)
    );

    const totalRelevant = matchedSkills.length + missingSkills.length;

    const matchScore = totalRelevant === 0
      ? 0
      : Math.round((matchedSkills.length / totalRelevant) * 100);

    user.jobDescription = jobDescription;
    user.matchedSkills = matchedSkills;
    user.missingSkills = missingSkills;
    user.matchScore = matchScore;

    await user.save();

    res.status(200).json({
      message: "Job match analysis completed",
      matchScore,
      matchedSkills,
      missingSkills
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  uploadResume,
  matchJobDescription
};