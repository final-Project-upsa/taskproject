import React from 'react';
import { CalendarTask } from './CalendarTask';

export const TimeGrid = ({ date, timeSlots, tasks, onCellClick }) => {
  // Convert date to start of day for consistent comparison
  const dateStr = new Date(date.setHours(0, 0, 0, 0)).toISOString().split('T')[0];
  const currentDate = new Date();
  const isToday = date.toDateString() === currentDate.toDateString();
  const currentHour = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();

  // Get tasks for this date including spillovers
  const getVisibleTasks = () => {
    return tasks.filter(task => {
      const taskDate = new Date(task.due_date);
      const taskDateStr = taskDate.toISOString().split('T')[0];
      
      // Get next day for spillover check
      const nextDate = new Date(taskDate);
      nextDate.setDate(nextDate.getDate() + 1);
      const nextDateStr = nextDate.toISOString().split('T')[0];

      // Either task belongs to this date or it's a spillover from previous date
      return taskDateStr === dateStr || (
        nextDateStr === dateStr && doesTaskSpillOver(task)
      );
    });
  };

  // Check if a task spills over to next day
  const doesTaskSpillOver = (task) => {
    const [hours, minutes] = task.time.split(':').map(Number);
    const taskStartMinutes = hours * 60 + minutes;
    return (taskStartMinutes + task.duration) > 1440;
  };

  // Calculate task position and width
  const getTaskDisplay = (task) => {
    const [hours, minutes] = task.time.split(':').map(Number);
    const taskStartMinutes = hours * 60 + minutes;
    const taskEndMinutes = taskStartMinutes + task.duration;
    const taskDate = new Date(task.due_date);
    const taskDateStr = taskDate.toISOString().split('T')[0];

    // If this is the spillover portion (next day)
    if (dateStr !== taskDateStr) {
      return {
        startMinutes: 0,
        width: Math.min(taskEndMinutes - 1440, 1440) / 60 * 128
      };
    }

    // If this is the original day
    return {
      startMinutes: taskStartMinutes,
      width: Math.min(1440 - taskStartMinutes, task.duration) / 60 * 128
    };
  };

  return (
    <div className="relative flex border-b border-gray-200 h-20">
      {timeSlots.map((time, timeIndex) => {
        const [hour] = time.split(':').map(Number);
        const isCurrentHour = isToday && hour === currentHour;
        
        return (
          <div 
            key={`${dateStr}-${timeIndex}`}
            className={`w-32 h-20 flex-none border-r border-gray-200 hover:bg-gray-50 relative
              ${isToday ? 'bg-blue-50/30' : ''}
              ${isCurrentHour ? 'bg-blue-100/40' : ''}`}
            onClick={() => onCellClick(dateStr, time)}
          >
            {isCurrentHour && (
              <div 
                className="absolute top-0 h-full border-l-2 border-red-400 z-10"
                style={{
                  left: `${(currentMinutes / 60) * 100}%`
                }}
              >
                <div className="absolute -top-1 -left-1.5 w-3 h-3 rounded-full bg-red-400" />
              </div>
            )}
          </div>
        );
      })}
      
      {getVisibleTasks().map((task) => {
        const { startMinutes, width } = getTaskDisplay(task);
        
        return (
          <CalendarTask
            key={`${task.id}-${dateStr}`}
            task={task}
            startMinutes={startMinutes}
            width={width}
          />
        );
      })}
    </div>
  );
};