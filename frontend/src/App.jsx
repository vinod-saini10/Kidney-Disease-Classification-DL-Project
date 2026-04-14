import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
export { default as Login } from './pages/Login';
export { default as Register } from './pages/Register';
export { default as Verify } from './pages/Verify';
export { default as Prediction } from './pages/Prediction';
export { default as UserDashboard } from './pages/UserDashboard';
export { default as AdminDashboard } from './pages/AdminDashboard';
export { default as AdminPanel } from './pages/AdminPanel';

import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';
import Prediction from './pages/Prediction';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />

          {/* Protected User Routes */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/predict" 
            element={
              <PrivateRoute>
                <Prediction />
              </PrivateRoute>
            } 
          />

          {/* Protected Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <PrivateRoute adminOnly={true}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/panel" 
            element={
              <PrivateRoute adminOnly={true}>
                <AdminPanel />
              </PrivateRoute>
            } 
          />

          {/* Default Redirection */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
