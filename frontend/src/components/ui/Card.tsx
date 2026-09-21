import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  interactive = false,
  className = '',
  children,
  ...props
}) => {
  const cardClass = interactive ? 'glass-panel-interactive' : 'glass-panel';
  return (
    <div 
      className={`${cardClass} ${className}`} 
      style={{ padding: '24px', ...props.style }}
      {...props}
    >
      {children}
    </div>
  );
};
