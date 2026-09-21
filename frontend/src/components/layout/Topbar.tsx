import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEducationApi } from '../../services/auth';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [eduLevel, setEduLevel] = useState<string>('Student');
  const [eduLoading, setEduLoading] = useState<boolean>(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [notifs, setNotifs] = useState([
    { id: 1, title: 'Welcome to Mentor.AI!', body: 'Start by updating your education details in settings.', time: 'Just now', read: false },
    { id: 2, title: 'Assessment Pending', body: 'Take your aptitude test to unlock recommendations.', time: '2 hours ago', read: false },
    { id: 3, title: 'Gemini Key Configured', body: 'Personalized AI advice is active.', time: '1 day ago', read: false },
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let active = true;
    const fetchEdu = async () => {
      try {
        setEduLoading(true);
        const edu = await getEducationApi();
        if (edu?.data?.educationLevel && active) {
          const map: Record<string, string> = {
            UG: 'Undergraduate',
            PG: 'Postgraduate',
            Diploma: 'Diploma',
            Class10: 'Class 10',
            Class11: 'Class 11',
            Class12: 'Class 12'
          };
          setEduLevel(map[edu.data.educationLevel] || edu.data.educationLevel);
        }
      } catch {
        if (active) setEduLevel('Student');
      } finally {
        if (active) setEduLoading(false);
      }
    };

    if (user) {
      fetchEdu();
    } else {
      setEduLoading(false);
    }

    return () => {
      active = false;
    };
  }, [user]);

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard': return 'Dashboard';
      case '/profile': return 'My Profile';
      case '/assessment': return 'Skill Assessment';
      case '/recommendations': return 'AI Career Recommendations';
      case '/roadmap': return 'My Career Roadmap';
      case '/learning': return 'Weekly Learning Plan';
      case '/resume': return 'Resume Optimizer';
      case '/internships': return 'Internship Opportunities';
      case '/jobs': return 'Job Placement Search';
      case '/settings': return 'Account Settings';
      default: return 'AI Career Mentor';
    }
  };

  const handleToggle = () => {
    setShowNotifications(!showNotifications);
    setHasUnread(false); // Clear unread dot indicator upon view
  };

  const displayUserName = user?.fullName || 'User';
  const displayEduLevel = eduLevel || 'Student';

  return (
    <header
      style={{
        height: '80px',
        background: 'rgba(8, 3, 21, 0.4)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 90,
      }}
    >
      {/* Left items: title and mobile hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onMenuClick}
          className="mobile-menu-btn"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'none', // Managed in global media queries, shown on mobile
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
          }}
        >
          <Menu size={24} />
        </button>
        <span 
          style={{ 
            fontSize: '18px', 
            fontWeight: 700, 
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-family)'
          }}
        >
          {getPageTitle(location.pathname)}
        </span>
      </div>

      {/* Right items: notifications and profile triggers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }} ref={dropdownRef}>
        <button
          onClick={handleToggle}
          style={{
            background: 'transparent',
            border: 'none',
            color: showNotifications ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            transition: 'color var(--transition-fast)'
          }}
          aria-label="View Notifications"
        >
          <Bell size={20} />
          {/* Notification dot indicator */}
          {hasUnread && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                background: 'var(--primary)',
                borderRadius: '50%',
              }}
            />
          )}
        </button>

        {/* Notifications Popover Dropdown */}
        {showNotifications && (
          <div
            style={{
              position: 'absolute',
              top: '46px',
              right: '0',
              width: '320px',
              background: '#100c1f',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              padding: '16px 0',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 110,
              animation: 'fadeIn 0.2s ease'
            }}
          >
            <div style={{ padding: '0 16px 12px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 700 }}>Notifications</span>
              <span 
                style={{ fontSize: '11px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }} 
                onClick={() => {
                  setNotifs(notifs.map(n => ({ ...n, read: true })));
                  setHasUnread(false);
                }}
              >
                Mark all as read
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '240px', overflowY: 'auto' }}>
              {notifs.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    setNotifs(notifs.map(n => n.id === notif.id ? { ...n, read: true } : n));
                    // Check if any unread ones remain
                    const remainingUnread = notifs.some(n => n.id !== notif.id ? !n.read : false);
                    if (!remainingUnread) setHasUnread(false);
                  }}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    cursor: 'pointer',
                    opacity: notif.read ? 0.5 : 1,
                    transition: 'background var(--transition-fast), opacity var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {!notif.read && (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
                      )}
                      {notif.title}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{notif.time}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{notif.body}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {authLoading || eduLoading ? (
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '6px' }} className="user-info-text">
              <div style={{ width: '90px', height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
              <div style={{ width: '70px', height: '10px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }} />
            </div>
          ) : (
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }} className="user-info-text">
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{displayUserName}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{displayEduLevel}</span>
            </div>
          )}
          {authLoading ? (
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <Avatar name={displayUserName} size="sm" />
          )}
        </div>
      </div>
    </header>
  );
};


