import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import SettingsPage from './pages/Settings';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

const PrivateRoute = ({ children, role }) => {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  if (role && user?.role !== role) return <Navigate to="/dashboard" />;

  return children;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-background text-white">
      {user && <Navbar />}
      <div className="container mx-auto px-4 py-8">
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  {user?.role === 'admin' ? <AdminDashboard /> : <Dashboard />}
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
