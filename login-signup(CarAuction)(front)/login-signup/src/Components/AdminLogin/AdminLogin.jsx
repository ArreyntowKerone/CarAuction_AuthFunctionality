import React, { useState } from 'react';
import './AdminLogin.css';  // Import the CSS

const AdminLogin = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Admin logged in successfully!');
        // Handle token storage or redirect here
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Server error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="adminlogin-form">
      <h2 className="adminlogin-title">Admin Login</h2>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="adminlogin-input"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="adminlogin-input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="adminlogin-input"
      />

      <button type="submit" className="adminlogin-button">Login</button>
      {error && <p className="adminlogin-error">{error}</p>}
    </form>
  );
};

export default AdminLogin;
