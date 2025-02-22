import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock, X } from 'lucide-react';
import api from '../utils/api';

const TaskTimeNotifications = () => {
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [browserNotificationEnabled, setBrowserNotificationEnabled] = useState(false);
  const [initialChecksDone, setInitialChecksDone] = useState({});

  const REMINDER_INTERVALS = [45, 30, 15, 0];

  const requestNotificationPermission = async () => {
    try {
      if (!("Notification" in window)) {
        console.log("Browser doesn't support notifications");
        return;
      }

      const permission = await Notification.requestPermission();
      setBrowserNotificationEnabled(permission === "granted");
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  const sendBrowserNotification = (title, message) => {
    if (browserNotificationEnabled && document.hidden) {
      new Notification(title, { body: message });
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get('/api/tasks/');
      const newTasks = response.data || [];
      setTasks(newTasks);
      
      // Only run initial notifications if they haven't been checked yet
      newTasks.forEach(task => {
        if (!initialChecksDone[task.id]) {
          checkInitialNotification(task);
        }
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
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

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const checkInitialNotification = (task) => {
    if (task.status === 'COMPLETED' || initialChecksDone[task.id]) {
      return;
    }

    const now = new Date();
    const taskDateTime = new Date(`${task.due_date.split('T')[0]}T${task.time}`);
    const minutesUntilDue = Math.floor((taskDateTime - now) / (1000 * 60));

    if (minutesUntilDue <= 60 && minutesUntilDue > 0) {
      const notificationId = `${task.id}-${minutesUntilDue}`; // Make the ID unique with minutes
      const message = getNotificationMessage(task, minutesUntilDue);
      
      setNotifications(prev => {
        // Check if notification already exists
        if (!prev.some(n => n.id === notificationId)) {
          return [...prev, {
            id: notificationId,
            type: task.type,
            message,
            task
          }];
        }
        return prev;
      });

      sendBrowserNotification('Task Coming Up', message);
      
      // Mark initial check as done for this task
      setInitialChecksDone(prev => ({ ...prev, [task.id]: true }));
    }
  };

  const checkReminderIntervals = () => {
    const now = new Date();

    tasks.forEach(task => {
      if (task.status === 'COMPLETED') {
        return;
      }

      const taskDateTime = new Date(`${task.due_date.split('T')[0]}T${task.time}`);
      const minutesUntilDue = Math.floor((taskDateTime - now) / (1000 * 60));

      if (REMINDER_INTERVALS.includes(minutesUntilDue)) {
        const notificationId = `${task.id}-${minutesUntilDue}`; // Make the ID unique with minutes
        const notificationKey = `shown_notification_${notificationId}`;

        if (!localStorage.getItem(notificationKey)) {
          const message = getNotificationMessage(task, minutesUntilDue);
          
          setNotifications(prev => {
            // Check if notification already exists
            if (!prev.some(n => n.id === notificationId)) {
              return [...prev, {
                id: notificationId,
                type: task.type,
                message,
                task
              }];
            }
            return prev;
          });

          sendBrowserNotification('Task Reminder', message);

          localStorage.setItem(notificationKey, 'true');
          setTimeout(() => {
            localStorage.removeItem(notificationKey);
          }, 60000);
        }
      }
    });
  };

  useEffect(() => {
    requestNotificationPermission();
    fetchTasks();
  }, []);

  useEffect(() => {
    const fetchInterval = setInterval(fetchTasks, 300000);
    return () => clearInterval(fetchInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(checkReminderIntervals, 60000);
    return () => clearInterval(interval);
  }, [tasks, browserNotificationEnabled]);

  if (!browserNotificationEnabled) {
    return (
      <div className="fixed bottom-4 right-4 max-w-sm">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-semibold">Enable Notifications</span>
          </div>
          <div className="mt-1 text-sm">
            Please enable notifications to receive task reminders
            <button 
              onClick={requestNotificationPermission}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              Enable
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-sm">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className={`p-4 rounded-lg border shadow-sm relative ${
            notification.type === 'MEETING' 
              ? 'bg-blue-50 border-blue-200 text-blue-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <button
            onClick={() => removeNotification(notification.id)}
            className="absolute top-2 right-2 hover:bg-gray-200 rounded-full p-1"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            {notification.type === 'MEETING' ? (
              <Clock className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <div className="font-semibold">
              {notification.type}
            </div>
          </div>
          <div className="mt-1 text-sm pr-6">{notification.message}</div>
        </div>
      ))}
    </div>
  );
};

export default TaskTimeNotifications;