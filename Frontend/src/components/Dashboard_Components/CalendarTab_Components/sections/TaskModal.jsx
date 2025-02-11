import React from 'react';
import { TaskTypes } from './TaskTypes';

export const TaskModal = ({ selectedCell, newTask, setNewTask, onClose, onSubmit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          Add Task for {selectedCell.time}
        </h2>
        <input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500"
        />
        <textarea
          placeholder="Task Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500"
          rows="3"
        />
        <select
          value={newTask.type}
          onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
          className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500"
        >
          {Object.entries(TaskTypes).map(([key, value]) => (
            <option key={key} value={value}>
              {value.charAt(0) + value.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <select
          value={newTask.priority}
          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
          className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="LOW">Low Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="HIGH">High Priority</option>
        </select>
        <input
          type="number"
          placeholder="Duration (minutes)"
          value={newTask.duration}
          onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) })}
          className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
};