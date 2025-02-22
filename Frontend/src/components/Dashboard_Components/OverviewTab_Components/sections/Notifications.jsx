import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, MessageSquare, Users, Clock, AlertCircle, BellOff } from 'lucide-react';
import api from '../../../../utils/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/api/notifications/');
        setNotifications(response.data.results);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-[670px] overflow-y-auto hide-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Notifications</h3>
        <Bell className="w-5 h-5 text-gray-400" />
      </div>
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg ${
                notification.is_read ? 'bg-gray-50' : 'bg-blue-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                {notification.notification_type === 'TASK_COMPLETED' && (
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                )}
                {notification.notification_type === 'TASK_COMMENT' && (
                  <MessageSquare className="w-4 h-4 text-green-500" />
                )}
                {notification.notification_type === 'TASK_ASSIGNED' && (
                  <Users className="w-4 h-4 text-purple-500" />
                )}
                {notification.notification_type === 'MEETING_STARTING' && (
                  <Clock className="w-4 h-4 text-orange-500" />
                )}
                {notification.notification_type === 'REMINDER' && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                {notification.notification_type === 'DEADLINE_APPROACHING' && (
                  <Clock className="w-4 h-4 text-yellow-500" />
                )}
                <div className="flex-1">
                  <div className="text-sm">{notification.message}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <BellOff className="w-8 h-8 text-gray-400" />
          <p className="text-sm text-gray-500 mt-2">No new notifications</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;