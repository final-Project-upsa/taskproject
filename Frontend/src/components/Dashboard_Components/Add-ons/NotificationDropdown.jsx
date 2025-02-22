import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Clock, AlertCircle, Bell } from 'lucide-react';
import api from '../../../utils/api';

const NotificationDropdown = ({ notifications, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [taskNotifications, setTaskNotifications] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all');
  
  const REMINDER_INTERVALS = [45, 30, 15, 0];

  useEffect(() => {
    fetchTasks();
    // Fetch tasks every 5 minutes
    const interval = setInterval(fetchTasks, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/api/tasks/');
      const newTasks = response.data || [];
      setTasks(newTasks);
      generateTaskNotifications(newTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const generateTaskNotifications = (tasks) => {
    const now = new Date();
    const newTaskNotifications = [];

    tasks.forEach(task => {
      if (task.status === 'COMPLETED') return;

      const taskDateTime = new Date(`${task.due_date.split('T')[0]}T${task.time}`);
      const minutesUntilDue = Math.floor((taskDateTime - now) / (1000 * 60));

      if (minutesUntilDue <= 60 && minutesUntilDue >= 0) {
        const notificationId = `${task.id}-${minutesUntilDue}`;
        const message = getNotificationMessage(task, minutesUntilDue);
        
        newTaskNotifications.push({
          id: notificationId,
          type: task.type,
          title: task.type,
          message,
          task,
          timestamp: taskDateTime.toISOString()
        });
      }
    });

    setTaskNotifications(newTaskNotifications);
  };

  const getNotificationMessage = (task, minutesLeft) => {
    const timeText = minutesLeft === 0 ? 'now' : `in ${minutesLeft} minutes`;
    
    switch (task.type) {
      case 'MEETING':
        return `Meeting "${task.title}" starting ${timeText}`;
      case 'DEADLINE':
        return `Deadline "${task.title}" due ${timeText}`;
      case 'PROJECT':
        return `Project "${task.title}" due ${timeText}`;
      case 'REMINDER':
        return `Reminder "${task.title}" ${timeText}`;
      case 'PERSONAL':
        return `Personal task "${task.title}" due ${timeText}`;
      default:
        return `Task "${task.title}" due ${timeText}`;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'MEETING':
        return <Clock className="w-4 h-4 text-purple-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
    }
  };

  const allNotifications = [...notifications, ...taskNotifications]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const filteredNotifications = selectedTab === 'all' 
    ? allNotifications
    : selectedTab === 'chat' 
      ? notifications
      : taskNotifications;

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 max-h-[80vh] overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Notifications</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex space-x-2 mb-4">
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              selectedTab === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedTab('all')}
          >
            All
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              selectedTab === 'chat'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedTab('chat')}
          >
            Chat
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              selectedTab === 'tasks'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedTab('tasks')}
          >
            Tasks
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[60vh]">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No notifications to show</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                    notification.unread 
                      ? 'bg-blue-50 hover:bg-blue-100' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 break-words">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 break-words">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;