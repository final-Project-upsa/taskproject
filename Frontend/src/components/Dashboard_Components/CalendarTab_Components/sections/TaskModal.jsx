import React, { useState, useEffect } from 'react';
import { TaskTypes } from './TaskTypes';
import api from '../../../../utils/api';
import { ChevronDown, Check, Users } from 'lucide-react';

export const TaskModal = ({ selectedCell, newTask, setNewTask, onClose, onSubmit, currentUser }) => {
  const [assignmentType, setAssignmentType] = useState('none');
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN') {
      fetchDepartments();
    }
  }, [currentUser]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/api/organization/team/');
      if (response.data && Array.isArray(response.data.departments)) {
        setDepartments(response.data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const handleAssignmentTypeChange = (type) => {
    setAssignmentType(type);
    setSelectedDepartments([]);
    setSelectedUsers([]);
    
    if (type === 'none') {
      setNewTask({ ...newTask, assigned_to: [] });
    } else if (type === 'everyone') {
      const allUserIds = departments.flatMap(dept => dept.members.map(member => member.id));
      setNewTask({ ...newTask, assigned_to: allUserIds });
    } else {
      setNewTask({ ...newTask, assigned_to: [] });
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
    setNewTask({ ...newTask, assigned_to: newSelectedUsers });
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
    setNewTask({ ...newTask, assigned_to: newSelectedUsers });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          Add Task for {selectedCell.time}
        </h2>
        
        {/* Basic Task Info Fields */}
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
        
        {/* Task Type and Priority Selectors */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <select
            value={newTask.type}
            onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
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
            className="p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
          </select>
        </div>

        <input
          type="number"
          placeholder="Duration (minutes)"
          value={newTask.duration}
          onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) })}
          className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500"
        />

        {/* Assignment Section */}
        {(currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment</label>
            <div className="space-y-2 mb-4">
              {['none', 'everyone', 'selected'].map((type) => (
                <div key={type} className="flex items-center">
                  <input
                    type="radio"
                    id={type}
                    checked={assignmentType === type}
                    onChange={() => handleAssignmentTypeChange(type)}
                    className="mr-2"
                  />
                  <label htmlFor={type} className="capitalize">
                    {type === 'none' ? 'Personal Task' : type}
                  </label>
                </div>
              ))}
            </div>

            {/* Department and User Selection */}
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

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6">
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