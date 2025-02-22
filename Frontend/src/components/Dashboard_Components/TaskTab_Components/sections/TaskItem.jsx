import React from 'react';
import { useNavigate } from 'react-router-dom';

const TaskItem = ({ 
  task, 
  selectedTasks, 
  toggleTaskSelection, 
  userData, 
  onAssignTask, 
}) => {
  const navigate = useNavigate();

  // Get status color classes
  const getStatusClasses = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default: // TODO
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority color classes
  const getPriorityClasses = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'URGENT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: // LOW
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if due date has passed
    const isPastDue = date < today && task.status !== 'COMPLETED';
    
    // Format date string
    let formattedDate = date.toLocaleDateString();
    
    // Add time if it's today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      formattedDate = `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      formattedDate = `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    return { formattedDate, isPastDue };
  };

  const { formattedDate, isPastDue } = formatDate(task.due_date);

  // Check the user's relationship to the task
  const isCreatedByMe = task.created_by === userData.id;
  const isAssignedToMe = task.assigned_to === userData.id;
  const isAssignedByMe = task.assigned_by === userData.id;

  return (
    <tr 
      className="hover:bg-gray-50 cursor-pointer border-b border-gray-200 transition-colors duration-150 ease-in-out"
      onClick={() => navigate(`/dashboard/tasks/expand/${task.id}`)}
    >
      {/* Checkbox column */}
      <td className="p-3" onClick={e => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selectedTasks.includes(task.id)}
          onChange={() => toggleTaskSelection(task.id)}
          className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
        />
      </td>

      {/* Title column */}
      <td className="p-3">
        <div className="font-medium text-gray-900">{task.title}</div>
        <div className="text-sm text-gray-500">
          {isCreatedByMe ? (
            <span className="text-indigo-600">Created by Me</span>
          ) : isAssignedToMe ? (
            <span className="text-green-600">Assigned to Me</span>
          ) : isAssignedByMe ? (
            <span className="text-purple-600">Assigned by Me</span>
          ) : (
            'Unassigned'
          )}
        </div>
      </td>

      {/* Status column */}
      <td className="p-3">
        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusClasses(task.status)}`}>
          {task.status.replace(/_/g, ' ')}
        </span>
      </td>

      {/* Priority column */}
      <td className="p-3">
        <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityClasses(task.priority)}`}>
          {task.priority}
        </span>
      </td>

      {/* Due date column */}
      <td className="p-3">
        <div className={`text-sm ${isPastDue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
          {formattedDate}
        </div>
      </td>

      {/* Actions column */}
      <td className="p-3" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          {/* Only show assign button for managers/admins */}
          {(userData?.role === 'MANAGER' || userData?.role === 'ADMIN') && (
            <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskSelection(task.id);
              onAssignTask(task);
            }}
            className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded transition-colors duration-150"
            >
              Assign
            </button>
          )}
          
          {/* Quick status update buttons could go here */}
          <button
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors duration-150"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            View
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TaskItem;