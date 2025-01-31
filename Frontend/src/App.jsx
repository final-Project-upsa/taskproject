import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import LandingPage from './components/LandingPage';
import OnboardingForm from './components/Onboarding_Components/OnboardingForm';
import DashboardLayout from './components/Dashboard_Components/DashboardLayout_Components/DashboardLayout';
import OverviewTab from './components/Dashboard_Components/OverviewTab_Components/OverviewTab';
import LoginPage from './components/Onboarding_Components/LoginPage';
import EmployeeRegistration from './components/EmployeeRegistration';
import TaskTab from './components/Dashboard_Components/TaskTab_Components/TaskTab';
import TeamTab from './components/Dashboard_Components/TeamTab_Components/TeamTab';
import TaskExpandPage from './components/Dashboard_Components/TaskTab_Components/TaskExpand_Components/TaskExpandPage';


// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  // show loader while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  } 
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<OnboardingForm />} />
        <Route path="/register/:token" element={<EmployeeRegistration />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route index element={<OverviewTab />} />
                <Route path="team" element={<TeamTab />} />
                <Route path="tasks" element={<TaskTab />} />
                <Route path="tasks/expand/:taskID" element={<TaskExpandPage />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;