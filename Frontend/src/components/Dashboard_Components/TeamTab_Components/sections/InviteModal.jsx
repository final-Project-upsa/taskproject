import React from 'react';
import { X, PlusCircle } from 'lucide-react';

const InviteModal = ({ 
  isOpen, 
  onClose, 
  inviteFormData, 
  onInviteChange, 
  onInviteSubmit, 
  inviteError, 
  departments, 
  openCreateDepartmentModal 
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
        <h3 className="text-xl font-semibold mb-4">Invite New Member</h3>
        
        <form onSubmit={onInviteSubmit} className="space-y-4">
          {inviteError && (
            <div className="bg-red-50 text-red-600 p-2 rounded-md">
              {inviteError}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={inviteFormData.email}
              onChange={onInviteChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={inviteFormData.role}
              onChange={onInviteChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <div className="flex items-center space-x-2">
              <select
                id="department"
                name="department"
                value={inviteFormData.department}
                onChange={onInviteChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
                <option value="create_new">+ Create New Department</option>
              </select>
              {inviteFormData.department === 'create_new' && (
                <button
                  type="button"
                  onClick={openCreateDepartmentModal}
                  className="mt-1 bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700"
                >
                  <PlusCircle className="w-5 h-5" />
                </button>
              )}
            </div>
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
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteModal;