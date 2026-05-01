const { cleanText } = require("../utils/textCleaner");

// 🔥 SKILL DATABASE (you can extend anytime)
const skillDB = [
  "javascript","react","node","express",
  "mongodb","mysql","sql","postgresql",
  "aws","azure","gcp",
  "docker","kubernetes",
  "git","github",
  "python","java","c","c++"
];

// 🔥 Extract skills using regex
function extractSkills(text) {
  const found = [];

  skillDB.forEach(skill => {
    const regex = new RegExp(`\\b${skill}\\b`, "i");
    if (regex.test(text)) {
      found.push(skill);
    }
  });

  return [...new Set(found)];
}

// 🔥 Main ATS calculation
function calculateATS(text) {
  const clean = cleanText(text);

  let score = 0;
  let suggestions = [];

  const skills = extractSkills(clean);

  // ================= SKILLS =================
  let skillScore = Math.min(skills.length * 6, 40);
  score += skillScore;

  if (skills.length < 5) {
    suggestions.push("Add more technical skills");
  }

  // ================= STRUCTURE =================
  const sections = ["education", "experience", "project", "skills"];

  let structureScore = 0;

  sections.forEach(sec => {
    if (clean.includes(sec)) structureScore += 5;
    else suggestions.push(`Add ${sec} section`);
  });

  score += structureScore;

  // ================= EXPERIENCE =================
  if (/\d+%|\d+\+|\d+\s+years/.test(clean)) {
    score += 20;
  } else {
    suggestions.push("Add measurable achievements");
  }

  // ================= ACTION WORDS =================
  const actions = ["developed","built","designed","implemented"];

  let actionCount = actions.filter(a => clean.includes(a)).length;

  if (actionCount >= 2) score += 15;
  else suggestions.push("Use strong action verbs");

  // ================= EMAIL =================
  if (clean.includes("@")) score += 5;
  else suggestions.push("Add email address");

  score = Math.min(score, 100);

  return {
    score,
    skills,
    suggestions
  };
}

module.exports = { calculateATS };