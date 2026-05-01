import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./AptitudeResult.css"

function AptitudeResult(){

const location = useLocation()
const navigate = useNavigate()

const {questions,answers,score} = location.state

return(

<div className="result-container">

<h2>Placementor Aptitude Result</h2>

<div className="score-card">

<h3>Your Score</h3>

<h1>{score} / {questions.length}</h1>

</div>

<div className="analysis">

{

questions.map((q,index)=>{

const userAnswer = answers[index]
const correct = q.answer

const isCorrect = userAnswer === correct

return(

<div className="question-review" key={index}>

<h4>Question {index+1}</h4>

<p>{q.question}</p>

<p>
Your Answer : 
<span className={isCorrect?"correct":"wrong"}>
{userAnswer !== undefined ? q.options[userAnswer] : "Not Answered"}
</span>
</p>

<p>
Correct Answer :
<span className="correct">
{q.options[correct]}
</span>
</p>

<p className="explanation">

Explanation :  
This question tests basic aptitude calculation. The correct option is {q.options[correct]}.

</p>

</div>

)

})

}

</div>

<button
className="dashboard-btn"
onClick={()=>navigate("/dashboard")}
>

Back to Dashboard

</button>

</div>

)

}

export default AptitudeResult