import React, { useRef, useState } from 'react';
import { Paperclip, Upload, Download } from 'lucide-react';
import api from '../../../../../utils/api';

const TaskAttachments = ({ task, setTask }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadingFiles, setDownloadingFiles] = useState({});

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('task_id', task.id);
    formData.append('file_name', file.name);

    try {
      await api.post(`/api/tasks/${task.id}/attachments/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedTask = await api.get(`/api/tasks/${task.id}/`);
      setTask(updatedTask.data);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (attachment) => {
    setDownloadingFiles(prev => ({ ...prev, [attachment.id]: true }));
  
    try {
      // Get the signed URL
      const response = await api.get(`/api/tasks/attachments/${attachment.id}/download-url/`);
      const { signed_url } = response.data;
      
      const fileResponse = await api.get(signed_url, {
        responseType: 'blob', 
        headers: {
          'Accept': '*/*'  // Accept any content type
        }
      });
      
      // Create blob URL and trigger download
      const blob = new Blob([fileResponse.data], { 
        type: fileResponse.headers['content-type'] || 'application/octet-stream'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file. Please try again.');
    } finally {
      setDownloadingFiles(prev => ({ ...prev, [attachment.id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Attachments</h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors"
        >
          <Upload size={16} />
          {isUploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      <div className="space-y-4">
        {task.attachments?.map((attachment) => (
          <div 
            key={attachment.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Paperclip className="text-gray-500" size={20} />
              <div>
                <p className="font-medium">{attachment.file_name}</p>
                <p className="text-sm text-gray-500">
                  Uploaded by {attachment.uploaded_by_name} on{' '}
                  {new Date(attachment.uploaded_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => handleDownload(attachment)}
              disabled={downloadingFiles[attachment.id]}
              className="flex items-center gap-2 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              {downloadingFiles[attachment.id] ? 'Downloading...' : 'Download'}
            </button>
          </div>
        ))}

        {task.attachments?.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No attachments yet
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskAttachments;