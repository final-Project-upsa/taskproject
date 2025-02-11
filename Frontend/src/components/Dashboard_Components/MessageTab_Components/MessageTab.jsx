import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import api from '../../../utils/api';
import ChatList from './sections/ChatList';
import ChatHeader from './sections/ChatHeader';
import MessageList from './sections/MessageList';
import MessageInput from './sections/MessageInput';
import NewChatModal from './sections/NewChatModal';
import useChatStore from '../../../stores/chatStore';

const MessageTab = () => {
  // Select all needed store state and actions
  const chats = useChatStore(state => state.chats);
  const selectedChatId = useChatStore(state => state.selectedChatId);
  const messages = useChatStore(state => state.messages);
  const isLoading = useChatStore(state => state.isLoading);
  const setSelectedChat = useChatStore(state => state.setSelectedChat);
  const fetchChats = useChatStore(state => state.fetchChats);
  
  
  // Local state
  const [currentUser, setCurrentUser] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [participantSearchTerm, setParticipantSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [chatType, setChatType] = useState('GROUP');
  const [participants, setParticipants] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [expandedDepts, setExpandedDepts] = useState({});
  const [newMessage, setNewMessage] = useState('');

  const selectedChat = chats.find(chat => chat.id === selectedChatId);
  const isGroupChat = selectedChat?.chat_type === 'GROUP';

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [userResponse, teamResponse] = await Promise.all([
          api.get('/api/current-user/'),
          api.get('/api/organization/team/')
        ]);
        setCurrentUser(userResponse.data);
        setDepartments(teamResponse.data.departments);
        await fetchChats();
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, [fetchChats]);

  
  

  const handleCreateChat = async () => {
    if (!currentUser) return;
    try {
      const response = await api.post('/api/chats/', {
        name,
        chat_type: chatType,
        participants,
      });
      
      await fetchChats();
      setSelectedChat(response.data.id);
      
      // Reset form
      setName('');
      setParticipants([]);
      setShowNewChatModal(false);
    } catch (error) {
      if (error.response?.data?.chat_id) {
        setSelectedChat(error.response.data.chat_id);
        alert(error.response.data.error);
      } else {
        alert(error.response?.data?.error || 'Error creating chat');
      }
    }
  };

  const handleSendMessage = async (e, formData) => {
    e?.preventDefault();
    
    if (!selectedChatId || !currentUser) return;
    
    try {
      if (formData && formData.has('attachments')) {
        const content = formData.get('content');
        const attachments = formData.getAll('attachments');
        await useChatStore.getState().handleSendMessage(
          selectedChatId,
          content,
          currentUser.id,
          attachments
        );
      } else if (newMessage.trim()) {
        await useChatStore.getState().handleSendMessage(
          selectedChatId,
          newMessage,
          currentUser.id
        );
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    }
  };

  const toggleDepartment = (deptId) => {
    setExpandedDepts(prev => ({
      ...prev,
      [deptId]: !prev[deptId]
    }));
  };

  const handleDepartmentSelect = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    if (dept) {
      const memberIds = dept.members.map(m => m.id.toString());
      setParticipants(prev => {
        const newParticipants = new Set([...prev]);
        memberIds.forEach(id => newParticipants.add(id));
        return Array.from(newParticipants);
      });
    }
  };

  const getChatDisplayName = (chat) => {
    if (chat.name) return chat.name;
    if (chat.chat_type === 'DIRECT') {
      const otherParticipant = chat.participants?.find(p => p.id !== currentUser?.id);
      return `Direct message with ${otherParticipant?.name || 'User'}`;
    }
    return `Group Chat`;
  };

  const filteredChats = chats.filter(chat =>
    getChatDisplayName(chat).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isUserSelected = (userId) => participants.includes(userId.toString());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-4/5 mx-auto my-[10vh] bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[80vh] mx-auto my-[2vh] bg-gray-50 rounded-lg shadow-lg overflow-hidden">
      <ChatList
        chats={filteredChats}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setShowNewChatModal={setShowNewChatModal}
        selectedChatId={selectedChatId}
        setSelectedChatId={setSelectedChat}
        getChatDisplayName={getChatDisplayName}
      />

      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <>
            <ChatHeader selectedChat={selectedChat} getChatDisplayName={getChatDisplayName} />
            {currentUser && (
              <MessageList 
                messages={messages[selectedChatId] || []} 
                currentUser={currentUser} 
                isGroupChat={isGroupChat} 
              />
            )}
            <MessageInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleSendMessage={handleSendMessage}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-800 mb-2">No Chat Selected</h3>
              <p className="text-gray-500">Choose a chat from the sidebar or start a new conversation</p>
            </div>
          </div>
        )}
      </div>

      <NewChatModal
        showNewChatModal={showNewChatModal}
        setShowNewChatModal={setShowNewChatModal}
        name={name}
        setName={setName}
        chatType={chatType}
        setChatType={setChatType}
        participants={participants}
        setParticipants={setParticipants}
        departments={departments}
        expandedDepts={expandedDepts}
        setExpandedDepts={setExpandedDepts}
        participantSearchTerm={participantSearchTerm}
        setParticipantSearchTerm={setParticipantSearchTerm}
        handleCreateChat={handleCreateChat}
        isUserSelected={isUserSelected}
        toggleDepartment={toggleDepartment}
        handleDepartmentSelect={handleDepartmentSelect}
      />
    </div>
  );
};

export default MessageTab;