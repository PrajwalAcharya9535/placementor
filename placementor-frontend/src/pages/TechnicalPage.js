
import Editor from "@monaco-editor/react";
import React, { useState, useRef } from "react";
import "./TechnicalPage.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function TechnicalPage() {

  const navigate = useNavigate();
const [isSampleOpen, setIsSampleOpen] = useState(false);
  const [language, setLanguage] = useState("python");
const [code, setCode] = useState("");
const [showPanel, setShowPanel] = useState(false);
const [loading, setLoading] = useState(false);
const [status, setStatus] = useState("idle"); 
const [data, setData] = useState(null);
const [error, setError] = useState(null);
const [questions, setQuestions] = useState([]);
const [currentQ, setCurrentQ] = useState(null);
const [timeLeft, setTimeLeft] = useState(600); // 120 min = 120 sec
const [isNextEnabled, setIsNextEnabled] = useState(false);
const [finalResult, setFinalResult] = useState(null); // success / fail
const [showHRPopup, setShowHRPopup] = useState(false);
const [showTimeUpCard, setShowTimeUpCard] = useState(false);
const [showFinalCard, setShowFinalCard] = useState(false);
const [finalMessage, setFinalMessage] = useState("");
const violationsRef = useRef(0);
const [warningMsg, setWarningMsg] = useState("");
const [technicalScore, setTechnicalScore] = useState(0);
const [totalTestCases, setTotalTestCases] = useState(0);
const [attemptedQuestions, setAttemptedQuestions] = useState(new Set());

const formatInput = (input) => {
  if (!input) return "";

  return input
    .replace(/\\n/g, "\n")   // convert \n → real newline
    .split("\n")             // split lines
    .map((line, i) => <div key={i}>{line}</div>); // show line by line
};



const currentIndex = questions.findIndex(
  (q) => q._id === currentQ?._id
);

useEffect(() => {

  const handleFullscreen = () => {

    if (!document.fullscreenElement) {

      violationsRef.current++;

      setWarningMsg(`⚠️ Fullscreen exited (${violationsRef.current}/3)`);

      // ❌ IMPORTANT: block paste after exit

      if (violationsRef.current >= 3) {
        setWarningMsg("❌ Test ending in 3 seconds...");
        setTimeout(() => navigate("/dashboard"), 3000);
      }
    }
  };

  document.addEventListener("fullscreenchange", handleFullscreen);

  return () => {
    document.removeEventListener("fullscreenchange", handleFullscreen);
  };

}, []);

useEffect(() => {

  const handleVisibility = () => {
    if (document.hidden) {

      violationsRef.current++;

      alert(`🚫 Tab switching (${violationsRef.current}/3)`);

if (violationsRef.current >= 3) {
  alert("❌ Test ended due to cheating");

  localStorage.setItem("technicalScore", "0");   // ✅ ADD THIS
  localStorage.setItem("technicalCompleted", "true");

  navigate("/dashboard");
}
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibility);
  };

}, []);

