import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../../utils/api';
import TaskHeader from './Sections/TaskHeader';
import TaskProgressBar from './Sections/TaskProgressBar';
import ActiveTabSelect from './Sections/ActiveTabSelect';
import TaskDetails from './Sections/TaskDetails';
import TaskComments from './Sections/TaskComments';
import TaskAttachments from './Sections/TaskAttachments';
import TaskMetrics from './Sections/TaskMetrics';

const TaskExpandPage = () => {
  const { taskID } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(`/api/tasks/${taskID}/`);
        setTask(response.data);
      } catch (error) {
        console.error('Error fetching task:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [taskID]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-600 text-lg mb-4">Task not found</div>
        <button 
          onClick={() => navigate('/dashboard/tasks')}
          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Tasks
        </button>
      </div>
    );
  }

  const daysUntilDue = Math.ceil(
    (new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysUntilDue < 0;
  const completionStatus = task.status === 'COMPLETED' ? 100 : 
    task.status === 'IN_PROGRESS' ? 50 : 
    task.status === 'TODO' ? 0 : 25;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <TaskHeader task={task} setTask={setTask} navigate={navigate} isOverdue={isOverdue} daysUntilDue={daysUntilDue} />
        <TaskProgressBar status={task.status} />

        <div className="bg-white rounded-2xl shadow-sm">
          <ActiveTabSelect activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="p-6">
            {activeTab === 'details' && <TaskDetails task={task} />}
            {activeTab === 'comments' && <TaskComments task={task} setTask={setTask} />}
            {activeTab === 'attachments' && <TaskAttachments task={task} setTask={setTask} />}
            {activeTab === 'metrics' && <TaskMetrics task={task} isOverdue={isOverdue} daysUntilDue={daysUntilDue} completionStatus={completionStatus} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskExpandPage;