import React from 'react';
import { Calendar, User, Building2, ArrowLeft } from 'lucide-react';
import TaskStatus from './TaskStatus';
import api from '../../../../../utils/api';

const TaskHeader = ({ task, navigate, isOverdue, daysUntilDue, setTask }) => {
    const handleMarkCompleted = async () => {
      try {
        await api.put(`/api/tasks/${task.id}/`, {
          action: 'mark_completed'
        });
        // Refresh task data
        const response = await api.get(`/api/tasks/${task.id}/`);
        setTask(response.data);
      } catch (error) {
        console.error('Error marking task as completed:', error);
      }
    };
  
    const handleSubmitForReview = async () => {
      try {
        await api.put(`/api/tasks/${task.id}/`, {
          action: 'mark_completed'  // This will set it to REVIEW for assigned tasks
        });
        // Refresh task data
        const response = await api.get(`/api/tasks/${task.id}/`);
        setTask(response.data);
      } catch (error) {
        console.error('Error submitting for review:', error);
      }
    };

    const handleApproveCompletion = async () => {
      try {
        await api.put(`/api/tasks/${task.id}/`, {
          action: 'approve_completion'
        });
        // Refresh task data
        const response = await api.get(`/api/tasks/${task.id}/`);
        setTask(response.data);
      } catch (error) {
        console.error('Error approving completion:', error);
      }
    };

    // Check if it's a personal task (created by user for themselves)
    const isPersonalTask = task.created_by_id === task.assigned_to_id;
    
    // Check if current user is the one who assigned the task
    const isTaskAssigner = task.assigned_by_id === task.current_user_id;
    
    // Check if current user is the assignee
    const isTaskAssignee = task.assigned_to_id === task.current_user_id;

    // Show "Submit for Review" only if:
    // 1. Current user is the assignee (not the assigner)
    // 2. Task is not a personal task
    // 3. Task is not already in REVIEW or COMPLETED status
    const showSubmitForReview = !isPersonalTask && 
                               isTaskAssignee && 
                               !isTaskAssigner &&
                               task.status !== 'REVIEW' && 
                               task.status !== 'COMPLETED';

    // Show "Mark as Completed" only if:
    // 1. It's a personal task AND current user is the creator/assignee
    // 2. Task is not already completed
    const showMarkCompleted = isPersonalTask && 
                            isTaskAssignee &&
                            task.status !== 'COMPLETED' && 
                            task.status !== 'REVIEW';

    // Show "Approve Completion" only if:
    // 1. Current user is the one who assigned the task
    // 2. Task is in REVIEW status
    const showApproveCompletion = !isPersonalTask && 
                                 isTaskAssigner && 
                                 task.status === 'REVIEW';
                                 
    // Debug information
    console.log('Task Header Debug Info:', {
        isPersonalTask,
        isTaskAssigner,
        status: task.status,
        showApproveCompletion,
        taskData: {
            current_user_id: task.current_user_id,
            assigned_by_id: task.assigned_by_id,
            created_by_id: task.created_by_id,
            assigned_to_id: task.assigned_to_id
        }
    });
  
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <button 
          onClick={() => navigate('/dashboard/tasks')}
          className="mb-6 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Tasks
        </button>
  
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{task.title}</h1>
            <div className="flex flex-wrap gap-4">
              <TaskStatus status={task.status} />
              <span className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                {task.assigned_to_name || 'Unassigned'}
              </span>
              <span className="flex items-center gap-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                {task.department_name}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
              <Calendar className="w-4 h-4" />
              <span>{new Date(task.due_date).toLocaleDateString()}</span>
            </div>
            {isOverdue && task.status !== 'COMPLETED' && (
              <span className="text-red-600 text-sm mt-1">
                {Math.abs(daysUntilDue)} days overdue
              </span>
            )}
          </div>
        </div>
  
        <div className="flex gap-4">
          {showSubmitForReview && (
            <button
              onClick={handleSubmitForReview}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Submit for Review
            </button>
          )}

          {showMarkCompleted && (
            <button
              onClick={handleMarkCompleted}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Mark as Completed
            </button>
          )}

          {showApproveCompletion && (
            <button
              onClick={handleApproveCompletion}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Approve Completion
            </button>
          )}
        </div>
      </div>
    );
};

export default TaskHeader;