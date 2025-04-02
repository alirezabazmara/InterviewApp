import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ApplicantPage from "./pages/ApplicantPage";
import CompanyPage from "./pages/CompanyPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/applicant" element={<ApplicantPage />} />
        <Route path="/company" element={<CompanyPage />} />
      </Routes>
    </Router>
  );
}

export default App;
