import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  BookOpen,
  Sparkles,
  Map,
  Calendar,
  FileText,
  Briefcase,
  GraduationCap,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onMobileClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuGroups = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Profile', path: '/profile', icon: User },
      ]
    },
    {
      title: 'Career Planning',
      items: [
        { name: 'Assessment', path: '/assessment', icon: BookOpen },
        { name: 'Recommendations', path: '/recommendations', icon: Sparkles },
        { name: 'Career Roadmap', path: '/roadmap', icon: Map },
        { name: 'Learning Roadmap', path: '/learning', icon: Calendar },
      ]
    },
    {
      title: 'Placement Tools',
      items: [
        { name: 'Resume Builder', path: '/resume', icon: FileText },
        { name: 'Internships', path: '/internships', icon: Briefcase },
        { name: 'Jobs', path: '/jobs', icon: GraduationCap },
      ]
    },
    {
      title: 'Account Settings',
      items: [
        { name: 'Settings', path: '/settings', icon: Settings },
      ]
    }
  ];

  const handleNav = (path: string) => {
    navigate(path);
    if (onMobileClose) onMobileClose();
  };

  const sidebarWidth = collapsed ? '70px' : '260px';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(5, 2, 12, 0.7)',
            zIndex: 99,
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: sidebarWidth,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: isMobileOpen ? 'fixed' : 'sticky',
          top: 0,
          left: isMobileOpen ? 0 : undefined,
          zIndex: 100,
          transition: 'width var(--transition-normal), transform var(--transition-normal)',
          transform: isMobileOpen ? 'translateX(0)' : undefined,
        }}
        className={isMobileOpen ? '' : undefined}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: '24px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
            height: '80px'
          }}
        >
          {!collapsed && (
            <span
              style={{
                fontSize: '18px',
                fontWeight: 700,
                background: 'var(--accent)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Mentor.AI
            </span>
          )}

          {/* Collapse Button (Desktop Only) */}
          {!isMobileOpen && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
              }}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          )}
        </div>

        {/* Sidebar Menu Items */}
        <nav
          style={{
            flex: 1,
            padding: '24px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
          }}
        >
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {!collapsed && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.08em',
                  paddingLeft: '12px',
                  marginBottom: '4px'
                }}>
                  {group.title}
                </span>
              )}
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      background: isActive ? 'rgba(157, 78, 221, 0.08)' : 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '13px',
                      transition: 'all var(--transition-fast)',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
                    }}
                    className="sidebar-item"
                  >
                    <Icon size={16} style={{ color: isActive ? 'var(--primary)' : 'inherit', flexShrink: 0 }} />
                    {!collapsed && <span>{item.name}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer / Logout placeholder */}
        <div
          style={{
            padding: '16px 12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.03)'
          }}
        >
          <button
            onClick={async () => {
              try {
                await logout();
                navigate('/login');
              } catch (err) {
                console.error(err);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: '#ef4444',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              fontWeight: 600,
              fontSize: '14px',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
