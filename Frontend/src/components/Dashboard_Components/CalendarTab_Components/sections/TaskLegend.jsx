import React from 'react';
import { TaskTypes, getTaskTypeColor } from './TaskTypes';

export const TaskLegend = () => {
  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-white border-b border-gray-200">
      {Object.entries(TaskTypes).map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded ${getTaskTypeColor(value).split(' ')[0]}`}
          />
          <span className="text-sm text-gray-600">
            {value.charAt(0) + value.slice(1).toLowerCase()}
          </span>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded bg-gray-100" />
        <span className="text-sm text-gray-600">Completed</span>
      </div>
    </div>
  );
};