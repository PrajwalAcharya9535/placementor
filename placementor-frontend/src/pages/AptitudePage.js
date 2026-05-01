import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./AptitudePage.css";
import * as faceapi from "face-api.js";

function AptitudePage() {

  const navigate = useNavigate();
  const videoRef = useRef(null);
  const violationsRef = useRef(0);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [time, setTime] = useState(900);
  const [showSubmit, setShowSubmit] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [showResultAnimation, setShowResultAnimation] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [warningMsg, setWarningMsg] = useState("");
const suspiciousReadyRef = useRef(false);
const returnedTimeRef = useRef(null);
const handleCheating = () => {
  setWarningMsg("❌ Cheating detected! Ending test...");

  setTimeout(() => {
    submitTest();
    navigate("/dashboard");
  }, 1500);
};

useEffect(() => {
  const loadModels = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
  };

  loadModels();
}, []);

useEffect(() => {

  let started = false;

  const startMonitoring = async () => {
let prevWidth = 0;
let movementDetected = false;
let downStartTime = null;
let returnedTime = null;
let suspiciousReady = false;
let suspiciousCount = 0;
let cooldown = false;
    if (started) return;
    started = true;

    const baseline = JSON.parse(localStorage.getItem("baseline"));

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(() => {});
      };
    }

let missingFrames = 0;

const interval = setInterval(async () => {

  const video = videoRef.current;
  if (!video) return;

  const detections = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();

  // ✅ FACE NOT VISIBLE
  if (detections.length === 0) {
    missingFrames++;

    if (missingFrames >= 2) {
      setWarningMsg("⚠️ Face not visible");
      setTimeout(() => setWarningMsg(""), 2000);
    }
    return;
  } else {
    missingFrames = 0;
  }

  // ✅ MULTIPLE PEOPLE
  if (detections.length > 1) {
    setWarningMsg("🚨 Multiple people detected");
    setTimeout(() => setWarningMsg(""), 2000);
    return;
  }

const detection = detections[0];
const box = detection.detection.box;

const centerY = box.y + box.height / 2;

// ✅ 1. DISTANCE WARNING
if (box.width < 120) {
  setWarningMsg("📏 Come closer to camera");
  setTimeout(() => setWarningMsg(""), 2000);
}

// ✅ 2. SUDDEN MOVEMENT (taking phone)
if (Math.abs(box.width - prevWidth) > 40) {
  movementDetected = true;
}

// ✅ 3. HEAD DOWN DETECTION
if (movementDetected && centerY > baseline.centerY + 60) {

  if (!downStartTime) {
    downStartTime = Date.now();
  }

  const duration = Date.now() - downStartTime;

  // must stay down for real cheating
  if (duration > 2000) {
    suspiciousReady = true;
  }
}

// ✅ 4. USER RETURNS BACK
if (centerY <= baseline.centerY + 20) {

  if (suspiciousReady) {
    returnedTime = Date.now();
  }

  downStartTime = null;
}

// update
prevWidth = box.width;

}, 2000);

    return () => clearInterval(interval);
  };

setTimeout(() => {
  startMonitoring();
}, 2000);
}, []);

useEffect(() => {
  const handleVisibility = () => {

    if (document.hidden) {

      violationsRef.current++;

      setWarningMsg(`🚫 Tab switching (${violationsRef.current}/3)`);

      // try to bring back focus
      window.focus();

      if (violationsRef.current >= 3) {
        handleCheating();
      }
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}, []);

  useEffect(() => {
  const verified = localStorage.getItem("verified");

  if (!verified) {
setWarningMsg("⚠️ Complete verification first!");
    navigate("/permission");
  }
}, []);

useEffect(() => {
  const disableRightClick = (e) => e.preventDefault();

  document.addEventListener("contextmenu", disableRightClick);

  return () => {
    document.removeEventListener("contextmenu", disableRightClick);
  };
}, []);

    useEffect(() => {
  if (reviewMode) {
    setTime(0); // 🔥 stop & reset timer
    return;
  }

  const timer = setInterval(() => {
    setTime(prev => (prev > 0 ? prev - 1 : 0));
  }, 1000);

  return () => clearInterval(timer);
}, [reviewMode]);


  useEffect(() => {
  const fetchQuestions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/aptitude/questions");
      const data = await res.json();

      console.log("Fetched:", data); // 🔥 debug

      setQuestions(data);

    } catch (err) {
      console.error(err);
    }
  };

  fetchQuestions();
}, []);


