import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Calendar, MessageSquare, Users, Settings } from 'lucide-react';

const sidebarLinks = [
  { icon: BarChart3, label: 'Overview', path: '/dashboard' },
  { icon: Calendar, label: 'Tasks', path: '/dashboard/tasks' },
  { icon: MessageSquare, label: 'Messages', path: '/dashboard/messages', badge: 3 },
  { icon: Users, label: 'Team', path: '/dashboard/team' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();

  return (
    <aside className={`fixed left-0 z-10 w-64 bg-white border-r transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out top-14 bottom-0`}>
      <div className="h-full overflow-y-auto">
        <div className="p-4 space-y-6">
          <nav className="space-y-1">
            {sidebarLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center justify-between w-full px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Tasks Completed</span>
                  <span className="font-medium text-gray-900">24/36</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-indigo-500 rounded-full" style={{ width: '67%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Project Progress</span>
                  <span className="font-medium text-gray-900">80%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-green-500 rounded-full" style={{ width: '80%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;