import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './sections/Sidebar';
import TopNavigation from './sections/TopNavigation';
import LoadingSpinner from './sections/LoadingSpinner';
import ErrorMessage from './sections/ErrorMessage';
import useAuthStore from '../../../stores/authStore';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const clearError = () => {
    setError(null); // Clear the error state
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('Not authenticated');
        setIsLoading(false);
        logout();
        return;
      }

      try {
        const response = await fetch('/api/user/dashboard/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        if (err.response?.status === 401) {
          setError('Authentication expired');
          logout();
        } else {
          setError('Failed to load user data');
        }
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, logout]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} clearError={clearError} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation userData={userData} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} handleLogout={handleLogout} />
      <div className="flex pt-14">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <main className="flex-1 p-6 md:ml-64">
          {isSidebarOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden" onClick={() => setIsSidebarOpen(false)} />
          )}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
          <footer className="text-center text-sm text-gray-500 mt-8">
            Powered by EnterpriseSync
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;