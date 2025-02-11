import React, { useState } from 'react';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';

const ChatHeader = ({ selectedChat, currentUser }) => {
    const [showParticipants, setShowParticipants] = useState(false);
  
    const getParticipantNames = () => {
      if (selectedChat.chat_type === 'DIRECT') {
        const otherParticipant = selectedChat.participants?.find(p => p.id !== currentUser?.id);
        return `Chat with ${otherParticipant?.name || otherParticipant?.email || 'User'}`;
      } else {
        return `Group Chat (${selectedChat.participants?.length || 0} participants)`;
      }
    };
  
    return (
      <div className="border-b bg-white">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedChat.name && `${selectedChat.name} - `}{getParticipantNames()}
          </h2>
          {selectedChat.chat_type === 'GROUP' && (
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <Users size={20} />
              {showParticipants ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          )}
        </div>
        
        {showParticipants && selectedChat.chat_type === 'GROUP' && (
          <div className="px-4 pb-4 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-2 pt-2">Participants</h3>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {selectedChat.participants?.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {participant.name?.[0]?.toUpperCase() || 
                     participant.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-gray-700">
                    {participant.name || participant.email}
                    {participant.id === currentUser?.id && " (You)"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
};


export default ChatHeader;