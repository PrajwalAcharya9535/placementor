const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { v4: uuidv4 } = require("uuid");

const TechnicalQuestion = require("../models/TechnicalQuestion");
const protect = require("../middleware/protect");
const tempDir = path.join(__dirname, "../temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

function runCode(language, code, input) {
  return new Promise((resolve, reject) => {
    const id = uuidv4();

    let filePath;
    let command;

    if (language === "python") {
      filePath = path.join(tempDir, `${id}.py`);
      fs.writeFileSync(filePath, code);
      command = `python ${filePath}`;
    }

    if (language === "cpp") {
      filePath = path.join(tempDir, `${id}.cpp`);
      const exeFile = path.join(tempDir, `${id}.exe`);

      fs.writeFileSync(filePath, code);
      command = `g++ ${filePath} -o ${exeFile} && ${exeFile}`;
    }

if (language === "java") {
  const className = "Main";

  filePath = path.join(tempDir, `${className}.java`);
  fs.writeFileSync(filePath, code);

  command = `javac ${filePath} && java -cp ${tempDir} ${className}`;
}
const process = exec(command, { timeout: 5000 });

let output = "";
let errorOutput = "";

process.stdout.on("data", (data) => {
  output += data.toString();
});

process.stderr.on("data", (data) => {
  errorOutput += data.toString();
});

process.on("close", () => {
  if (errorOutput) {
    return reject(errorOutput);
  }
  resolve(output);
});

let fixedInput = input ?? "";

fixedInput = String(fixedInput)
  .replace(/\\n/g, "\n")   // convert \n → real newline
  .replace(/\r/g, "")
  .trim();

if (!fixedInput) {
  console.log("❌ EMPTY INPUT DETECTED");
} else {
  console.log("✅ INPUT OK:", JSON.stringify(fixedInput));
}

console.log("FINAL INPUT SENT:", fixedInput);

process.stdin.write(fixedInput + "\n");
process.stdin.end();
  });
}
const normalize = (str = "") =>
  str.toString().replace(/\s/g, "").replace(/[\r\n]/g, "");
// ADD QUESTION
router.post("/add", protect, async (req, res) => {
  try {
    const question = await TechnicalQuestion.create(req.body);
    res.json({
      message: "Question added successfully",
      question,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// GET QUESTIONS
router.get("/questions", async (req, res) => {
  try {
    const questions = await TechnicalQuestion.aggregate([
      { $sample: { size: 3 } } // 🔥 RANDOM 3
    ]);

    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// RUN CODE (VISIBLE TEST CASES)
router.post("/run", async (req, res) => {
  try {
    const { questionId, code, language } = req.body;

    const question = await TechnicalQuestion.findById(questionId); // ✅ ADD THIS

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const results = [];

const visibleTests = question.visibleTestCases || [];
for (const test of visibleTests) { 
      try {
const safeInput = test.input ?? "";

console.log("TEST INPUT FROM DB:", JSON.stringify(safeInput));

const rawOutput = await runCode(language, code, safeInput);

const output = rawOutput
  .toString()
  .replace(/\r/g, "")
  .replace(/\n/g, "")
  .trim();
       console.log("INPUT:", test.input);
console.log("OUTPUT:", output);
console.log("EXPECTED:", test.expectedOutput);

const expected = (test.expectedOutput ?? "")
  .toString()
  .replace(/\r/g, "")
  .replace(/\n/g, "")
  .trim();

const passed = normalize(output) === normalize(expected);

          results.push({
          input: test.input,
          expected: test.expectedOutput,
          output,
          passed,
          type: "visible"
        });
      } catch (error) {
  console.log("EXEC ERROR:", error);

  return res.json({
    status: "error",
    message: error.toString()
  });
}
    }

    res.json({
      message: "Visible test cases executed",
      results,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SUBMIT CODE (VISIBLE + HIDDEN TESTS)
router.post("/submit", async (req, res) => {
  try {
    const { questionId, code, language } = req.body;

    const question = await TechnicalQuestion.findById(questionId);
console.log("FULL QUESTION DATA:", question);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const results = [];

    // ✅ COMBINE BOTH TEST CASES
const allTests = [
  ...(question.visibleTestCases || []).map(t => ({
    input: t.input,
    expectedOutput: t.expectedOutput,
    type: "visible"
  })),
  ...(question.hiddenTestCases || []).map(t => ({
    input: t.input,
    expectedOutput: t.expectedOutput,
    type: "hidden"
  }))
];


for (const test of allTests) {
  try {
    const safeInput = test.input || "";

    const rawOutput = await runCode(language, code, safeInput);

    const output = rawOutput
      .toString()
      .replace(/\r/g, "")
      .trim();

    const expected = (test.expectedOutput ?? "")
      .toString()
      .replace(/\r/g, "")
      .trim();

    console.log("INPUT:", JSON.stringify(safeInput));
    console.log("EXPECTED:", expected);
    console.log("ACTUAL:", output);

    const passed = normalize(output) === normalize(expected);

    results.push({
      input: safeInput,
      expected,
      output,
      passed,
      type: test.type
    });

  } catch (error) {
    return res.json({
      status: "error",
      message: error.toString(),
    });
  }
}

// 🔥 CALCULATE RESULTS
const visiblePassed = results.filter(r => r.type === "visible" && r.passed).length;
const hiddenPassed = results.filter(r => r.type === "hidden" && r.passed).length;

const totalVisible = results.filter(r => r.type === "visible").length;
const totalHidden = results.filter(r => r.type === "hidden").length;

const totalTestCases = totalVisible + totalHidden;

const status =
  visiblePassed + hiddenPassed === totalTestCases ? "Passed" : "Failed";

// 🔥 FINAL RESPONSE
const visibleResults = results.filter(r => r.type === "visible");

res.json({
  status: "done",
  passed: visibleResults.filter(r => r.passed).length,
  totalTestCases: visibleResults.length,   // 🔥 ONLY VISIBLE
  hiddenPassed: results.filter(r => r.type === "hidden" && r.passed).length,

testResults: results.map(r => ({
  expected: r.expected !== undefined ? String(r.expected) : "",
  actual: r.output !== undefined ? String(r.output) : "",
  pass: r.passed
}))
});

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;