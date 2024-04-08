import React from 'react';
import logo from '../logo/Group60.svg'; 
import '../css/LoginPage.css'

function LoginPage() {
  const handleLogin = () => {
    window.location.href = `${process.env.REACT_APP_SERVER_URL}/google`;
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="Logo" className="logo" />
        <button onClick={handleLogin} className="login-button">
          Login with Google
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
