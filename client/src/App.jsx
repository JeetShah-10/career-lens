import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import StudioLayout from './components/StudioLayout';
import MacDockNav from './components/MacDockNav';

// Pages
import Hero from './pages/Hero';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewAnalysis from './pages/NewAnalysis';
import Result from './pages/Result';
import History from './pages/History';
import Profile from './pages/Profile';
function NotFound() {
  return (
    <div className="app-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        404 — Page Not Found
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        The requested page does not exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        Return to Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Standalone Full-Bleed Framed Pages - Protected so Login/Register comes first */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Hero />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/careers" element={<Navigate to="/" replace />} />

          {/* Protected Application Workspace in Extraordinary Framed Studio Layout */}
          <Route element={<StudioLayout />}>
            <Route
              path="/analyze"
              element={
                <ProtectedRoute>
                  <NewAnalysis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analyses/:id"
              element={
                <ProtectedRoute>
                  <Result />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <MacDockNav />
      </AuthProvider>
    </BrowserRouter>
  );
}

