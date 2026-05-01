const Question = require("../models/Question");
const TestAttempt = require("../models/TestAttempt");
const User = require("../models/User");

/////////////////////////////////////////////////////
// START TEST
/////////////////////////////////////////////////////

const startTest = async (req, res) => {
  try {

    // Prevent multiple attempts
    const alreadyAttempted = await TestAttempt.findOne({
      user: req.user._id
    });

    if (alreadyAttempted) {
      return res.status(400).json({
        message: "You have already completed the aptitude test."
      });
    }

    const easy = await Question.aggregate([
      { $match: { difficulty: "easy" } },
      { $sample: { size: 10 } }
    ]);

    const medium = await Question.aggregate([
      { $match: { difficulty: "medium" } },
      { $sample: { size: 6 } }
    ]);

    const hard = await Question.aggregate([
      { $match: { difficulty: "hard" } },
      { $sample: { size: 4 } }
    ]);

    let questions = [...easy, ...medium, ...hard];

    // Shuffle
    questions = questions.sort(() => Math.random() - 0.5);
    // 🔀 Shuffle options inside each question
questions = questions.map(q => {
  const shuffled = [...q.options].sort(() => Math.random() - 0.5);

  return {
    ...q,
    options: shuffled,
    correctAnswer: q.correctAnswer // keep same VALUE, not index
  };
});

    // Remove correct answers before sending
    const safeQuestions = questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty
    }));

    res.json({
      total: 20,
      timeLimit: "30 minutes",
      questions: safeQuestions
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// SUBMIT TEST
/////////////////////////////////////////////////////

const submitTest = async (req, res) => {
  try {

    const { answers, timeTaken } = req.body;

    if (timeTaken > 1800) {
      return res.status(400).json({
        message: "Time limit exceeded."
      });
    }

    let score = 0;
    let results = [];

    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    const questionMap = {};
    questions.forEach(q => {
      questionMap[q._id] = q;
    });

    for (let ans of answers) {

      const question = questionMap[ans.questionId];
      if (!question) continue;

      const isCorrect = question.correctAnswer === ans.selectedAnswer;

      if (isCorrect) {
        score += 1;
      } else {
        score -= 0.25;   // Negative marking
      }

      results.push({
        question: question.question,
        selectedAnswer: ans.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: isCorrect ? null : question.explanation
      });
    }

    if (score < 0) score = 0;

    score = parseFloat(score.toFixed(2));
    const totalQuestions = 20;
    const percentage = parseFloat(((score / totalQuestions) * 100).toFixed(2));

    // Performance message
    let performanceMessage = "";

    if (percentage === 100)
      performanceMessage = "Outstanding! Perfect Score!";
    else if (percentage >= 90)
      performanceMessage = "Excellent Performance!";
    else if (percentage >= 75)
      performanceMessage = "Very Good Job!";
    else if (percentage >= 50)
      performanceMessage = "Good Attempt, but can improve!";
    else
      performanceMessage = "More preparation is needed. Keep practicing!";

    await TestAttempt.create({
      user: req.user._id,
      score,
      totalQuestions,
      percentage,
      timeTaken,
      performanceMessage,
      answers: answers.map(a => ({
        questionId: a.questionId,
        selectedAnswer: a.selectedAnswer,
        isCorrect:
          questionMap[a.questionId]?.correctAnswer === a.selectedAnswer
      }))
    });

    res.json({
      score,
      total: totalQuestions,
      percentage,
      message: performanceMessage,
      results
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// BEST SCORE
/////////////////////////////////////////////////////

const getBestScore = async (req, res) => {
  try {

    const attempts = await TestAttempt.find({
      user: req.user._id
    });

    if (attempts.length === 0) {
      return res.json({ bestScore: 0, attempts: 0 });
    }

    const best = Math.max(...attempts.map(a => a.score));

    res.json({
      bestScore: best,
      attempts: attempts.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// LEADERBOARD
/////////////////////////////////////////////////////

const getLeaderboard = async (req, res) => {
  try {

    const aggregated = await TestAttempt.aggregate([
      {
        $group: {
          _id: "$user",
          bestScore: { $max: "$score" },
          bestTime: { $min: "$timeTaken" }
        }
      },
      {
        $sort: { bestScore: -1, bestTime: 1 }
      }
    ]);

    const ranked = await Promise.all(
      aggregated.map(async (entry, index) => {

        const user = await User.findById(entry._id).select("name");

        return {
          rank: index + 1,
          name: user ? user.name : "Unknown",
          score: entry.bestScore,
          timeTaken: entry.bestTime
        };
      })
    );

    res.json({
      leaderboard: ranked.slice(0, 10)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  startTest,
  submitTest,
  getBestScore,
  getLeaderboard
};