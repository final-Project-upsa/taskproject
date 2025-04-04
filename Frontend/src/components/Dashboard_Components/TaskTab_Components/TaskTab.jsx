import React, { useState, useEffect } from 'react';
import api from '../../../utils/api'; 
import TaskList from './sections/TaskList';
import CreateTaskModal from './sections/CreateTaskModal';
import AssignTaskModal from './sections/AssignTaskModal';
import Filters from './sections/Filters';

const TaskTab = () => {
  const [tasks, setTasks] = useState([]);
  const [userData, setUserData] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    department: ''
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [expandedTask, setExpandedTask] = useState(null);
  const [isTaskExpandOpen, setIsTaskExpandOpen] = useState(false);

  const handleExpandTask = (task) => {
    setExpandedTask(task);
    setIsTaskExpandOpen(true);
  };

  const handleAddComment = async (data) => {
    try {
      const response = await api.post(`/api/tasks/${data.task_id}/comments/`, {
        content: data.content
      });
      // Refresh task data after adding comment
      const updatedTask = await api.get(`/api/tasks/${data.task_id}/`);
      setExpandedTask(updatedTask.data);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleAddAttachment = async (formData) => {
    try {
      const response = await api.post(
        `/api/tasks/${formData.get('task_id')}/attachments/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      // Refresh task data after adding attachment
      const updatedTask = await api.get(`/api/tasks/${formData.get('task_id')}/`);
      setExpandedTask(updatedTask.data);
    } catch (error) {
      console.error('Error adding attachment:', error);
    }
  };

  // Fetch tasks and user data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('No authentication token found');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user data
        const userResponse = await api.get('/api/user/dashboard/');
        console.log(userResponse.data)
        setUserData(userResponse.data);

        // Fetch tasks
        const tasksResponse = await api.get('/api/tasks/', {
          params: filters
        });
        
        // Ensure tasks is an array
        const tasksData = Array.isArray(tasksResponse.data) 
          ? tasksResponse.data 
          : [];
        
        setTasks(tasksData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'An error occurred while fetching tasks');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/api/organization/team/');
        setDepartments(response.data.departments);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  // Bulk update tasks (delete, change status, etc.)
  const handleBulkUpdate = async (updateData) => {
    try {
      await api.post('/api/tasks/bulk-update/', {
        task_ids: selectedTasks,
        update_data: { is_active: false }  // Make sure to send is_active: false
      });
  
      // Refetch the tasks instead of just updating local state
      const tasksResponse = await api.get('/api/tasks/', {
        params: filters
      });
      
      const tasksData = Array.isArray(tasksResponse.data) 
        ? tasksResponse.data 
        : [];
      
      setTasks(tasksData);
      setSelectedTasks([]);
    } catch (error) {
      console.error('Error bulk updating tasks:', error);
      alert(`Error updating tasks: ${error.response?.data?.error || 'Unknown error'}`);
    }
  };

  // Toggle task selection for bulk actions
  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(
      selectedTasks.includes(taskId)
        ? selectedTasks.filter(id => id !== taskId)
        : [...selectedTasks, taskId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }
  
  const refreshTasks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tasksResponse = await api.get('/api/tasks/', {
        params: filters
      });
      
      const tasksData = Array.isArray(tasksResponse.data) 
        ? tasksResponse.data 
        : [];
      
      setTasks(tasksData);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.message || 'An error occurred while fetching tasks');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions Bar */}
      <Filters 
        filters={filters}
        setFilters={setFilters}
        onBulkDelete={() => handleBulkUpdate({ is_active: false })}
        selectedTasks={selectedTasks}
        onCreateTask={() => setIsCreateModalOpen(true)}
      />

      {/* Task List */}
      <TaskList 
        tasks={tasks}
        selectedTasks={selectedTasks}
        toggleTaskSelection={toggleTaskSelection}
        userData={userData}
        onAssignTask={() => setIsAssignModalOpen(true)}
        onExpandTask={handleExpandTask}
        setSelectedTasks={setSelectedTasks}
      />

      {isTaskExpandOpen && expandedTask && (
        <TaskExpand
          task={expandedTask}
          onClose={() => setIsTaskExpandOpen(false)}
          onAddComment={handleAddComment}
          onAddAttachment={handleAddAttachment}
        />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        departments={departments}
        userData={userData}
        onCreateTask={(newTask) => setTasks([...tasks, newTask])}
        onTaskAssigned={refreshTasks}
      />

      {/* Assign Task Modal */}
      <AssignTaskModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        selectedTasks={selectedTasks}
        userData={userData}
        onTaskAssigned={refreshTasks}
      />
    </div>
  );
};

export default TaskTab;