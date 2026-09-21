import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions
}) => {
  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '32px',
        gap: '16px',
        flexWrap: 'wrap'
      }}
    >
      <div>
        <h1 
          style={{ 
            fontSize: 'var(--font-size-xl)', 
            fontWeight: 700, 
            color: 'var(--text-primary)',
            marginBottom: '4px'
          }}
        >
          {title}
        </h1>
        {description && (
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {actions}
        </div>
      )}
    </div>
  );
};
