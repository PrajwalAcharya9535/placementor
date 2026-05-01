const axios = require("axios");
const TechnicalQuestion = require("../models/TechnicalQuestion");
const TechnicalResult = require("../models/TechnicalResult");

//////////////////////////////////////////////////////
// GET ALL QUESTIONS (Without Hidden Cases)
//////////////////////////////////////////////////////

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await TechnicalQuestion.find().select("-hiddenTestCases");
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// ADD QUESTION
//////////////////////////////////////////////////////

exports.addQuestion = async (req, res) => {
  try {
    const question = new TechnicalQuestion(req.body);
    await question.save();
    res.status(201).json({ message: "Question added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// RUN CODE USING JUDGE0
//////////////////////////////////////////////////////

const runCode = async (sourceCode, languageId, input) => {
  const response = await axios.post(
    "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
    {
      language_id: languageId,
      source_code: sourceCode,
      stdin: input
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.RAPID_API_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
      }
    }
  );

  return response.data.stdout?.trim();
};

//////////////////////////////////////////////////////
// SUBMIT CODE
//////////////////////////////////////////////////////

exports.submitCode = async (req, res) => {
  try {
    const { questionId, sourceCode, languageId } = req.body;

    const question = await TechnicalQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

let testResults = [];
let passed = 0;

const visible = question.visibleTestCases || [];
const hidden = question.hiddenTestCases || [];

// 🔥 VISIBLE TEST CASES
for (let test of visible) {
  const output = await runCode(sourceCode, languageId, test.input);

  const isPass = output === test.expectedOutput.trim();

  if (isPass) passed++;

  testResults.push({
    input: test.input,
    expected: test.expectedOutput,
    actual: output,
    pass: isPass,
  });
}

// 🔥 HIDDEN TEST CASES
let hiddenPassed = 0;

for (let test of hidden) {
  const output = await runCode(sourceCode, languageId, test.input);

  if (output === test.expectedOutput.trim()) {
    hiddenPassed++;
  }
}

const totalTestCases = visible.length + hidden.length;

const score = Math.round(((passed + hiddenPassed) / totalTestCases) * 100);

const status =
  passed + hiddenPassed === totalTestCases ? "done" : "fail";

    const result = new TechnicalResult({
      userId: req.user._id,
      questionId,
      sourceCode,
      totalTestCases,
      passed,
      score,
      status
    });

    await result.save();

res.json({
  status,                         // "Passed" or "Failed"
  avgTime: "0.25",
  maxTime: "0.40",

  passed,                         // visible passed
  hiddenPassed,                   // hidden passed

  totalVisible: visible.length,
  totalHidden: hidden.length,

  totalTestCases: visible.length + hidden.length, // 🔥 ADD THIS

  testResults                     // 🔥 VERY IMPORTANT
});

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//////////////////////////////////////////////////////
// GET RESULTS BY USER
//////////////////////////////////////////////////////

exports.getUserResults = async (req, res) => {
  try {
    const results = await TechnicalResult.find({
      userId: req.params.userId
    }).populate("questionId", "title difficulty");

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};