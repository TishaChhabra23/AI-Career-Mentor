import React, { useState, useRef, useEffect } from 'react';

interface MultiSearchableSelectProps {
  id: string;
  label?: string;
  placeholder?: string;
  value: string;           // comma-separated string e.g. "Python, React"
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  error?: string;
}

/**
 * A multi-value combobox that manages a comma-separated string.
 * Users can type freely OR pick suggestions from the dropdown.
 * Selected items appear as removable tags above the input.
 */
export const MultiSearchableSelect: React.FC<MultiSearchableSelectProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  options,
  required,
  error,
}) => {
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse current tags from value
  const tags = value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options: exclude already-selected tags and match input
  const filtered = options.filter(
    (opt) =>
      !tags.some((t) => t.toLowerCase() === opt.toLowerCase()) &&
      opt.toLowerCase().includes(inputText.toLowerCase())
  );

  const addTag = (tag: string) => {
    const newTags = [...tags, tag];
    onChange(newTags.join(', '));
    setInputText('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    onChange(newTags.join(', '));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputText.trim()) {
      e.preventDefault();
      addTag(inputText.trim());
    }
    if (e.key === 'Backspace' && !inputText && tags.length > 0) {
      removeTag(tags.length - 1);
    }
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

      <div
        className="multi-select-container"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <span key={i} className="multi-select-tag">
            {tag}
            <button
              type="button"
              className="multi-select-tag-remove"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(i);
              }}
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          type="text"
          className="multi-select-input"
          placeholder={tags.length === 0 ? placeholder : 'Add more...'}
          value={inputText}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          required={required && tags.length === 0}
        />
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="searchable-select-dropdown" role="listbox" aria-labelledby={id}>
          {filtered.slice(0, 15).map((opt, i) => (
            <div
              key={i}
              className="searchable-select-option"
              role="option"
              aria-selected={false}
              onClick={() => addTag(opt)}
              onMouseDown={(e) => e.preventDefault()}
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
