import React from 'react';
import {
  Plus, Flame, TrendingUp, Target, ArrowUpRight,
  CheckCircle2, MessageSquare, Activity
} from 'lucide-react';

// Custom Progress Ring Component
const ProgressRing = ({ progress, size = 40, strokeWidth = 4 }) => (
  <div className="relative" style={{ width: size, height: size }}>
    <svg className="transform -rotate-90" width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={(size - strokeWidth) / 2}
        strokeWidth={strokeWidth}
        stroke="rgb(229, 231, 235)"
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={(size - strokeWidth) / 2}
        strokeWidth={strokeWidth}
        stroke="rgb(99, 102, 241)"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={((size - strokeWidth) * Math.PI)}
        strokeDashoffset={((size - strokeWidth) * Math.PI) * (1 - progress / 100)}
        className="transition-all duration-1000 ease-out"
      />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
      {progress}%
    </div>
  </div>
);

const OverviewTab = () => {
  const tasks = [
    { id: 1, title: 'Review Q1 Reports', status: 'In Progress', dueDate: '2025-01-25', priority: 'High', progress: 65 },
    { id: 2, title: 'Team Sync Meeting', status: 'Upcoming', dueDate: '2025-01-22', priority: 'Medium', progress: 0 },
    { id: 3, title: 'Update Documentation', status: 'Completed', dueDate: '2025-01-20', priority: 'Low', progress: 100 },
  ];

  const metrics = {
    productivity: 87,
    teamVelocity: 94,
    taskCompletion: 72
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Team Productivity</h3>
            <Flame className="w-5 h-5" />
          </div>
          <div className="flex items-center space-x-4">
            <ProgressRing progress={metrics.productivity} />
            <div>
              <div className="text-2xl font-bold">{metrics.productivity}%</div>
              <div className="text-xs opacity-75">vs last week</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Sprint Velocity</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex items-center space-x-4">
            <ProgressRing progress={metrics.teamVelocity} />
            <div>
              <div className="text-2xl font-bold text-gray-900">{metrics.teamVelocity}%</div>
              <div className="text-xs text-green-500 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                12% increase
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Task Completion</h3>
            <Target className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex items-center space-x-4">
            <ProgressRing progress={metrics.taskCompletion} />
            <div>
              <div className="text-2xl font-bold text-gray-900">{metrics.taskCompletion}%</div>
              <div className="text-xs text-gray-500">18 of 25 tasks done</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-4 sm:p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Active Tasks</h2>
              <p className="text-sm text-gray-500">Track your team's progress</p>
            </div>
            <button className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {tasks.map(task => (
              <div key={task.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === 'Completed' ? 'bg-green-500' :
                      task.status === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`} />
                    <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full w-fit ${
                    task.priority === 'High' ? 'bg-red-100 text-red-800' :
                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          task.status === 'Completed' ? 'bg-green-500' :
                          task.status === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">Due {task.dueDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Activity Timeline</h2>
          <p className="text-sm text-gray-500">Recent updates from your team</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {[
                { user: 'Sarah Chen', action: 'completed the task "Review Q1 Reports"', time: '2 hours ago', type: 'completion' },
                { user: 'Mike Ross', action: 'commented on "Team Sync Meeting"', time: '4 hours ago', type: 'comment' },
                { user: 'Anna Smith', action: 'started working on "Update Documentation"', time: '6 hours ago', type: 'start' },
              ].map((activity, index) => (
                <div key={index} className="relative flex items-start ml-6">
                  <div className={`absolute -left-10 mt-1 w-4 h-4 rounded-full flex items-center justify-center ${
                    activity.type === 'completion' ? 'bg-green-100' :
                    activity.type === 'comment' ? 'bg-blue-100' : 'bg-yellow-100'
                  }`}>
                    {activity.type === 'completion' ? (
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    ) : activity.type === 'comment' ? (
                      <MessageSquare className="w-3 h-3 text-blue-600" />
                    ) : (
                      <Activity className="w-3 h-3 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <img
                        src="/api/placeholder/32/32"
                        alt={activity.user}
                        className="w-6 h-6 rounded-full ring-2 ring-white"
                      />
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;