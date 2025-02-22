import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X, ChevronDown, LogOut } from 'lucide-react';
import UserAvatar from './UserAvatar';
import useNotificationStore from '../../../../stores/NotificationStore';
import NotificationDropdown from '../../Add-ons/NotificationDropdown';

const TopNavigation = ({ userData, isSidebarOpen, setIsSidebarOpen, handleLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markAllAsRead } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white border-b px-4 py-2 fixed top-0 w-full z-20">
      <div className="flex items-center justify-between">
        {/* Left side content */}
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">{userData?.organization || 'EnterpriseSync'}</span>
          </Link>
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>

        {/* Right side content */}
        <div className="flex items-center space-x-4">
          {/* Notification button and dropdown */}
          <div className="relative" ref={notificationRef}>
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg relative"
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) markAllAsRead();
              }}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <NotificationDropdown 
                notifications={notifications}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-2"
            >
              <UserAvatar username={userData?.username} avatarUrl={userData?.avatar} size={8}/>
              <span className="text-sm font-medium text-gray-700">{userData?.username || 'User'}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Profile</div>
                  <div 
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    onClick={() => navigate('/dashboard/settings')}
                  >
                    Settings
                  </div>
                  <div className="border-t border-gray-100"></div>
                  <div
                    className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Log out</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;