const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs");

const Resume = require("../models/Resume");
const protect = require("../middleware/protect");
const Tesseract = require("tesseract.js");

const { calculateATS } = require("../services/atsService");
const { fixBrokenWords } = require("../utils/textCleaner");

// ================= FILE UPLOAD CONFIG =================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files allowed"));
    }
    cb(null, true);
  },
});

router.get("/test", (req, res) => {
  res.json({ message: "Resume route working ✅" });
});

// ================= 🔥 SMART SKILL EXTRACTION =================
function extractSkills(text) {
  const cleanText = text
    .toLowerCase()
    .replace(/[^a-z0-9.\s]/g, " ");

  const skillMap = {
    javascript: ["javascript", "js"],
    typescript: ["typescript", "ts"],
    python: ["python"],
    java: ["java"],
    c: ["c"],
    cpp: ["c++"],
    react: ["react", "reactjs", "react.js"],
    node: ["node", "nodejs", "node.js"],
    express: ["express"],
    mongodb: ["mongodb"],
    mysql: ["mysql"],
    postgresql: ["postgresql"],
    sql: ["sql"],
    aws: ["aws"],
    azure: ["azure"],
    gcp: ["gcp"],
    docker: ["docker"],
    kubernetes: ["kubernetes"],
    git: ["git"],
    github: ["github"],
  };

  const foundSkills = [];

  Object.keys(skillMap).forEach((key) => {
    skillMap[key].forEach((variant) => {
      const regex = new RegExp(`\\b${variant}\\b`, "i");
      if (regex.test(cleanText)) {
        foundSkills.push(key);
      }
    });
  });

  return [...new Set(foundSkills)];
}

function extractHobbies(text) {
  const clean = text.toLowerCase();

  const hobbyKeywords = [
    "cricket", "football", "gaming", "reading", "music",
    "travel", "travelling", "coding", "blogging",
    "photography", "sports", "movies", "writing"
  ];

  const sectionKeywords = [
    "hobbies",
    "interests",
    "personal interests",
    "activities",
    "extracurricular"
  ];

  let found = [];

  // 🔥 STEP 1: detect section
  sectionKeywords.forEach(section => {
    if (clean.includes(section)) {
      hobbyKeywords.forEach(h => {
        if (clean.includes(h)) {
          found.push(h);
        }
      });
    }
  });

  // 🔥 STEP 2: fallback (if no section detected)
  if (found.length === 0) {
    hobbyKeywords.forEach(h => {
      if (clean.includes(h)) {
        found.push(h);
      }
    });
  }

  return [...new Set(found)];
}

function extractSoftSkills(text) {
  const softList = ["teamwork", "communication", "leadership", "problem solving"];
  const clean = text.toLowerCase();

  return softList.filter(s => clean.includes(s));
}

// ================= 🔥 ATS ANALYSIS ENGINE =================
function analyzeResume(text) {
  const cleanText = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");

  let atsScore = 0;
  let suggestions = [];

  let categoryScores = {
    skills: 0,
    structure: 0,
    experience: 0,
    impact: 0,
  };

  // 🔥 USE NEW SKILL EXTRACTOR
  const skills = extractSkills(text);

  // ================= SKILLS =================
  categoryScores.skills = Math.min(skills.length * 6, 40);
  atsScore += categoryScores.skills;

  if (skills.length < 5) {
    suggestions.push("Add more relevant technical skills.");
  }

  // ================= STRUCTURE =================
  const sections = ["education", "experience", "project", "skills"];

  sections.forEach((sec) => {
    if (cleanText.includes(sec)) {
      categoryScores.structure += 5;
    } else {
      suggestions.push(`Add ${sec} section.`);
    }
  });

  atsScore += categoryScores.structure;

  // ================= EXPERIENCE =================
  if (/\d+%|\d+\+|\d+\s+years/.test(cleanText)) {
    categoryScores.experience = 20;
  } else {
    suggestions.push("Add measurable achievements.");
  }

  atsScore += categoryScores.experience;

  // ================= IMPACT =================
  const actionWords = [
    "developed",
    "designed",
    "implemented",
    "built",
    "created",
    "optimized",
  ];

  let actionCount = 0;
  actionWords.forEach((word) => {
    if (cleanText.includes(word)) actionCount++;
  });

  if (actionCount >= 2) {
    categoryScores.impact = 15;
  } else {
    suggestions.push("Use strong action verbs.");
  }

  atsScore += categoryScores.impact;

  // ================= CONTACT =================
  if (cleanText.includes("@")) {
    atsScore += 5;
  } else {
    suggestions.push("Add email address.");
  }

  // 🔥 BOOST if good resume
  if (skills.length >= 8) atsScore += 10;

  atsScore = Math.min(atsScore, 100);

  return {
    atsScore,
    categoryScores,
    suggestions,
    skills,
  };
}

function getFeedback(score) {
  if (score >= 80) return "Excellent Resume 🚀";
  if (score >= 60) return "Good Resume 👍";
  if (score >= 40) return "Needs Improvement ⚠️";
  return "Poor Resume ❌";
}

// ================= UPLOAD ROUTE =================
router.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const buffer = fs.readFileSync(req.file.path);

    let text = "";

    // 🔥 STEP 1: Extract PDF text
   console.log("🚀 Request received");

const pdfData = await pdfParse(buffer);

// 🔥 TEMP: disable OCR
text = pdfData.text;

console.log("📄 TEXT LENGTH:", text.length);
console.log("📄 SAMPLE:", text.substring(0, 100));

    // 🔥 STEP 2: Fix broken text
    text = fixBrokenWords(text);

    console.log("📄 FINAL TEXT SAMPLE:", text.substring(0, 200));

    // 🔥 STEP 3: ATS ENGINE
    const result = calculateATS(text);
    const hobbies = extractHobbies(text);
const softSkills = extractSoftSkills(text);
    if (!result.suggestions || result.suggestions.length === 0) {
  result.suggestions = [
    "✅ Your resume is strong. No major improvements needed."
  ];
}
console.log("✅ ATS DONE");
console.log("SCORE:", result.score);
console.log("SKILLS:", result.skills);



    // 🔥 STEP 4: SEND RESPONSE
res.json({
  message: "ATS completed",
  score: result.score,
  skills: result.skills,
  hobbies: hobbies,            // ✅ ADD
  softSkills: softSkills,      // ✅ ADD
  suggestions: result.suggestions,
  categoryScores: result.categoryScores,
  feedback: getFeedback(result.score)
});

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= GET USER RESUME =================
router.get("/my", protect, async (req, res) => {
  const resume = await Resume.findOne({ userId: req.user.id });

  if (!resume)
    return res.status(404).json({ message: "No resume found." });

  res.json(resume);
});

module.exports = router;