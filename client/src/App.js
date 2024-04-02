import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './componets/LoginPage.js';
import MainPage from './componets/MainPage.js';
import StudentInputPage from './componets/StudentInputPage.js'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/student-input" element={<StudentInputPage />} /> {/* Add this line */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
