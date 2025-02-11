import React, { useRef, useEffect, useState } from 'react';
import { File, MoreVertical, Copy, Check, Plus } from 'lucide-react';
import api from '../../../../utils/api'
import TaskModal from './TaskModal';

const MessageList = ({ messages, currentUser, isGroupChat }) => {
  const messagesEndRef = useRef(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [userData, setUserData] = useState(null);


  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/api/user/dashboard/');
      setUserData(response.data.user);
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.message-menu')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const handleFileDownload = async (fileUrl, fileName) => {
    try {
      if (!fileUrl) {
        console.error('Invalid file URL');
        return;
      }

      const path = fileUrl.startsWith('http') 
        ? new URL(fileUrl).pathname 
        : fileUrl;

      const response = await api.get(path, {
        responseType: 'blob',
        withCredentials: true
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const renderAttachment = (attachment) => {
    if (!attachment.file_url) {
      console.error('Missing file URL for attachment:', attachment);
      return null;
    }

    const isImage = attachment.file_type?.startsWith('image/');
    const fileSize = attachment.file_size ? (attachment.file_size / 1024).toFixed(1) : 'N/A';
    const fileName = attachment.file_name || 'Unknown File';
    const truncatedFileName = fileName.length > 20 
      ? `${fileName.substring(0, 20)}...${fileName.split('.').pop()}` 
      : fileName;

    if (isImage) {
      const path = attachment.file_url.startsWith('http') 
        ? new URL(attachment.file_url).pathname 
        : attachment.file_url;
        
      const imageUrl = `${api.defaults.baseURL}${path}`;

      return (
        <div key={attachment.id} className="max-w-sm">
          <img
            src={imageUrl}
            alt={fileName}
            className="max-w-sm rounded-lg shadow-sm cursor-pointer hover:opacity-90"
            onClick={() => handleFileDownload(attachment.file_url, fileName)}
          />
        </div>
      );
    }
    
    return (
      <div key={attachment.id} className="max-w-sm">
        <div 
          className="flex items-center gap-2 bg-white rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
          onClick={() => handleFileDownload(attachment.file_url, fileName)}
        >
          <File size={20} className="text-gray-500" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{truncatedFileName}</span>
            <span className="text-xs text-gray-500">{fileSize} KB</span>
          </div>
        </div>
      </div>
    );
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageId(text);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
    setOpenMenuId(null);
  };

  const renderMessageMenu = (message, isOwnMessage) => (
    <div className="relative message-menu">
      <button 
        className="p-1"
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId(openMenuId === message.id ? null : message.id);
        }}
      >
        <MoreVertical size={16} className="text-gray-500" />
      </button>
      {openMenuId === message.id && (
        <div className={`absolute mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 ${
          isOwnMessage ? 'right-0' : 'left-0'
        }`}>
          <div className="py-1">
            <button
              onClick={() => handleCopy(message.content)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {copiedMessageId === message.content ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
              {copiedMessageId === message.content ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => {
                setSelectedMessage(message);
                setIsTaskModalOpen(true);
                setOpenMenuId(null);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Plus size={16} className="mr-2" />
              Create Task/Reminder
            </button>
          </div>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/api/organization/team/');
        setDepartments(response.data.departments);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);


  const handleCreateTask = async (taskData) => {
    try {
      const response = await api.post('/api/tasks/create/', {
        ...taskData
      });
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert(`Error creating task: ${error.response?.data?.error || 'Unknown error'}`);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.sender?.id === currentUser?.id;
          
          return (
            <div
              key={message.id}
              className={`flex items-start gap-2 ${
                isOwnMessage ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className="flex flex-col max-w-[70%] min-w-[60px]">
                {isGroupChat && !isOwnMessage && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 flex items-center justify-center bg-indigo-500 text-white rounded-full text-xs">
                      {message.sender?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {message.sender?.name}
                    </span>
                  </div>
                )}
                
                {message.content && (
                  <div className={`flex items-end gap-2 ${
                    isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    <div className={`px-4 py-2 rounded-2xl break-words ${
                      isOwnMessage
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}>
                      <p className="text-sm whitespace-pre-line break-all">
                        {message.content}
                      </p>
                    </div>
                    {renderMessageMenu(message, isOwnMessage)}
                  </div>
                )}
                
                {message.attachments?.length > 0 && (
                  <div className={`mt-2 space-y-2 ${
                    isOwnMessage ? 'items-end' : 'items-start'
                  }`}>
                    {message.attachments.map((attachment) => renderAttachment(attachment))}
                  </div>
                )}
                
                <div className={`text-xs text-gray-400 mt-1 ${
                  isOwnMessage ? 'text-right' : 'text-left'
                }`}>
                  {message.timestamp && new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div ref={messagesEndRef} />
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedMessage(null);
          }}
          initialTitle={selectedMessage?.content || ''}
          onCreateTask={handleCreateTask}
          message={selectedMessage}
          departments={departments}
          userData={userData}
        />
      )}
    </div>
  );
};

export default MessageList;