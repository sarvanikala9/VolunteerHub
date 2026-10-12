import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  HeartHandshake, 
  GraduationCap, 
  CheckCircle2, 
  HelpCircle,
  Award,
  AlertCircle,
  UserPlus,
  LogIn
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';
import RegisterPage from './RegisterPage';

export default function LoginPage({ onLoginSuccess, availableUsers = [] }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [roleTab, setRoleTab] = useState('student'); // 'student' | 'coordinator'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // If user switched to Register mode, render the dedicated Register Page
  if (authMode === 'register') {
    return (
      <RegisterPage 
        onRegisterSuccess={onLoginSuccess}
        onSwitchToLogin={() => {
          setAuthMode('login');
          setErrorMsg('');
        }}
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Please enter your SVECW Username or College Roll Number.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      // Authenticate via database
      let authenticatedUser = null;
      try {
        const authRes = await api.login(username.trim(), password.trim(), roleTab);
        if (authRes && authRes.user) {
          authenticatedUser = authRes.user;
        }
      } catch (apiErr) {
        // Fallback local match
        const cleanUser = username.trim().toUpperCase();
        authenticatedUser = availableUsers.find(
          (v) =>
            v.rollNumber?.toUpperCase() === cleanUser ||
            v.email?.toUpperCase() === cleanUser ||
            v.name?.toUpperCase() === cleanUser
        );
        if (!authenticatedUser) {
          throw apiErr;
        }
      }

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      onLoginSuccess(authenticatedUser, rememberMe);
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-viewport">
      {/* Dynamic Aurora Ambient Background */}
      <div className="login-aurora-bg">
        <div className="aurora-orb aurora-orb-orange"></div>
        <div className="aurora-orb aurora-orb-purple"></div>
        <div className="aurora-orb aurora-orb-green"></div>
      </div>

      <div className="login-container">
        {/* Main Glass Card */}
        <div className="login-card">
          {/* Logo & College Header */}
          <div className="login-header">
            {/* Official Vishnu Logo Box */}
            <div className="svecw-logo-wrapper" title="Vishnu Universal Learning">
              <img 
                src="/svecw-logo.jpg" 
                alt="Vishnu Universal Learning - SVECW Logo" 
                className="svecw-logo-image" 
              />
            </div>

            {/* SVECW Title and Badge */}
            <div className="svecw-badge">
              <Sparkles size={14} className="svecw-badge-icon" />
              <span>OFFICIAL VOLUNTEER PORTAL</span>
            </div>

            <h1 className="svecw-main-title">SVECW</h1>
            <h2 className="svecw-sub-title">SHRI VISHNU ENGINEERING COLLEGE FOR WOMEN</h2>
            <p className="svecw-accreditation">
              Autonomous • NAAC 'A+' Grade • NBA Accredited • Bhimavaram
            </p>

            <div className="portal-tagline">
              <HeartHandshake size={16} />
              <span>VolunteerHub — Campus Impact & Community Service</span>
            </div>
          </div>

          {/* Auth Mode Switcher: Sign In vs New Registration */}
          <div className="role-tabs" style={{ marginBottom: '1.25rem', background: 'rgba(15, 23, 42, 0.95)' }}>
            <button
              type="button"
              className={`role-tab ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
            >
              <LogIn size={15} />
              Sign In
            </button>
            <button
              type="button"
              className={`role-tab ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
            >
              <UserPlus size={15} />
              New Student Registration
            </button>
          </div>

          {/* Role Tabs */}
          <div className="role-tabs">
            <button
              type="button"
              className={`role-tab ${roleTab === 'student' ? 'active' : ''}`}
              onClick={() => {
                setRoleTab('student');
                if (username === 'FAC-NSS01' || username === 'ME21B088') setUsername('24B01A1288');
              }}
            >
              <GraduationCap size={16} />
              Student Volunteer (Women)
            </button>
            <button
              type="button"
              className={`role-tab ${roleTab === 'coordinator' ? 'active' : ''}`}
              onClick={() => {
                setRoleTab('coordinator');
                setUsername('FAC-NSS01');
              }}
            >
              <ShieldCheck size={16} />
              Faculty Coordinator / Lead
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="login-error-alert">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="svecw-username">
                College Roll Number / Username
              </label>
              <div className="input-field-wrapper">
                <User size={18} className="field-icon" />
                <input
                  id="svecw-username"
                  type="text"
                  className="login-input"
                  placeholder="e.g. 24B01A1288, 21B01A0588, or FAC-NSS01"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <span className="field-helper-hint">
                Use your official SVECW Roll No or Portal Username
              </span>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" htmlFor="svecw-password" style={{ marginBottom: 0 }}>
                  Password
                </label>
                <button
                  type="button"
                  className="link-btn-text"
                  onClick={() => setShowHelpModal(true)}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-field-wrapper">
                <Lock size={18} className="field-icon" />
                <input
                  id="svecw-password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Enter your college password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="eye-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember & Help row */}
            <div className="form-options-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me on this device</span>
              </label>

              <span className="badge-demo-key">Default: svecw@2026</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary login-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <div className="btn-spinner"></div>
              ) : (
                <>
                  <span>Sign In to SVECW VolunteerHub</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Switch to Register Page */}
            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                New student to SVECW VolunteerHub?{' '}
              </span>
              <button
                type="button"
                className="link-btn-text"
                style={{ fontSize: '0.88rem', fontWeight: 700 }}
                onClick={() => {
                  setAuthMode('register');
                  setErrorMsg('');
                }}
              >
                Create Account & Register (Saves to DB)
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

      {/* Forgot Password / Help Modal */}
      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <HelpCircle size={22} style={{ color: '#fbbf24' }} />
              <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>SVECW Student Portal Help</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.2rem' }}>
              For student credentials assistance or password reset on the SVECW VolunteerHub platform:
            </p>
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem',
              fontSize: '0.86rem',
              color: '#e2e8f0'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Demo Password:</strong> <code style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>svecw@2026</code>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Student Support:</strong> studentaffairs@svecw.edu.in
              </div>
              <div>
                <strong>NSS Office:</strong> Main Admin Block, SVECW Campus, Bhimavaram
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => setShowHelpModal(false)}
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
