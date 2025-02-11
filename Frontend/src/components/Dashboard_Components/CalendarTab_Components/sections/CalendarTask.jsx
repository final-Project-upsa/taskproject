import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getTaskTypeColor } from './TaskTypes';

export const CalendarTask = ({ task, startMinutes, width }) => {
    const navigate = useNavigate();
    const isCompleted = task.status === 'COMPLETED';
    const backgroundColor = getTaskTypeColor(task.type, isCompleted);
    
    const handleClick = (e) => {
      e.stopPropagation();
      navigate(`/dashboard/tasks/expand/${task.id}`);
    };
    
    return (
      <div
        onClick={handleClick}
        className={`absolute ${backgroundColor} rounded-lg border shadow-sm 
          cursor-pointer hover:shadow-md transition-shadow ${
            isCompleted ? 'line-through' : ''
          }`}
        style={{
          left: `${(startMinutes / 60) * 128}px`,
          width: `${width - 4}px`,
          top: '2px',
          height: 'calc(100% - 4px)',
          maxHeight: '72px'
        }}
      >
        <div className="font-medium text-xs truncate px-2 pt-1">{task.title}</div>
        <div className="text-xs opacity-75 truncate px-2">
          {task.description}
          {isCompleted && (
            <span className="ml-1 text-gray-600 font-medium">(Completed)</span>
          )}
        </div>
      </div>
    );
  };