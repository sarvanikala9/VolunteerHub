import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  BookOpen, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  HeartHandshake, 
  GraduationCap, 
  Award,
  AlertCircle,
  CheckCircle,
  Database,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';

const DEPARTMENTS = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Electronics & Communication Engineering (ECE)',
  'Artificial Intelligence & Machine Learning (AIML)',
  'Artificial Intelligence & Data Science (AIDS)',
  'Electrical & Electronics Engineering (EEE)',
  'Mechanical Engineering (ME)',
  'Basic Science & Humanities'
];

const YEARS = [
  '1st Year B.Tech',
  '2nd Year B.Tech',
  '3rd Year B.Tech',
  '4th Year B.Tech'
];

const SKILL_OPTIONS = [
  'Community Outreach',
  'Blood Donation Support',
  'Tree Planting & Environment',
  'School Teaching & Mentoring',
  'First Aid & Health',
  'Event Coordination & Anchoring',
  'Photography & Media',
  'Animal Welfare'
];

export default function RegisterPage({ onRegisterSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Computer Science & Engineering (CSE)',
    year: '2nd Year B.Tech',
    phone: '',
    role: 'student', // 'student' | 'coordinator'
    skills: ['Community Outreach', 'Tree Planting & Environment'],
    bio: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSkillToggle = (skill) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      if (exists) {
        return { ...prev, skills: prev.skills.filter((s) => s !== skill) };
      } else {
        return { ...prev, skills: [...prev.skills, skill] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validations
    if (!formData.name.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!formData.rollNumber.trim()) {
      setErrorMsg('College Roll Number is required (e.g. 22B01A0501 or CS22B045).');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('A valid college email address is required.');
      return;
    }
    if (!formData.password) {
      setErrorMsg('Password is required.');
      return;
    }
    if (formData.password.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        rollNumber: formData.rollNumber.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        department: formData.department,
        year: formData.year,
        phone: formData.phone.trim(),
        role: formData.role,
        skills: formData.skills,
        bio: formData.bio.trim() || `Student volunteer at Shri Vishnu Engineering College for Women (SVECW), ${formData.department}.`
      };

      // Call API to persist in database (MongoDB or server/data/store.json)
      const res = await api.register(payload);

      if (res && res.success) {
        setSuccessMsg(`Registration successful in SVECW DB! Welcome, ${res.user.name}.`);

        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (err) {}

        setTimeout(() => {
          onRegisterSuccess(res.user, true);
        }, 800);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg(err.message || 'Failed to register account in database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-viewport">
      {/* Ambient background with Vishnu colors */}
      <div className="login-aurora-bg">
        <div className="aurora-orb aurora-orb-orange"></div>
        <div className="aurora-orb aurora-orb-purple"></div>
        <div className="aurora-orb aurora-orb-green"></div>
      </div>

      <div className="login-container" style={{ maxWidth: '640px' }}>
        <div className="login-card" style={{ padding: '2.5rem 2.25rem' }}>
          {/* Header */}
          <div className="login-header" style={{ marginBottom: '1.5rem' }}>
            <div className="svecw-logo-wrapper" title="Vishnu Universal Learning">
              <img 
                src="/svecw-logo.jpg" 
                alt="Vishnu Universal Learning - SVECW Logo" 
                className="svecw-logo-image" 
              />
            </div>

            <div className="svecw-badge">
              <Database size={13} className="svecw-badge-icon" />
              <span>STUDENT REGISTRATION • DATABASE STORED</span>
            </div>

            <h1 className="svecw-main-title" style={{ fontSize: '2.4rem' }}>SVECW</h1>
            <h2 className="svecw-sub-title">SHRI VISHNU ENGINEERING COLLEGE FOR WOMEN</h2>
            <p className="svecw-accreditation">
              Autonomous • NAAC 'A+' Grade • NBA Accredited • Bhimavaram
            </p>

            <div className="portal-tagline">
              <HeartHandshake size={15} />
              <span>Join VolunteerHub • Create Verified Student Profile</span>
            </div>
          </div>

          {/* Role Selector Tabs */}
          <div className="role-tabs" style={{ marginBottom: '1.5rem' }}>
            <button
              type="button"
              className={`role-tab ${formData.role === 'student' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'student' })}
            >
              <GraduationCap size={16} />
              Student Volunteer
            </button>
            <button
              type="button"
              className={`role-tab ${formData.role === 'coordinator' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, role: 'coordinator' })}
            >
              <ShieldCheck size={16} />
              Club Coordinator / Lead
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="login-error-alert" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.86rem',
              marginBottom: '1.25rem'
            }}>
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">
                  Full Name *
                </label>
                <div className="input-field-wrapper">
                  <User size={18} className="field-icon" />
                  <input
                    id="reg-name"
                    type="text"
                    className="login-input"
                    placeholder="e.g. Sai Pranathi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* College Roll Number */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-roll">
                  College Roll Number *
                </label>
                <div className="input-field-wrapper">
                  <Award size={18} className="field-icon" />
                  <input
                    id="reg-roll"
                    type="text"
                    className="login-input"
                    placeholder="e.g. 22B01A0501 or CS22B045"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  College Email *
                </label>
                <div className="input-field-wrapper">
                  <Mail size={18} className="field-icon" />
                  <input
                    id="reg-email"
                    type="email"
                    className="login-input"
                    placeholder="e.g. rollno@svecw.edu.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">
                  Phone Number
                </label>
                <div className="input-field-wrapper">
                  <Phone size={18} className="field-icon" />
                  <input
                    id="reg-phone"
                    type="tel"
                    className="login-input"
                    placeholder="+91 98450 12345"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* Department */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-dept">
                  Department / Branch *
                </label>
                <div className="input-field-wrapper">
                  <BookOpen size={18} className="field-icon" />
                  <select
                    id="reg-dept"
                    className="login-input"
                    style={{ paddingLeft: '2.75rem', appearance: 'auto', background: '#0f172a' }}
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Year */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-year">
                  Year of Study *
                </label>
                <div className="input-field-wrapper">
                  <Calendar size={18} className="field-icon" />
                  <select
                    id="reg-year"
                    className="login-input"
                    style={{ paddingLeft: '2.75rem', appearance: 'auto', background: '#0f172a' }}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {/* Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  Password *
                </label>
                <div className="input-field-wrapper">
                  <Lock size={18} className="field-icon" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className="login-input"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="eye-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm-password">
                  Confirm Password *
                </label>
                <div className="input-field-wrapper">
                  <Lock size={18} className="field-icon" />
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="login-input"
                    placeholder="Repeat your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="eye-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Volunteer Interests / Skills selection */}
            <div className="form-group">
              <label className="form-label">
                Volunteer Interests & Skills (Click to choose)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.25rem' }}>
                {SKILL_OPTIONS.map((skill) => {
                  const isChecked = formData.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        border: isChecked ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                        background: isChecked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                        color: isChecked ? '#34d399' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary login-submit-btn"
              disabled={loading}
              style={{ marginTop: '0.75rem' }}
            >
              {loading ? (
                <div className="btn-spinner"></div>
              ) : (
                <>
                  <Database size={18} />
                  <span>Register & Save Profile to Database</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Back to Login link */}
            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Already registered with SVECW?{' '}
              </span>
              <button
                type="button"
                className="link-btn-text"
                style={{ fontSize: '0.88rem', fontWeight: 700 }}
                onClick={onSwitchToLogin}
              >
                Sign In to your account
              </button>
            </div>
          </form>

          {/* Footer Accreditations */}
          <div className="login-footer">
            <div className="footer-badges">
              <span>🏛️ Sri Vishnu Educational Society</span>
              <span>⭐ NAAC 'A+' Grade</span>
              <span>🎓 JNTUK Autonomous</span>
            </div>
            <p className="footer-copyright">
              © {new Date().getFullYear()} Shri Vishnu Engineering College for Women (SVECW), Bhimavaram. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
