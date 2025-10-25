import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/signUp";   
import Login from "./pages/Login";    


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
     

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
       

      </Routes>
    </Router>
  );
};

export default App;