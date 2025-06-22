import React, { useState } from 'react';
import LoginSignup from './LoginSignup/LoginSignup';
import AdminLogin from './AdminLogin/AdminLogin';
import './AuthPage.css';  // Import new styles

const AuthPage = () => {
  const [mode, setMode] = useState(null);

  if (mode === 'user') {
    return <LoginSignup />;
  }

  if (mode === 'admin') {
    return <AdminLogin />;
  }

  return (
    <div className="authpage-background">
      <div className="authpage-card">
        <h1 className="authpage-title">Welcome to Car Auction</h1>
        <p className="authpage-subtitle">Please select your login type</p>

        <div className="authpage-buttons">
          <button
            className="authpage-button user-button"
            onClick={() => setMode('user')}
            aria-label="User Login Signup"
          >
            User
          </button>

          <button
            className="authpage-button admin-button"
            onClick={() => setMode('admin')}
            aria-label="Admin Login"
          >
            Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
