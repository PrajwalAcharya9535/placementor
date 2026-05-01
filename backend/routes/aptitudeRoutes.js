const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");

const {
  startTest,
  submitTest,
  getBestScore,
  getLeaderboard
} = require("../controllers/aptitudeController");


const Question = require("../models/Question");


// Start Aptitude Test
router.post("/start", protect, startTest);


// Submit Test
router.post("/submit", protect, submitTest);


// Get Best Score
router.get("/best-score", protect, getBestScore);


// Get Leaderboard
router.get("/leaderboard", protect, getLeaderboard);


// 🔹 Get all aptitude questions
router.get("/questions", async (req, res) => {
  try {

    const questions = await Question.aggregate([
      { $sample: { size: 10 } }
    ]);

    const formatted = questions.map((q, index) => {

      const correctValue = q.options[q.correctAnswer];

      const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

      const newAnswerIndex = shuffledOptions.indexOf(correctValue);

      return {
        id: index + 1,
        question: q.question,
        options: shuffledOptions,
        answer: newAnswerIndex,
        explanation: q.explanation
      };
    });

    res.json(formatted);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;