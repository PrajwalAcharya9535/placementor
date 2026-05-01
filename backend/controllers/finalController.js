const Result = require("../models/Result");
const InterviewResult = require("../models/InterviewResult");

exports.getFinalResult = async (req,res)=>{

 try{

   const userId = req.user.id;

   const aptitude = await Result.findOne({userId});
   const hr = await InterviewResult.findOne({userId});

   const aptitudeScore = aptitude ? aptitude.score : 0;

   const technicalScore = 70; // temporary until coding score stored

   const hrScore = hr ? Math.round(
     (hr.knowledge + hr.confidence + hr.communication) / 3 * 10
   ) : 0;

   const finalScore = Math.round(
     (aptitudeScore + technicalScore + hrScore)/3
   );

   res.json({

     aptitudeScore,
     technicalScore,
     hrScore,
     finalScore,

     status:
       finalScore >= 75
         ? "Ready for Interview"
         : "Needs Improvement"

   });

 }catch(err){

   res.status(500).json({message:err.message});

 }

};