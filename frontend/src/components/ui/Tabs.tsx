import React from 'react';

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = ''
}) => {
  return (
    <div 
      className={className} 
      style={{ 
        display: 'flex', 
        gap: '8px', 
        borderBottom: '1px solid var(--border-glass)',
        paddingBottom: '8px',
        marginBottom: '20px',
        overflowX: 'auto'
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: '8px 16px',
              background: isActive ? 'rgba(157, 78, 221, 0.1)' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
              borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent'
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
