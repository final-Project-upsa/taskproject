import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../../../utils/api';
import DepartmentSection from './sections/DepartmentSection';
import InviteModal from './sections/InviteModal';
import CreateDepartmentModal from './sections/CreateDepartmentModal';
import UserAvatar from '../DashboardLayout_Components/sections/UserAvatar';

const TeamTab = () => {
  const [departments, setDepartments] = useState([]);
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Invite Modal States
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteFormData, setInviteFormData] = useState({
    email: '',
    role: 'employee',
    department: ''
  });
  const [inviteError, setInviteError] = useState(null);

  // New Department Modal States
  const [isCreateDepartmentModalOpen, setIsCreateDepartmentModalOpen] = useState(false);
  const [newDepartmentData, setNewDepartmentData] = useState({
    name: '',
    description: ''
  });
  const [departmentError, setDepartmentError] = useState(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await api.get('/api/organization/team/');
        setDepartments(response.data.departments);
        
        if (response.data.organization_name) {
          setOrganizationName(response.data.organization_name);
        }
      } catch (err) {
        setError('Failed to load team data');
        console.error('Error fetching team data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  const handleInviteChange = (e) => {
    const { name, value } = e.target;
    setInviteFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteError(null);

    try {
      const response = await api.post('/api/employees/invite/', {
        email: inviteFormData.email,
        role: inviteFormData.role,
        department: inviteFormData.department
      });

      // Reset form and close modal on successful invite
      setInviteFormData({
        email: '',
        role: 'employee',
        department: ''
      });
      setIsInviteModalOpen(false);

      // Optional: Show success toast or notification
      alert('Invitation sent successfully!');
    } catch (err) {
      setInviteError(err.response?.data?.error || 'Failed to send invitation');
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setDepartmentError(null);

    try {
      const response = await api.post('/api/departments/create/', {
        name: newDepartmentData.name,
        description: newDepartmentData.description
      });

      // Add new department to the list
      setDepartments(prev => [...prev, response.data]);

      // Reset new department form
      setNewDepartmentData({
        name: '',
        description: ''
      });

      // Close create department modal and return to invite modal
      setIsCreateDepartmentModalOpen(false);
      
      // Automatically select the newly created department in invite modal
      setInviteFormData(prev => ({
        ...prev,
        department: response.data.id
      }));

      // Optional: Show success notification
      alert('Department created successfully!');
    } catch (err) {
      setDepartmentError(err.response?.data?.error || 'Failed to create department');
    }
  };

  const handleNewDepartmentChange = (e) => {
    const { name, value } = e.target;
    setNewDepartmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openCreateDepartmentModal = () => {
    setIsCreateDepartmentModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {organizationName && `${organizationName} - `}Team Organization
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">Powered by EnterpriseSync</div>
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            Invite Members
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {departments.map((department) => (
          <DepartmentSection key={department.id} department={department} />
        ))}
      </div>

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        inviteFormData={inviteFormData}
        onInviteChange={handleInviteChange}
        onInviteSubmit={handleInviteSubmit}
        inviteError={inviteError}
        departments={departments}
        openCreateDepartmentModal={openCreateDepartmentModal}
      />

      <CreateDepartmentModal
        isOpen={isCreateDepartmentModalOpen}
        onClose={() => setIsCreateDepartmentModalOpen(false)}
        newDepartmentData={newDepartmentData}
        onNewDepartmentChange={handleNewDepartmentChange}
        onCreateDepartmentSubmit={handleCreateDepartment}
        departmentError={departmentError}
      />
    </div>
  );
};

export default TeamTab;