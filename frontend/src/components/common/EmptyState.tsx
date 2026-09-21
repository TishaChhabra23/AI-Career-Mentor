import React from 'react';
import { Card } from '../ui/Card';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon
}) => {
  return (
    <Card style={{ textAlign: 'center', padding: '48px 24px', maxWidth: '600px', margin: '0 auto' }}>
      {icon && (
        <div style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          {icon}
        </div>
      )}
      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
        {description}
      </p>
      {action && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {action}
        </div>
      )}
    </Card>
  );
};
