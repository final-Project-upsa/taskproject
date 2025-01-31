import React from 'react';

const TaskMetrics = ({ task, isOverdue, daysUntilDue, completionStatus }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Tracking</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Created</span>
            <span className="font-medium">{new Date(task.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Last Updated</span>
            <span className="font-medium">{new Date(task.updated_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Time Until Due</span>
            <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
              {isOverdue 
                ? `${Math.abs(daysUntilDue)} days overdue` 
                : `${daysUntilDue} days remaining`}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Comments</span>
            <span className="font-medium">{task.comments?.length || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Attachments</span>
            <span className="font-medium">{task.attachments?.length || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Completion</span>
            <span className="font-medium">{completionStatus}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskMetrics;