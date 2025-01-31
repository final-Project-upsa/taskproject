import React from 'react';
import { X } from 'lucide-react';

const CreateDepartmentModal = ({ 
  isOpen, 
  onClose, 
  newDepartmentData, 
  onNewDepartmentChange, 
  onCreateDepartmentSubmit, 
  departmentError 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-semibold mb-4">Create New Department</h3>
        
        <form onSubmit={onCreateDepartmentSubmit} className="space-y-4">
          {departmentError && (
            <div className="bg-red-50 text-red-600 p-2 rounded-md">
              {departmentError}
            </div>
          )}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Department Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={newDepartmentData.name}
              onChange={onNewDepartmentChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Enter department name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Department Description
            </label>
            <textarea
              id="description"
              name="description"
              value={newDepartmentData.description}
              onChange={onNewDepartmentChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Optional department description"
              rows="3"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Department
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDepartmentModal;