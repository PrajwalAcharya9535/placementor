const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ================= DEBUG =================
console.log("🔐 MONGO URI:", process.env.MONGO_URI);

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= ROUTES =================
// ⚠️ NO "backend/" because this file is already inside backend

const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const aptitudeRoutes = require("./routes/aptitudeRoutes");
const technicalRoutes = require("./routes/technicalRoutes");
const hrRoutes = require("./routes/hrRoutes");
const finalRoutes = require("./routes/finalRoutes");

// ================= API ROUTES =================
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/aptitude", aptitudeRoutes);
app.use("/api/technical", technicalRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/final", finalRoutes);

// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("🚀 Backend is running...");
});

app.post("/api/evaluate", (req, res) => {
  const { answer, question } = req.body;

  let score = 0;
  let feedback = "Try to improve your answer";

  // ✅ simple logic (demo AI)

  if (!answer || answer.length < 5) {
    score = 0;
    feedback = "Answer too short ❌";
  }
  else if (answer.length > 10) {
    score = 1;
    feedback = "Good answer 👍";
  }

  if (answer.toLowerCase().includes("example")) {
    score = 2;
    feedback = "Excellent answer with example 💯";
  }

const extractedSkills = ["Python", "React", "MongoDB"];
const extractedHobbies = ["Cricket", "Reading"];
const extractedSoftSkills = ["Teamwork", "Communication"];

res.json({
  score: score,
  skills: extractedSkills,
  hobbies: extractedHobbies,
  softSkills: extractedSoftSkills
});
});



// ================= DATABASE + SERVER =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(5000, () => {
      console.log("🔥 Server running on http://localhost:5000");
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB Error:", err);
  });