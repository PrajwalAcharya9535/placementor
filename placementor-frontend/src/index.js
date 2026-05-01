import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';

import { GoogleOAuthProvider } from "@react-oauth/google"; // 👈 ADD THIS

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="844627102295-5vam3k5edk5l0ai5pe8l4ufl34g796pi.apps.googleusercontent.com"> {/* 👈 ADD THIS */}
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);