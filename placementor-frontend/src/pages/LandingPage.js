import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

function LandingPage(){

  const navigate = useNavigate();

  useEffect(()=>{
    setTimeout(()=>{
      navigate("/login");
    },6000);
  },[navigate]);

  return(

    <div className="landing-container">

      <h1 className="title">Placementor</h1>

      <p className="tagline">
        Practice • Prepare • Get Placed
      </p>

      <img
        src="/images/placementor.png"
        alt="Placementor"
        className="imageMove"
      />

      <p className="loading">
        Loading platform...
      </p>

    </div>

  );
}

export default LandingPage;