useEffect(() => {
  if (!currentQ) return;

  setTimeLeft(600); // reset when question changes  ///600 keep afterwards realtime exam type

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev === 1) {
        clearInterval(timer);
        handleAutoNext(); // 🔥 auto move
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [currentQ]);


useEffect(() => {
  if (currentQ) {
    setCode(currentQ.solution?.python || "");
  }
}, [currentQ]);


useEffect(() => {
  const fetchQuestions = async () => {
    const res = await fetch("http://localhost:5000/api/technical/questions");
    const data = await res.json();

    setQuestions(data);
    setCurrentQ(data[0]); // first question
  };

  fetchQuestions();
}, []);

const nextQuestion = () => {
  const index = questions.findIndex(q => q._id === currentQ._id);

  if (index < questions.length - 1) {
    setCurrentQ(questions[index + 1]);

    // 🔥 RESET EVERYTHING
    setIsNextEnabled(false);
    setCode("");          // clear editor
    setData(null);        // remove results
    setError(null);       // remove errors
    setStatus("idle");    // reset status
    setShowPanel(false);  // close testcase panel
  }
};

const prevQuestion = () => {
  const index = questions.findIndex(q => q._id === currentQ._id);

  if (index > 0) {
    setCurrentQ(questions[index - 1]);

    // 🔥 RESET
    setIsNextEnabled(false);
    setCode("");
    setData(null);
    setError(null);
    setStatus("idle");
    setShowPanel(false);
  }
};

const handleAutoNext = () => {
  const index = questions.findIndex(q => q._id === currentQ._id);

  if (index < questions.length - 1) {
    setCurrentQ(questions[index + 1]);
    setIsNextEnabled(false);
    setTimeLeft(600);
  }else {
  setFinalMessage("⏰ Time Up! Test Ended");

  localStorage.setItem("technicalScore", "0");   // ✅ ADD THIS
  localStorage.setItem("technicalCompleted", "true");

  setShowFinalCard(true);

  setTimeout(() => {
    navigate("/dashboard");
  }, 3000);
}
};


  return (
    
    <div className="technical-container">
{warningMsg && (
  <div className="cheat-overlay">

    <div className="cheat-box">

      <div className="warning-icon">⚠️</div>

      <h2 className="warning-title">
        Fullscreen Interrupted
      </h2>

      <p className="warning-text">
        {warningMsg}
      </p>

      <div className="warning-progress">
        Attempt {violationsRef.current} of 3
      </div>

      {violationsRef.current < 3 && (
        <button
          className="resume-btn"
          onClick={() => {
            document.documentElement.requestFullscreen();
            setWarningMsg("");
          }}
        >
          🔒 Resume Secure Test
        </button>
      )}

 {violationsRef.current >= 3 && (
  <p className="end-text">
    ❌ Test ending in 3 seconds...
  </p>
)}

    </div>

  </div>
)}

{finalResult && (
  <div className="final-overlay">
    <div className="final-box">
      {finalResult === "success" ? (
        <>
          <h1>🎉 Congratulations!</h1>
          <p>Technical Round Completed</p>
          <p>Redirecting to Dashboard...</p>
        </>
      ) : (
        <>
          <h1>❌ You Failed</h1>
          <p>Try Again</p>
        </>
      )}
    </div>
  </div>
)}

{showHRPopup && (
  <div className="hr-overlay">
    <div className="hr-box">
      <h1>🚀 HR Round Ready</h1>
      <p>Get ready for HR Interview</p>
    </div>
  </div>
)}

      {/* 🔥 TOP HEADER */}
      <div className="top-header">

        <div className="header-left">
          <span className="logo">Placementor</span>
          <span className="nav">Home</span>
        </div>

        <div className="header-right">
          <span className="email">
            prajwalacharya.810@gmail.com
          </span>

          <button className="logout-btn">
            Logout
          </button>
        </div>

      </div>

      {/* 🔥 MAIN LAYOUT (VERY IMPORTANT) */}
      <div className="main-layout">

        {/* ✅ LEFT PANEL */}
  <div className="left-panel">

  <div className="question-card">   {/* ✅ ADD THIS */}

    {/* BLACK STRIP */}
    <div className="question-header">
   <span className="question-title">
  Question {currentIndex + 1} / {questions.length}
</span>

<span
  className={`question-timer ${
    timeLeft > 360
      ? "green"
      : timeLeft > 180
      ? "yellow"
      : "red"
  }`}
>
  {Math.floor(timeLeft / 60)}:
  {String(timeLeft % 60).padStart(2, "0")}
</span>
    </div>

    {/* BODY */}
<div className="question-body">

  {/* QUESTION */}
<h2 className="question-name">
  {currentQ?.title || "Loading..."}
</h2>

<p className="question-text">
  {currentQ?.description || "Loading..."}
</p>

  {/* EXAMPLE */}
  <h4 className="section-title">Example</h4>

 <div className="example-card">
  <p>
    <b>Input:</b>{" "}
<span className="chip" style={{ whiteSpace: "pre-wrap" }}>
  {currentQ?.visibleTestCases?.[0]?.input?.replace(/\\n/g, "\n")}
</span>
  </p>

  <p>
    <b>Output:</b>{" "}
    <span className="chip">
      {currentQ?.visibleTestCases?.[0]?.expectedOutput}
    </span>
  </p>
</div>

{/* SAMPLE TEST CASES */}
<div className="testcases">

  <div className="test-header" onClick={() => setIsSampleOpen(!isSampleOpen)}>
    <span>Sample Test Cases</span>
<span className="toggle-btn">
  {isSampleOpen ? "−" : "+"}
</span>
  </div>

{isSampleOpen && (
  <div className="test-content">

    {currentQ?.visibleTestCases?.map((test, index) => (
      <div key={index} className="clean-testcase">

        <div className="tc-title">Test Case {index + 1}</div>

        <div className="tc-row">
          <div className="tc-label">Input</div>
          <div className="tc-box">
            {test.input.replace(/\\n/g, "\n")}
          </div>
        </div>

        <div className="tc-row">
          <div className="tc-label">Expected</div>
          <div className="tc-output">
            {test.expectedOutput}
          </div>
        </div>

      </div>
    ))}

  </div>
)}

</div>

</div>

  </div>

</div>

        {/* ✅ RIGHT PANEL */}
<div className="right-panel">

  <div className="editor-card">

    {/* 🔥 HEADER */}
    <div className="editor-header">
      <span className="editor-title">Editor</span>

      <select
        className="language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="cpp">C</option>
      </select>
    </div>


    {/* 🔥 MONACO EDITOR */}
    <div className="editor-body">
<Editor
  height="100%"
  theme="hc-black"
  language={language}
  value={code}

onChange={(value) => {
  setCode(value || "");
}}

onMount={(editor, monaco) => {


}}

  options={{
    fontSize: 14,
    minimap: { enabled: false },
    automaticLayout: true,
    renderLineHighlight: "none",
    cursorLineStyle: "line",
    overviewRulerBorder: false,
  }}
/>
    </div>

{/* 🔥 ADD HERE */}
{showPanel && (
  <div className="testcase-overlay">

    {/* CLOSE */}
    <div
      className="close-btn"
      onClick={() => {
        setShowPanel(false);
        setLoading(false);
      }}
    >
      ✕
    </div>

    {/* LOADING */}
    {loading ? (
      <div className="loading-box">
        <div className="loader"></div>
        <p>Loading resources...</p>
      </div>
    ) : (
      <div className="result-box">

{error && (
  <div className="error-box">
    <span>⚠ Compilation Error</span>
    <pre>{error}</pre>
  </div>
)}

        {/* SUMMARY */}
{/* 🔥 TOP ROW */}
<div className="top-row">

  {/* LEFT → TIME */}
  <div className="time-section">
    <div className="stat-box">
      <span className="stat-title">Average time</span>
      <span className="stat-value">0.248 s</span>
    </div>

    <div className="stat-box">
      <span className="stat-title">Maximum time</span>
      <span className="stat-value">0.321 s</span>
    </div>
  </div>

<div className="status-simple">

  <div className="status-line">
    <span>
{status === "running"
  ? "Running test cases..."
  : data && data.testResults
  ? `${data.testResults.length} test case(s) executed`
  : "Submit to see results"}
    </span>

<div
  className={`progress ${
    status === "running"
      ? "running"
      : status === "fail"
      ? "fail"
      : "done"
  }`}
></div>  </div>

  <div className="status-line">
<span>
  {status === "running"
    ? "Checking hidden test cases..."
    : data
    ? `Hidden test cases included in total`
    : ""}
</span>

<div
  className={`progress ${
    status === "running"
      ? "running"
      : status === "fail"
      ? "fail"
      : "done"
  }`}
></div>  </div>

</div>

</div>

        {/* TEST CASES */}
        
{Array.isArray(data?.testResults) && data.testResults.length > 0 ? (
  data.testResults.map((test, index) => (
    <TestCase
      key={index}
      title={`Test Case ${index + 1}`}
      expected={test.expected}
      actual={test.actual}
      pass={test.pass}
    />
  ))
) : (
  <div style={{ padding: "12px", color: "#94a3b8" }}>
    No test cases yet. Click Submit 🚀
  </div>
)}

      </div>

    )}

  </div>
)}


  </div>
  

</div>

      </div>
<div className="bottom-strip">
  <div className="button-group">
<button className="btn prev" onClick={prevQuestion}>‹ Prev</button>
<button
  className="btn reset"
  onClick={() => {
    setCode("");          // 🧹 clear editor
    setData(null);        // ❌ remove results
    setError(null);       // ❌ remove errors
    setStatus("idle");    // 🔄 reset status
    setShowPanel(false);  // ❌ close output panel
  }}
>
  Reset
</button>
<button
  className="btn run"
  onClick={async () => {
    setShowPanel(true);
    setStatus("running");
    setError(null);

    const res = await fetch("http://localhost:5000/api/technical/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questionId: currentQ?._id,
        code: code,
        language: language,
      }),
    });

    const result = await res.json();

setData(result);

if (result.status === "error") {
  setError(result.message);
  setStatus("fail");
  return;
}



setStatus("done");
  }}
