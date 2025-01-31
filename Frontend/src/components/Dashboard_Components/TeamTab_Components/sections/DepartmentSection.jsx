import React, { useState } from 'react';
import MemberCard from './MemberCard';

const DepartmentSection = ({ department }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div 
        className="px-6 py-4 border-b cursor-pointer hover:bg-gray-50 transition"
        onClick={toggleExpand}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {department.name}
          </h3>
          <span className="text-gray-500">
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
        {department.description && (
          <p className="mt-1 text-sm text-gray-500">{department.description}</p>
        )}
      </div>

      {isExpanded && (
        <div className="divide-y">
          {department.members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentSection;