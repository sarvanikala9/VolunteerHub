import React, { useEffect } from 'react';
import { X, Award, Printer, Share2, Sparkles, ShieldCheck, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CertificateModal({ registration, event, student, onClose }) {
  useEffect(() => {
    if (!registration || !student) return;
    // Fire celebratory confetti upon certificate reveal
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  }, [registration, student]);

  if (!registration || !student) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const certCode = registration.certificateCode || `VH-2026-CERT-${Math.floor(1000 + Math.random() * 9000)}`;
  const hours = registration.hoursAwarded || event?.hoursCredit || 4;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '780px', padding: '2rem' }}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close Certificate">
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={22} style={{ color: '#fbbf24' }} />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
              Verified University Impact Certificate
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={triggerConfetti}>
              <Sparkles size={14} style={{ color: '#fbbf24' }} />
              Celebrate
            </button>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={14} />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Official Certificate Canvas Frame */}
        <div className="certificate-frame" id="printable-certificate">
          <div className="certificate-watermark">VOLUNTEERHUB</div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <div style={{
              background: '#ffffff',
              padding: '0.35rem 0.65rem',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
            }}>
              <img src="/svecw-logo.jpg" alt="SVECW Logo" style={{ height: '36px', width: 'auto', display: 'block' }} />
            </div>

            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #fbbf24 0%, #b45309 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(251, 191, 36, 0.4)'
            }}>
              <ShieldCheck size={26} color="#000" />
            </div>
          </div>

          <div className="certificate-college-name">
            SHRI VISHNU ENGINEERING COLLEGE FOR WOMEN (AUTONOMOUS) • SVECW
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            National Service Scheme (NSS) Unit & Youth Volunteer Council • Bhimavaram
          </div>

          <h2 className="certificate-title">
            Certificate of Commendation & Service
          </h2>

          <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '0.25rem' }}>
            This is proudly awarded to
          </div>

          <div className="certificate-recipient">
            {student.name}
          </div>

          <div style={{ fontSize: '0.88rem', color: '#cbd5e1', fontWeight: 600 }}>
            Roll No: <span style={{ color: '#38bdf8' }}>{student.rollNumber}</span> • {student.department}
          </div>

          <p className="certificate-body-text">
            for exceptional dedication, civic commitment, and meritorious community service during the 
            <strong> "{registration.eventTitle || event?.title}"</strong> outreach drive. A total of 
            <strong style={{ color: '#34d399' }}> {hours} Certified Public Service Hours</strong> have been officially recorded towards collegiate graduation honors and the Dean's Civic Medal.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            color: '#fbbf24'
          }}>
            <CheckCircle size={14} />
            Verified Credential ID: <strong>{certCode}</strong>
          </div>

          {/* Signatures & Seal */}
          <div className="certificate-signatures">
            <div className="signature-block">
              <span className="signature-img-font">Dr. Arvind S.</span>
              <span className="signature-title">NSS Program Officer</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Youth Red Cross Wing</span>
            </div>

            <div style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              border: '2px dashed #fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.62rem',
              color: '#fbbf24',
              fontWeight: 800,
              textTransform: 'uppercase',
              textAlign: 'center',
              padding: '0.2rem'
            }}>
              OFFICIAL SEAL VERIFIED
            </div>

            <div className="signature-block">
              <span className="signature-img-font">Prof. Sunita Rao</span>
              <span className="signature-title">Dean of Student Welfare</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>University Board</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          This certificate is digitally verifiable on the campus intranet with credential code: {certCode}
        </div>
      </div>
    </div>
  );
}
