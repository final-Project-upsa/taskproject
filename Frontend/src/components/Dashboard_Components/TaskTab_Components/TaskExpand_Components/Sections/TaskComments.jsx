import React, { useState } from 'react';
import api from '../../../../../utils/api';

const TaskComments = ({ task, setTask }) => {
  const [comment, setComment] = useState('');

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    try {
      await api.post(`/api/tasks/${task.id}/comments/`, {
        content: comment
      });
      const updatedTask = await api.get(`/api/tasks/${task.id}/`);
      setTask(updatedTask.data);
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCommentSubmit} className="space-y-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
          rows="3"
        />
        <button
          type="submit"
          disabled={!comment.trim()}
          className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add Comment
        </button>
      </form>

      <div className="space-y-4">
        {task.comments?.map((comment) => (
          <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{comment.author_name}</span>
              <span className="text-sm text-gray-500">
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-600">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskComments;