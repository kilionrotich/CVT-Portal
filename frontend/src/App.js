import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboards
import StudentDashboard from './pages/dashboard/StudentDashboard';
import LecturerDashboard from './pages/dashboard/LecturerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ParentDashboard from './pages/dashboard/ParentDashboard';
import ExaminerDashboard from './pages/dashboard/ExaminerDashboard';

/** Route guard: redirect unauthenticated users to /login */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

/** Route guard: redirect already-logged-in users to their dashboard */
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return children;
  const routes = {
    student: '/dashboard/student',
    lecturer: '/dashboard/lecturer',
    admin: '/dashboard/admin',
    parent: '/dashboard/parent',
    examiner: '/dashboard/examiner',
  };
  return <Navigate to={routes[user.role] || '/dashboard/student'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

      {/* Protected dashboard routes */}
      <Route path="/dashboard/student" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
      <Route path="/dashboard/lecturer" element={<PrivateRoute><LecturerDashboard /></PrivateRoute>} />
      <Route path="/dashboard/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
      <Route path="/dashboard/parent" element={<PrivateRoute><ParentDashboard /></PrivateRoute>} />
      <Route path="/dashboard/examiner" element={<PrivateRoute><ExaminerDashboard /></PrivateRoute>} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
