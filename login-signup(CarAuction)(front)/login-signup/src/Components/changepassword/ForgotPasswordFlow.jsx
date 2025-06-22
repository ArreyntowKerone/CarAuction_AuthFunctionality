import React, { useState } from 'react';



function ForgotPasswordFlow() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [providedCode, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');

  const handleSendCode = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/send-forgot-password-code', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('Code sent to your email.');
        setStep(2);
      } else {
        setStatus(data.message);
      }
    } catch (err) {
      setStatus('Network error.');
    }
  };

  const handleVerifyCode = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/verify-forgot-password-code', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, providedCode, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('Code verified. Your password has being changed.');
        setStep(3);
      } else {
        setStatus(data.message);
      }
    } catch (err) {
      setStatus('Error verifying code.');
    }
  };

  return (
    <div className="forgot-password-flow">
      <h2>Forgot Password</h2>
      <p>{status}</p>

      {step === 1 && (
        <>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleSendCode}>Send Verification Code</button>
        </>
      )}

      {step === 2 && (
        <>
            <input
            type="text"
            placeholder="Enter verification code"
            value={providedCode}
            onChange={(e) => setCode(e.target.value)}
            />

            <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ flexGrow: 1 }}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ marginLeft: '8px' }}
            >
                {showPassword ? "Hide" : "Show"}
            </button>
            </div>

            <button onClick={handleVerifyCode}>Change</button>
        </>
        )}



      {step === 3 && (
        <p>✅ Your password has been reset. You can now log in.</p>
      )}
    </div>
  );
}

export default ForgotPasswordFlow;
