import React, { useState, useEffect, useRef } from "react";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { FiLogOut } from "react-icons/fi";

function Dashboard() {

const navigate = useNavigate();

/* MODULE STATUS */

const resumeDone = localStorage.getItem("resumeCompleted") === "true";
const aptitudeDone = localStorage.getItem("aptitudeCompleted") === "true";
const technicalDone = localStorage.getItem("technicalCompleted") === "true";
const hrDone = localStorage.getItem("hrCompleted") === "true";
const finalDone = hrDone; // final depends on HR completion
const [showResultCard, setShowResultCard] = useState(false);
const resumeScore = Number(localStorage.getItem("resumeScore")) || 0;
const aptitudeScore = Number(localStorage.getItem("aptitudeScore")) || 0;
const technicalScore = Number(localStorage.getItem("technicalScore")) || 0;
const hrScore = Number(localStorage.getItem("hrScore")) || 0;
const scores = [resumeScore, aptitudeScore, technicalScore, hrScore].filter(s => s > 0);
const overallScore = scores.length
  ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  : 0;

const resultStatus = overallScore >= 60 ? "🎉 Selected" : "❌ Rejected";
const resumeJustDone = localStorage.getItem("resumeJustDone") === "true";
/* CURRENT STEP */
const aptitudeJustDone = localStorage.getItem("aptitudeJustDone") === "true";
const technicalJustDone = localStorage.getItem("technicalJustDone") === "true";
const hrJustDone = localStorage.getItem("hrJustDone") === "true";


/* REFS */

const resumeRef = useRef(null);
const aptRef = useRef(null);
const techRef = useRef(null);
const hrRef = useRef(null);
const finalRef = useRef(null);
/* BLAST STATES */

const [resumeBlast,setResumeBlast] = useState(false);
const [aptBlast,setAptBlast] = useState(false);
const [techBlast,setTechBlast] = useState(false);
const [hrBlast,setHrBlast] = useState(false);
const [finalBlast, setFinalBlast] = useState(false);
const [finalComplete, setFinalComplete] = useState(false);
/* COMPLETION STATES */

const [resumeComplete,setResumeComplete] = useState(false);
const [aptComplete,setAptComplete] = useState(false);
const [techComplete,setTechComplete] = useState(false);
const [hrComplete,setHrComplete] = useState(false);

/* ANIMATION LOCKS */

const [resumeAnimated,setResumeAnimated] = useState(false);
const [aptAnimated,setAptAnimated] = useState(false);
const [techAnimated,setTechAnimated] = useState(false);
const [hrAnimated,setHrAnimated] = useState(false);

/* BLAST FUNCTION */

const triggerBlast = (ref) => {

if(!ref.current) return;

const rect = ref.current.getBoundingClientRect();

const x = (rect.left + rect.width/2) / window.innerWidth;
const y = (rect.top + rect.height/2) / window.innerHeight;

confetti({
particleCount:35,
spread:50,
origin:{x,y}
});

};

const currentStep = !resumeDone
  ? "resume"
  : !aptitudeDone
  ? "aptitude"
  : !technicalDone
  ? "technical"
  : !hrDone
  ? "hr"
  : "final";

useEffect(() => {
  if (hrJustDone) {
    setTimeout(() => {
      setFinalBlast(true);
      triggerBlast(finalRef);

      setTimeout(() => {
        setFinalBlast(false);
        setFinalComplete(true);
      }, 1000);
    }, 1800); // delay after HR blast
  }
}, []);



useEffect(() => {
  if (resumeJustDone) {
    setTimeout(() => {
      setResumeBlast(true);
      triggerBlast(resumeRef);

      setTimeout(() => {
        setResumeBlast(false);
        setResumeComplete(true);
        localStorage.removeItem("resumeJustDone");
      }, 1000);

    }, 1000);
  }
}, []);

/* APTITUDE */
useEffect(() => {
  if (aptitudeJustDone) {
    setTimeout(() => {
      setAptBlast(true);
      triggerBlast(aptRef);

      setTimeout(() => {
        setAptBlast(false);
        setAptComplete(true);
        localStorage.removeItem("aptitudeJustDone");
      }, 1000);

    }, 1000);
  }
}, []);

/* TECHNICAL */

useEffect(() => {
  if (technicalJustDone) {
    setTimeout(() => {
      setTechBlast(true);
      triggerBlast(techRef);

      setTimeout(() => {
        setTechBlast(false);
        setTechComplete(true);
        localStorage.removeItem("technicalJustDone");
      }, 1000);

    }, 1000);
  }
}, []);

/* HR */

useEffect(() => {
  if (hrJustDone) {

    // 🔥 HR blast
    setTimeout(() => {
      setHrBlast(true);
      triggerBlast(hrRef);

      setTimeout(() => {
        setHrBlast(false);
        setHrComplete(true);
        localStorage.removeItem("hrJustDone");
      }, 1000);

    }, 1000);

    // 🎆 BIG FINAL CELEBRATION
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
    }, 2000);

  }
}, []);

/* USER NAME */

const username = localStorage.getItem("userName") || "Student";

/* PROGRESS */

let completed = 0;

if(resumeDone) completed++;
if(aptitudeDone) completed++;
if(technicalDone) completed++;
if(hrDone) completed++;

const progress = Math.round((completed / 4) * 100);

/* LOGOUT */

const logout = () => {

localStorage.removeItem("token");
navigate("/login");

};


const resetAllProgress = () => {
  // clear all progress
  localStorage.removeItem("resumeCompleted");
  localStorage.removeItem("aptitudeCompleted");
  localStorage.removeItem("technicalCompleted");
  localStorage.removeItem("hrCompleted");

  // clear scores
  localStorage.removeItem("resumeScore");
  localStorage.removeItem("aptitudeScore");
  localStorage.removeItem("technicalScore");
  localStorage.removeItem("hrScore");

  // clear animation flags
  localStorage.removeItem("resumeJustDone");
  localStorage.removeItem("aptitudeJustDone");
  localStorage.removeItem("technicalJustDone");
  localStorage.removeItem("hrJustDone");

  // OPTIONAL: reset UI instantly
  window.location.reload(); // 🔥 refresh dashboard
};

return(

<div className="dashboardContainer">

{/* NAVBAR */}


<div className="topBar">

<div className="logoArea">
<span>Placementor</span>
</div>

<div className="topIcons">
  <div className="profileWrapper">

    <div className="profileEmail">
      {localStorage.getItem("userEmail")}
    </div>

<button className="logoutIcon" onClick={logout}>
  <FiLogOut />
</button>

  </div>
</div>

</div>

<div className="dashboardBody">

{/* SIDEBAR */}

<div className="sidebar">

<ul>

<li onClick={()=>navigate("/dashboard")}>Dashboard</li>
<li onClick={()=>navigate("/resume-upload")}>Resume Upload</li>
<li onClick={()=>navigate("/permission")}>Aptitude Test</li>
<li onClick={()=>navigate("/technical")}>Technical</li>
<li onClick={()=>navigate("/hr-interview")}>HR Interview</li>
<li onClick={()=>navigate("/results")}>All Scores</li>
<li onClick={logout}>Logout</li>

</ul>

</div>

{/* MAIN CONTENT */}

<div className="mainContent">

<div className="welcomeBox">

<h1>Welcome, {username} 👋</h1>
<p>Your placement journey starts here!</p>

</div>

<div className="modules">

{/* RESUME */}

<div className="moduleRow">

<div className="timeline">

<div
  ref={resumeRef}
className={`circle ${resumeBlast ? "blast" : ""} ${resumeDone ? "done" : ""}`}>
  {resumeDone && (
<svg className="tick" viewBox="0 0 24 24">
  <path 
    d="M20 6L9 17l-5-5" 
    stroke="white" 
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
  />
</svg>
  )}
</div>

<div className={`line ${resumeDone ? "flow" : ""}`}></div>

</div>

<div className="moduleCard">

<div className="moduleLeft">
<h3>Upload Resume</h3>
<p>Upload your resume for ATS analysis</p>
</div>

<button
  disabled={currentStep !== "resume"}
  className={currentStep === "resume" ? "blink" : ""}
  onClick={() => navigate("/resume")}
>
  Upload
</button>

</div>

</div>

{/* APTITUDE */}

<div className="moduleRow">

<div className="timeline">

<div
  ref={aptRef}
  className={`circle ${aptBlast ? "blast" : ""} ${aptitudeDone ? "done" : ""}`}
>
  {aptitudeDone && (
<svg className="tick" viewBox="0 0 24 24">
  <path 
    d="M20 6L9 17l-5-5" 
    stroke="white" 
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
  />
</svg>
  )}
</div>

<div className={`line ${aptitudeDone ? "flow" : ""}`}></div>

</div>

<div className="moduleCard">

<div className="moduleLeft">
<h3>Aptitude Test</h3>
<p>Practice quantitative aptitude questions</p>
</div>

<button
  disabled={currentStep !== "aptitude"}
  className={currentStep === "aptitude" ? "blink" : ""}
  onClick={() => navigate("/permission?type=aptitude")}
>
  Start
</button>

</div>

</div>

{/* TECHNICAL */}

<div className="moduleRow">

<div className="timeline">

<div
  ref={techRef}
  className={`circle ${techBlast ? "blast" : ""} ${technicalDone ? "done" : ""}`}
>
  {technicalDone && (
<svg className="tick" viewBox="0 0 24 24">
  <path 
    d="M20 6L9 17l-5-5" 
    stroke="white" 
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
  />
</svg>
  )}
</div>

<div className={`line ${technicalDone ? "flow" : ""}`}></div>

</div>

<div className="moduleCard">

<div className="moduleLeft">
<h3>Technical Test</h3>
<p>Solve coding and technical questions</p>
</div>

<button
  disabled={currentStep !== "technical"}
  className={currentStep === "technical" ? "blink" : ""}
  onClick={() => navigate("/permission?type=technical")}
>
Code
</button>

</div>

</div>

{/* HR */}

<div className="moduleRow">

<div className="timeline">

<div
  ref={hrRef}
  className={`circle ${hrBlast ? "blast" : ""} ${hrDone ? "done" : ""}`}
>
  {hrDone && (
<svg className="tick" viewBox="0 0 24 24">
  <path 
    d="M20 6L9 17l-5-5" 
    stroke="white" 
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
  />
</svg>
  )}
</div>

<div className={`line ${hrDone ? "flow" : ""}`}></div>

</div>

<div className="moduleCard">

<div className="moduleLeft">
<h3>HR Interview</h3>
<p>Prepare for HR interview questions</p>
</div>

<button
  disabled={currentStep !== "hr"}
  className={currentStep === "hr" ? "blink" : ""}
  onClick={() => navigate("/hr-interview")}
>
  Join
</button>

</div>

</div>

{/* FINAL */}

<div className="moduleRow">

<div className="timeline">
<div
  ref={finalRef}
  className={`circle ${finalBlast ? "blast" : ""} ${finalDone ? "done" : ""}`}
>
  {finalDone && (
    <svg className="tick" viewBox="0 0 24 24">
      <path 
        d="M20 6L9 17l-5-5" 
        stroke="white" 
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )}
</div>
</div>

<div className="moduleCard">

<div className="moduleLeft">
<h3>Final Score</h3>
<p>View overall performance</p>
</div>

<button
  disabled={currentStep !== "final"}
  className={currentStep === "final" ? "blink" : ""}
onClick={() => {

  const canvas = document.getElementById("confetti-canvas");

  const myConfetti = confetti.create(canvas, {
    resize: true,
    useWorker: true
  });

  // 🎆 blast on background
  myConfetti({
    particleCount: 200,
    spread: 120,
    origin: { y: 0.6 }
  });

  // open result card
  setShowResultCard(true);
}}>
  View
</button>

</div>

</div>

</div>

</div>

{/* RIGHT PANEL */}

<div className="rightPanel">



<div className="progressCard">

<h3>Placement Progress</h3>

<div
className="progressCircle"
style={{ "--progress": progress }}
>

<div className="progressInner">
{progress}%
</div>

</div>

<p>Modules Completed</p>

</div>

</div>

</div>
<canvas id="confetti-canvas" className="confetti-canvas"></canvas>

{showResultCard && (
  <div className="result-overlay">

    <div className="result-card">

      <h2>🎯 Final Result</h2>

      <div className="score-list">
        <p>📄 Resume: {resumeScore}</p>
        <p>🧠 Aptitude: {aptitudeScore}</p>
        <p>💻 Technical: {technicalScore}</p>
        <p>🎤 HR: {hrScore}</p>
      </div>

      <div className="overall-score">
        <h3>Overall: {overallScore}%</h3>
        <h2>{resultStatus}</h2>
      </div>

<button
  className="close-btn"
  onClick={() => {
    setShowResultCard(false);
    resetAllProgress();   // 🔥 MAIN LINE
  }}
>
  Close
</button>

    </div>

  </div>
)}
</div>

);

}

export default Dashboard;