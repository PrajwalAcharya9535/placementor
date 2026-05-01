import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./PermissionPage.css";
import * as faceapi from "face-api.js";
function PermissionPage() {
  const navigate = useNavigate();
  const location = useLocation();
const query = new URLSearchParams(location.search);

const type = query.get("type"); // aptitude or technical
const isTechnical = type === "technical";
  const videoRef = useRef(null);
const [cameraOn, setCameraOn] = useState(false);
const [screenOn, setScreenOn] = useState(false);
const [fullscreenOn, setFullscreenOn] = useState(false);
const [currentStep, setCurrentStep] = useState("camera");
const [videoReady, setVideoReady] = useState(false);
const [modelsLoaded, setModelsLoaded] = useState(false);

const [aiMessage, setAiMessage] = useState(
isTechnical
  ? 'Click "Share Screen" to begin'
  : 'Click "Enable Camera" to begin verification');
const [faceOk, setFaceOk] = useState(false);
const [lightingOk, setLightingOk] = useState(false);
const [eyeOk, setEyeOk] = useState(false);


useEffect(() => {
  const loadModels = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");

    console.log("✅ Models loaded");
    setModelsLoaded(true);
  };

  loadModels();
}, []);


useEffect(() => {
  if (!cameraOn) return;

  const video = videoRef.current;
  if (!video) return;

  const stream = window.cameraStream;

  if (stream) {
    video.srcObject = stream;

    video.onloadedmetadata = () => {
      video.play()
        .then(() => {
          console.log("✅ Video rendering fixed");
          setVideoReady(true);
        })
        .catch(err => console.error(err));
    };
  }
}, [cameraOn]);

const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    window.cameraStream = stream; // store
    setCameraOn(true); // trigger render

    setAiMessage("🔍 Please stay still while we verify your face");

  } catch (err) {
    console.error("❌ Camera error:", err);
  }
};

useEffect(() => {
  if (!cameraOn || !videoReady || !modelsLoaded) return;

  const video = videoRef.current;
  if (!video) return;

let step = 1;
let stableCount = 0;

const interval = setInterval(async () => {

  // 🔥 ADD THIS (MOST IMPORTANT)
  if (!video.videoWidth || !video.videoHeight) {
    console.log("⏳ Waiting for video frame...");
    return;
  }

  console.log("🔍 Detecting...");

  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks();

  // ❌ NO FACE
  if (!detection) {
    setAiMessage("📍 Sit in front of camera");
    stableCount = 0;
    return;
  }

  const box = detection.detection.box;

  // 🎯 FACE REGION ONLY
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0);

const faceFrame = ctx.getImageData(
  Math.floor(box.x),
  Math.floor(box.y),
  Math.floor(box.width),
  Math.floor(box.height)
);

  // --------------------------
  // 💡 LIGHTING CHECK
  // --------------------------
  let brightness = 0;
  let min = 255;
  let max = 0;

  for (let i = 0; i < faceFrame.data.length; i += 4) {
    const val = faceFrame.data[i];

    brightness += val;
    if (val < min) min = val;
    if (val > max) max = val;
  }

  brightness = brightness / (faceFrame.data.length / 4);
  const contrast = max - min;

  // ==========================
  // 🔥 STEP 1: LIGHTING
  // ==========================
  if (step === 1) {

    if (brightness < 80) {
      setAiMessage("💡 Too dark → move to brighter place");
      stableCount = 0;
      return;
    }

    if (brightness > 180) {
      setAiMessage("⚠️ Too bright → reduce light");
      stableCount = 0;
      return;
    }

    if (contrast < 50) {
      setAiMessage("⚠️ Face not clear → adjust position");
      stableCount = 0;
      return;
    }

    // 🧠 STABILITY
    stableCount++;

    if (stableCount === 1) {
      setAiMessage("👍 Good... hold still");
      return;
    }

    if (stableCount === 2) {
      setAiMessage("⏳ Almost perfect...");
      return;
    }

    if (stableCount >= 3) {
      setAiMessage("✅ Perfect lighting 👍 Stay here");

      // 🔒 STORE BASELINE
 

      step = 2;
      stableCount = 0;
      return;
    }
  }

  // ==========================
  // 👀 STEP 2: EYE TRACK READY
  // ==========================
  if (step === 2) {

    const leftEye = detection.landmarks.getLeftEye();
    const rightEye = detection.landmarks.getRightEye();

    if (!leftEye || !rightEye) {
      setAiMessage("👀 Look straight at camera");
      stableCount = 0;
      return;
    }

    const eyeHeight =
      Math.abs(leftEye[1].y - leftEye[5].y) +
      Math.abs(rightEye[1].y - rightEye[5].y);

    // 📏 DISTANCE CONTROL (IMPORTANT)
    if (box.width < 150) {
      setAiMessage("📏 Too far → come closer");
      stableCount = 0;
      return;
    }

    if (box.width > 320) {
      setAiMessage("⚠️ Too close → move back");
      stableCount = 0;
      return;
    }

    // 👀 EYE VISIBILITY
    if (eyeHeight < 6) {
      setAiMessage("👀 Keep eyes clearly visible");
      stableCount = 0;
      return;
    }

    // 🧠 STABILITY
    stableCount++;

    if (stableCount === 1) {
      setAiMessage("👍 Good... checking eyes");
      return;
    }

    if (stableCount === 2) {
      setAiMessage("⏳ Hold steady...");
      return;
    }

if (stableCount >= 3) {

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  localStorage.setItem("verified", "true");

  // 🔥 ADD THIS CHECK
  if (Math.abs(centerX - (video.videoWidth / 2)) > 80) {
    setAiMessage("⚠️ Sit in center of screen");
    stableCount = 0;
    return;
  }

  // 🔒 STORE BASELINE
  localStorage.setItem("baseline", JSON.stringify({
    brightness,
    contrast,
    faceWidth: box.width,
    centerX,
    centerY,
    eyeHeight
  }));

  setAiMessage("🎉 Ready for test → maintain this position");

  setFaceOk(true);
  setLightingOk(true);
  setEyeOk(true);

  setCurrentStep("screen");

  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }

  clearInterval(interval);
}
  }

}, 500);

  return () => clearInterval(interval);
}, [cameraOn, videoReady,  modelsLoaded]);


  // 🖥 Screen share
const startScreen = async () => {

  // ✅ Only check camera for aptitude
  if (!cameraOn && !isTechnical) {
    alert("Enable camera first!");
    return;
  }

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
  });

  setScreenOn(true);
  setCurrentStep("fullscreen");
};

const startFullscreen = () => {
  if (!screenOn) return;

  document.documentElement.requestFullscreen();
  setFullscreenOn(true);

  setCurrentStep("done"); // 🔥 stop glow
};

const startTest = () => {

  // ✅ Aptitude → need all permissions
  if (!isTechnical) {
    if (!cameraOn || !screenOn || !fullscreenOn) {
      alert("Enable all permissions first!");
      return;
    }

    navigate("/aptitude");
  }

  // ✅ Technical → NO camera needed
  else {
    if (!screenOn || !fullscreenOn) {
      alert("Enable screen & fullscreen first!");
      return;
    }

    navigate("/technical");
  }
};

  useEffect(() => {
  return () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };
}, []);

 return (
<div className="permission-container">

<div className="hero">

  <h1 className="hero-title">
    🔒 Secure Test
  </h1>

  <p className="hero-sub">
    Your session will be monitored • Stay focused • No distractions
  </p>

</div>

<div className="permission-grid">

  {/* CAMERA (ONLY FOR APTITUDE) */}
  {!isTechnical && (
  <div className={`permission-card ${cameraOn ? "success" : ""}`}>

    <div className="icon camera-icon"></div>

    <h3>Camera Access</h3>

    <div className="dynamic-status">

      {!cameraOn && (
        <span className="idle-text">
          Ready to verify your face & environment
        </span>
      )}

      {cameraOn && !faceOk && (
        <span className="idle-text">
          Checking face & lighting...
        </span>
      )}

      {faceOk && lightingOk && eyeOk && (
        <span className="success-text">
          Face Verified Successfully
        </span>
      )}

    </div>

    <button 
      onClick={startCamera}
      disabled={cameraOn}
      className={currentStep === "camera" ? "active-btn" : ""}
    >
      Enable Camera
    </button>

  </div>
  )}

  {/* SCREEN */}
  <div className={`permission-card ${(!cameraOn && !isTechnical) ? "disabled" : ""} ${screenOn ? "success" : ""}`}>

    <div className="icon screen-icon"></div>

    <h3>Screen Monitoring</h3>

    <div className="dynamic-status">

      {!cameraOn && !isTechnical && (
        <span className="idle-text">
          Complete camera verification
        </span>
      )}

      {(cameraOn || isTechnical) && !screenOn && (
        <span className="idle-text">
          Ready to share your screen
        </span>
      )}

      {screenOn && (
        <span className="success-text">
          Screen Shared Successfully
        </span>
      )}

    </div>

    <button 
      onClick={startScreen}
      disabled={isTechnical ? false : (!faceOk || !lightingOk || !eyeOk)}
      className={currentStep === "screen" ? "active-btn" : ""}
    >
      Share Screen
    </button>

  </div>

  {/* FULLSCREEN */}
  <div className={`permission-card ${!screenOn ? "disabled" : ""} ${fullscreenOn ? "success" : ""}`}>

    <div className="icon fullscreen-icon"></div>

    <h3>Secure Mode</h3>

    <div className="dynamic-status">

      {!screenOn && (
        <span className="idle-text">
          Complete screen sharing
        </span>
      )}

      {screenOn && !fullscreenOn && (
        <span className="idle-text">
          Enable fullscreen mode
        </span>
      )}

      {fullscreenOn && (
        <span className="success-text">
          Secure Mode Activated
        </span>
      )}

    </div>

    <button 
      onClick={startFullscreen}
      disabled={!screenOn}
      className={currentStep === "fullscreen" ? "active-btn" : ""}
    >
      Enter Fullscreen
    </button>

  </div>

</div>

{/* VIDEO PREVIEW (ONLY FOR APTITUDE) */}
{!isTechnical && (
<div className="video-container">
  {!cameraOn ? (
    <div className="video-placeholder">
      Camera preview will appear here
    </div>
  ) : (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="live-video"
    />
  )}
</div>
)}

<div className="ai-box">
  {aiMessage}
</div>

{/* START BUTTON */}
<button
  className="start-btn"
  disabled={
    isTechnical
      ? (!screenOn || !fullscreenOn)
      : (!cameraOn || !screenOn || !fullscreenOn)
  }
  onClick={startTest}
>
  Start Test
</button>

</div>
);
}

export default PermissionPage;