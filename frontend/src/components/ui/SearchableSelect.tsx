import React, { useState, useRef, useEffect } from 'react';

interface SearchableSelectProps {
  id: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  error?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  options,
  required,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // The filter is the current input text; when value changes externally, sync filter
  useEffect(() => {
    setFilter(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(filter.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFilter(val);
    onChange(val);
    setIsOpen(true);
  };

  const handleSelect = (opt: string) => {
    onChange(opt);
    setFilter(opt);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="form-group" ref={containerRef} style={{ position: 'relative' }}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        id={id}
        className="input"
        type="text"
        placeholder={placeholder}
        value={filter}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        required={required}
        autoComplete="off"
      />
      {isOpen && filtered.length > 0 && (
        <div
          className="searchable-select-dropdown"
          role="listbox"
          aria-labelledby={id}
        >
          {filtered.map((opt, i) => (
            <div
              key={i}
              className="searchable-select-option"
              role="option"
              aria-selected={opt === value}
              onClick={() => handleSelect(opt)}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
            >
              {opt}
            </div>
          ))}
        </div>
      )}
      {error && (
        <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
          {error}
        </span>
      )}
    </div>
  );
};
