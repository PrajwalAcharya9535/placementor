import React, { useState, useEffect } from "react";
import "./LoginPage.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RegisterPage() {

const navigate = useNavigate();

const [email,setEmail] = useState("");

const [otp,setOtp] = useState(["","","","","",""]);
const [otpSent,setOtpSent] = useState(false);

const [emailVerified,setEmailVerified] = useState(false);

const [password,setPassword] = useState("");
const [confirmPassword,setConfirmPassword] = useState("");

const [showPassword,setShowPassword] = useState(false);
const [showConfirmPassword,setShowConfirmPassword] = useState(false);

const [timer,setTimer] = useState(180);
const [otpError,setOtpError] = useState("");

const [emailTyped,setEmailTyped] = useState(false);
const [loadingOtp,setLoadingOtp] = useState(false);
const [verifyingOtp,setVerifyingOtp] = useState(false);


/* OTP TIMER */

useEffect(()=>{

if(!otpSent) return;
if(timer <= 0) return;

const interval = setInterval(()=>{
setTimer(prev=>prev-1);
},1000);

return ()=>clearInterval(interval);

},[timer,otpSent]);



/* SEND OTP */

const sendOtp = async () => {

if(!email){
alert("Please enter email");
return;
}

setLoadingOtp(true);

try{

await axios.post(
"http://localhost:5000/api/auth/send-register-otp",
{ email }
);

setOtpSent(true);
setTimer(180);
setOtp(["","","","","",""]);
setOtpError("");

setTimeout(()=>{
document.getElementById("otp-0").focus();
},100);

}catch(error){

alert(error.response?.data?.message || "Failed to send OTP");

}

setLoadingOtp(false);

};


/* OTP INPUT */

const handleOtpChange = (value,index)=>{

if(!/^[0-9]?$/.test(value)) return;

const newOtp = [...otp];
newOtp[index] = value;

setOtp(newOtp);

if(value && index < 5){
document.getElementById(`otp-${index+1}`).focus();
}

};



/* BACKSPACE CONTROL */

const handleBackspace = (e,index)=>{

if(e.key === "Backspace" && !otp[index] && index > 0){
document.getElementById(`otp-${index-1}`).focus();
}

};



/* VERIFY OTP */

const verifyOtp = () => {

  const enteredOtp = otp.join("");

  if(enteredOtp.length !== 6){
    setOtpError("Enter complete OTP");
    return;
  }

  setOtpError("");
  setEmailVerified(true);

};

/* REGISTER USER */


const handleRegister = async (e) => {

  e.preventDefault();

  if(password !== confirmPassword){
    alert("Passwords do not match");
    return;
  }

  try{

    const res = await axios.post(
      "http://localhost:5000/api/auth/verify-register",
      {
        name: email.split("@")[0],
        email: email,
        otp: otp.join(""),
        password: password
      }
    );

    alert(res.data.message);

    navigate("/login");

  }catch(err){

    alert(err.response?.data?.message || "Registration failed");

  }

};

return(

<div
className="login-wrapper">


<div className="login-container">

<div className="login-card">

<div className="card-header">
  <h1>PLACEMENTOR</h1>
</div>

<div className="login-content">
  <h2 className="login-heading">Create Account</h2>
  <p className="sub-text">Verify email & continue</p>

<form onSubmit={handleRegister}>


{/* EMAIL */}

<div className="input-group">

  <input
    type="email"
    placeholder="Enter your email"
    value={email}
    onChange={(e)=>{
      setEmail(e.target.value);
      setEmailTyped(e.target.value.length > 0);
    }}
    required
  />

  {/* ICON INSIDE INPUT */}
  {emailTyped && (
    <span
      style={{
        position: "absolute",
        right: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "#2563eb",
        color: "white",
        borderRadius: "50%",
        width: "26px",
        height: "26px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer"
      }}
      onClick={sendOtp}
    >
      ➜
    </span>
  )}

</div>



{/* OTP SECTION */}

{otpSent && !emailVerified && (

<>

<div className="otp-container">

{otp.map((digit,index)=>(

<input
key={index}
id={`otp-${index}`}
type="text"
maxLength="1"
value={digit}
onChange={(e)=>handleOtpChange(e.target.value,index)}
onKeyDown={(e)=>handleBackspace(e,index)}
className="otp-box"
/>

))}

</div>

<p className="otp-timer">
OTP expires in {timer}s
</p>

<button
type="button"
className="login-btn"
onClick={verifyOtp}
>
Verify OTP
</button>

{otpError && (
<p className="otp-error">{otpError}</p>
)}

<p
className="resend"
onClick={sendOtp}
>
Resend OTP
</p>

</>

)}



{/* PASSWORD SECTION */}

{emailVerified && (

<>

{/* PASSWORD */}

<div className="input-group password-group premium-input">
<input
type={showPassword ? "text" : "password"}
placeholder="Enter password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
required
/>

<span
className="eye-icon"
onClick={()=>setShowPassword(!showPassword)}
>
{showPassword ? <FaEye/> : <FaEyeSlash/>}
</span>

</div>



{/* CONFIRM PASSWORD */}

<div className="input-group password-group">

<input
type={showConfirmPassword ? "text" : "password"}
placeholder="Confirm password"
value={confirmPassword}
onChange={(e)=>setConfirmPassword(e.target.value)}
required
/>

<span
className="eye-icon"
onClick={()=>setShowConfirmPassword(!showConfirmPassword)}
>
{showConfirmPassword ? <FaEye/> : <FaEyeSlash/>}
</span>

</div>



<button className="login-btn">
Verify & Register
</button>

</>

)}



<p className="register-link">

Already have an account?

<span onClick={()=>navigate("/login")}>
Login
</span>

</p>


</form>

</div>
</div>
</div>
</div>

);

}

export default RegisterPage;