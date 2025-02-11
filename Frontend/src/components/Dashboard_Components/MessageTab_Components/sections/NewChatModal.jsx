import React from 'react';
import { Search, ChevronDown, ChevronRight, Check, Plus } from 'lucide-react';

const NewChatModal = ({ 
  showNewChatModal, 
  setShowNewChatModal, 
  name, 
  setName, 
  chatType, 
  setChatType, 
  participants, 
  setParticipants, 
  departments, 
  expandedDepts, 
  setExpandedDepts, 
  participantSearchTerm, 
  setParticipantSearchTerm, 
  handleCreateChat, 
  isUserSelected, 
  toggleDepartment, 
  handleDepartmentSelect 
}) => {
  return (
    showNewChatModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
          <h3 className="text-xl font-semibold mb-4">Create New Chat</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chat Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter chat name"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chat Type
                </label>
                <select
                  value={chatType}
                  onChange={(e) => setChatType(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="GROUP">Group Chat</option>
                  <option value="DIRECT">Direct Chat</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Participants
                </label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search participants..."
                    value={participantSearchTerm}
                    onChange={(e) => setParticipantSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                  {departments.map(dept => (
                    <div key={dept.id} className="border-b last:border-b-0">
                      <div
                        className="flex items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleDepartment(dept.id)}
                      >
                        {expandedDepts[dept.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        <span className="ml-2 font-medium">{dept.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDepartmentSelect(dept.id);
                          }}
                          className="ml-auto text-sm text-indigo-600 hover:text-indigo-800"
                        >
                          Select All
                        </button>
                      </div>
                      {expandedDepts[dept.id] && (
                        <div className="pl-8 pr-4 py-2 space-y-2">
                          {dept.members
                            .filter(member => 
                              member.name.toLowerCase().includes(participantSearchTerm.toLowerCase()) ||
                              member.email.toLowerCase().includes(participantSearchTerm.toLowerCase())
                            )
                            .map(member => (
                              <div
                                key={member.id}
                                className="flex items-center py-2 px-2 hover:bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center flex-1">
                                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    <img
                                      src={member.avatar}
                                      alt={member.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="ml-3">
                                    <div className="font-medium text-sm">{member.name}</div>
                                    <div className="text-xs text-gray-500">{member.email}</div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    const userId = member.id.toString();
                                    setParticipants(prev =>
                                      isUserSelected(userId)
                                        ? prev.filter(id => id !== userId)
                                        : [...prev, userId]
                                    );
                                  }}
                                  className={`p-2 rounded-lg ${
                                    isUserSelected(member.id)
                                      ? 'bg-indigo-100 text-indigo-600'
                                      : 'hover:bg-gray-100'
                                  }`}
                                >
                                  {isUserSelected(member.id) ? (
                                    <Check size={20} className="text-indigo-600" />
                                  ) : (
                                    <Plus size={20} className="text-gray-400" />
                                  )}
                                </button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-6 pt-4 border-t">
            <div>
              <span className="text-sm text-gray-600">
                Selected: {participants.length} participants
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChat}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default NewChatModal;