import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'purple' | 'blue';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  color = 'purple',
  children,
  className = '',
  ...props
}) => {
  const badgeColorClass = color === 'purple' ? 'badge-purple' : 'badge-blue';
  return (
    <span 
      className={`badge ${badgeColorClass} ${className}`} 
      {...props}
    >
      {children}
    </span>
  );
};
