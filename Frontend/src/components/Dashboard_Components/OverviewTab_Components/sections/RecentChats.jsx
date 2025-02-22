import React from 'react';
import { MessageSquare, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom'; // Assuming you're using React Router for navigation

const RecentChats = ({ chats }) => {
  const formatTime = (timestamp) => {
    try {
      // Assuming timestamp is in ISO format from Django
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return '';
      }
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900">Recent Chats</h3>
        <MessageSquare className="w-5 h-5 text-gray-400" />
      </div>

      {chats.length > 0 ? (
        <div className="space-y-1">
          {chats.slice(0, 3).map(chat => (
            <div 
              key={chat.id} 
              className="group cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors duration-200"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-medium text-gray-900">
                  {chat.name || 'Unnamed Chat'} 
                </div>
                <div className="text-xs text-gray-400">
                  {formatTime(chat.last_activity)}
                </div>
              </div>

              <div className="text-xs text-gray-500 truncate group-hover:text-gray-700">
                {typeof chat.last_message === 'object' 
                  ? chat.last_message.content 
                  : chat.last_message}
              </div>
            </div>
          ))}

          {/* "See All Chats" Link */}
          <Link to="/dashboard/messages" className="text-sm text-blue-500 hover:underline mt-4 block text-center">
            See all chats
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-32">
          <MessageCircle className="w-8 h-8 text-gray-400 mb-1" />
          <p className="text-sm text-gray-500">No recent chats</p>
        </div>
      )}
    </div>
  );
};

export default RecentChats;
