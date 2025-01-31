import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../../stores/authStore';

const ErrorMessage = ({ error }) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  const handleLoginClick = () => {
    // Clear any auth-related data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('subdomain');
    
    // Use the auth store's logout to clear states
    logout();
    
    // Navigate to login
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={handleLoginClick}
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Log In
        </button>
      </div>
    </div>
  );
};

export default ErrorMessage;