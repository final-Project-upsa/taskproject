// components/OverviewTab.js
import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Flame, TrendingUp, Target } from 'lucide-react';
import MetricsCard from './sections/MetricsCard';
import ActiveTasks from './sections/ActiveTasks';
import UpcomingDeadlines from './sections/UpcomingDeadlines';
import RecentChats from './sections/RecentChats';
import TeamActivity from './sections/TeamActivity';
import Notifications from './sections/Notifications';
import QuickActions from './sections/QuickActions';
import CreateTaskModal from '../TaskTab_Components/sections/CreateTaskModal';

const OverviewTab = () => {
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const [recentChats, setRecentChats] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [tasksRes, analyticsRes, userRes, chatsRes] = await Promise.all([
          api.get('/api/tasks/'),
          api.get('/api/tasks/analytics/'),
          api.get('/api/current-user/'),
          api.get('/api/chats/'),
        ]);

        setTasks(tasksRes.data);
        setAnalytics(analyticsRes.data);
        setCurrentUser(userRes.data);
        setRecentChats(chatsRes.data);

        // Filter tasks with due dates for upcoming deadlines
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const upcomingTasks = tasksRes.data.filter(task => {
          const dueDate = new Date(task.due_date);
          return dueDate <= threeDaysFromNow && dueDate >= now;
        });
        setUpcomingDeadlines(upcomingTasks);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchInitialData();
  }, []);

  const calculateVelocity = () => {
    if (!analytics?.overview?.completed_tasks) return 0;
    const weeksInPeriod = 4;
    return (analytics.overview.completed_tasks / weeksInPeriod).toFixed(1);
  };

  const calculatePersonalCompletion = () => {
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
    const totalTasks = tasks.length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const handleTaskCreate = async (newTask) => {
    try {
      await api.post('/api/tasks/create/', newTask);
      const tasksRes = await api.get('/api/tasks/');
      setTasks(tasksRes.data);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/api/tasks/${taskId}/`, { status: newStatus });
      const tasksRes = await api.get('/api/tasks/');
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'mine') return task.assigned_to?.id === currentUser?.id;
    if (filter === 'department' && currentUser?.department) {
      return task.department?.id === currentUser.department.id;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricsCard
          title="Team Productivity"
          value={`${Math.round(analytics?.overview?.completion_rate || 0)}%`}
          icon={Flame}
          progress={Math.round(analytics?.overview?.completion_rate || 0)}
          description="Overall Completion Rate"
          color="from-indigo-500 to-indigo-600"
        />
        <MetricsCard
          title="Sprint Velocity"
          value={calculateVelocity()}
          icon={TrendingUp}
          progress={calculateVelocity()}
          description="Tasks/Week"
          color="from-green-500 to-green-600"
        />
        <MetricsCard
          title="Your Task Completion"
          value={`${calculatePersonalCompletion()}%`}
          icon={Target}
          progress={calculatePersonalCompletion()}
          description="Personal completion rate"
          color="from-blue-500 to-blue-600"
        />
      </div>

      {/* Active Tasks Section */}
      <ActiveTasks
        tasks={filteredTasks}
        filter={filter}
        setFilter={setFilter}
        setIsCreateModalOpen={setIsCreateModalOpen}
        handleStatusChange={handleStatusChange}
        currentUser={currentUser}
      />

      {/* Grid for Upcoming Deadlines, Recent Chats, Team Activity, Notifications, and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upcoming Deadlines and Recent Chats */}
        <div className="space-y-6">
          <UpcomingDeadlines deadlines={upcomingDeadlines} />
          <RecentChats chats={recentChats} />
        </div>

        {/* Middle Column - Team Activity */}
        <div className="space-y-6">
          <Notifications /> 
        </div>

        {/* Right Column - Notifications and Quick Actions */}
        <div className="space-y-6">
          <TeamActivity />
          <QuickActions setIsCreateModalOpen={setIsCreateModalOpen} />
        </div>
      </div>

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <CreateTaskModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleTaskCreate}
        />
      )}
    </div>
  );
};

export default OverviewTab;