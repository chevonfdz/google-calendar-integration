function LoginPage() {
  const handleLogin = () => {
    window.location.href = `${process.env.REACT_APP_SERVER_URL}/google`;
  };

  return (
    <div>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  );
}
  
export default LoginPage;
  