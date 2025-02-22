import React, { useEffect, useState } from 'react';
import { Activity, ActivityIcon } from 'lucide-react';
import api from '../../../../utils/api';

const TeamActivity = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamActivity = async () => {
      try {
        const response = await api.get('/api/team-activity/');
        setActivities(response.data.results);
      } catch (error) {
        console.error('Error fetching team activity:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamActivity();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // Function to get background color based on name initial
  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-yellow-500', 'bg-red-500'
    ];
    const charCode = name ? name.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-96 overflow-y-auto hide-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Team Activity</h3>
        <Activity className="w-5 h-5 text-gray-400" />
      </div>
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map(activity => {
            const userName = activity.user || "Unknown";
            const initial = userName.charAt(0).toUpperCase();
            const avatarColor = getAvatarColor(userName);
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white font-medium`}>
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-medium">{activity.user || "Unknown User"}</span>
                    {' '}
                    <span className="text-gray-500">
                      {activity.activity_type === 'TASK_COMPLETED' && 'completed a task'}
                      {activity.activity_type === 'TASK_COMMENT' && 'commented on a task'}
                      {activity.activity_type === 'FILE_UPLOAD' && 'uploaded a file'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <ActivityIcon className="w-8 h-8 text-gray-400" />
          <p className="text-sm text-gray-500 mt-2">No recent activity</p>
        </div>
      )}
    </div>
  );
};

export default TeamActivity;