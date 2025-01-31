  import React from 'react';
  import TaskItem from './TaskItem';

  const TaskList = ({ tasks, selectedTasks, toggleTaskSelection, userData, onAssignTask,  }) => {

    return (
      <div className="bg-white border rounded">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3 text-left">
                <input 
                  type="checkbox" 
                  checked={selectedTasks.length === tasks.length}
                  onChange={() => 
                    setSelectedTasks(
                      selectedTasks.length === tasks.length 
                        ? [] 
                        : tasks.map(task => task.id)
                    )
                  }
                />
              </th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Priority</th>
              <th className="p-3 text-left">Due Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  No tasks found
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <TaskItem 
                  key={task.id}
                  task={task}
                  selectedTasks={selectedTasks}
                  toggleTaskSelection={toggleTaskSelection}
                  userData={userData}
                  onAssignTask={onAssignTask}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  export default TaskList;