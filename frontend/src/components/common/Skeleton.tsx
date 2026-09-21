import React from 'react';

interface SkeletonWrapperProps {
  className?: string;
  style?: React.CSSProperties;
}

export const SkeletonText: React.FC<SkeletonWrapperProps> = ({ className = '', style }) => (
  <div 
    className={`skeleton-loading ${className}`} 
    style={{ height: '14px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', marginBottom: '8px', ...style }} 
  />
);

export const SkeletonCard: React.FC<SkeletonWrapperProps> = ({ className = '', style }) => (
  <div 
    className={`skeleton-loading ${className}`} 
    style={{ height: '150px', borderRadius: 'var(--radius-md)', background: 'var(--surface)', border: '1px solid var(--border-glass)', ...style }} 
  />
);

export const SkeletonAvatar: React.FC<SkeletonWrapperProps> = ({ className = '', style }) => (
  <div 
    className={`skeleton-loading ${className}`} 
    style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', ...style }} 
  />
);
