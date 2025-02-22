import React, { useState, useEffect, useRef, useCallback } from 'react';
import WeekSelector from './sections/WeekSelector';
import MonthYearSelector from './sections/MonthYearSelector';
import { TaskModal } from './sections/TaskModal';
import { TimeGrid } from './sections/TimeGrid';
import { TaskLegend } from './sections/TaskLegend';
import api from '../../../utils/api';


const DesktopCalendarTab = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCell, setSelectedCell] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const timeGridRef = useRef(null);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    time: '', 
    date: '', 
    priority: 'MEDIUM',
    type: 'PERSONAL',
    duration: 60,
    department: null
  });

  const [currentUser, setCurrentUser] = useState(null);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/api/current-user/');
      setCurrentUser(response.data); // Set the current user data
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  // Fetch the current user when the component mounts
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Generate 24-hour time slots (00:00 to 23:00)
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    return `${i.toString().padStart(2, '0')}:00`;
  });

  const getWeekDates = () => {
    const dates = [];
    const current = new Date(selectedDate);
    
    current.setDate(current.getDate() - current.getDay());
    
    for (let i = 0; i < 7; i++) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    // console.log('All week dates:', dates.map(d => d.toISOString()));
    return dates;
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const weekStart = new Date(selectedDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
    
    
        const response = await api.get('/api/tasks/', {
          params: {
            start_date: weekStart.toISOString().split('T')[0],
            end_date: weekEnd.toISOString().split('T')[0]
          }
        });
    
        
    
        const transformedTasks = response.data.map(task => ({
          ...task,
          time: task.time || '09:00',
          duration: task.duration || 60
        }));
    
        console.log('Transformed tasks:', transformedTasks);
        setTasks(transformedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [selectedDate]);

  const handleCreateTask = async () => {
    try {
      const taskData = {
        ...newTask,
        due_date: selectedCell.date,
        time: selectedCell.time,
      };

      const response = await api.post('/api/tasks/create/', taskData);
      
      setTasks(prevTasks => [...prevTasks, {
        ...response.data,
        time: taskData.time,
        duration: taskData.duration
      }]);
      
      setSelectedCell(null);
      setNewTask({ 
        title: '', 
        description: '', 
        time: '', 
        date: '', 
        priority: 'MEDIUM',
        type: 'PERSONAL',
        duration: 60,
        department: null
      });
    } catch (error) {
      console.error('Error creating task:', error);
      alert(`Error creating task: ${error.response?.data?.error || 'Unknown error'}`);
    }
  };

  // Function to scroll to 7 AM
  const scrollToMorning = useCallback(() => {
    if (timeGridRef.current) {
      // Calculate scroll position (7 * 128px per hour)
      const scrollPosition = 7 * 128;
      timeGridRef.current.scrollLeft = scrollPosition;
    }
  }, []);

  // Auto-scroll on initial render
  useEffect(() => {
    scrollToMorning();
  }, [scrollToMorning]);


  return (
    <div className="h-full bg-white rounded-lg shadow-lg flex flex-col">
      {/* Header section */}
      <div className="flex-none">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <MonthYearSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            <WeekSelector selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          </div>
        </div>
        <TaskLegend />
      </div>

      {/* Calendar grid section */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed date column */}
        <div className="w-32 flex-none border-r border-gray-200">
          {/* Time header spacer */}
          <div className="h-10 bg-gray-50 border-b border-gray-200" />
          
          {/* Date cells */}
          <div className="divide-y divide-gray-200">
            {getWeekDates().map((date, index) => {
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div 
                  key={index} 
                  className={`h-20 p-3 ${isToday ? 'bg-blue-50/30' : 'bg-gray-50'}`}
                >
                  <div className="font-medium text-sm">
                    {date.toLocaleString('default', { weekday: 'short' })}
                  </div>
                  <div className={`text-xl font-semibold ${
                    isToday ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable time grid */}
        <div 
          ref={timeGridRef}
          className="flex-1 overflow-x-auto overflow-y-hidden scroll-smooth"
        >
          <div className="min-w-fit">
            {/* Time header */}
            <div className="flex h-10 border-b border-gray-200 bg-white sticky top-0">
              {timeSlots.map((time) => (
                <div 
                  key={time}
                  className="w-32 flex-none border-r border-gray-200 flex items-center justify-center"
                >
                  <span className="text-xs font-medium text-gray-600">{time}</span>
                </div>
              ))}
            </div>

            {/* Grid rows */}
            {getWeekDates().map((date, index) => (
              <TimeGrid
                key={index}
                date={date}
                timeSlots={timeSlots}
                tasks={tasks}
                onCellClick={(date, time) => setSelectedCell({ date, time })}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Task Modal remains the same */}
      {selectedCell && (
        <TaskModal
          selectedCell={selectedCell}
          newTask={newTask}
          setNewTask={setNewTask}
          onClose={() => setSelectedCell(null)}
          onSubmit={handleCreateTask}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default DesktopCalendarTab;