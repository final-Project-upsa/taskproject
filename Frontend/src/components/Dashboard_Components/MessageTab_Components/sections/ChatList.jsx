import React from 'react';
import { Search, Plus, Users, UserPlus, Circle , Paperclip} from 'lucide-react';

const ChatList = ({ 
  chats, 
  searchTerm, 
  setSearchTerm, 
  setShowNewChatModal, 
  selectedChatId, 
  setSelectedChatId, 
  getChatDisplayName 
}) => {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          <button
            onClick={() => setShowNewChatModal(true)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <Plus size={20} />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setSelectedChatId(chat.id)}
            className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
              selectedChatId === chat.id ? 'bg-indigo-50' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                chat.chat_type === 'GROUP' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {chat.chat_type === 'GROUP' ? <Users size={20} /> : <UserPlus size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="font-medium text-gray-900 truncate flex items-center gap-2">
                    {getChatDisplayName(chat)}
                    {chat.unread && (
                      <Circle size={8} className="fill-indigo-600 text-indigo-600" />
                    )}
                  </div>
                  {chat.last_message?.timestamp && (
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(chat.last_message.timestamp)}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {chat.last_message?.sender && (
                    <span className="font-medium">
                      {chat.chat_type === 'GROUP' ? `${chat.last_message.sender.name}: ` : ''}
                    </span>
                  )}
                  {chat.last_message?.has_attachments ? (
                    <span className="flex items-center gap-1">
                      <Paperclip className="w-3 h-3"/> File Attachment
                      {chat.last_message?.content && ` • ${chat.last_message.content}`}
                    </span>
                  ) : (
                    chat.last_message?.content || 'No messages yet'
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;