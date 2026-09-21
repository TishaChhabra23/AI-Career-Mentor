import React from 'react';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
}

export const Progress: React.FC<ProgressProps> = ({ value, className = '', ...props }) => {
  const percentage = Math.min(Math.max(value, 0), 100);

  return (
    <div 
      className={className} 
      style={{ 
        width: '100%', 
        height: '8px', 
        background: 'rgba(255, 255, 255, 0.05)', 
        borderRadius: 'var(--radius-pill)', 
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        ...props.style
      }}
      {...props}
    >
      <div 
        style={{ 
          width: `${percentage}%`, 
          height: '100%', 
          background: 'var(--accent)', 
          borderRadius: 'var(--radius-pill)',
          transition: 'width var(--transition-slow)'
        }} 
      />
    </div>
  );
};
