import React, { useState } from 'react';
import { 
  Award, 
  Clock, 
  Sparkles, 
  Calendar, 
  MapPin, 
  QrCode, 
  CheckCircle, 
  ChevronRight, 
  FileCheck, 
  XCircle,
  Edit3,
  Check,
  Shield,
  Layers
} from 'lucide-react';

export default function StudentDashboard({ 
  currentUser, 
  userRegistrations, 
  allEvents, 
  onViewCertificate, 
  onCancelRegistration,
  onUpdateSkills 
}) {
  const [activeSubTab, setActiveSubTab] = useState('upcoming'); // 'upcoming', 'completed', 'badges'
  const [editingSkills, setEditingSkills] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skillsList, setSkillsList] = useState(currentUser?.skills || []);
  const [selectedPass, setSelectedPass] = useState(null);

  // Group registrations
  const upcomingRegs = userRegistrations.filter(r => r.status === 'Registered');
  const completedRegs = userRegistrations.filter(r => r.status === 'Attended');

  // Next Milestone calculation
  const totalHours = currentUser?.totalHours || 0;
  const nextMilestoneHours = totalHours < 25 ? 25 : totalHours < 50 ? 50 : 100;
  const milestoneProgress = Math.min(100, Math.round((totalHours / nextMilestoneHours) * 100));

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skillsList.includes(skillInput.trim())) {
      const updated = [...skillsList, skillInput.trim()];
      setSkillsList(updated);
      setSkillInput('');
      onUpdateSkills(currentUser?.rollNumber, { skills: updated });
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = skillsList.filter(s => s !== skillToRemove);
    setSkillsList(updated);
    onUpdateSkills(currentUser?.rollNumber, { skills: updated });
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Student Profile Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        marginBottom: '2rem',
        backdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '300px',
          height: '100%',
          background: 'radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Avatar & Core Bio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <img 
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200'} 
              alt={currentUser?.name}
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--primary)',
                boxShadow: '0 0 20px var(--primary-glow)'
              }} 
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.6rem', color: '#fff' }}>{currentUser?.name}</h2>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.74rem',
                  fontWeight: 700
                }}>
                  {currentUser?.role === 'coordinator' ? 'Club Lead' : 'Active Volunteer'}
                </span>
              </div>

              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Roll: <strong style={{ color: '#fff' }}>{currentUser?.rollNumber}</strong> • {currentUser?.department} • {currentUser?.year || '3rd Year'}
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                {currentUser?.email} {currentUser?.phone && `• ${currentUser?.phone}`}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.4rem',
              textAlign: 'center',
              minWidth: '130px'
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', lineHeight: 1.1 }}>
                {totalHours}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Logged Hours
              </div>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.4rem',
              textAlign: 'center',
              minWidth: '130px'
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1.1 }}>
                {currentUser?.karmaPoints || 450}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Karma Score
              </div>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.4rem',
              textAlign: 'center',
              minWidth: '130px'
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#818cf8', lineHeight: 1.1 }}>
                {currentUser?.badges?.length || 3}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Badges Won
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              Next Dean's Medal Milestone ({nextMilestoneHours} Service Hours)
            </span>
            <span style={{ color: '#34d399', fontWeight: 700 }}>
              {totalHours} / {nextMilestoneHours} Hours ({nextMilestoneHours - totalHours} more to reach next tier)
            </span>
          </div>
          <div style={{ height: '8px', background: 'rgba(30, 41, 59, 0.8)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${milestoneProgress}%`,
              background: 'var(--primary-gradient)',
              borderRadius: '99px',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.75rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0.5rem'
      }}>
        <button 
          className={`chip ${activeSubTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('upcoming')}
        >
          Upcoming Registrations ({upcomingRegs.length})
        </button>

        <button 
          className={`chip ${activeSubTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('completed')}
        >
          Completed Drives & Certificates ({completedRegs.length})
        </button>

        <button 
          className={`chip ${activeSubTab === 'badges' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('badges')}
        >
          Earned Badges ({currentUser?.badges?.length || 0})
        </button>
      </div>

      {/* Tab: Upcoming Registrations */}
      {activeSubTab === 'upcoming' && (
        <div>
          {upcomingRegs.length === 0 ? (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '3rem',
              textAlign: 'center'
            }}>
              <Calendar size={36} style={{ color: 'var(--text-dim)', margin: '0 auto 0.75rem' }} />
              <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Upcoming Registrations Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
                You have not signed up for any upcoming drives. Switch to the Explore tab to find community initiatives!
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
              {upcomingRegs.map((reg) => {
                const event = allEvents.find(e => String(e._id) === String(reg.eventId));
                return (
                  <div key={reg._id} style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backdropFilter: 'blur(12px)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)'
                        }}>
                          Confirmed Spot
                        </span>

                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          Pass: <strong style={{ color: '#fff' }}>{reg.certificateCode}</strong>
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.6rem' }}>
                        {reg.eventTitle}
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={14} style={{ color: 'var(--primary)' }} />
                          <span>{reg.eventDate || event?.date}</span>
                        </div>
                        {event && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={14} style={{ color: 'var(--primary)' }} />
                            <span>{event.location?.venue}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Award size={14} style={{ color: '#fbbf24' }} />
                          <span>{event?.hoursCredit || 4} Service Hours Credit</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                      <button 
                        className="btn btn-secondary btn-sm" 
                        style={{ flex: 1 }}
                        onClick={() => setSelectedPass(reg)}
                      >
                        <QrCode size={14} />
                        View Entry Pass
                      </button>

                      <button 
                        className="btn btn-outline btn-sm" 
                        style={{ color: '#f87171', borderColor: 'rgba(244, 63, 94, 0.25)' }}
                        onClick={() => onCancelRegistration(reg.eventId, reg._id, currentUser?.rollNumber)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Completed Drives & Certificates */}
      {activeSubTab === 'completed' && (
        <div>
          {completedRegs.length === 0 ? (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px dashed var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '3rem',
              textAlign: 'center'
            }}>
              <FileCheck size={36} style={{ color: 'var(--text-dim)', margin: '0 auto 0.75rem' }} />
              <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Completed Drives Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto' }}>
                Once you attend registered drives and the coordinator checks your attendance, your official verified certificates will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
              {completedRegs.map((reg) => {
                const event = allEvents.find(e => String(e._id) === String(reg.eventId));
                return (
                  <div key={reg._id} style={{
                    background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(6, 78, 59, 0.2) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#34d399',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)'
                        }}>
                          Attended & Certified ✓
                        </span>

                        <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>
                          +{reg.hoursAwarded || event?.hoursCredit || 4} Hours Credited
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>
                        {reg.eventTitle}
                      </h3>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                        Certificate Credential: <strong style={{ color: '#fff' }}>{reg.certificateCode}</strong>
                      </div>
                    </div>

                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => onViewCertificate(reg, event)}
                      style={{ width: '100%' }}
                    >
                      <Award size={15} />
                      View Official Certificate
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Earned Badges */}
      {activeSubTab === 'badges' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.25rem'
        }}>
          {currentUser?.badges?.map((badge, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              backdropFilter: 'blur(12px)'
            }}>
              <div style={{
                fontSize: '2.2rem',
                background: 'rgba(255, 255, 255, 0.05)',
                width: 56,
                height: 56,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {badge.icon}
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                  {badge.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {badge.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Entry Pass Modal Popup */}
      {selectedPass && (
        <div className="modal-overlay" onClick={() => setSelectedPass(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center' }}>
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Digital Volunteer Entry Pass</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Show this pass at the registration desk for venue entry.
            </p>

            <div style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              display: 'inline-block',
              margin: '0 auto 1.5rem'
            }}>
              <QrCode size={160} color="#0f172a" />
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              marginBottom: '1.5rem',
              fontSize: '0.85rem'
            }}>
              <div style={{ color: 'var(--text-muted)' }}>Student Name: <strong style={{ color: '#fff' }}>{currentUser?.name}</strong></div>
              <div style={{ color: 'var(--text-muted)' }}>Roll Number: <strong style={{ color: '#fff' }}>{currentUser?.rollNumber}</strong></div>
              <div style={{ color: 'var(--text-muted)' }}>Drive: <strong style={{ color: '#fff' }}>{selectedPass.eventTitle}</strong></div>
              <div style={{ color: 'var(--text-muted)' }}>Ticket ID: <strong style={{ color: '#34d399' }}>{selectedPass.certificateCode}</strong></div>
            </div>

            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setSelectedPass(null)}>
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
