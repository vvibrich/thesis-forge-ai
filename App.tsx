import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NewProject from './pages/NewProject';
import Editor from './pages/Editor';
import LandingPage from './pages/LandingPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new" element={<NewProject />} />
        <Route path="/editor/:id" element={<Editor />} />
      </Routes>
    </Router>
  );
};

export default App;