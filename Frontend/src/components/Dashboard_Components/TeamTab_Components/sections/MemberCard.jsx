import React from 'react';
import { Mail, Phone, MessageCircle } from 'lucide-react';
import UserAvatar from '../../DashboardLayout_Components/sections/UserAvatar';

const MemberCard = ({ member }) => {
  return (
    <div className="p-6">
      <div className="flex items-start space-x-4">
        {/* Use the UserAvatar component */}
        <UserAvatar username={member.name} avatarUrl={member.avatar} size={12} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold text-gray-900">
              {member.name}
            </h4>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-indigo-50 text-indigo-700">
              {member.role}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">{member.job_title}</p>

          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              <a href={`mailto:${member.email}`} className="hover:text-indigo-600">
                {member.email}
              </a>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              <a href={`tel:${member.phone_number}`} className="hover:text-indigo-600">
                {member.phone_number}
              </a>
            </div>
          </div>
        </div>

        <button
          className="flex items-center text-indigo-600 hover:text-indigo-700"
          onClick={() => alert(`Message ${member.name}`)}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Message
        </button>
      </div>
    </div>
  );
};

export default MemberCard;