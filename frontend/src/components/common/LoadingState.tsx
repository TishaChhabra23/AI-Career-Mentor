import React from 'react';
import { Card } from '../ui/Card';
import { Loading } from '../ui/Loading';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading information..."
}) => {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', minHeight: '200px' }}>
      <Loading size="lg" />
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '16px' }}>
        {message}
      </p>
    </Card>
  );
};