>
  Run
</button>
<button
  className="btn submit"
onClick={async () => {
  setShowPanel(true);
  setStatus("running");
  setError(null);

  console.log("SUBMIT CLICKED");

  const res = await fetch("http://localhost:5000/api/technical/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      questionId: currentQ?._id,
      code: code,
      language: language,
    }),
  });

const result = await res.json();
if (result.status === "error") {
  setError(result.message);
  setStatus("fail");
  return;
}
setData(result);
const total = result.testResults?.length || 0;
const passed = result.testResults?.filter(t => t.pass).length || 0;

// ✅ Prevent double scoring ONLY
if (!attemptedQuestions.has(currentQ._id)) {
  setAttemptedQuestions(prev => new Set(prev).add(currentQ._id));

  setTechnicalScore(prev => prev + passed);
  setTotalTestCases(prev => prev + total);
}

console.log("Question Score:", passed, "/", total);
console.log("API RESPONSE:", result);

// ❌ Handle error first


// ✅ Show results

// ✅ Check pass
const allPassed = result.testResults?.every(t => t.pass);

console.log("Current Index:", currentIndex);
console.log("Total Questions:", questions.length);
console.log("Is Last:", currentIndex === questions.length - 1);

const isLastQuestion = currentIndex === questions.length - 1;

