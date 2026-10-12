import React, { useState, useEffect } from 'react';
import { api } from './api';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import EventCard from './components/EventCard';
import EventDetailsModal from './components/EventDetailsModal';
import CertificateModal from './components/CertificateModal';
import StudentDashboard from './components/StudentDashboard';
import OrganizerDesk from './components/OrganizerDesk';
import LeaderboardView from './components/LeaderboardView';
import BulletinsView from './components/BulletinsView';
import LoginPage from './components/LoginPage';
import { Search, Sparkles, Filter, CheckCircle, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

const CATEGORIES = [
  'All',
  'Environment & Sustainability',
  'Health & Blood Donation',
  'Education & Mentoring',
  'Community & Social Welfare',
  'Campus & Cultural Support',
  'Animal Welfare'
];

export default function App() {
  const [currentTab, setCurrentTab] = useState('explore'); // explore, dashboard, organizer, leaderboard, announcements
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState(null);
  
  // Stored SVECW User Session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('svecw_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [userRegistrations, setUserRegistrations] = useState([]);

  // Filtering & Search
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date'); // 'date', 'hours', 'urgent'

  // Modals & Popups
  const [selectedEventModal, setSelectedEventModal] = useState(null);
  const [selectedCertificateModal, setSelectedCertificateModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load initial datasets
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [eventsData, volunteersData, announcementsData, statsData] = await Promise.all([
        api.getEvents(),
        api.getVolunteers(),
        api.getAnnouncements(),
        api.getStats()
      ]);

      setEvents(eventsData || []);
      setVolunteers(volunteersData || []);
      setAnnouncements(announcementsData || []);
      setStats(statsData || null);

      if (currentUser) {
        const refreshedUser = volunteersData.find(v => v.rollNumber === currentUser.rollNumber) 
          || volunteersData.find(v => v._id === currentUser._id)
          || volunteersData[0];
        if (refreshedUser) {
          setCurrentUser(refreshedUser);
          try {
            localStorage.setItem('svecw_current_user', JSON.stringify(refreshedUser));
          } catch (e) {}
          loadUserRegistrations(refreshedUser.rollNumber);
        }
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
      showToast('Error connecting to backend server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUserRegistrations = async (rollNumber) => {
    if (!rollNumber) return;
    try {
      const regs = await api.getRegistrations({ studentRoll: rollNumber });
      setUserRegistrations(regs || []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleLoginSuccess = (user, rememberMe = true) => {
    setCurrentUser(user);
    if (rememberMe) {
      try {
        localStorage.setItem('svecw_current_user', JSON.stringify(user));
      } catch (e) {}
    }
    loadUserRegistrations(user.rollNumber);
    showToast(`Welcome to SVECW VolunteerHub, ${user.name}!`);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('svecw_current_user');
    } catch (e) {}
    setCurrentUser(null);
    setUserRegistrations([]);
    showToast('Signed out of SVECW VolunteerHub successfully.');
  };

  const handleSwitchUser = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('svecw_current_user', JSON.stringify(user));
    } catch (e) {}
    loadUserRegistrations(user.rollNumber);
    showToast(`Switched active profile to ${user.name} (${user.rollNumber})`);
  };

  const handleRegisterEvent = async (eventId, payload) => {
    try {
      const reg = await api.registerForEvent(eventId, payload);
      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      showToast(`Successfully registered for drive! Pass code: ${reg.certificateCode}`);
      await loadAllData();
      if (selectedEventModal) {
        const updated = await api.getEventById(eventId);
        setSelectedEventModal(updated);
      }
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const handleCancelRegistration = async (eventId, registrationId, studentRoll) => {
    try {
      await api.cancelRegistration(eventId, registrationId, studentRoll);
      showToast('Registration withdrawn.');
      await loadAllData();
      if (selectedEventModal) {
        const updated = await api.getEventById(eventId);
        setSelectedEventModal(updated);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleMarkAttendance = async (eventId, registrationId, hours) => {
    try {
      await api.markAttendance(eventId, registrationId, hours);
      showToast(`Student attendance verified and ${hours} service hours awarded!`);
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateEvent = async (eventData) => {
    try {
      await api.createEvent(eventData);
      showToast('New volunteer drive published successfully!');
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const handlePostAnnouncement = async (payload) => {
    try {
      await api.createAnnouncement(payload);
      showToast('Campus bulletin broadcast successfully!');
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const handleResetSeed = async () => {
    if (!window.confirm('Reset VolunteerHub to fresh sample data?')) return;
    try {
      await api.resetSeed();
      showToast('Platform reset to clean seed data state.');
      await loadAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filtered Events list
  const filteredEvents = events.filter((e) => {
    if (selectedCategory !== 'All' && e.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = e.title.toLowerCase().includes(q);
      const matchesDesc = e.description.toLowerCase().includes(q);
      const matchesClub = e.organizer?.club?.toLowerCase().includes(q);
      const matchesSkill = e.skillsRequired?.some(s => s.toLowerCase().includes(q));
      if (!matchesTitle && !matchesDesc && !matchesClub && !matchesSkill) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortOption === 'hours') return b.hoursCredit - a.hoursCredit;
    if (sortOption === 'urgent') return (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0) || a.date.localeCompare(b.date);
    return a.date.localeCompare(b.date);
  });

  const urgentAnnouncement = announcements.find(a => a.priority === 'Urgent');

  // If not logged in, render SVECW Login Page
  if (!currentUser) {
    return (
      <div className="app-container">
        <LoginPage 
          onLoginSuccess={handleLoginSuccess}
          availableUsers={volunteers}
        />
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Navbar */}
      <Navbar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        availableUsers={volunteers}
        onResetSeed={handleResetSeed}
        onLogout={handleLogout}
        announcementCount={announcements.length}
      />

      <main className="main-content">
        {/* Urgent Ticker Banner */}
        {urgentAnnouncement && (
          <div className="announcement-bar">
            <span className="announcement-badge">Urgent Notice</span>
            <span className="announcement-text">
              <strong>{urgentAnnouncement.title}:</strong> {urgentAnnouncement.content}
            </span>
            <button 
              className="btn btn-outline btn-sm" 
              style={{ padding: '0.2rem 0.65rem', fontSize: '0.75rem', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
              onClick={() => setCurrentTab('announcements')}
            >
              View All
            </button>
          </div>
        )}

        {/* TAB 1: EXPLORE DRIVES */}
        {currentTab === 'explore' && (
          <div>
            {/* Hero Section with Live Impact Metrics */}
            <HeroBanner 
              stats={stats}
              onExploreClick={() => {
                const el = document.getElementById('drives-catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onHostClick={() => setCurrentTab('organizer')}
            />

            {/* Catalog Anchor */}
            <div id="drives-catalog" className="section-header">
              <div>
                <h2 className="section-title">Discover Volunteer Drives</h2>
                <p className="section-subtitle">
                  Browse verified community initiatives, register in 1-click, and earn certified service credits.
                </p>
              </div>
            </div>

            {/* Controls Bar: Search, Category Chips, Sorting */}
            <div className="controls-bar">
              <div className="search-row">
                <div className="search-box">
                  <Search size={18} className="search-icon" />
                  <input 
                    className="search-input"
                    placeholder="Search drives by keyword, skill, or student club..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Sort by:</span>
                  <select 
                    className="sort-select"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="date">Date (Earliest First)</option>
                    <option value="hours">Highest Hours Credit</option>
                    <option value="urgent">Urgent Drives First</option>
                  </select>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="category-chips">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '3rem',
                textAlign: 'center'
              }}>
                <Filter size={36} style={{ color: 'var(--text-dim)', margin: '0 auto 0.75rem' }} />
                <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Matching Volunteer Drives</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Try relaxing your filter query or select another category chip.
                </p>
              </div>
            ) : (
              <div className="events-grid">
                {filteredEvents.map((evt) => {
                  const isRegistered = userRegistrations.some(
                    r => String(r.eventId) === String(evt._id) && r.status !== 'Cancelled'
                  );
                  return (
                    <EventCard 
                      key={evt._id}
                      event={evt}
                      isUserRegistered={isRegistered}
                      onSelectEvent={(e) => setSelectedEventModal(e)}
                      onRegisterClick={(e) => setSelectedEventModal(e)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STUDENT DASHBOARD */}
        {currentTab === 'dashboard' && (
          <StudentDashboard 
            currentUser={currentUser}
            userRegistrations={userRegistrations}
            allEvents={events}
            onViewCertificate={(reg, event) => setSelectedCertificateModal({ reg, event, student: currentUser })}
            onCancelRegistration={handleCancelRegistration}
            onUpdateSkills={async (roll, data) => {
              await api.updateVolunteerProfile(roll, data);
              await loadAllData();
            }}
          />
        )}

        {/* TAB 3: ORGANIZER DESK */}
        {currentTab === 'organizer' && (
          <OrganizerDesk 
            events={events}
            registrations={userRegistrations}
            currentUser={currentUser}
            onCreateEvent={handleCreateEvent}
            onMarkAttendance={handleMarkAttendance}
            onPostAnnouncement={handlePostAnnouncement}
          />
        )}

        {/* TAB 4: LEADERBOARD */}
        {currentTab === 'leaderboard' && (
          <LeaderboardView volunteers={volunteers} />
        )}

        {/* TAB 5: BULLETINS */}
        {currentTab === 'announcements' && (
          <BulletinsView 
            announcements={announcements}
            onSelectEventById={async (evtId) => {
              const evt = events.find(e => String(e._id) === String(evtId));
              if (evt) {
                setSelectedEventModal(evt);
              }
            }}
          />
        )}
      </main>

      {/* MODAL: EVENT DETAILS & REGISTRATION */}
      {selectedEventModal && (
        <EventDetailsModal 
          event={selectedEventModal}
          currentUser={currentUser}
          userRegistration={userRegistrations.find(r => String(r.eventId) === String(selectedEventModal._id))}
          onClose={() => setSelectedEventModal(null)}
          onRegister={handleRegisterEvent}
          onCancelRegistration={handleCancelRegistration}
        />
      )}

      {/* MODAL: OFFICIAL SERVICE CERTIFICATE */}
      {selectedCertificateModal && (
        <CertificateModal 
          registration={selectedCertificateModal.reg}
          event={selectedCertificateModal.event}
          student={selectedCertificateModal.student}
          onClose={() => setSelectedCertificateModal(null)}
        />
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
