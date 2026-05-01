import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* PAGES */

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./pages/ResumeUpload";

import AptitudePage from "./pages/AptitudePage";
import AptitudeResult from "./pages/AptitudeResult";

import TechnicalPage from "./pages/TechnicalPage";
import HRPage from "./pages/HRPage";

import FinalResult from "./pages/FinalResult";
import PermissionPage from "./pages/PermissionPage";
import ResetPassword from "./pages/ResetPassword";

function App() {

return (

<Router>

<Routes>

{/* LANDING */}

<Route path="/" element={<LandingPage />} />

{/* AUTH */}

<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />

{/* DASHBOARD */}

<Route path="/dashboard" element={<Dashboard />} />

{/* MODULES */}

<Route path="/resume" element={<ResumeUpload />} />

<Route path="/aptitude" element={<AptitudePage />} />
<Route path="/permission" element={<PermissionPage />} />
<Route path="/aptitude-result" element={<AptitudeResult />} />

<Route path="/technical" element={<TechnicalPage />} />

<Route path="/hr-interview" element={<HRPage />} />

{/* FINAL RESULT */}

<Route path="/result" element={<FinalResult />} />
<Route path="/permissions" element={<PermissionPage />} />
<Route path="/reset/:token" element={<ResetPassword />} />
</Routes>

</Router>

);

}

export default App;