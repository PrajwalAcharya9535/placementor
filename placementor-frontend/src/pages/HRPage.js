import React, { useState, useEffect,useRef } from "react";
import "./HRPage.css";

function HRPage() {

const [stage, setStage] = useState("start");
const [messages, setMessages] = useState([]);
const [memory, setMemory] = useState([]);
const [skills, setSkills] = useState([]);
const [activeSkill, setActiveSkill] = useState("Python");
const [showSkillsCard, setShowSkillsCard] = useState(false);
const [flip, setFlip] = useState(false);
const [showUI, setShowUI] = useState(false);
const [showInterview, setShowInterview] = useState(false);
const [hobbies, setHobbies] = useState([]);
const [softSkills, setSoftSkills] = useState([]);
const [resume, setResume] = useState(null);
const [questionCount, setQuestionCount] = useState(0);
const [score, setScore] = useState(0);
const TOTAL_QUESTIONS = 5;   // you can change later
const [isListening, setIsListening] = useState(false);
const [transcript, setTranscript] = useState("");
const recognitionRef = useRef(null);
const [candidateName, setCandidateName] = useState("Candidate");
const [interviewStep, setInterviewStep] = useState(0);
const [projectCount, setProjectCount] = useState(0);



useEffect(() => {
  const name = localStorage.getItem("candidateName");
  if (name) setCandidateName(name);
}, []);

useEffect(() => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech Recognition not supported");
    return;
  }

  const recog = new SpeechRecognition();

  recog.continuous = true;
  recog.interimResults = true;
  recog.lang = "en-US";

recog.onresult = (event) => {
  let liveText = "";

  for (let i = 0; i < event.results.length; i++) {
    liveText += event.results[i][0].transcript + " ";
  }

  setTranscript(liveText);

  // 🔥 SHOW LIVE TEXT IN CHAT
  setMessages(prev => {
    const last = prev[prev.length - 1];

    if (last && last.type === "user-live") {
      return [
        ...prev.slice(0, -1),
        { type: "user-live", text: liveText }
      ];
    }

    return [...prev, { type: "user-live", text: liveText }];
  });
};

  recognitionRef.current = recog;   // ✅ STORE HERE
}, []);


useEffect(() => {
  const storedResume = localStorage.getItem("resume");

  if (storedResume) {
    setResume(storedResume);
  }

  // ✅ LOAD REAL DATA FROM LOCALSTORAGE
  const storedSkills = JSON.parse(localStorage.getItem("skills")) || [];
  const storedHobbies = JSON.parse(localStorage.getItem("hobbies")) || [];
  const storedSoft = JSON.parse(localStorage.getItem("softSkills")) || [];

  setSkills(storedSkills);
  setHobbies(storedHobbies);
  setSoftSkills(storedSoft);

  console.log("Loaded from storage:", storedSkills, storedHobbies, storedSoft);
}, []);

  // 🎤 SPACE KEY

