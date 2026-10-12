import React from 'react';
import { Calendar, Clock, MapPin, Award, CheckCircle, ArrowRight, AlertTriangle } from 'lucide-react';

export default function EventCard({ 
  event, 
  onSelectEvent, 
  onRegisterClick, 
  isUserRegistered 
}) {
  const percentFilled = Math.min(100, Math.round((event.registeredCount / event.requiredVolunteers) * 100));
  const spotsLeft = Math.max(0, event.requiredVolunteers - event.registeredCount);

  return (
    <article className="event-card">
      {/* Media thumbnail & floating badges */}
      <div className="event-card-media" onClick={() => onSelectEvent(event)} style={{ cursor: 'pointer' }}>
        <img 
          src={event.bannerImage || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'} 
          alt={event.title} 
          className="event-img" 
        />
        <div className="event-badges-row">
          <span className="tag-category">{event.category}</span>
          {event.isUrgent && (
            <span className="tag-urgent">
              Urgent Need
            </span>
          )}
        </div>

        <div className="tag-hours">
          <Award size={14} />
          {event.hoursCredit} Hours Credit
        </div>
      </div>

      <div className="event-body">
        {/* Organizer details */}
        <div className="event-organizer-row">
          <img 
            src={event.organizer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
            alt={event.organizer?.club} 
            className="organizer-avatar" 
          />
          <span className="organizer-club">{event.organizer?.club}</span>
        </div>

        {/* Title & Desc */}
        <h3 
          className="event-title" 
          onClick={() => onSelectEvent(event)} 
          style={{ cursor: 'pointer' }}
          title={event.title}
        >
          {event.title}
        </h3>
        <p className="event-desc">{event.description}</p>

        {/* Meta particulars */}
        <div className="event-details-meta">
          <div className="meta-item">
            <Calendar size={15} />
            <span>{event.date}</span>
          </div>
          <div className="meta-item">
            <Clock size={15} />
            <span>{event.time}</span>
          </div>
          <div className="meta-item">
            <MapPin size={15} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {event.location?.venue}
            </span>
          </div>
        </div>

        {/* Slots remaining progress */}
        <div className="slots-container">
          <div className="slots-header">
            <span>Volunteers Registered</span>
            <span style={{ color: spotsLeft <= 5 ? '#f43f5e' : 'var(--primary)' }}>
              {event.registeredCount} / {event.requiredVolunteers} ({spotsLeft} spots left)
            </span>
          </div>
          <div className="slots-progress-track">
            <div 
              className="slots-progress-bar" 
              style={{ 
                width: `${percentFilled}%`,
                background: spotsLeft === 0 ? '#ef4444' : 'var(--primary-gradient)'
              }}
            ></div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="event-footer">
          {isUserRegistered ? (
            <button 
              className="btn btn-secondary btn-sm" 
              style={{ flex: 1, borderColor: '#10b981', color: '#34d399' }}
              onClick={() => onSelectEvent(event)}
            >
              <CheckCircle size={15} />
              Registered ✓
            </button>
          ) : spotsLeft === 0 ? (
            <button 
              className="btn btn-secondary btn-sm" 
              style={{ flex: 1, opacity: 0.6, cursor: 'not-allowed' }} 
              disabled
            >
              Slots Filled
            </button>
          ) : (
            <button 
              className="btn btn-primary btn-sm" 
              style={{ flex: 1 }}
              onClick={() => onRegisterClick(event)}
            >
              Register Now
            </button>
          )}

          <button 
            className="btn btn-outline btn-sm" 
            onClick={() => onSelectEvent(event)}
            title="View Full Drive Details & Agenda"
          >
            Details
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
