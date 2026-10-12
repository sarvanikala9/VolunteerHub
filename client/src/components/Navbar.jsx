import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Compass, 
  UserCheck, 
  ShieldCheck, 
  Trophy, 
  Bell, 
  ChevronDown, 
  RefreshCw,
  Sparkles,
  LogOut 
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  currentUser, 
  onSwitchUser, 
  availableUsers,
  onResetSeed,
  onLogout,
  announcementCount 
}) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="navbar">
      <div className="nav-inner">
        {/* SVECW Brand */}
        <div className="brand" onClick={() => setCurrentTab('explore')}>
          <div className="navbar-svecw-logo-badge" title="Shri Vishnu Engineering College for Women (SVECW)">
            <img 
              src="/svecw-logo.jpg" 
              alt="Vishnu Universal Learning - SVECW" 
              className="navbar-svecw-logo-img" 
            />
          </div>
          <div className="brand-text">
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              SVECW <span className="navbar-college-tag">VolunteerHub</span>
            </h1>
            <span>Shri Vishnu Engg. College for Women</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button 
            className={`nav-item ${currentTab === 'explore' ? 'active' : ''}`}
            onClick={() => setCurrentTab('explore')}
          >
            <Compass size={17} />
            Explore Drives
          </button>

          <button 
            className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentTab('dashboard')}
          >
            <UserCheck size={17} />
            My Dashboard
          </button>

          <button 
            className={`nav-item ${currentTab === 'organizer' ? 'active' : ''}`}
            onClick={() => setCurrentTab('organizer')}
          >
            <ShieldCheck size={17} />
            Club Organizer Desk
          </button>

          <button 
            className={`nav-item ${currentTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setCurrentTab('leaderboard')}
          >
            <Trophy size={17} />
            Leaderboard
          </button>

          <button 
            className={`nav-item ${currentTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setCurrentTab('announcements')}
          >
            <Bell size={17} />
            Bulletins
            {announcementCount > 0 && (
              <span style={{
                background: '#f43f5e',
                color: '#fff',
                fontSize: '0.68rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '99px',
                fontWeight: 800
              }}>
                {announcementCount}
              </span>
            )}
          </button>
        </nav>

        {/* User Switcher Pill & Actions */}
        <div className="nav-actions">
          <div style={{ position: 'relative' }}>
            <div 
              className="role-badge" 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              title="Click to switch active student/coordinator demo profile"
            >
              <img 
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                alt={currentUser?.name} 
                className="role-avatar" 
              />
              <div className="role-info">
                <span className="role-name">{currentUser?.name?.split(' ')[0]} ({currentUser?.rollNumber})</span>
                <span className="role-tag">
                  {currentUser?.role === 'coordinator' ? (currentUser?.designation || 'Faculty / Lead') : `${currentUser?.totalHours || 0} hrs served`}
                </span>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            </div>

            {/* Dropdown for instant role switching */}
            {showUserDropdown && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: '#0f172a',
                border: '1px solid var(--border-highlight)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '0.6rem',
                minWidth: '240px',
                zIndex: 60,
                animation: 'slideDown 0.2s ease'
              }}>
                <div style={{ 
                  fontSize: '0.74rem', 
                  color: 'var(--text-dim)', 
                  padding: '0.35rem 0.6rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em', 
                  fontWeight: 700 
                }}>
                  Switch Active Demo Profile
                </div>
                {availableUsers.map((u) => (
                  <div
                    key={u.rollNumber}
                    onClick={() => {
                      onSwitchUser(u);
                      setShowUserDropdown(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.55rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      background: currentUser?.rollNumber === u.rollNumber ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      transition: 'background 0.15s'
                    }}
                  >
                    <img 
                      src={u.avatar} 
                      alt={u.name} 
                      style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} 
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {u.rollNumber} • {u.department?.split(' ')[0]} • {u.role === 'coordinator' ? (u.designation || 'Lead') : `${u.totalHours} hrs`}
                      </div>
                    </div>
                  </div>
                ))}

                <div 
                  onClick={() => {
                    setShowUserDropdown(false);
                    onLogout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.55rem 0.65rem',
                    marginTop: '0.4rem',
                    borderTop: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    color: '#fda4af',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    transition: 'background 0.15s'
                  }}
                >
                  <LogOut size={15} />
                  <span>Sign Out of SVECW Portal</span>
                </div>
              </div>
            )}
          </div>

          <button 
            className="btn-logout"
            onClick={onLogout}
            title="Sign Out of SVECW VolunteerHub"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>

          <button 
            className="btn btn-outline btn-sm" 
            onClick={onResetSeed} 
            title="Reset database to fresh seed state"
            style={{ borderRadius: 'var(--radius-full)', padding: '0.45rem 0.75rem' }}
          >
            <RefreshCw size={14} />
            <span style={{ fontSize: '0.78rem' }}>Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
