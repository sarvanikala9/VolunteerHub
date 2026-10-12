import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, 
  Users, 
  CheckCircle, 
  Download, 
  Megaphone, 
  Calendar, 
  Clock, 
  Award, 
  Trash2,
  Sparkles,
  FileSpreadsheet,
  Search,
  ChevronDown,
  X,
  Check
} from 'lucide-react';

export default function OrganizerDesk({ 
  events, 
  registrations, 
  onCreateEvent, 
  onMarkAttendance, 
  onPostAnnouncement,
  currentUser 
}) {
  const [activeTab, setActiveTab] = useState('manage'); // 'manage', 'create', 'broadcast'
  const [selectedEventId, setSelectedEventId] = useState(events[0]?._id || '');
  const [driveSearchText, setDriveSearchText] = useState('');
  const [isDriveDropdownOpen, setIsDriveDropdownOpen] = useState(false);
  const driveDropdownRef = useRef(null);

  // Host Event Form State
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'Community & Social Welfare',
    description: '',
    date: '2026-11-25',
    time: '09:00 AM - 01:00 PM',
    venue: 'Campus Student Activity Centre',
    hoursCredit: 4,
    requiredVolunteers: 25,
    skills: 'Teamwork, Communication, Organization',
    bannerImage: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1000&auto=format&fit=crop&q=80',
    organizerClub: currentUser?.role === 'coordinator' ? 'Youth Leadership Council' : 'NSS Campus Wing',
    isUrgent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Broadcast Form State
  const [announcement, setAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'Urgent',
    clubOrWing: 'Student Activity Council'
  });

  const selectedEvent = events.find(e => String(e._id) === String(selectedEventId)) || events[0];
  const eventRegistrations = registrations.filter(r => String(r.eventId) === String(selectedEventId));

  useEffect(() => {
    if (selectedEvent) {
      setDriveSearchText(selectedEvent.title);
    }
  }, [selectedEventId, events]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (driveDropdownRef.current && !driveDropdownRef.current.contains(e.target)) {
        setIsDriveDropdownOpen(false);
        if (selectedEvent && !driveSearchText.trim()) {
          setDriveSearchText(selectedEvent.title);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedEvent, driveSearchText]);

  const filteredDrives = events.filter(ev => {
    if (!driveSearchText || !driveSearchText.trim()) return true;
    const q = driveSearchText.toLowerCase();
    return (
      ev.title.toLowerCase().includes(q) ||
      (ev.category && ev.category.toLowerCase().includes(q)) ||
      (ev.date && ev.date.toLowerCase().includes(q)) ||
      (ev.organizer?.club && ev.organizer.club.toLowerCase().includes(q))
    );
  });

  const handleSelectDrive = (ev) => {
    setSelectedEventId(ev._id);
    setDriveSearchText(ev.title);
    setIsDriveDropdownOpen(false);
  };

  const handleClearDriveSearch = () => {
    setDriveSearchText('');
    setIsDriveDropdownOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreateEvent({
        title: newEvent.title,
        category: newEvent.category,
        description: newEvent.description,
        date: newEvent.date,
        time: newEvent.time,
        location: { venue: newEvent.venue, landmark: 'Campus Centre' },
        hoursCredit: Number(newEvent.hoursCredit),
        requiredVolunteers: Number(newEvent.requiredVolunteers),
        skillsRequired: newEvent.skills.split(',').map(s => s.trim()).filter(Boolean),
        bannerImage: newEvent.bannerImage,
        isUrgent: newEvent.isUrgent,
        organizer: {
          name: currentUser?.name || 'Club Lead',
          club: newEvent.organizerClub,
          email: currentUser?.email || 'coordinator@college.edu',
          phone: currentUser?.phone || '+91 98400 00000',
          avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
        }
      });
      setActiveTab('manage');
      setNewEvent({ ...newEvent, title: '', description: '' });
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!announcement.title || !announcement.content) return;
    try {
      await onPostAnnouncement({
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        clubOrWing: announcement.clubOrWing,
        author: currentUser?.name || 'Volunteer Coordinator',
        linkEventId: selectedEventId || ''
      });
      setAnnouncement({ title: '', content: '', priority: 'Urgent', clubOrWing: 'Student Activity Council' });
      alert('Announcement bulletin broadcast successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const exportAttendanceCSV = () => {
    if (eventRegistrations.length === 0) {
      alert('No registrations available to export.');
      return;
    }
    const headers = ['Registration ID,Student Name,Roll Number,Department,Status,Hours Awarded,Certificate Code,Date Registered\n'];
    const rows = eventRegistrations.map(r => 
      `"${r._id}","${r.studentName}","${r.studentRoll}","${r.studentDept || ''}","${r.status}","${r.hoursAwarded || 0}","${r.certificateCode || ''}","${r.createdAt || ''}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VolunteerHub_Attendance_${selectedEvent?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'Event'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Sub Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0.5rem'
      }}>
        <button 
          className={`chip ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          <Users size={15} />
          Volunteer Attendance Desk
        </button>

        <button 
          className={`chip ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          <PlusCircle size={15} />
          + Host New Volunteer Drive
        </button>

        <button 
          className={`chip ${activeTab === 'broadcast' ? 'active' : ''}`}
          onClick={() => setActiveTab('broadcast')}
        >
          <Megaphone size={15} />
          Broadcast Campus Bulletin
        </button>
      </div>

      {/* VIEW: MANAGE & ATTENDANCE */}
      {activeTab === 'manage' && (
        <div>
          {/* Event Picker Bar with Searchable Drive Combobox */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            position: 'relative'
          }}>
            <div 
              ref={driveDropdownRef}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '320px', position: 'relative' }}
            >
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                Select Drive:
              </label>

              <div style={{ position: 'relative', flex: 1 }}>
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: isDriveDropdownOpen ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem 0.85rem',
                    gap: '0.5rem',
                    boxShadow: isDriveDropdownOpen ? '0 0 0 3px rgba(16, 185, 129, 0.2)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setIsDriveDropdownOpen(true)}
                >
                  <Search size={16} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                  <input
                    type="text"
                    value={driveSearchText}
                    onChange={(e) => {
                      setDriveSearchText(e.target.value);
                      setIsDriveDropdownOpen(true);
                    }}
                    onFocus={() => setIsDriveDropdownOpen(true)}
                    placeholder="Type to search drive name, date, club..."
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      minWidth: '160px'
                    }}
                  />
                  {driveSearchText && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearDriveSearch();
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-dim)',
                        cursor: 'pointer',
                        padding: '0.15rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Clear drive filter"
                    >
                      <X size={15} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDriveDropdownOpen(!isDriveDropdownOpen);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      padding: '0.15rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Toggle drive options"
                  >
                    <ChevronDown size={16} style={{ transform: isDriveDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                </div>

                {/* Floating Searchable Dropdown List */}
                {isDriveDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    maxHeight: '340px',
                    overflowY: 'auto',
                    background: '#0f172a',
                    border: '1px solid var(--border-highlight)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100,
                    padding: '0.4rem',
                    animation: 'slideDown 0.18s ease'
                  }}>
                    <div style={{
                      padding: '0.35rem 0.65rem',
                      fontSize: '0.72rem',
                      color: 'var(--text-dim)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>{filteredDrives.length} Drives (Click to select)</span>
                      <span>Type to filter</span>
                    </div>

                    {filteredDrives.length === 0 ? (
                      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No volunteer drives matching "{driveSearchText}"
                      </div>
                    ) : (
                      filteredDrives.map((ev) => {
                        const isSelected = String(ev._id) === String(selectedEventId);
                        return (
                          <div
                            key={ev._id}
                            onClick={() => handleSelectDrive(ev)}
                            style={{
                              padding: '0.65rem 0.85rem',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              background: isSelected ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                              borderLeft: isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.75rem',
                              marginBottom: '0.2rem',
                              transition: 'background 0.12s'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: '0.88rem',
                                fontWeight: isSelected ? 700 : 600,
                                color: isSelected ? '#34d399' : '#ffffff',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {ev.title}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                📅 {ev.date} • {ev.category} • <span style={{ color: '#94a3b8' }}>{ev.organizer?.club}</span>
                              </div>
                            </div>

                            {isSelected && (
                              <Check size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={exportAttendanceCSV}>
                <FileSpreadsheet size={15} />
                Export Attendance CSV
              </button>
            </div>
          </div>

          {/* Drive Snapshot */}
          {selectedEvent && (
            <div style={{
              background: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h4 style={{ color: '#fff', fontSize: '1.1rem' }}>{selectedEvent.title}</h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Organized by: <strong style={{ color: 'var(--primary)' }}>{selectedEvent.organizer?.club}</strong> • Venue: {selectedEvent.location?.venue}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>Registered:</span>{' '}
                  <strong style={{ color: '#34d399' }}>{eventRegistrations.length} students</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>Target Slots:</span>{' '}
                  <strong style={{ color: '#fff' }}>{selectedEvent.requiredVolunteers}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-dim)' }}>Hours Credit:</span>{' '}
                  <strong style={{ color: '#fbbf24' }}>{selectedEvent.hoursCredit} hrs</strong>
                </div>
              </div>
            </div>
          )}

          {/* Registered Volunteers Table */}
          <div className="table-card">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student Volunteer</th>
                  <th>Roll Number</th>
                  <th>Department</th>
                  <th>Pass Code</th>
                  <th>Status</th>
                  <th>Action / Attendance</th>
                </tr>
              </thead>
              <tbody>
                {eventRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No students registered for this drive yet.
                    </td>
                  </tr>
                ) : (
                  eventRegistrations.map((reg) => (
                    <tr key={reg._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{reg.studentName}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{reg.studentEmail}</div>
                      </td>
                      <td>
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 700,
                          color: '#38bdf8'
                        }}>
                          {reg.studentRoll}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{reg.studentDept || 'Engineering'}</td>
                      <td style={{ color: '#fbbf24', fontWeight: 600 }}>{reg.certificateCode}</td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          background: reg.status === 'Attended' 
                            ? 'rgba(16, 185, 129, 0.2)' 
                            : reg.status === 'Cancelled' 
                            ? 'rgba(244, 63, 94, 0.2)' 
                            : 'rgba(56, 189, 248, 0.2)',
                          color: reg.status === 'Attended' 
                            ? '#34d399' 
                            : reg.status === 'Cancelled' 
                            ? '#f43f5e' 
                            : '#38bdf8'
                        }}>
                          {reg.status}
                        </span>
                      </td>
                      <td>
                        {reg.status === 'Attended' ? (
                          <span style={{ color: '#34d399', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <CheckCircle size={15} />
                            Hours Credited ({reg.hoursAwarded || selectedEvent?.hoursCredit || 4}h)
                          </span>
                        ) : reg.status === 'Cancelled' ? (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>Withdrawn</span>
                        ) : (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => onMarkAttendance(selectedEvent._id, reg._id, selectedEvent?.hoursCredit || 4)}
                          >
                            <CheckCircle size={14} />
                            Check-in & Award Hours
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: CREATE EVENT */}
      {activeTab === 'create' && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          maxWidth: '850px',
          backdropFilter: 'blur(16px)'
        }}>
          <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
            Host a New Volunteering Drive
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Publish an official student outreach drive under your club, department, or student organization.
          </p>

          <form onSubmit={handleCreateSubmit}>
            <div className="form-group">
              <label className="form-label">Drive Title *</label>
              <input 
                className="form-input"
                placeholder="e.g. Campus Solar Energy Awareness & E-Waste Drive"
                value={newEvent.title}
                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select 
                  className="form-select"
                  value={newEvent.category}
                  onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}
                >
                  <option value="Environment & Sustainability">Environment & Sustainability</option>
                  <option value="Health & Blood Donation">Health & Blood Donation</option>
                  <option value="Education & Mentoring">Education & Mentoring</option>
                  <option value="Community & Social Welfare">Community & Social Welfare</option>
                  <option value="Campus & Cultural Support">Campus & Cultural Support</option>
                  <option value="Animal Welfare">Animal Welfare</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Host Organization / Club *</label>
                <input 
                  className="form-input"
                  value={newEvent.organizerClub}
                  onChange={e => setNewEvent({ ...newEvent, organizerClub: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description & Objectives *</label>
              <textarea 
                className="form-textarea"
                rows={4}
                placeholder="Describe what volunteers will be doing, instructions, where to report..."
                value={newEvent.description}
                onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Event Date *</label>
                <input 
                  type="date"
                  className="form-input"
                  value={newEvent.date}
                  onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Time Window *</label>
                <input 
                  className="form-input"
                  value={newEvent.time}
                  onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                  placeholder="09:00 AM - 01:00 PM"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Venue / Landmark *</label>
                <input 
                  className="form-input"
                  value={newEvent.venue}
                  onChange={e => setNewEvent({ ...newEvent, venue: e.target.value })}
                  placeholder="Main Seminar Hall / Gate 2"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Service Hours Awarded</label>
                <input 
                  type="number"
                  min="1"
                  max="12"
                  className="form-input"
                  value={newEvent.hoursCredit}
                  onChange={e => setNewEvent({ ...newEvent, hoursCredit: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Volunteer Slots</label>
                <input 
                  type="number"
                  min="5"
                  max="200"
                  className="form-input"
                  value={newEvent.requiredVolunteers}
                  onChange={e => setNewEvent({ ...newEvent, requiredVolunteers: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills (Comma-separated)</label>
                <input 
                  className="form-input"
                  value={newEvent.skills}
                  onChange={e => setNewEvent({ ...newEvent, skills: e.target.value })}
                  placeholder="First Aid, Photography, Mentoring"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Banner Image URL</label>
              <input 
                className="form-input"
                value={newEvent.bannerImage}
                onChange={e => setNewEvent({ ...newEvent, bannerImage: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <input 
                type="checkbox"
                id="urgent-check"
                checked={newEvent.isUrgent}
                onChange={e => setNewEvent({ ...newEvent, isUrgent: e.target.checked })}
                style={{ width: 18, height: 18 }}
              />
              <label htmlFor="urgent-check" style={{ fontSize: '0.88rem', color: '#fed7aa', cursor: 'pointer' }}>
                Flag as Urgent Call for Volunteers (displays prominent alert badge)
              </label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Publishing...' : 'Publish Volunteer Drive to Campus'}
            </button>
          </form>
        </div>
      )}

      {/* VIEW: BROADCAST BULLETIN */}
      {activeTab === 'broadcast' && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          maxWidth: '750px',
          backdropFilter: 'blur(16px)'
        }}>
          <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
            Broadcast Urgent Bulletin
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Post real-time campus volunteer alerts, venue shifts, refreshment pickups, or congratulations messages.
          </p>

          <form onSubmit={handleBroadcastSubmit}>
            <div className="form-group">
              <label className="form-label">Bulletin Headline *</label>
              <input 
                className="form-input"
                placeholder="e.g. Free T-shirt distribution at Student Hall counter"
                value={announcement.title}
                onChange={e => setAnnouncement({ ...announcement, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Priority Level</label>
                <select 
                  className="form-select"
                  value={announcement.priority}
                  onChange={e => setAnnouncement({ ...announcement, priority: e.target.value })}
                >
                  <option value="Urgent">Urgent</option>
                  <option value="Important">Important</option>
                  <option value="Highlight">Highlight</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Posting Club / Wing</label>
                <input 
                  className="form-input"
                  value={announcement.clubOrWing}
                  onChange={e => setAnnouncement({ ...announcement, clubOrWing: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Content *</label>
              <textarea 
                className="form-textarea"
                rows={3}
                placeholder="Provide details for student volunteers..."
                value={announcement.content}
                onChange={e => setAnnouncement({ ...announcement, content: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              <Megaphone size={16} />
              Broadcast to Campus Live Feed
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
