import React, { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import api from '../../../../utils/api';

const AssignTaskModal = ({ isOpen, onClose, selectedTasks, userData, onTaskAssigned }) => {
  const [departments, setDepartments] = useState([]);
  const [departmentMembers, setDepartmentMembers] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch departments when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchDepartments = async () => {
        try {
          const response = await api.get('/api/organization/team/');
          setDepartments(response.data.departments);
        } catch (err) {
          console.error('Error fetching departments:', err);
          setError('Failed to fetch departments');
        }
      };

      fetchDepartments();
    }
  }, [isOpen]);

  // Fetch department members when a department is selected
  useEffect(() => {
    if (selectedDepartment) {
      const fetchDepartmentMembers = async () => {
        try {
          const response = await api.get(`/api/organization/department/${selectedDepartment}/members/`);
          setDepartmentMembers(response.data.members);
        } catch (err) {
          console.error('Error fetching department members:', err);
          setError('Failed to fetch department members');
        }
      };

      fetchDepartmentMembers();
    }
  }, [selectedDepartment]);

  // Handle individual employee selection
  const toggleEmployeeSelection = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  // Handle task assignment
  const handleAssignTask = async () => {
    console.log('Assign Task clicked');
    console.log('Selected Tasks:', selectedTasks);
    console.log('Selected Department:', selectedDepartment);
    console.log('Selected Employees:', selectedEmployees);

    setLoading(true);
    setError(null);

    try {
      // If assigning to a whole department
      if (selectedDepartment && departmentMembers.length > 0) {
        console.log('Assigning to department');
        const assignPromises = selectedTasks.map(taskId => {
          console.log(`Assigning task ${taskId} to department ${selectedDepartment}`);
          return api.post(`/api/tasks/${taskId}/assign/`, { 
            department_id: selectedDepartment 
          });
        });
        await Promise.all(assignPromises);
      } 
      // If assigning to specific employees
      else if (selectedEmployees.length > 0) {
        console.log('Assigning to specific employees');
        const assignPromises = selectedTasks.flatMap(taskId => 
          selectedEmployees.map(employeeId => {
            console.log(`Assigning task ${taskId} to employee ${employeeId}`);
            return api.post(`/api/tasks/${taskId}/assign/`, { employee_id: employeeId });
          })
        );
        await Promise.all(assignPromises);
      } else {
        console.error('No employees or department selected');
        throw new Error('No employees or department selected');
      }
      onTaskAssigned();
      onClose();
    } catch (err) {
      console.error('Error assigning tasks:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.error || 'Failed to assign tasks');
    } finally {
      setLoading(false);
    }
  };

  // Filter departments based on user role
  const filterDepartments = () => {
    if (userData.role === 'MANAGER') {
      // Manager can only see and assign within their department
      return departments.filter(dept => dept.id === userData.department);
    }
    return departments;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Assign Task{selectedTasks.length > 1 ? 's' : ''}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Department Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Department
          </label>
          <div className="grid grid-cols-3 gap-2">
            {filterDepartments().map(dept => (
              <button
                key={dept.id}
                onClick={() => {
                  setSelectedDepartment(dept.id);
                  setSelectedEmployees([]); // Reset individual selections
                }}
                className={`p-2 rounded border ${
                  selectedDepartment === dept.id 
                    ? 'bg-indigo-600  text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                {dept.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Department Members */}
        {selectedDepartment && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-md font-semibold">Department Members</h3>
              <button
                onClick={() => setSelectedEmployees(
                  departmentMembers.map(member => member.id)
                )}
                className="text-sm text-indigo-600 hover:underline"
              >
                Select All
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {departmentMembers.map(member => (
                <div 
                  key={member.id}
                  className={`flex items-center p-2 rounded cursor-pointer ${
                    selectedEmployees.includes(member.id) 
                      ? 'bg-indigo-100' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => toggleEmployeeSelection(member.id)}
                >
                  <input 
                    type="checkbox"
                    checked={selectedEmployees.includes(member.id)}
                    onChange={() => toggleEmployeeSelection(member.id)}
                    className="mr-2"
                  />
                  <img 
                    src={member.avatar || '/default-avatar.png'} 
                    alt={member.name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div>
                    <div className="text-sm font-medium">{member.name}</div>
                    <div className="text-xs text-gray-500">{member.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 mt-4">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleAssignTask}
            disabled={loading || (!selectedDepartment && selectedEmployees.length === 0)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
          >
            {loading ? 'Assigning...' : 'Assign Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTaskModal;