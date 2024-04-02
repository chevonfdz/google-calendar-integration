import React from 'react';
// import logo from '../logo/logocolor.png'; 
function LoginPage() {
  const handleLogin = () => {
    window.location.href = `${process.env.REACT_APP_SERVER_URL}/google`;
  };

  return (
    <div className="flex justify-center items-center h-screen bg-[#051726]">
      <div className="text-center">
        <div className="mb-8">
          {/* <img src={logo} alt="Logo" className="mx-auto" /> */}
        </div>
        <button 
          onClick={handleLogin} 
          className="text-white bg-[#81FFD9] hover:bg-[#66cca9] font-bold py-2 px-6 rounded-full transition duration-300"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}
  
export default LoginPage;