useEffect(() => {
  const handleFullscreen = () => {

    if (!document.fullscreenElement) {

      violationsRef.current++;

      setWarningMsg(`⚠️ Fullscreen exited (${violationsRef.current}/3)`);

      // auto re-enter fullscreen
      document.documentElement.requestFullscreen().catch(() => {});

      if (violationsRef.current >= 3) {
        handleCheating();
      }
    }
  };

  document.addEventListener("fullscreenchange", handleFullscreen);

  return () => {
    document.removeEventListener("fullscreenchange", handleFullscreen);
  };
}, []);

  const formatTime = () => {
    const m = Math.floor(time / 60);
    const s = time % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

const selectOption = (index) => {

  if (reviewMode) return;

  setAnswers(prev => ({
    ...prev,
    [currentQuestion]: index
  }));

  // 🚨 CHEATING LOGIC HERE
 if (suspiciousReadyRef.current && returnedTimeRef.current) {

    const timeGap = Date.now() - returnedTimeRef.current;

    // 👉 answered within 3 seconds after looking down
    if (timeGap < 3000) {

      violationsRef.current++;

      setWarningMsg(`⚠️ Suspicious activity (${violationsRef.current}/3)`);

      setTimeout(() => setWarningMsg(""), 2000);

      if (violationsRef.current >= 3) {
        handleCheating();
      }
    }

    // reset
suspiciousReadyRef.current = false;
returnedTimeRef.current = null;
  }
};

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1)
      setCurrentQuestion(currentQuestion + 1);
  };

  const prevQuestion = () => {
    if (currentQuestion > 0)
      setCurrentQuestion(currentQuestion - 1);
  };

  const goQuestion = (index) => {
    setCurrentQuestion(index);
  };

const submitTest = () => {

  let correct = 0;
  let wrong = [];

  questions.forEach((q, i) => {
    if (answers[i] === q.answer) {
      correct++;
    } else {
      wrong.push(i);
    }
  });

  // ✅ CALCULATE PERCENTAGE
const score = Math.round((correct / questions.length) * 100);

// ✅ STORE SCORE
localStorage.setItem("aptitudeScore", score);
localStorage.setItem("aptitudeCompleted", "true");
localStorage.setItem("aptitudeJustDone", "true"); // ✅ ADDED


  // (optional debug)
  console.log("APTITUDE SCORE:", score);

  // 🔥 EXISTING LOGIC (DON’T REMOVE)
  wrong.sort((a, b) => a - b);

  setWrongQuestions(wrong);
  setReviewMode(true);
  setReviewIndex(0);
};

  const answered = Object.keys(answers).length;
const activeIndex = reviewMode
  ? wrongQuestions[reviewIndex]
  : currentQuestion;

const currentQ = questions[activeIndex];
useEffect(() => {
  if (reviewMode) {
    setAnimationStep(0);

    setTimeout(() => setAnimationStep(1), 1000); // ❌ wrong tick
    setTimeout(() => setAnimationStep(2), 2800); // ✅ correct tick + animation
    setTimeout(() => setAnimationStep(3), 3500); // 🟢 HOLD (no movement)
    setTimeout(() => setAnimationStep(4), 5000); // ❌ fade others
  }
}, [activeIndex]);

const handleSubmitAnswer = () => {
  if (answers[currentQuestion] === undefined) return;

  // last question → go to review
  if (currentQuestion === questions.length - 1) {
    submitTest();
  } else {
    setCurrentQuestion(currentQuestion + 1); // 🔥 AUTO NEXT
  }
};

if (questions.length === 0) {
  return <h2>Loading questions...</h2>;
}

