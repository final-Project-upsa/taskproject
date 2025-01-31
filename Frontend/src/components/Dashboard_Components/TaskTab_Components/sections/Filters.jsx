import React from 'react';
import { Plus, Trash2, Search } from 'lucide-react';

const Filters = ({ 
  filters, 
  setFilters, 
  onBulkDelete, 
  selectedTasks, 
  onCreateTask, 
  departments = [] 
}) => {
  const handleSearchChange = (e) => {
    setFilters({...filters, search: e.target.value});
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center">
        {/* Search and Filters */}
        <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-4 md:items-center">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 w-full md:w-64"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-2">
            {/* Status Filter */}
            <select 
              value={filters.status || ''} 
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            >
              <option value="">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>

            {/* Priority Filter */}
            <select 
              value={filters.priority || ''} 
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>

            {/* Department Filter */}
            <select 
              value={filters.department || ''} 
              onChange={(e) => setFilters({...filters, department: e.target.value})}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {/* Create Task Button */}
          <button 
            onClick={onCreateTask}
            className="flex items-center space-x-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>

          {/* Bulk Delete Button (only show if tasks selected) */}
          {selectedTasks.length > 0 && (
            <button 
              onClick={onBulkDelete}
              className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Selected ({selectedTasks.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Selected Tasks Count */}
      {selectedTasks.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};

export default Filters;