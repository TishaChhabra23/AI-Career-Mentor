import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = "We couldn't load this section.",
  onRetry
}) => {
  return (
    <Card style={{ textAlign: 'center', padding: '32px 24px', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.03)' }}>
      <div style={{ color: 'var(--error)', fontSize: '32px', marginBottom: '12px' }}>
        ⚠️
      </div>
      <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
        Something went wrong
      </h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
        {message}
      </p>
      {onRetry && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="secondary" onClick={onRetry}>Try Again</Button>
        </div>
      )}
    </Card>
  );
};
