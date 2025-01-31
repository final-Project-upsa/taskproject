import React from 'react';

const TaskStatus = ({ status }) => {
  const styles = {
    COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    TODO: 'bg-gray-100 text-gray-700 border-gray-200',
    BLOCKED: 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default TaskStatus;