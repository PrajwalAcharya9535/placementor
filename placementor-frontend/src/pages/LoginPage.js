import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";

import React, { useState, useEffect } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { 
  FiFileText, FiBarChart2, FiCode, FiUser,
  FiDatabase, FiTrendingUp, FiCpu, FiLayers
} from "react-icons/fi";


function LoginPage() {

  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [showPassword,setShowPassword] = useState(false);
const [remember, setRemember] = useState(false);
const [mode, setMode] = useState("login"); 
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [otp, setOtp] = useState("");

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );
console.log(res.data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userEmail", res.data.email);   // ✅ IMPORTANT
localStorage.setItem("userName", res.data.name);     // optional
      if (remember) {
  localStorage.setItem("email", email);
  localStorage.setItem("password", password);
} else {
  localStorage.removeItem("email");
  localStorage.removeItem("password");
}
      navigate("/dashboard");

    } catch (error) {
      alert("Invalid email or password");
    }
  };

  useEffect(() => {
  const savedEmail = localStorage.getItem("email");
  const savedPassword = localStorage.getItem("password");

  if (savedEmail && savedPassword) {
    setEmail(savedEmail);
    setPassword(savedPassword);
    setRemember(true);
  }
}, []);

return (
  <div className="login-wrapper">
<div className="bg-animation">

  <FiFileText className="bg-icon icon1" />
  <FiBarChart2 className="bg-icon icon2" />
  <FiCode className="bg-icon icon3" />
  <FiUser className="bg-icon icon4" />
  <FiDatabase className="bg-icon icon5" />
  <FiTrendingUp className="bg-icon icon6" />
  <FiCpu className="bg-icon icon7" />
  <FiLayers className="bg-icon icon8" />

</div>
    <div className="login-container">

      <div className="login-card">

        {/* ===== HEADER ===== */}
        <div className="card-header">
          <h1>PLACEMENTOR</h1>
        </div>

        {/* ===== CONTENT ===== */}
        <div className="login-content">

          {/* ===== LOGIN MODE ===== */}
          {mode === "login" && (
            <>
              <p className="sub-text">Log in to your account</p>

              <form onSubmit={handleLogin}>

                {/* EMAIL */}
                <div className="input-group">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* PASSWORD */}
                <div className="input-group password-group">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? "text":"password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    required
                  />

                  <span
                    className="eye-icon"
                    onClick={togglePassword}
                  >
                    {showPassword ? <FaEye/> : <FaEyeSlash/>}
                  </span>
                </div>

                {/* OPTIONS */}
                <div className="login-options">
                  <label>
                  <input 
                 type="checkbox"
                   checked={remember}
                   onChange={() => setRemember(!remember)}
                              /> 
                      Remember me                  </label>

                  <span 
                    className="forgot"
                    onClick={() => setMode("forgot")}
                  >
                    Forgot password?
                  </span>
                </div>

                {/* LOGIN BUTTON */}
                <button className="login-btn">
                  Log In <FiArrowRight />
                </button>

                {/* DIVIDER */}
                <div className="divider">
                  <span>or</span>
                </div>

                {/* GOOGLE LOGIN */}

<div style={{ marginTop: "10px" }}>
  <GoogleLogin
    onSuccess={async (credentialResponse) => {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/auth/google-login",
          {
            token: credentialResponse.credential,
          }
        );

localStorage.setItem("token", res.data.token);
localStorage.setItem("userEmail", res.data.email);
localStorage.setItem("userName", res.data.name);
        navigate("/dashboard");

      } catch (err) {
        alert("Google login failed");
      }
    }}
    onError={() => {
      alert("Google Sign In Failed");
    }}
  />
</div>

                {/* REGISTER */}
                <p className="register-link">
                  Don't have an account?
                  <span onClick={() => navigate("/register")}>
                    Register
                  </span>
                </p>

              </form>
            </>
          )}

          {/* ===== FORGOT PASSWORD MODE ===== */}
          {mode === "forgot" && (
            <>
              <h2 className="login-heading">Reset Password</h2>

              <div className="input-group">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                />
              </div>

              <button 
                className="login-btn"
onClick={async () => {
  try {
    await axios.post(
      "http://localhost:5000/api/auth/forgot-password",
      { email }
    );

    alert("Reset link sent to your email 📩");

  } catch (err) {
    alert("Error sending reset link");
  }
}}           >
                Send Reset Link <FiArrowRight />
              </button>

              <p 
                className="register-link"
                onClick={() => setMode("login")}
                style={{cursor:"pointer"}}
              >
                Back to Login
              </p>
            </>
          )}

        </div>

      </div>

    </div>
  </div>
);
}

export default LoginPage;