if (isLastQuestion) {
  console.log("🔥 LAST QUESTION SUBMITTED");

const alreadyAttempted = attemptedQuestions.has(currentQ._id);

const updatedTotal = alreadyAttempted
  ? totalTestCases
  : totalTestCases + total;

const updatedPassed = alreadyAttempted
  ? technicalScore
  : technicalScore + passed;

  const finalPercentage =
    updatedTotal > 0
      ? Math.round((updatedPassed / updatedTotal) * 100)
      : 0;

  console.log("FINAL TECH SCORE:", finalPercentage);

  // ✅ SAVE SCORE
  localStorage.setItem("technicalScore", String(finalPercentage));
  localStorage.setItem("technicalCompleted", "true");
localStorage.setItem("technicalJustDone", "true"); // 🔥 ADD THIS
  console.log("STORED VALUE:", localStorage.getItem("technicalScore"));

  setTimeout(() => {
    navigate("/dashboard");
  }, 2000);

  return;
}

if (allPassed) {
  setIsNextEnabled(true);
}

setStatus("done");
}}
>
  Submit
</button>

<button
  className={`btn next ${isNextEnabled ? "pop" : "disabled"}`}
  disabled={!isNextEnabled}
  onClick={nextQuestion}
>
  Next ›
</button>
 </div>
</div>
{showFinalCard && (
  <div className="final-overlay">
    <div className="timeup-card">
      {finalMessage}
    </div>
  </div>
)}
</div>

  );
}
const TestCase = ({ title, expected, actual, pass }) => {
  const [open, setOpen] = useState(false);




  return (
    <div className="testcase-item">
      
      {/* HEADER */}
      <div className="test-header" onClick={() => setOpen(!open)}>
        <span>
          {pass ? "✅" : "❌"} {title}
        </span>
        <span>{open ? "▲" : "▼"}</span>
      </div>

      {/* BODY */}
{open && (
  <div className="test-content row">

    <div className="col">
      <span className="label">Expected</span>
      <div className="value-box">
        {expected || "_"}
      </div>
    </div>

    <div className="col">
      <span className="label">Actual</span>
      <div className={`value-box ${pass ? "correct" : "wrong"}`}>
        {actual || "_"}
      </div>
    </div>

  </div>
)}
    </div>
  );
};

export default TechnicalPage;