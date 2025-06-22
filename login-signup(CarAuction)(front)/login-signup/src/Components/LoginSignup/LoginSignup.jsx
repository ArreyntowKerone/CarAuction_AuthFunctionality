import React, { useState } from 'react';
import './LoginSignup.css';
import ForgotPasswordFlow from '../changepassword/ForgotPasswordFlow';
import Modal from '../ModalWrapper/Modal';
import user_icon from '../Assets/person.png';
import email_icon from '../Assets/email.png';
import password_icon from '../Assets/password.png';
import address_icon from '../Assets/address.png';
import phone_icon from '../Assets/phone.png';
import profile_icon from '../Assets/profile.png';

const LoginSignup = () => {
  const [showForgotFlow, setShowForgotFlow] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const [verificationCode, setVerificationCode] = useState('');

  const [action, setAction] = useState("Sign Up");

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState(null);

  const handleSubmit = async () => {
    const endpoint = action === "Sign Up"
      ? 'http://localhost:8000/api/auth/signup'
      : 'http://localhost:8000/api/auth/login';

    try {
      let res;
      if (action === "Sign Up") {
        const formData = new FormData();
        formData.append('profileImage', profileImage);
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('phoneNumber', phoneNumber);
        formData.append('address', address);

        res = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });

      } else {
        res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
      }

      const data = await res.json();
      if (res.ok) {
        alert(data.message || `${action} successful`);
        console.log(data);

        if(action === "Sign Up"){
          // Send verification code only after signup
          await fetch('http://localhost:8000/api/auth/send-verification-code', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          });
          setShowVerificationModal(true);
        }
        
      } else {
        alert(data.message || 'An error occurred');
      }

    } catch (err) {
      console.error(err);
      alert('Something went wrong');
    }
  };

  const handleVerifyCode = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/verify-verification-code', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, providedCode: verificationCode })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Your account has been verified!');
        setShowVerificationModal(false);
        setVerificationCode('');
      } else {
        alert(data.message || 'Verification failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server error while verifying');
    }
  };

  return (
    <div className='container'>
      <div className='header'>
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>

      <div className="inputs">
        {action === "Login" ? null : (
          <>
            <div className="input">
              <img src={profile_icon} alt="" />
              <input
                type="file"
                placeholder="Upload Profile Image"
                accept="image/*"
                onChange={(e) => setProfileImage(e.target.files[0])}
              />
            </div>
            <div className="input">
              <img src={user_icon} alt="" />
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="input">
          <img src={email_icon} alt="" />
          <input
            type="email"
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input">
          <img src={password_icon} alt="" />
          <input
            type="password"
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {action === "Login" ? null : (
          <>
            <div className="input">
              <img src={phone_icon} alt="" />
              <input
                type="text"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <div className="input">
              <img src={address_icon} alt="" />
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      {action === "Sign Up" ? null : (
        <div className="forgot-password">
          Forgot Password?{' '}
          <span onClick={() => setShowForgotFlow(true)}>Click Here!</span>
        </div>
      )}

      {showForgotFlow && (
        <Modal onClose={() => setShowForgotFlow(false)}>
          <ForgotPasswordFlow />
        </Modal>
      )}

      <div className="submit-container">
        <div
          className={action === "Login" ? "submit gray" : "submit"}
          onClick={() => {
            if (action === "Sign Up") {
              handleSubmit(); // Only submit if already in Sign Up mode
            } else {
              setAction("Sign Up"); // Otherwise, just switch the form
            }
          }}>
          Sign Up
        </div>
        <div
          className={action === "Sign Up" ? "submit gray" : "submit"}
          onClick={() => {
            if (action === "Login") {
              handleSubmit(); // Only submit if already in Login mode
            } else {
              setAction("Login"); // Otherwise, just switch the form
            }
          }}>
          Log In
        </div>
      </div>

      {showVerificationModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Email Verification</h3>
            <p>Enter the code sent to <strong>{email}</strong>:</p>
            <input
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <button onClick={handleVerifyCode}>Verify</button>
            <button className="close-btn" onClick={() => setShowVerificationModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginSignup;
