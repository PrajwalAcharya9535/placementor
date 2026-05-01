import React, { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

import { FiLock, FiArrowRight } from "react-icons/fi";
import "./LoginPage.css"; // reuse same CSS

function ResetPassword() {

  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleReset = async () => {

    if(password !== confirm){
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { newPassword: password }
      );

      alert("Password reset successful ✅");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">

        <div className="login-card">

          {/* HEADER */}
          <div className="card-header">
            <h1>PLACEMENTOR</h1>
          </div>

          {/* CONTENT */}
          <div className="login-content">

            <h2 className="login-heading">Set New Password</h2>
            <p className="sub-text">Create a new secure password</p>

            {/* NEW PASSWORD */}
            <div className="input-group">
              <FiLock className="input-icon" />
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="input-group">
              <FiLock className="input-icon" />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={(e)=>setConfirm(e.target.value)}
              />
            </div>

            {/* BUTTON */}
            <button className="login-btn" onClick={handleReset}>
              Set Password <FiArrowRight />
            </button>

            {/* BACK */}
            <p 
              className="register-link"
              onClick={() => navigate("/login")}
              style={{cursor:"pointer"}}
            >
              Back to Login
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default ResetPassword;