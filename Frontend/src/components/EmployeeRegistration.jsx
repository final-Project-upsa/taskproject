import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Lock, User, Mail, Phone, Building2 } from 'lucide-react';

const EmployeeRegistration = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  // Form data state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    department: ''
  });

  // Component state
  const [error, setError] = useState(null);
  const [invitationDetails, setInvitationDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvitationDetails = async () => {
      try {
        const response = await api.get(`/api/employees/verify-invitation/${token}/`);
        
        // Set invitation details including department
        setInvitationDetails(response.data);
        setFormData(prev => ({
          ...prev,
          email: response.data.email,
          department: response.data.department || ''
        }));
        
        setIsLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Invalid or expired invitation');
        setIsLoading(false);
      }
    };

    fetchInvitationDetails();
  }, [token]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Password validation
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await api.post(`/api/employees/register/${token}/`, {
        username: formData.username,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        department: invitationDetails.department,
        role: invitationDetails.role,
        email: invitationDetails.email
      });

      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);

      navigate('/dashboard');
    } catch (err) {
      console.error('Full error response:', err.response?.data);
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
          <div className="bg-red-50 border border-red-400 text-red-700 p-4 rounded-lg">
            <strong className="font-bold block mb-2">Error: </strong>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Complete Your Registration
          </h2>
          {invitationDetails && (
            <p className="text-sm text-gray-600">
              for {invitationDetails.organization} 
              {invitationDetails.role && ` as a ${invitationDetails.role}`}
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field (Disabled) */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={invitationDetails?.email || ''}
              disabled
              className="w-full pl-10 p-3 border rounded-md bg-gray-100 text-gray-700"
              placeholder="Email address"
            />
          </div>

          {/* Department Field (Disabled) */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={invitationDetails?.department || ''}
              disabled
              className="w-full pl-10 p-3 border rounded-md bg-gray-100 text-gray-700"
              placeholder="Department"
            />
          </div>

          {/* Username Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full pl-10 p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Username"
            />
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <input
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="First Name"
            />
            <input
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Last Name"
            />
          </div>

          {/* Phone Number Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full pl-10 p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Phone Number (Optional)"
            />
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                name="confirm_password"
                type="password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                className="w-full pl-10 p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm Password"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
          >
            Complete Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeRegistration;