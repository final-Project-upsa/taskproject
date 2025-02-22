import React from 'react';
import { Calendar, CalendarDays } from 'lucide-react';

const UpcomingDeadlines = ({ deadlines }) => {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const upcomingTasks = deadlines.filter(task => {
    const dueDate = new Date(task.due_date);
    // Filter out COMPLETED tasks and keep only those due in the next 3 days
    return dueDate <= threeDaysFromNow && 
           dueDate >= now && 
           task.status !== 'COMPLETED';
  });

  // Function to determine priority color based on due date
  const getPriorityColor = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const taskDate = new Date(dueDate);
    taskDate.setHours(0, 0, 0, 0);
    
    if (taskDate.getTime() === today.getTime()) {
      return "bg-red-500"; // Due today
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      return "bg-orange-500"; // Due tomorrow
    }
    return "bg-yellow-500"; // Due later
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Upcoming Deadlines</h3>
        <Calendar className="w-5 h-5 text-gray-400" />
      </div>
      {upcomingTasks.length > 0 ? (
        <div className="space-y-3">
          {upcomingTasks.map(task => (
            <div key={task.id} className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.due_date)}`} />
              <div className="flex-1">
                <div className="text-sm font-medium">{task.title}</div>
                <div className="flex justify-between">
                  <div className="text-xs text-gray-500">
                    Due {new Date(task.due_date).toLocaleDateString()}
                  </div>
                  {/* <div className="text-xs">
                    {task.assigned_to && (
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {task.assigned_to}
                      </span>
                    )}
                  </div> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <CalendarDays className="w-8 h-8 text-gray-400" />
          <p className="text-sm text-gray-500 mt-2">No upcoming deadlines</p>
        </div>
      )}
    </div>
  );
};

export default UpcomingDeadlines;