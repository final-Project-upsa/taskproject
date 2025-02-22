import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, List } from 'lucide-react';

const TaskProgressBar = ({ status }) => {
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
    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
      <div 
        className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  );
};

const ActiveTasks = ({ tasks, filter, setFilter, setIsCreateModalOpen, handleStatusChange, currentUser }) => {
  const navigate = useNavigate();

  const filteredTasks = tasks.filter(task => {
    if (filter === 'personal') {
      return task.created_by?.id === currentUser?.id;
    } else if (filter === 'assigned') {
      return task.assigned_to?.id === currentUser?.id;
    }
    return true;
  });

  const recentActiveTasks = filteredTasks
    .filter(task => task.status !== 'COMPLETED')
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-96 overflow-y-auto hide-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Recent Active Tasks</h3>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          New Task
        </button>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          All
        </button>
        
      </div>

      {recentActiveTasks.length > 0 ? (
        <div className="space-y-3">
          {recentActiveTasks.map(task => (
            <div
              key={task.id}
              onClick={() => navigate(`/dashboard/tasks/expand/${task.id}`)}
              className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3">
                {task.status === 'IN_PROGRESS' && <Clock className="w-4 h-4 text-blue-500" />}
                {task.status === 'REVIEW' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                <div className="flex-1">
                  <div className="text-sm font-medium">{task.title}</div>
                  <div className="text-xs text-gray-500">
                    Due {new Date(task.due_date).toLocaleDateString()}
                  </div>
                  <TaskProgressBar status={task.status} />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(task.id, 'COMPLETED');
                  }}
                  className="p-1 rounded-full hover:bg-green-50 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <List className="w-8 h-8 text-gray-400" />
          <p className="text-sm text-gray-500 mt-2">No active tasks available</p>
        </div>
      )}
    </div>
  );
};

export default ActiveTasks;