useEffect(() => {
  const handleKeyDown = async (e) => {
    if (stage !== "done") return;

    if (e.code === "Space") {
      e.preventDefault();

      // 🎤 START
if (!isListening) {
// 🎤 START LISTENING
setIsListening(true);
setTranscript("");

recognitionRef.current?.start();

setMessages(prev => [
...prev,
{ type: "ai", text: "Listening..." }
]);

} else {
// 🛑 STOP LISTENING
setIsListening(false);

recognitionRef.current?.stop();

const userAnswer = transcript;

if (!userAnswer || userAnswer.trim().length < 3) {
  setMessages(prev => [
    ...prev,
    { type: "ai", text: "I couldn't catch that clearly. Please try again." }
  ]);
  return;
}

// 🔥 ADD THIS LINE HERE
const updatedMemory = [
  ...memory,
  {
    step: interviewStep - 1,
    answer: userAnswer
  }
];

setMemory(updatedMemory);
setMessages(prev => {
  const filtered = prev.filter(msg => msg.type !== "user-live");

  return [
    ...filtered,
    { type: "user", text: userAnswer }
  ];
});

const lastQuestion =
messages[messages.length - 1]?.text || "";

const result = await evaluateAnswer(userAnswer, lastQuestion);

setScore(prev => prev + result.score);
setQuestionCount(prev => prev + 1);

const currentStep = interviewStep - 1;
const hr = getHRResponse(userAnswer, currentStep, updatedMemory);// 👉 HR reaction
setMessages(prev => [
  ...prev,
  { type: "ai", text: "" }
]);

speakWithTyping(hr.reaction);

// 👉 follow-up after delay
setTimeout(() => {
  if (hr.followUp) {
    speakWithTyping(hr.followUp);
  } else {
    // ✅ ONLY call next question if NO follow-up
    setTimeout(() => {
      askNextQuestion();
    }, 2000);
  }
}, 2000);
}
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [stage, isListening, transcript, messages]);


const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.pitch = 1;
  utterance.rate = 1;

  window.speechSynthesis.speak(utterance);
};


  // 🔥 CLICK HANDLER
const handleClick = () => {
  setStage("loading");
  setTimeout(() => {
    setStage("scanning");

setTimeout(() => {
 setFlip(true);

  setTimeout(() => {
    setShowSkillsCard(true);
    setStage("done");
  }, 800);

}, 3000);

  }, 800);
};

const questionBank = {
  Python: [
    "Explain OOP concepts in Python",
    "What is difference between list and tuple?",
    "Explain decorators in Python"
  ],
  React: [
    "What is useEffect?",
    "Explain virtual DOM",
    "Difference between state and props"
  ],
  MongoDB: [
    "What is NoSQL?",
    "Explain aggregation in MongoDB"
  ],
  Node: [
    "What is event loop in Node.js?",
    "Explain middleware"
  ],
  Communication: [
    "How do you handle team conflicts?",
    "Describe a situation where you communicated effectively"
  ],
  Teamwork: [
    "Tell me about a team project",
    "How do you contribute in a team?"
  ]
};


const questionStyles = {
  intro: [
    "Can you introduce yourself?",
    "Tell me about yourself",
    "Give me a quick overview about you",
    "Walk me through your background",
    "How would you describe yourself professionally?"
  ],

  skills: [
    "What are your key skills?",
    "Which skills are you strongest in?",
    "Can you tell me your core technical skills?",
    "What are your major strengths in skills?",
    "Which skill are you most confident about?"
  ],

  project: [
    "Explain one project you worked on",
    "Tell me about a project you built",
    "Can you describe your recent project?",
    "Walk me through your project",
    "What project are you most proud of?"
  ],

  challenge: [
    "What challenges did you face?",
    "Tell me about a difficult situation",
    "Did you face any obstacles in your project?",
    "What was the toughest part of your work?",
    "Describe a challenge and how you handled it"
  ],

  teamwork: [
    "Tell me about a situation where you worked in a team",
    "Describe your teamwork experience",
    "Have you worked in a team before?",
    "How do you collaborate with others?",
    "Explain your role in a team project"
  ],

  hire: [
    "Why should we hire you?",
    "What makes you a good fit for this role?",
    "Why do you think you are suitable for this job?",
    "Convince me why we should select you",
    "What makes you stand out?"
  ]
};

const getRandom = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const askNextQuestion = () => {

if (interviewStep === 0) {
  const q = getRandom(questionStyles.intro);
  speakWithTyping(`Hi ${candidateName}, ${q}`);
  setInterviewStep(1);
  return;
}

if (interviewStep === 1) {
  const q = getRandom(questionStyles.skills);
  speakWithTyping(q);
  setInterviewStep(2);
  return;
}

if (interviewStep === 2) {
  const q = getRandom(questionStyles.project);
  speakWithTyping(q);
  setInterviewStep(3);
  return;
}

if (interviewStep === 3) {
  const q = getRandom(questionStyles.challenge);
  speakWithTyping(q);
  setInterviewStep(4);
  return;
}

if (interviewStep === 4) {
  const q = getRandom(questionStyles.teamwork);
  speakWithTyping(q);
  setInterviewStep(5);
  return;
}

if (interviewStep === 5) {
  const q = getRandom(questionStyles.hire);
  speakWithTyping(q);
  setInterviewStep(6);
  return;
}

// ✅ AFTER LAST QUESTION (step 6)
if (interviewStep === 6) {
  finishHRInterview();
  return;
}
};


const evaluateAnswer = async (answer, question) => {
  try {
    const res = await fetch("http://localhost:5000/api/evaluate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ answer, question })
    });

    const data = await res.json();

    return data; // { score: 1, feedback: "Good answer" }

  } catch (err) {
    console.error(err);
    return { score: 0, feedback: "Error evaluating answer" };
  }
};

const speakWithTyping = (text) => {

  // ✅ PROTECTION
  if (!text || typeof text !== "string") return;

  const words = text.split(" ");
  let index = 0;
  let currentText = "";

  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1;
  utter.pitch = 1;

  window.speechSynthesis.speak(utter);

  const interval = setInterval(() => {
    if (index >= words.length) {
      clearInterval(interval);
      return;
    }

    currentText += words[index] + " ";

    setMessages(prev => {
      const last = prev[prev.length - 1];

      if (last && last.type === "ai") {
        return [
          ...prev.slice(0, -1),
          { type: "ai", text: currentText }
        ];
      }

      return prev;
    });

    index++;
  }, 120);
};


const chatRef = useRef(null);

useEffect(() => {
  if (chatRef.current) {
    chatRef.current.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth"   // 🔥 smooth movement
    });
  }
}, [messages]);

