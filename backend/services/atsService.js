const { cleanText } = require("../utils/textCleaner");

// 🔥 SKILL DATABASE (extend anytime)
const skillDB = [

  // 🔹 Programming Languages
  "c","c++","java","python","javascript","typescript","go","rust","php","ruby",

  // 🔹 Frontend
  "html","html5","css","css3","sass","bootstrap","tailwind",
  "react","react.js","angular","vue","next.js",

  // 🔹 Backend
  "node","nodejs","node.js","express","spring","springboot","django","flask","laravel",

  // 🔹 Databases
  "mysql","mongodb","postgresql","sql","sqlite","firebase","redis","oracle",

  // 🔹 Tools
  "git","github","gitlab","bitbucket",
  "postman","swagger","jira","figma","canva",

  // 🔹 Cloud & DevOps
  "aws","azure","gcp","docker","kubernetes","jenkins","nginx","linux",

  // 🔹 Data / ML (MCA students sometimes)
  "pandas","numpy","matplotlib","tensorflow","scikit","machine learning","deep learning",

  // 🔹 Concepts
  "data structures","algorithms","oops","dbms","operating system","computer networks",

  // 🔹 APIs & Auth
  "rest api","graphql","jwt","oauth","authentication",

  // 🔹 Others
  "web development","full stack","mern","mean"
];


function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractSkillsSection(text) {
  const match = text.match(/skills[\s\S]*?(education|experience|projects|$)/i);
  return match ? match[0] : text;
}


function extractSkills(text) {
  const found = [];

  skillDB.forEach(skill => {
    const safeSkill = escapeRegex(skill);   // ✅ FIX
const regex = new RegExp(`\\b${safeSkill}\\b`, "i");
    if (regex.test(text)) {
      found.push(skill);
    }
  });

  return [...new Set(found)];
}


function calculateATS(text) {
  console.log("📄 TEXT LENGTH:", text.length);
console.log("📄 TEXT SAMPLE:", text.substring(0, 200));

  const clean = cleanText(text);

  let score = 20;
  let suggestions = [];

  // 🔥 SKILLS
  const skillsSection = extractSkillsSection(clean);
  const skills = extractSkills(skillsSection);

  let skillScore = Math.min(skills.length * 5, 30);
  score += skillScore;

  if (skills.length < 5) {
    suggestions.push("Add more relevant technical skills based on your domain");
  }

  // 🔥 STRUCTURE CHECK (REAL ATS)
  const sections = ["education", "experience", "project", "projects", "skills"];
  let structureScore = 0;

 sections.forEach(sec => {
  if (clean.includes(sec)) {
    structureScore += 5;
  } else {
    structureScore += 2; // 🔥 partial score
  }
});

  score += structureScore;

  if (structureScore < 15) {
    suggestions.push("Ensure proper resume sections like Education, Projects, Skills");
  }

  // 🔥 FRESHER SAFE EXPERIENCE CHECK
  const hasExperience = clean.includes("experience");

  if (hasExperience) {
   if (/\d+%|\d+\+|\d+\s+years/.test(clean)) {
  score += 20;
} else {
  score += 10; // 🔥 partial score for freshers
}
  } else {
    // fresher safe
    if (!clean.includes("project")) {
      suggestions.push("Add projects section (important for freshers)");
    }
  }

  // 🔥 ACTION WORDS
  const actions = ["developed","built","designed","implemented","created"];

  let actionCount = actions.filter(a => clean.includes(a)).length;

  if (actionCount >= 2) {
    score += 10;
  } else {
    suggestions.push("Use strong action verbs like Developed, Built, Designed");
  }

  // 🔥 CONTACT CHECK
  if (clean.includes("@")) {
    score += 5;
  } else {
    suggestions.push("Add email address");
  }

  // 🔥 BONUS (GOOD RESUME)
  if (skills.length >= 8 && structureScore >= 15) {
    score += 10;
  }

  score = Math.min(score, 100);

  return {
    score,
    skills,
    suggestions
  };
}

module.exports = { calculateATS };