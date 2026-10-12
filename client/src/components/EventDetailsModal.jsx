import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Award, 
  CheckCircle, 
  Users, 
  Phone, 
  Mail, 
  Gift, 
  AlertCircle,
  QrCode,
  Check
} from 'lucide-react';

export default function EventDetailsModal({ 
  event, 
  onClose, 
  currentUser, 
  onRegister, 
  onCancelRegistration,
  userRegistration 
}) {
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!event) return null;

  const isRegistered = !!userRegistration && userRegistration.status !== 'Cancelled';
  const spotsLeft = Math.max(0, event.requiredVolunteers - (event.registeredCount || 0));

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await onRegister(event._id, {
        studentRoll: currentUser?.rollNumber,
        studentName: currentUser?.name,
        studentEmail: currentUser?.email,
        studentDept: currentUser?.department,
        phone: phone || currentUser?.phone,
        notes
      });
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close Modal">
          <X size={20} />
        </button>

        {/* Media Header */}
        <div style={{
          height: '220px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          marginBottom: '1.5rem',
          position: 'relative'
        }}>
          <img 
            src={event.bannerImage || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000'} 
            alt={event.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(15,23,42,0.95) 100%)'
          }} />

          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1.25rem',
            right: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}>
            <div>
              <span className="tag-category" style={{ marginBottom: '0.4rem', display: 'inline-block' }}>
                {event.category}
              </span>
              <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 800 }}>
                {event.title}
              </h2>
            </div>
            <div className="tag-hours" style={{ position: 'static' }}>
              <Award size={15} />
              {event.hoursCredit} Hours
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.85rem',
          background: 'rgba(30, 41, 59, 0.4)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div className="meta-item">
            <Calendar size={16} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>DATE</div>
              <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{event.date}</strong>
            </div>
          </div>
          <div className="meta-item">
            <Clock size={16} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>TIME</div>
              <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{event.time}</strong>
            </div>
          </div>
          <div className="meta-item">
            <MapPin size={16} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>VENUE</div>
              <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{event.location?.venue}</strong>
            </div>
          </div>
          <div className="meta-item">
            <Users size={16} />
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>CAPACITY</div>
              <strong style={{ color: '#fff', fontSize: '0.85rem' }}>
                {event.registeredCount} / {event.requiredVolunteers}
              </strong>
            </div>
          </div>
        </div>

        {/* Full Overview */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: '#fff' }}>About This Initiative</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.7' }}>
            {event.description}
          </p>
        </div>

        {/* Skills Required */}
        {event.skillsRequired && event.skillsRequired.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: '#cbd5e1' }}>Desired Volunteer Skills</h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {event.skillsRequired.map((skill, i) => (
                <span key={i} style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#a5b4fc',
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Benefits & Perks */}
        {event.benefits && event.benefits.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: '#cbd5e1' }}>Volunteer Perks & Recognition</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
              {event.benefits.map((b, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.84rem',
                  color: '#e2e8f0',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <Check size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Organizer Contact */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1rem',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img 
              src={event.organizer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
              alt={event.organizer?.club} 
              style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} 
            />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                {event.organizer?.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                {event.organizer?.club}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {event.organizer?.phone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={13} /> {event.organizer?.phone}
              </span>
            )}
            {event.organizer?.email && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={13} /> {event.organizer?.email}
              </span>
            )}
          </div>
        </div>

        {/* REGISTRATION ACTION / STATUS BOX */}
        <div style={{
          background: isRegistered 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 78, 59, 0.3) 100%)'
            : 'rgba(30, 41, 59, 0.7)',
          border: isRegistered ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem'
        }}>
          {isRegistered ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle size={22} style={{ color: '#34d399' }} />
                  <div>
                    <strong style={{ color: '#34d399', fontSize: '1rem' }}>You Are Registered for this Drive!</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Roll: {currentUser?.rollNumber} • Verification Code: <span style={{ color: '#fff', fontWeight: 700 }}>{userRegistration.certificateCode}</span>
                    </div>
                  </div>
                </div>

                <button 
                  className="btn btn-outline btn-sm"
                  style={{ color: '#f87171', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                  onClick={() => onCancelRegistration(event._id, userRegistration._id, currentUser?.rollNumber)}
                >
                  Withdraw Registration
                </button>
              </div>

              {/* Digital Check-in Pass Card */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                border: '1px dashed rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{
                  background: '#fff',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <QrCode size={48} color="#0f172a" />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Digital Attendance Pass</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                    {currentUser?.name}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#a7f3d0' }}>
                    Present this QR / Code at the venue help desk on {event.date} to log your {event.hoursCredit} service hours.
                  </div>
                </div>
              </div>
            </div>
          ) : spotsLeft === 0 ? (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <AlertCircle size={28} style={{ color: '#fbbf24', margin: '0 auto 0.5rem' }} />
              <h4 style={{ color: '#fff' }}>Maximum Volunteer Limit Reached</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                All {event.requiredVolunteers} spots for this drive have been taken. Check back later if seats open up!
              </p>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '0.75rem' }}>
                Confirm Your Participation
              </h4>

              {errorMsg && (
                <div style={{
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid #f43f5e',
                  color: '#fecaca',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.84rem',
                  marginBottom: '1rem'
                }}>
                  {errorMsg}
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.85rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={currentUser?.name || ''} disabled style={{ opacity: 0.8 }} />
                </div>
                <div>
                  <label className="form-label">College Roll Number</label>
                  <input className="form-input" value={currentUser?.rollNumber || ''} disabled style={{ opacity: 0.8 }} />
                </div>
                <div>
                  <label className="form-label">Contact Phone</label>
                  <input 
                    className="form-input" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Dietary / Emergency Notes (Optional)</label>
                  <input 
                    className="form-input" 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Vegetarian, Allergy notes" 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  By registering, you commit to attend for {event.hoursCredit} hours on {event.date}.
                </span>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={submitting}
                >
                  {submitting ? 'Registering...' : `Confirm Registration (${event.hoursCredit} Hrs Credit)`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