const resetMic = () => {
  recognitionRef.current?.stop();

  setIsListening(false);
  setTranscript("");

  setMessages(prev =>
    prev.filter(msg => msg.type !== "user-live")
  );
};

const endInterview = () => {
  recognitionRef.current?.stop();
  setIsListening(false);
  setTranscript("");

  finishHRInterview();
};

const feedbackStyles = {
  intro: [
    "Nice introduction 👍",
    "Good start 👏",
    "That was clear and well structured 👌",
    "Confident introduction, good 👍",
    "Decent intro, you can make it more impactful"
  ],

  skills: [
    "Good skillset 👍",
    "Nice combination of skills 👏",
    "You seem comfortable with your skills 👌",
    "That's a decent skill profile",
    "Try to explain your strongest skill more clearly"
  ],

  project: [
    "That sounds interesting 👍",
    "Nice project explanation 👏",
    "Good work on that project 👌",
    "You explained it well",
    "Try to include more technical depth"
  ],

  challenge: [
    "Good 👍",
    "Nice effort 👏",
    "That’s a valid challenge",
    "You handled it well",
    "Explain your solution more clearly next time"
  ],

  teamwork: [
    "Nice 👍 teamwork is important",
    "Good collaboration 👏",
    "That shows team spirit 👍",
    "You seem comfortable working in teams",
    "Try to explain your contribution clearly"
  ],

  hire: [
    "Good answer 👍",
    "Confident response 👏",
    "That was convincing 👍",
    "Nice explanation 👌",
    "You can make it more impactful"
  ]
};

const followUpStyles = {
  skills: [
    "Can you explain one skill in detail?",
    "Which skill are you most confident in?",
    "Can you give a real example of using that skill?",
    "Where have you applied this skill?",
    "What makes you strong in that skill?"
  ],

  project: [
    "What was your role in that project?",
    "What exactly did you contribute?",
    "Can you explain your responsibilities?",
    "What part of the project did you handle?",
    "What challenges did you personally solve?"
  ],

  challenge: [
    "How did you solve it?",
    "What approach did you take?",
    "Can you explain your solution clearly?",
    "What steps did you follow to fix it?",
    "What did you learn from that?"
  ],

  teamwork: [
    "What was your role in the team?",
    "How did you contribute to the team?",
    "Did you face any conflicts?",
    "How did you handle team coordination?",
    "What did you learn from teamwork?"
  ],

  hire: [
    "Can you justify that with an example?",
    "Why do you think so?",
    "Can you support that with your experience?",
    "What makes you confident about that?",
    "Can you explain that more strongly?"
  ]
};


const getHRResponse = (answer, step, memory) => {

  const a = answer.toLowerCase();

  // 🟢 INTRO
  if (step === 1) {
    return {
      reaction: getRandom(feedbackStyles.intro),
      followUp: null
    };
  }

  // 🔵 SKILLS (1–2 questions max)
  if (step === 2) {
    if (a.length < 20) {
      return {
        reaction: getRandom(feedbackStyles.skills),
        followUp: getRandom(followUpStyles.skills)
      };
    }

    return {
      reaction: getRandom(feedbackStyles.skills),
      followUp: null
    };
  }

  // 🟣 PROJECT (MAX 2–3 interactions)
  if (step === 3) {

    // 👉 First project answer
    if (questionCount === 2) {
      return {
        reaction: getRandom(feedbackStyles.project),
        followUp: "What was your role in this project?"
      };
    }

    // 👉 Second (last follow-up)
    if (questionCount === 3) {
      return {
        reaction: getRandom(feedbackStyles.project),
        followUp: null
      };
    }

    // 👉 Stop project questions
    return {
      reaction: getRandom(feedbackStyles.project),
      followUp: null
    };
  }

  // 🔴 CHALLENGE
  if (step === 4) {
    return {
      reaction: getRandom(feedbackStyles.challenge),
      followUp: getRandom(followUpStyles.challenge)
    };
  }

  // 🟠 TEAMWORK
  if (step === 5) {
    return {
      reaction: getRandom(feedbackStyles.teamwork),
      followUp: getRandom(followUpStyles.teamwork)
    };
  }

  // ⚫ FINAL (WHY SHOULD WE HIRE YOU)
  if (step === 6) {
    return {
      reaction: getRandom(feedbackStyles.hire),
      followUp: null
    };
  }

  return {
    reaction: "Okay 👍",
    followUp: null
  };
};

