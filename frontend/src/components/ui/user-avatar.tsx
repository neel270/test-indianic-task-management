import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { User } from '@/types/api';

interface UserAvatarProps {
  user?: User | null;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  showName = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0).toUpperCase() || '';
    const last = lastName?.charAt(0).toUpperCase() || '';
    return first + last || 'U';
  };

  if (!user) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`${sizeClasses[size]} bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium`}>
          ?
        </div>
        {showName && <span className='text-sm text-gray-400'>Unassigned</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={user?.profileImage} alt={`${user.firstName} ${user.lastName}`} />
        <AvatarFallback className='bg-blue-500 text-white font-medium'>
          {getInitials(user.firstName, user.lastName)}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <span className='text-sm font-medium text-gray-700'>
          {user.firstName} {user.lastName}
        </span>
      )}
    </div>
  );
};
