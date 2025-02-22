import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Loader } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Validate form whenever data changes
  useEffect(() => {
    const isValid = 
      inviteFormData.email?.trim() !== '' && 
      inviteFormData.role?.trim() !== '' && 
      (inviteFormData.department?.trim() !== '' && inviteFormData.department !== 'create_new');
    
    setIsFormValid(isValid);
  }, [inviteFormData]);
  
  // Handle form submission with loading state
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onInviteSubmit(e);
    } catch (error) {
      console.error('Invitation submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          disabled={isSubmitting}
        >
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-semibold mb-4">Invite New Member</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  className="mt-1 bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
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
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteModal;