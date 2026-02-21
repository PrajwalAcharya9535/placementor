const Question = require("../models/Question");

// Get 10 random aptitude questions
const getAptitudeQuestions = async (req, res) => {
  try {
    const questions = await Question.aggregate([
      { $match: { category: "aptitude" } },
      { $sample: { size: 10 } }
    ]);

    res.status(200).json(questions);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit answers & calculate score
const submitAptitudeTest = async (req, res) => {
  try {
    const { answers } = req.body;

    let score = 0;
    let results = [];

    for (let answer of answers) {
      const question = await Question.findById(answer.questionId);

      if (!question) continue;

      const isCorrect = question.correctAnswer === answer.selectedOption;

      if (isCorrect) score++;

      results.push({
        questionId: answer.questionId,
        isCorrect
      });
    }

    const percentage = Math.round((score / answers.length) * 100);

    res.status(200).json({
      score,
      percentage,
      totalQuestions: answers.length,
      results
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAptitudeQuestions,
  submitAptitudeTest
};