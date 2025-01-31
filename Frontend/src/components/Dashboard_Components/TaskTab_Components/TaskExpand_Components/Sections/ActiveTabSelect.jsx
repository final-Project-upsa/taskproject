import React from 'react';

const ActiveTabSelect = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b">
      <div className="flex">
        {['details', 'comments', 'attachments', 'metrics'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === tab
                ? 'text-indigo-600 border-b-2 border-indigo-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActiveTabSelect;