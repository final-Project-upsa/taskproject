import React from 'react';

const TaskProgressBar = ({ status }) => {
  // Calculate progress based on status
  const getProgressPercentage = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 100;
      case 'REVIEW':
        return 75;
      case 'IN_PROGRESS':
        return 50;
      case 'TODO':
        return 0;
      default:
        return 0;
    }
  };

  const progressPercentage = getProgressPercentage(status);

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
      <div 
        className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  );
};

export default TaskProgressBar;