import React from 'react';
import { Bell, AlertTriangle, Calendar, ExternalLink, Megaphone, CheckCircle } from 'lucide-react';

export default function BulletinsView({ announcements, onSelectEventById }) {
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Urgent':
        return { bg: 'rgba(244, 63, 94, 0.15)', border: '#f43f5e', text: '#fca5a5' };
      case 'Important':
        return { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#fde68a' };
      case 'Highlight':
        return { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#a7f3d0' };
      default:
        return { bg: 'rgba(56, 189, 248, 0.15)', border: '#38bdf8', text: '#bae6fd' };
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Campus Volunteer Bulletins & Notices</h2>
          <p className="section-subtitle">
            Official announcements from University NSS, Red Cross, Student Welfare, and registered campus societies.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {announcements.map((item) => {
          const style = getPriorityStyle(item.priority);
          return (
            <article key={item._id} style={{
              background: 'var(--bg-card)',
              border: `1px solid ${style.border}`,
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              backdropFilter: 'blur(14px)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{
                    background: style.bg,
                    border: `1px solid ${style.border}`,
                    color: style.text,
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    textTransform: 'uppercase'
                  }}>
                    {item.priority}
                  </span>

                  <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700 }}>
                    {item.clubOrWing}
                  </span>
                </div>

                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Posted by {item.author}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.6rem' }}>
                {item.title}
              </h3>

              <p style={{ color: '#cbd5e1', fontSize: '0.94rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                {item.content}
              </p>

              {item.linkEventId && (
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => onSelectEventById(item.linkEventId)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                >
                  <ExternalLink size={14} />
                  View Related Volunteer Drive
                </button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
