import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';

const SettingsTab = ({ currentUser }) => {
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    job_title: '',
    department: '',
    profile_picture: null
  });

  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    task_reminders: true,
    team_updates: true,
    project_notifications: true
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/profile/');
        setProfileData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile data');
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await api.put('/api/profile/', profileData);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwords.new_password !== passwords.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    try {
      await api.post('/api/profile/change-password/', {
        old_password: passwords.old_password,
        new_password: passwords.new_password
      });
      setSuccess('Password changed successfully');
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError('Failed to change password');
    }
  };

  const handleNotificationUpdate = async (e) => {
    e.preventDefault();
    setSuccess('Notification preferences updated');
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Profile Section */}
          <form onSubmit={handleProfileUpdate} className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="none"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileData.phone_number}
                  onChange={(e) => setProfileData({...profileData, phone_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="none"
                  value={profileData.role}
                  onChange={(e) => setProfileData({...profileData, job_title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="none"
                  value={profileData.department}
                  onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Save Profile Changes
            </button>
          </form>

          {/* Password Change Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwords.old_password}
                  onChange={(e) => setPasswords({...passwords, old_password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwords.new_password}
                  onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwords.confirm_password}
                  onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Change Password
              </button>
            </form>
          </div>

          {/* Notification Preferences */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
            <form onSubmit={handleNotificationUpdate} className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={notifications.email_notifications}
                    onChange={(e) => setNotifications({...notifications, email_notifications: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Email Notifications</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={notifications.task_reminders}
                    onChange={(e) => setNotifications({...notifications, task_reminders: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Task Reminders</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={notifications.team_updates}
                    onChange={(e) => setNotifications({...notifications, team_updates: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Team Updates</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={notifications.project_notifications}
                    onChange={(e) => setNotifications({...notifications, project_notifications: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Project Notifications</span>
                </label>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Save Notification Preferences
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;