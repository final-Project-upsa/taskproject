import React from 'react';

const TaskDetails = ({ task }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
        <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
      </div>
    </div>
  );
};

export default TaskDetails;