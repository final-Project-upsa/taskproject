import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import api from '../../../utils/api';
import { TaskTypes, getTaskTypeColor } from './sections/TaskTypes';


const MobileCalendarTab = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedView, setSelectedView] = useState('day');
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
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

    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true);
            try {
                const startDate = new Date(selectedDate);
                const endDate = new Date(selectedDate);
                endDate.setDate(endDate.getDate() + 1);

                const response = await api.get('/api/tasks/', {
                    params: {
                        start_date: startDate.toISOString().split('T')[0],
                        end_date: endDate.toISOString().split('T')[0]
                    }
                });

                const transformedTasks = response.data.map(task => ({
                    ...task,
                    time: task.time || '09:00',
                    duration: task.duration || 60
                }));

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
                due_date: selectedDate.toISOString().split('T')[0],
            };

            const response = await api.post('/api/tasks/create/', taskData);
            
            setTasks(prevTasks => [...prevTasks, {
                ...response.data,
                time: taskData.time,
                duration: taskData.duration
            }]);
            
            setIsAddTaskModalOpen(false);
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

    const goToPreviousDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    const goToNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(newDate);
    };

    const renderDayView = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
                </div>
            );
        }
        
        return (
            <div className="p-4 pb-20">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={goToPreviousDay} className="p-2">
                        <ChevronLeft className="text-gray-600" />
                    </button>
                    <h2 className="text-xl font-semibold">
                        {selectedDate.toLocaleDateString('default', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </h2>
                    <button onClick={goToNextDay} className="p-2">
                        <ChevronRight className="text-gray-600" />
                    </button>
                </div>

                {tasks.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        No tasks for this day
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tasks.map(task => (
                            <div 
                                key={task.id} 
                                className={`border-l-4 p-4 rounded-r-lg ${getTaskTypeColor(task.type, task.completed)}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{task.title}</h3>
                                        <p className="text-sm text-gray-600">{task.description}</p>
                                        <div className="text-xs text-gray-500 mt-2">
                                            {task.time} | {task.duration} mins | {task.priority}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderAddTaskModal = () => {
        if (!isAddTaskModalOpen) return null;
    
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
                <div className="bg-white w-full rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">Add New Task</h2>
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
                    <div className="flex space-x-3 mb-3">
                        <input
                            type="time"
                            value={newTask.time}
                            onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                            type="number"
                            placeholder="Duration (mins)"
                            value={newTask.duration}
                            onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) })}
                            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <select
                        value={newTask.type}
                        onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                        className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500"
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
                        className="w-full p-3 border rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="LOW">Low Priority</option>
                        <option value="MEDIUM">Medium Priority</option>
                        <option value="HIGH">High Priority</option>
                    </select>
                    <div className="flex justify-between">
                        <button
                            onClick={() => setIsAddTaskModalOpen(false)}
                            className="flex-1 mr-2 p-3 bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateTask}
                            className="flex-1 ml-2 p-3 bg-indigo-600 text-white rounded-lg"
                        >
                            Add Task
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderBottomNavigation = () => {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3">
                <button 
                    onClick={() => setSelectedView('day')}
                    className={`flex flex-col items-center ${selectedView === 'day' ? 'text-indigo-600' : 'text-gray-500'}`}
                >
                    <CalendarIcon />
                    <span className="text-xs mt-1">Day</span>
                </button>
                <button 
                    onClick={() => setSelectedView('week')}
                    className={`flex flex-col items-center ${selectedView === 'week' ? 'text-indigo-600' : 'text-gray-500'}`}
                >
                    <CalendarIcon />
                    <span className="text-xs mt-1">Week</span>
                </button>
                <button 
                    onClick={() => setSelectedView('month')}
                    className={`flex flex-col items-center ${selectedView === 'month' ? 'text-indigo-600' : 'text-gray-500'}`}
                >
                    <CalendarIcon />
                    <span className="text-xs mt-1">Month</span>
                </button>
                <button 
                    onClick={() => setIsAddTaskModalOpen(true)}
                    className="flex flex-col items-center text-gray-500"
                >
                    <Plus />
                    <span className="text-xs mt-1">Add</span>
                </button>
            </div>
        );
    };

    return (
        <div className="h-screen bg-white flex flex-col">
            {renderDayView()}
            {renderBottomNavigation()}
            {renderAddTaskModal()}
        </div>
    );
};

export default MobileCalendarTab;