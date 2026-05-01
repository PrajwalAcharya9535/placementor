const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const Resume = require("../models/Resume");

// Question bank
const questionBank = {

 python: {
   easy: [
     "What is Python?",
     "What is a list in Python?",
     "What is indentation?",
     "What is tuple?"
   ],
   medium: [
     "Explain list comprehension.",
     "What are Python decorators?",
     "Explain generators."
   ],
   hard: [
     "Explain Python GIL.",
     "Difference between threading and multiprocessing?"
   ]
 },

 react: {
   easy: [
     "What is React?",
     "What is JSX?",
     "What is component in React?",
     "What is Virtual DOM?"
   ],
   medium: [
     "Difference between state and props?",
     "Explain React hooks.",
     "Explain useEffect."
   ],
   hard: [
     "Explain React lifecycle.",
     "How does reconciliation work?"
   ]
 },

 mongodb: {
   easy: [
     "What is MongoDB?",
     "What is a document?",
     "What is a collection?",
     "What is NoSQL?"
   ],
   medium: [
     "Explain indexing in MongoDB.",
     "What is aggregation pipeline?",
     "Explain sharding."
   ],
   hard: [
     "Explain MongoDB replication.",
     "Difference between sharding and replication."
   ]
 }

};

// shuffle helper
function shuffle(arr) {
 return arr.sort(() => Math.random() - 0.5);
}

// evaluation helper
function evaluateAnswer(text) {

 const words = text.toLowerCase().split(" ");

 let knowledge = words.length > 10 ? 8 : 5;
 let confidence = 8;
 let communication = 7;

 const fillers = ["uh", "umm", "maybe", "i think"];

 fillers.forEach(word => {
   if(text.toLowerCase().includes(word)){
     confidence -=1;
   }
 });

 return {
   knowledge,
   confidence,
   communication
 };
}


// START HR INTERVIEW
router.get("/start", protect, async (req,res)=>{

 try{

   const resume = await Resume.findOne({userId:req.user.id});

   if(!resume){
     return res.status(404).json({message:"Resume not found"});
   }

   const skills = Object.values(resume.extractedSkills).flat();

   const shuffledSkills = shuffle(skills);

   res.json({
     message:"Interview started",
     skills:shuffledSkills
   });

 }catch(error){

   res.status(500).json({message:error.message});

 }

});


// GET QUESTIONS FOR SKILL
router.get("/questions/:skill", protect, (req,res)=>{

 const skill = req.params.skill.toLowerCase();

 const skillQuestions = questionBank[skill];

 if(!skillQuestions){
   return res.json({message:"No questions available for this skill"});
 }

 const easy = shuffle(skillQuestions.easy).slice(0,4);
 const medium = shuffle(skillQuestions.medium).slice(0,3);
 const hard = shuffle(skillQuestions.hard).slice(0,2);

 const questions = [...easy,...medium,...hard];

 res.json({
   skill,
   questions
 });

});


// ANALYZE ANSWER
router.post("/answer", protect, (req,res)=>{

 try{

  const {answer,skill} = req.body;

  const score = evaluateAnswer(answer);

  res.json({
    skill,
    score
  });

 }catch(error){

  res.status(500).json({message:error.message});

 }

});

module.exports = router;