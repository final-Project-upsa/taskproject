import React, { useState, useEffect } from 'react';
import { X, Loader, Users, ChevronDown } from 'lucide-react';
import api from '../../../../utils/api';

const CreateTaskModal = ({ isOpen, onClose, departments, userData, onCreateTask }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [assignmentType, setAssignmentType] = useState('none');
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    due_date: '',
    time: '09:00',
    type: 'PERSONAL',
    duration: 60,
    department: null,
    assigned_to: []
  });

  useEffect(() => {
    const isValid = newTask.title.trim() !== '';
    setIsFormValid(isValid);
  }, [newTask]);

  const handleAssignmentTypeChange = (type) => {
    setAssignmentType(type);
    setSelectedDepartments([]);
    setSelectedUsers([]);
    
    if (type === 'none') {
      setNewTask(prev => ({ ...prev, assigned_to: [] }));
    } else if (type === 'everyone') {
      const allUserIds = departments.flatMap(dept => dept.members.map(member => member.id));
      setNewTask(prev => ({ ...prev, assigned_to: allUserIds }));
    } else {
      setNewTask(prev => ({ ...prev, assigned_to: [] }));
    }
  };

  const handleDepartmentToggle = (deptId) => {
    const department = departments.find(dept => dept.id === deptId);
    if (!department) return;

    let newSelectedDepts = [...selectedDepartments];
    let newSelectedUsers = [...selectedUsers];

    if (selectedDepartments.includes(deptId)) {
      // Unselect department and its members
      newSelectedDepts = newSelectedDepts.filter(id => id !== deptId);
      newSelectedUsers = newSelectedUsers.filter(userId => 
        !department.members.some(member => member.id === userId)
      );
    } else {
      // Select department and all its members
      newSelectedDepts.push(deptId);
      department.members.forEach(member => {
        if (!newSelectedUsers.includes(member.id)) {
          newSelectedUsers.push(member.id);
        }
      });
    }

    setSelectedDepartments(newSelectedDepts);
    setSelectedUsers(newSelectedUsers);
    setNewTask(prev => ({ ...prev, assigned_to: newSelectedUsers }));
  };

  const handleUserToggle = (userId, deptId) => {
    let newSelectedUsers = [...selectedUsers];
    const department = departments.find(dept => dept.id === deptId);
    
    if (selectedUsers.includes(userId)) {
      // Unselect user
      newSelectedUsers = newSelectedUsers.filter(id => id !== userId);
      // Unselect department if not all members are selected
      if (selectedDepartments.includes(deptId)) {
        setSelectedDepartments(prev => prev.filter(id => id !== deptId));
      }
    } else {
      // Select user
      newSelectedUsers.push(userId);
      // Check if all department members are now selected
      const allDeptMembersSelected = department.members.every(
        member => newSelectedUsers.includes(member.id)
      );
      if (allDeptMembersSelected && !selectedDepartments.includes(deptId)) {
        setSelectedDepartments(prev => [...prev, deptId]);
      }
    }
    
    setSelectedUsers(newSelectedUsers);
    setNewTask(prev => ({ ...prev, assigned_to: newSelectedUsers }));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/api/tasks/create/', newTask);
      onCreateTask(response.data);
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      alert(`Error creating task: ${error.response?.data?.error || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[32rem] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Task</h2>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="text-gray-500 hover:text-gray-700 disabled:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleCreateTask} className="space-y-4">
          <input 
            type="text"
            placeholder="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
            required
            disabled={isSubmitting}
          />

          <textarea 
            placeholder="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
            rows="3"
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            >
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
            </select>

            <select
              value={newTask.type}
              onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            >
              <option value="PERSONAL">Personal</option>
              <option value="MEETING">Meeting</option>
              <option value="PROJECT">Project</option>
              <option value="DEADLINE">Deadline</option>
              <option value="REMINDER">Reminder</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input 
              type="date"
              value={newTask.due_date}
              onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
            <input 
              type="time"
              value={newTask.time}
              onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input 
              type="number"
              min="0"
              placeholder="Duration (minutes)"
              value={newTask.duration}
              onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) || 0 })}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
              disabled={isSubmitting}
            />
            <span className="text-gray-500">minutes</span>
          </div>

          {/* Assignment Section */}
          {['MANAGER', 'ADMIN'].includes(userData?.role) && (
            <div className="space-y-4">
              <div className="font-medium text-gray-700">Assignment</div>
              <div className="space-y-2">
                {['none', 'everyone', 'selected'].map((type) => (
                  <div key={type} className="flex items-center">
                    <input
                      type="radio"
                      id={type}
                      checked={assignmentType === type}
                      onChange={() => handleAssignmentTypeChange(type)}
                      className="mr-2"
                      disabled={isSubmitting}
                    />
                    <label htmlFor={type} className="capitalize">
                      {type === 'none' ? 'Personal Task' : type}
                    </label>
                  </div>
                ))}
              </div>

              {assignmentType === 'selected' && (
                <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                  {departments.map(dept => (
                    <div key={dept.id} className="mb-4">
                      <div 
                        className="flex items-center p-2 bg-white rounded-lg shadow-sm cursor-pointer hover:bg-gray-50"
                        onClick={() => handleDepartmentToggle(dept.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDepartments.includes(dept.id)}
                          onChange={() => {}}
                          className="mr-2"
                          disabled={isSubmitting}
                        />
                        <span className="font-medium">{dept.name}</span>
                        <Users size={16} className="ml-2 text-gray-500" />
                      </div>
                      
                      <div className="ml-6 mt-2 space-y-2">
                        {dept.members.map(member => (
                          <div 
                            key={member.id}
                            className="flex items-center p-2 bg-white rounded-md"
                          >
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(member.id)}
                              onChange={() => handleUserToggle(member.id, dept.id)}
                              className="mr-2"
                              disabled={isSubmitting}
                            />
                            <span>{member.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <button 
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;