import React, { useState,useEffect,useRef } from "react";
import "./ResumeUpload.css";

export default function ResumeScanner() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [improveMode, setImproveMode] = useState(false);
  const [skills, setSkills] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [feedback, setFeedback] = useState("");   // ✅ ADD THIS
  const [fileUrl, setFileUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [finalScore, setFinalScore] = useState(0); // ✅ NEW
  const [displayScore, setDisplayScore] = useState(0);

  const [resumeData, setResumeData] = useState({
    summary: "",
    skills: "",
    experience: "",
    education: "",
  });

  // ================= FILE HANDLER =================
const handleFile = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setPdfLoaded(false);
  setFile(file);
  setFileName(file.name.replace(".pdf", ""));

  console.log("File selected:", file.name);

  handleUpload(file);   // 🔥 MUST RUN
};

const handleUpload = (file) => {
  const reader = new FileReader();

  reader.onload = () => {
    localStorage.setItem("resume", reader.result);
    console.log("✅ Resume stored in localStorage");
  };

  reader.readAsDataURL(file);
};

  // ================= SCAN FLOW =================
const startScan = async () => {
  if (!file) return;

  // 1️⃣ show resume
  setFileUrl(URL.createObjectURL(file));

  // 2️⃣ start UI

  const formData = new FormData();
  formData.append("resume", file);

  const startTime = Date.now(); // ⏱ start timer

  try {
    // 🔵 animation steps
    setTimeout(() => setStep(2), 800);
    setTimeout(() => setStep(3), 1600);

    // 🔥 backend call (fast or slow doesn't matter now)
    const res = await fetch("http://localhost:5000/api/resume/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    console.log("API RESPONSE:", data);


    // ⏱ calculate remaining time to reach 3 sec
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(3000 - elapsed, 0);

    // 🔥 FORCE DELAY
 setTimeout(() => {
  setFinalScore(data.score);

  localStorage.setItem("resumeScore", data.score);
  localStorage.setItem("resumeCompleted", "true");
  localStorage.setItem("resumeJustDone", "true"); // ✅ ADDED

  setSkills(data.skills || []);

      localStorage.setItem("skills", JSON.stringify(data.skills || []));
      localStorage.setItem("hobbies", JSON.stringify(data.hobbies || []));
      localStorage.setItem("softSkills", JSON.stringify(data.softSkills || []));

      setSuggestions(data.suggestions || []);
      setFeedback(data.feedback || "Analysis Complete");
      

      setStep(4);
      setLoading(false);
    }, remaining);

  } catch (err) {
    console.error(err);
    setLoading(false);
  }
};

  // ================= EDIT =================
const handleChange = (e) => {
  setResumeData({
    ...resumeData,
    [e.target.name]: e.target.value,
  });
};
// ================= DOWNLOAD =================
const downloadResume = () => {
  const blob = new Blob(
    [JSON.stringify(resumeData, null, 2)],
    { type: "application/json" }
  );

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Improved_Resume.json";
  link.click();
};

  useEffect(() => {
  if (finalScore > 0) {
    let current = 0;

    const counter = setInterval(() => {
      current += 2;

      if (current >= finalScore) {
        current = finalScore;
        clearInterval(counter);
      }

      setDisplayScore(current);
    }, 20);

    return () => clearInterval(counter);
  }
}, [finalScore]);

useEffect(() => {
  if (pdfLoaded) {
    setTimeout(() => {
      setLoading(true);
      setStep(1);

      // step animation
      setTimeout(() => setStep(2), 800);
      setTimeout(() => setStep(3), 1600);
    }, ); // small delay for smooth feel
  }
}, [pdfLoaded]);

  return (
    <div className="container">

      {/* ================= LEFT ================= */}
      <div className="left">
<div className="heading-mask">
  <h2 className="heading move-full">ATS Resume</h2>
</div>


        {/* ================= IMPROVE MODE ================= */}
 
        {improveMode ? (
          <div className="glass">
            <h3>Edit Resume</h3>

            <textarea name="summary" placeholder="Summary" onChange={handleChange} />
            <textarea name="skills" placeholder="Skills" onChange={handleChange} />
            <textarea name="experience" placeholder="Experience" onChange={handleChange} />
            <textarea name="education" placeholder="Education" onChange={handleChange} />

            <div className="buttons">
              <button className="btn-light" onClick={downloadResume}>
  Save & Download
</button>
              <button className="btn-dark">✨ Auto Improve</button>
            </div>
          </div>
        ) : (
          <>
            {/* ================= UPLOAD ================= */}
            {/* ========= UPLOAD ========= */}
<div className={`glass upload-card ${loading ? "loading" : ""}`}>
  <div className="upload-top">
    <h3>Upload Resume</h3>
    <p>Upload your resume (PDF only, max 5MB)</p>
  </div>


  {/* DROP ZONE */}

 <input
  type="file"
  ref={fileInputRef}
  style={{ display: "none" }}
  onChange={handleFile}
/>

<div
  className={`drop-zone ${fileName ? "uploaded" : ""}`}
  onClick={() => fileInputRef.current.click()}
  onDragOver={(e) => e.preventDefault()}
onDrop={(e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    setFile(file);
    setFileName(file.name);
    setFileUrl(URL.createObjectURL(file));

    handleUpload(file);   // 🔥 ADD THIS ALSO
  }
}}
>
  {!fileName ? (
    <>
      <div className="upload-icon"></div>
      <p>Drag & drop your PDF here</p>
    </>
  ) : (
    <div className="file-row">
      <div className="file-left">
        📄
        <div>
          <p className="file-name">{fileName}</p>
          <span>2.4 MB</span>
        </div>
      </div>

      {loading && (
        <div className="file-progress">
          <p>Scanning...</p>
          <div className="mini-bar"></div>
        </div>
      )}
    </div>
  )}
</div>


  {/* BUTTON */}
<button className="upload-btn" onClick={startScan}
disabled={!fileName}>
  Upload Resume
</button>
</div>



           {/* ================= STEPS + ATS ================= */}
<div className="ats-row">

  {/* LEFT SIDE (ATS + Suggestions) */}
  <div className="left-column">

    <div className={`glass ats-card ${step >= 4 ? "done" : ""}`}>
      <h3>ATS Score</h3>

      <div className="ats-container">

        {/* 🔥 CIRCLE */}
        <svg width="160" height="160" className="ats-svg">

          {/* 🔥 OUTER BORDER */}
          <circle cx="80" cy="80" r="65" className="outer-border" />

          {/* BG */}
          <circle cx="80" cy="80" r="60" className="progress-bg" />

          {/* PROGRESS */}
          <circle
            cx="80"
            cy="80"
            r="60"
            className="progress-bar"
            style={{
              strokeDasharray: 377,
              strokeDashoffset: step >= 4
                ? 377 - (377 * displayScore) / 100
                : 377
            }}
          />
        </svg>

        <svg width="160" height="160" className="ats-svg">
         <defs>
  <linearGradient id="gradientStroke" gradientUnits="userSpaceOnUse">
    <stop offset="0%" stopColor="#ff4d4d" />
    <stop offset="25%" stopColor="#ffcc00" />
    <stop offset="50%" stopColor="#00ffcc" />
    <stop offset="75%" stopColor="#3399ff" />
    <stop offset="100%" stopColor="#cc66ff" />

    {/* 🔥 ROTATING GRADIENT */}
    <animateTransform
      attributeName="gradientTransform"
      type="rotate"
      from="0 80 80"
      to="360 80 80"
      dur="4s"
      repeatCount="indefinite"
    />
  </linearGradient>
</defs>

          {/* BG */}
          <circle cx="80" cy="80" r="60" className="progress-bg" />

          {/* PROGRESS */}
          <circle
            cx="80"
            cy="80"
            r="60"
            className="progress-bar"
            style={{
              strokeDasharray: 377,
              strokeDashoffset: step >= 4
                ? 377 - (377 * displayScore) / 100
                : 377
            }}
          />
        </svg>

        {/* 🔥 SCORE */}
        <div className="ats-score">
          {step >= 4 ? `${displayScore}%` : "..."}
        </div>
      </div>

      <p className="ats-text">
        {step >= 4 ? "Great Match 🎯" : "Analyzing..."}
      </p>
    </div>
</div>

  {/* RIGHT SIDE (SKILLS) */}
  <div className="glass skills-card">
    <h3>Skills Extracted</h3>

    <div className="tags">
      {skills && skills.length > 0 ? (
skills.map((s) => (
  <span
    key={s}
    className={`skill-tag ${step >= 4 ? "animate" : ""}`}
  >
    {s}
  </span>

))      ) : (
        <p>No skills extracted yet</p>
      )}
    </div>
  </div>
  </div>


{/* 🔥 SUGGESTIONS + BUTTON SIDE BY SIDE */}
<div className="suggestions-row">

  {/* LEFT - Suggestions */}
  <div className="glass suggestions-card">
    <h3>Suggestions</h3>

   <div className="suggestions">
  {/* ⏳ Hide everything while scanning */}
  {loading ? null : (
    suggestions && suggestions.length > 0 ? (
      suggestions.map((s, i) => (
        <p key={i}>✓ {s}</p>
      ))
    ) : (
      <p className="strong-msg">
        ✓ Your resume is strong. No major improvements needed.
      </p>
    )
  )}
</div>
  </div>
  

  {/* RIGHT - Improve Button */}
 <div className="improve-container">

  <button
    className="improve-btn"
    onClick={() => setImproveMode(true)}
  >
    Improve Resume →
  </button>

  <button
    className="dashboard-btn"
    onClick={() => window.location.href = "/dashboard"}
  >
    Go to Dashboard ↓
  </button>

</div>

</div>


            {/* ================= SKILLS + SUGGESTIONS ================= */}
           

            {/* ================= BUTTONS ================= */}
          
          </>
        )}
      </div>


      {/* ================= RIGHT ================= */}
      <div className="right">
  <div className="glass preview-card">



    {/* RESUME */}
    <div className="resume-preview">
  {fileUrl ? (
    <>
      <iframe
  src={fileUrl}
  title="Resume Preview"
  className="pdf-frame"
  onLoad={() => setPdfLoaded(true)}   // 🔥 IMPORTANT
/>

      {/* 🔥 SCAN LINE */}
      {loading && <div className="scan-line"></div>}

      {/* 🔥 SCAN STATUS */}
      {loading && (
        <div className="scan-card">
          {step === 1 && <p>🔍 Analyzing keywords...</p>}
          {step === 2 && <p>📄 Checking formatting...</p>}
          {step === 3 && <p>⚡ Extracting skills...</p>}
          {step === 4 && <p>🎯 Calculating ATS score...</p>}
        </div>
      )}
    </>
  ) : (
    <p>No Resume Uploaded</p>
  )}
</div>

   
    {/* 🔥 FLOATING AI STATUS */}
   

  </div>
</div>

    </div>
  );
}