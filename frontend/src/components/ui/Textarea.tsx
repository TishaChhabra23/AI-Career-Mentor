import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="form-group" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && (
        <label htmlFor={id} className="label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <textarea id={id} className={`form-textarea ${className}`} {...props} />
      {error && (
        <span style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px' }}>
          {error}
        </span>
      )}
    </div>
  );
};