const finishHRInterview = () => {

  const finalPercentage =
    questionCount > 0
      ? Math.round((score / questionCount) * 100)
      : 0;

  console.log("HR FINAL SCORE:", finalPercentage);

  // ✅ SAVE
  localStorage.setItem("hrScore", String(finalPercentage));
  localStorage.setItem("hrCompleted", "true");
  localStorage.setItem("hrJustDone", "true"); // 🔥 ADD THIS

  speakWithTyping(`Thank you ${candidateName}, interview completed 🎉`);

  setTimeout(() => {
    window.location.href = "/dashboard";
  }, 3000);
};

  return (

    <div className="hr-page">
    <div className="hr-container">

      {/* HEADER */}
      <div className="hr-header">
        Placementor | HR Interview
      </div>

      <div className="center-screen">

        {/* 🔥 RESUME CARD */}
{/* 🔥 RESUME CARD */}
<div className="resume-card">
  <div className={`card-inner ${flip ? "flip" : ""}`}>

    {/* FRONT */}
    <div className="card-front">
      {stage === "start" && (
        <>
          <h2>AI HR Interview</h2>
          <p>Click below to begin</p>
          <button className="start-btn" onClick={handleClick}>
            Click Here
          </button>
        </>
      )}

      {(stage === "loading" || stage === "scanning" || stage === "done") && (
        <div className="pdf-container">
{resume ? (
  <iframe src={resume} title="resume" width="100%" height="100%" />
) : (
  <p>No resume found</p>
)}

          {stage === "scanning" && <div className="scan-line"></div>}
        </div>
      )}
    </div>

    {/* BACK */}
<div className="card-back">

  {!showInterview ? (
    <>
      <h3>🤖 AI Interview</h3>

      <button
        className="start-interview-btn"
onClick={() => {
  setShowInterview(true);
  askNextQuestion();   // 🔥 first question instantly
}}
      >
        ▶ Start Interview
      </button>
    </>
  ) : (
    <div className="inside-interview">

      {/* CHAT */}
      <div className="chat-area" ref={chatRef}>
        {messages.length === 0 ? (
          <div className="chat-placeholder">
            🤖 Interview will begin...
          </div>
        ) : (
          messages.map((msg, i) => (
   <div
  key={i}
  className={
    msg.type === "ai"
      ? "ai-msg"
      : msg.type === "user-live"
      ? "user-msg live"
      : "user-msg"
  }
>
  {msg.text}
</div>
          ))
        )}
      </div>

      {/* MIC */}
<div className="mic-area">
<button className="end-btn" onClick={endInterview}>
  ⛔ End
</button>
  <button className="mic-close" onClick={resetMic}>
  ✖
</button>

  <div className={`google-mic ${isListening ? "active" : ""}`}>
    
    {/* OUTER GLOW */}
    <div className="mic-glow"></div>

    {/* INNER CIRCLE */}
    <div className="mic-inner">
      <svg viewBox="0 0 24 24" className="mic-icon">
        <path d="M12 14a3 3 0 003-3V5a3 3 0 10-6 0v6a3 3 0 003 3zm5-3a1 1 0 10-2 0 3 3 0 01-6 0 1 1 0 10-2 0 5 5 0 0010 0zM11 19h2v3h-2z"/>
      </svg>
    </div>

  </div>

  <p className="mic-text">
    {isListening ? "Listening..." : "Press SPACE to Speak"}
  </p>
</div>

    </div>
  )}

</div>

  </div>
</div>

{/* ✅ SKILLS POPUP (OUTSIDE EVERYTHING) */}
{showSkillsCard && (
<div className="skills-popup">

  {/* Skills */}
  {skills.map((s, i) => (
    <span key={i} className="skill">{s}</span>
  ))}

  {/* Hobbies */}
  {hobbies.map((h, i) => (
    <span key={i} className="skill hobby">{h}</span>
  ))}

  {/* Soft Skills */}
  {softSkills.map((s, i) => (
    <span key={i} className="skill soft">{s}</span>
  ))}

</div>
)}



      </div>
    </div>
    </div>
  );
}

export default HRPage;