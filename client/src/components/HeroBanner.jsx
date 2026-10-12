import React from 'react';
import { Sparkles, Clock, Users, Calendar, Trees, HeartHandshake, ArrowRight, ShieldCheck } from 'lucide-react';

export default function HeroBanner({ stats, onExploreClick, onHostClick }) {
  return (
    <section className="hero-section">
      <div className="hero-glow-1"></div>
      <div className="hero-glow-2"></div>

      <div className="hero-content">
        <div className="hero-pill">
          <Sparkles size={14} />
          <span>Official University Social Impact Platform</span>
        </div>

        <h1 className="hero-title">
          Empowering Campus Youth to <span className="gradient-text">Lead, Serve & Transform</span> Communities
        </h1>

        <p className="hero-desc">
          Discover verified university volunteering drives, blood donation camps, environmental cleanups, and educational mentoring programs. Track your verified service hours, earn credit badges, and download verifiable university certificates of appreciation.
        </p>

        <div className="hero-cta-group">
          <button className="btn btn-primary" onClick={onExploreClick}>
            <HeartHandshake size={18} />
            Explore Volunteer Drives
            <ArrowRight size={16} />
          </button>

          <button className="btn btn-secondary" onClick={onHostClick}>
            <ShieldCheck size={18} />
            Host Event as Club Coordinator
          </button>
        </div>
      </div>

      {/* Live Impact Counters */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-box stat-icon-emerald">
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">{stats?.totalHoursServed || 177}+</div>
            <div className="stat-label">Service Hours Logged</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box stat-icon-indigo">
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{stats?.totalVolunteers || 6}+</div>
            <div className="stat-label">Registered Student Volunteers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box stat-icon-amber">
            <Calendar size={24} />
          </div>
          <div>
            <div className="stat-value">{stats?.totalEvents || 8}</div>
            <div className="stat-label">Campus Outreach Drives</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box stat-icon-cyan">
            <Trees size={24} />
          </div>
          <div>
            <div className="stat-value">{stats?.treesPlanted || 1250}+</div>
            <div className="stat-label">Saplings Planted & Nurtured</div>
          </div>
        </div>
      </div>
    </section>
  );
}
