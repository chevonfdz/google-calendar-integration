import React from 'react';
// import Button from 'react-bootstrap/Button';
import { Button } from 'react-bootstrap';
// import logo from '../logo/logocolor.png';
function LoginPage() {
  const handleLogin = () => {
    window.location.href = `${process.env.REACT_APP_SERVER_URL}/google`;
  };

  return (
    <div className="login-container">
      {/* <div className="mb-8">
        <img src={logo} alt="Logo" className="mx-auto" />
      </div> */}
      <Button onClick={handleLogin} className="login-button">
        Login with Google
      </Button>
    </div>
  );
}

export default LoginPage;