{warningMsg && (
  <div className="warning-box">
    {warningMsg}
  </div>
)}

  return (
    <div className="exam-container">
{warningMsg && (
  <div className="cheat-warning">
    {warningMsg}
  </div>
)}
      {/* HEADER */}

<div className="header">
  <div className="header-left">
  <div className="heading-mask">
    <h2 className="move-full">Aptitude Test</h2>
  </div>
</div>

  <div className="header-right">
    <div className="timer-box">
      ⏱ {formatTime()}
    </div>
  </div>
</div>

 

      {/* 🔥 MAIN CONTAINER */}
<div className="main">
  {reviewMode && (
  <div className="score-floating">
    {questions.length - wrongQuestions.length} / {questions.length}
  </div>
)}

  {/* LEFT SIDE */}
  <div className="left">

    {/* QUESTION CARD */}
    <div className="card question-card">
      <h3>Question {activeIndex + 1}</h3>
      <p>{currentQ.question}</p>

<div className="options">
 {currentQ.options.map((opt, index) => {
  const isCorrect = index === currentQ.answer;
const isSelected = answers[currentQuestion] === index;
  return (
    <div
      key={index}
      onClick={() => !reviewMode && selectOption(index)}
      className={`option

${!reviewMode && answers[currentQuestion] === index ? "selected" : ""}

/* ❌ WRONG TICK */
${reviewMode && animationStep >= 1 && isSelected && !isCorrect ? "wrong-show" : ""}

/* ✅ CORRECT TICK + STYLE */
${reviewMode && animationStep >= 2 && isCorrect ? "correct-show" : ""}

/* ❌ FADE ALL WRONG OPTIONS */
${reviewMode && animationStep >= 4 && !isCorrect ? "fade-out" : ""}

/* 🚀 MOVE ONLY AFTER WAIT */
${reviewMode && animationStep >= 4 && isCorrect ? "correct-move" : ""}
/* ❌ FINAL REMOVE */
${reviewMode && animationStep >= 6 && !isCorrect ? "hide" : ""}

`}
    >
      <span>{opt}</span>

      {/* ❌ WRONG */}
      {reviewMode && animationStep >= 1 && isSelected && !isCorrect && (
        <span className="icon icon-wrong">❌</span>
      )}

      {/* ✅ CORRECT */}
      {reviewMode && animationStep >= 2 && isCorrect && (
        <span className="icon  icon-correct">✅</span>
      )}
    </div>
  );
})}
  {/* 📘 EXPLANATION */}
{animationStep >= 4 && (
  <div className="inline-explanation">
    <h4>Explanation</h4>
    <p>❌ You selected wrong answer</p>
    <p>✅ Correct answer: {currentQ.options[currentQ.answer]}</p>
<p>📘 {currentQ.explanation || "No explanation available"}</p>
  </div>
)}
</div>
    </div>
  </div>

  {/* RIGHT SIDE */}
  <div className="right">

    <div className="card palette">
      <h4>Questions</h4>
      <p>{Object.keys(answers).length} / {questions.length} Completed</p>

      <div className="grid">
        {questions.map((q, index) => (
          <button
            key={index}
          className={`p-btn 
  ${index === activeIndex ? "active" : ""}

  ${
    !reviewMode && answers[index] !== undefined
      ? "visited"   // BLUE before submit
      : ""
  }

  ${
    reviewMode && answers[index] === questions[index].answer
      ? "correct"
      : ""
  }

  ${
    reviewMode &&
    answers[index] !== undefined &&
    answers[index] !== questions[index].answer
      ? "wrong"
      : ""
  }
`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
<div className="actions">

  {reviewMode ? (
    <>
      {reviewIndex > 0 && (
        <button onClick={() => setReviewIndex(reviewIndex - 1)}>
          Previous
        </button>
      )}

      {reviewIndex < wrongQuestions.length - 1 ? (
        <button onClick={() => setReviewIndex(reviewIndex + 1)}>
          Next
        </button>
      ) : (
        <>
          <button onClick={() => window.location.reload()}>
            Retest
          </button>

          <button onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>
        </>
      )}
    </>
  ) : (
    <>
      {currentQuestion > 0 && (
        <button onClick={prevQuestion}>Previous</button>
      )}

      <button onClick={handleSubmitAnswer}>
        {currentQuestion === questions.length - 1 ? "Submit Test" : "Submit"}
      </button>
    </>
  )}

</div>
</div>
 </div>
 <video ref={videoRef} autoPlay muted style={{ display: "none" }} />
</div>

  );
  }
export default AptitudePage;
