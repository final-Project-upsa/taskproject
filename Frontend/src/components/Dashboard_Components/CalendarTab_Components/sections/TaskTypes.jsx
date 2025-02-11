export const TaskTypes = {
    PERSONAL: 'PERSONAL',
    MEETING: 'MEETING',
    PROJECT: 'PROJECT',
    DEADLINE: 'DEADLINE',
    REMINDER: 'REMINDER'
  };
  
  export const getTaskTypeColor = (type, isCompleted = false) => {
    if (isCompleted) {
      return 'bg-gray-100 border-gray-200 text-gray-600 opacity-75';
    }
    
    const colors = {
      PERSONAL: 'bg-blue-100 border-blue-200 text-blue-800',
      MEETING: 'bg-purple-100 border-purple-200 text-purple-800',
      PROJECT: 'bg-orange-100 border-orange-200 text-orange-800',
      DEADLINE: 'bg-red-100 border-red-200 text-red-800',
      REMINDER: 'bg-green-100 border-green-200 text-green-800'
    };
    return colors[type] || 'bg-gray-100 border-gray-200 text-gray-800';
  };