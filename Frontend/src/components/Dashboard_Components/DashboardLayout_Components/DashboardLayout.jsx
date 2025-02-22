import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './sections/Sidebar';
import TopNavigation from './sections/TopNavigation';
import LoadingSpinner from './sections/LoadingSpinner';
import ErrorMessage from './sections/ErrorMessage';
import useAuthStore from '../../../stores/authStore';
import api from '../../../utils/api';
import useChatStore from '../../../stores/chatStore';
import useNotificationStore from '../../../stores/NotificationStore';
import NotificationPopup from '../Add-ons/NotificationPopup';
import TaskTimeNotifications from '../../TaskTimeNotifications';
import UnifiedNotifications from '../Add-ons/UnifiedNotifications';

const fetchCurrentUser = async () => {
  try {
    const token = localStorage.getItem('access_token');

    const response = await api.get('/api/current-user/', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data; // Returns the current user object
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [activeNotification, setActiveNotification] = useState(null);
  const initializeWebSocket = useChatStore(state => state.initializeWebSocket);
  const updateChatWithMessage = useChatStore(state => state.updateChatWithMessage);
  const cleanupWebSockets = useChatStore(state => state.cleanupWebSockets);
  const activeWebSocketsRef = useRef(new Map());

  const clearError = () => {
    setError(null); // Clear the error state
  };

  
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');

      // Fetch current user
      const user = await fetchCurrentUser();
      setCurrentUser(user);

      if (!user) {
        setError('Not authenticated');
        setIsLoading(false);
        logout();
        return;
      }

      // Fetch user data
      try {
        const response = await fetch('/api/user/dashboard/', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
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

    fetchData();
  }, [navigate, logout]);


  useEffect(() => {
    if (!currentUser || !userData) return;
    
    console.log('Initializing WebSockets...');
    const activeWebSockets = new Map();
    
    const fetchAndInitialize = async () => {
      try {
        const response = await api.get('/api/chats/');
        const chats = response.data;
        
        console.log(`Setting up WebSockets for ${chats.length} chats`);
        
        chats.forEach(chat => {
          // If this chat already has an active connection in our ref, skip it
          if (activeWebSocketsRef.current.has(chat.id) && 
              activeWebSocketsRef.current.get(chat.id).readyState === WebSocket.OPEN) {
            console.log(`WebSocket already exists for chat ${chat.id}`);
            activeWebSockets.set(chat.id, activeWebSocketsRef.current.get(chat.id));
            return;
          }
          
          console.log(`Creating new WebSocket for chat ${chat.id}`);
          const ws = initializeWebSocket(chat.id, currentUser.id);
          
          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(`Message received for chat ${chat.id}:`, data);
            
            const transformedMessage = {
              id: data.id,
              chat: chat.id,
              content: data.content,
              sender: data.sender,
              timestamp: data.timestamp,
              attachments: data.attachments || [],
              has_attachments: data.has_attachments
            };
            
            updateChatWithMessage(transformedMessage, currentUser.id);
            
            if (data.sender.id !== currentUser.id) {
              const chatName = chat.name || (chat.chat_type === 'GROUP' ? 
                'Group Chat' : `Chat with ${data.sender.name}`);
              
              const newNotification = {
                id: Date.now() + Math.random(),
                type: 'message',
                chatId: chat.id,
                title: chatName,
                message: `${data.sender.name}: ${data.content}`,
                timestamp: data.timestamp,
                sender: data.sender,
                unread: true
              };
              
              console.log('Creating notification:', newNotification);
              addNotification(newNotification);
              setActiveNotification(newNotification);
            }
          };
          
          activeWebSockets.set(chat.id, ws);
        });
        
        // Update our ref with the new map of connections
        activeWebSocketsRef.current = activeWebSockets;
        
      } catch (error) {
        console.error('Error initializing WebSockets:', error);
      }
    };
    
    fetchAndInitialize();
    
    // Cleanup function
    return () => {
      console.log('Cleaning up WebSockets...');
      activeWebSockets.forEach((ws, chatId) => {
        console.log(`Closing WebSocket for chat ${chatId}`);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      });
      activeWebSockets.clear();
      cleanupWebSockets();
    };
  }, [currentUser?.id, userData]);

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

  if (!currentUser) {
    return <div>Loading...</div>; // Show a loading state until the user is fetched
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation
        userData={userData}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleLogout={handleLogout}
      />
      <div className="flex pt-14">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} currentUser={currentUser} />
        <main className="flex-1 p-6 md:ml-64">
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
          <div className="max-w-7xl mx-auto">
          {React.cloneElement(children, { currentUser })}
          <UnifiedNotifications
            chatNotification={activeNotification ? {
              title: activeNotification.title,
              message: activeNotification.message
            } : null}
            onChatNotificationClose={() => setActiveNotification(null)}
          />
          {/* <TaskTimeNotifications/>  */}
          </div>
          {/* {activeNotification && (
            <NotificationPopup
              message={`${activeNotification.title}: ${activeNotification.message}`}
              onClose={() => setActiveNotification(null)}
            />
          )} */}
          <footer className="text-center text-sm text-gray-500 mt-8">
            Powered by EnterpriseSync
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;