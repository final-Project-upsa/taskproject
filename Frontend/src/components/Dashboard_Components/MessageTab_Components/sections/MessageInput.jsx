import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Plus, X, File, CheckCircle2 } from 'lucide-react';
import api from '../../../../utils/api';

const MessageInput = ({ newMessage, setNewMessage, handleSendMessage }) => {
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showTaskMenu, setShowTaskMenu] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const fileInputRef = useRef(null);
  const taskMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (taskMenuRef.current && !taskMenuRef.current.contains(event.target)) {
        setShowTaskMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const response = await api.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
    setShowOptionsMenu(false);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleTaskShare = (task) => {
    const orgSubdomain = window.location.host.split('.')[0];
    const taskLink = `http://${orgSubdomain}.localhost:5173/dashboard/tasks/expand/${task.id}`;
    setNewMessage(prev => {
      const prefix = prev.trim() ? `${prev}\n` : '';
      return `${prefix}[Task: ${task.title}](${taskLink})`;
    });
    setShowTaskMenu(false);
    setShowOptionsMenu(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || isUploading) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('content', newMessage.trim());
      
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await handleSendMessage(e, formData);
      setNewMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 bg-white border-t">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
              <File size={16} />
              <span className="text-sm truncate max-w-[150px]">{file.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isUploading}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex space-x-2 relative">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isUploading}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx,.txt"
        />
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isUploading}
          >
            <Plus size={20} />
          </button>
          
          {showOptionsMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 w-48">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Paperclip size={16} />
                Attach File
              </button>
              <button
                type="button"
                onClick={() => {
                  fetchTasks();
                  setShowTaskMenu(true);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <CheckCircle2 size={16} />
                Share Task
              </button>
            </div>
          )}
          
          {showTaskMenu && (
            <div ref={taskMenuRef} className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 w-64 max-h-64 overflow-y-auto">
              <div className="p-2 border-b">
                <h3 className="font-medium text-gray-700">Select Task to Share</h3>
              </div>
              {isLoadingTasks ? (
                <div className="p-4 text-center text-gray-500">Loading tasks...</div>
              ) : (
                <div className="py-1">
                  {tasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => handleTaskShare(task)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <div className="font-medium text-gray-800">{task.title}</div>
                      <div className="text-xs text-gray-500">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className={`px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center space-x-2 ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isUploading}
        >
          {isUploading ? (
            <span>Sending...</span>
          ) : (
            <>
              <Send size={18} />
              <span>Send</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;