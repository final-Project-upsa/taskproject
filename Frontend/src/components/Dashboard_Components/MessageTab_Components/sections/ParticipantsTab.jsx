import React, { useState } from 'react';
import { Users, ChevronDown, ChevronRight } from 'lucide-react';

const ParticipantsTab = ({ participants }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-t border-gray-200">
      <div
        className="p-4 flex items-center cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-medium">Participants</span>
        <button className="ml-auto">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
      {isExpanded && (
        <div className="p-4 space-y-2">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-3">
                <div className="font-medium text-sm">{participant.name}</div>
                <div className="text-xs text-gray-500">{participant.email}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticipantsTab;