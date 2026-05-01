const Resume = require("../models/Resume");
const HrQuestion = require("../models/HrQuestion");
const InterviewResult = require("../models/InterviewResult");

// start interview
exports.startInterview = async (req,res)=>{

 try{

  const resume = await Resume.findOne({userId:req.user.id});

  if(!resume){
   return res.status(404).json({message:"Resume not found"});
  }

  const skills = resume.extractedSkills.flat();

  const shuffledSkills = skills.sort(()=>Math.random()-0.5);

  res.json({
   message:"HR Interview Started",
   skills:shuffledSkills
  });

 }catch(err){
  res.status(500).json({message:err.message});
 }

};



// fetch questions for skill
exports.getQuestions = async (req,res)=>{

 try{

  const skill = req.params.skill.toLowerCase();

  const easy = await HrQuestion.find({skill,difficulty:"easy"}).limit(4);

  const medium = await HrQuestion.find({skill,difficulty:"medium"}).limit(3);

  const hard = await HrQuestion.find({skill,difficulty:"hard"}).limit(2);

  const questions = [...easy,...medium,...hard];

  res.json(questions);

 }catch(err){
  res.status(500).json({message:err.message});
 }

};



// answer evaluation
exports.evaluateAnswer = async (req,res)=>{

 try{

  const {answer,skill} = req.body;

  const words = answer.split(" ").length;

  let knowledge = words > 12 ? 8 : 5;

  let confidence = 8;

  const fillerWords = ["uh","umm","maybe","i think"];

  fillerWords.forEach(word=>{
   if(answer.toLowerCase().includes(word)){
    confidence -=1;
   }
  });

  const communication = words>10 ? 7 : 5;

  const result = new InterviewResult({
   userId:req.user.id,
   skill,
   knowledge,
   confidence,
   communication
  });

  await result.save();

  res.json({
   knowledge,
   confidence,
   communication
  });

 }catch(err){
  res.status(500).json({message:err.message});
 }

};