import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Statistics from './pages/Statistics';
import Upload from './pages/Upload';
import History from './pages/History';
import Profile from './pages/Profile';
import Nutrition from './pages/Nutrition';
import Research from './pages/Research';
import Recommendations from './pages/Recommendations';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" /> : 
            <Login onLogin={() => setIsAuthenticated(true)} />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" /> : 
            <Register onRegister={() => setIsAuthenticated(true)} />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? 
            <Dashboard /> : 
            <Navigate to="/login" />
          } 
        />
        <Route 
          path="/statistics" 
          element={
            isAuthenticated ? 
            <Statistics /> : 
            <Navigate to="/login" />
          } 
        />
        <Route 
          path="/upload" 
          element={
            isAuthenticated ? 
            <Upload /> : 
            <Navigate to="/login" />
          } 
        />
        <Route 
          path="/history" 
          element={
            isAuthenticated ? 
            <History /> : 
            <Navigate to="/login" />
          } 
        />
        <Route 
          path="/profile" 
          element={
            isAuthenticated ? 
            <Profile onLogout={() => setIsAuthenticated(false)} /> : 
            <Navigate to="/login" />
          } 
        />
        <Route 
          path="/nutrition" 
          element={
            isAuthenticated ? 
            <Nutrition /> : 
            <Navigate to="/login" />
          } 
        />
        <Route 
          path="/research" 
          element={
            isAuthenticated ? 
            <Research /> : 
            <Navigate to="/login" />
          } 
        />
        <Route 
          path="/recommendations" 
          element={
            isAuthenticated ? 
            <Recommendations /> : 
            <Navigate to="/login" />
          } 
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
