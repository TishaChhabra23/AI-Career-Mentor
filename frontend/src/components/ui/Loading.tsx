import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  fullScreen = false
}) => {
  const spinnerSize = size === 'sm' ? { width: '16px', height: '16px' } : size === 'lg' ? { width: '40px', height: '40px' } : { width: '24px', height: '24px' };

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a051b',
        zIndex: 9999
      }}>
        <div className="spinner" style={spinnerSize} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '12px' }}>
      <div className="spinner" style={spinnerSize} />
    </div>
  );
};
