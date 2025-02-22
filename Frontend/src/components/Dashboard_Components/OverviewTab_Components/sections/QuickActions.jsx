import React from 'react';
import { Plus, MessageSquare, Mail, Users, ArrowUpRight } from 'lucide-react';

const QuickActions = ({ setIsCreateModalOpen }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-64">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Quick Actions</h3>
        <ArrowUpRight className="w-5 h-5 text-gray-400" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <Plus className="w-5 h-5 text-indigo-600 mb-1" />
          <span className="text-sm font-medium text-indigo-600">New Task</span>
        </button>
        <button className="p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
          <MessageSquare className="w-5 h-5 text-green-600 mb-1" />
          <span className="text-sm font-medium text-green-600">New Chat</span>
        </button>
        <button className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
          <Mail className="w-5 h-5 text-purple-600 mb-1" />
          <span className="text-sm font-medium text-purple-600">Send Update</span>
        </button>
        <button className="p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
          <Users className="w-5 h-5 text-orange-600 mb-1" />
          <span className="text-sm font-medium text-orange-600">Team Meet</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;