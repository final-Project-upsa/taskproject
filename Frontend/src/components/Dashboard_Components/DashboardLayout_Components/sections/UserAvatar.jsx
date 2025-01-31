import React, { useState } from 'react';

const UserAvatar = ({ username, avatarUrl, size = 8 }) => {
  const [imageError, setImageError] = useState(false);
  const fallbackAvatar = username ? username.charAt(0).toUpperCase() : 'U';
  
  // Define valid size classes
  const sizeMap = {
    8: 'w-8 h-8',
    12: 'w-12 h-12',
    16: 'w-16 h-16'
  };

  // Get size class or default to w-8 h-8
  const sizeClass = sizeMap[size] || sizeMap[8];

  return (
    <div 
      className={`
        ${sizeClass} 
        rounded-full 
        flex 
        items-center 
        justify-center 
        bg-indigo-500 
        text-white 
        font-bold 
        overflow-hidden
      `}
    >
      {avatarUrl && !imageError ? (
        <img
          src={avatarUrl}
          alt={fallbackAvatar}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-center">{fallbackAvatar}</span>
      )}
    </div>
  );
};

export default UserAvatar;