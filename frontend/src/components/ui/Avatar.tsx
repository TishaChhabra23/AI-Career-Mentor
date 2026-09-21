import React from 'react';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md' }) => {
  const dimension = size === 'sm' ? '32px' : size === 'lg' ? '64px' : '40px';
  const fontSize = size === 'sm' ? '12px' : size === 'lg' ? '24px' : '16px';

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: dimension,
          height: dimension,
          borderRadius: 'var(--radius-pill)',
          objectFit: 'cover',
          border: '2px solid var(--border-glass)'
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: dimension,
        height: dimension,
        borderRadius: 'var(--radius-pill)',
        background: 'var(--accent)',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: fontSize,
        border: '2px solid var(--border-glass)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {initials}
    </div>
  );
};
