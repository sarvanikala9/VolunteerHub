import React, { useState } from 'react';
import { Trophy, Medal, Search, Flame, Award, Star, ShieldCheck, Heart } from 'lucide-react';

export default function LeaderboardView({ volunteers }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('hours'); // 'hours', 'karma'

  let list = [...volunteers];
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(v =>
      v.name.toLowerCase().includes(s) ||
      v.rollNumber.toLowerCase().includes(s) ||
      v.department.toLowerCase().includes(s)
    );
  }

  if (sortBy === 'hours') {
    list.sort((a, b) => b.totalHours - a.totalHours || b.karmaPoints - a.karmaPoints);
  } else {
    list.sort((a, b) => b.karmaPoints - a.karmaPoints);
  }

  const top3 = list.slice(0, 3);
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  const getTier = (hours) => {
    if (hours >= 45) return { name: 'Platinum Luminary', color: '#c084fc', border: 'rgba(192, 132, 252, 0.4)' };
    if (hours >= 30) return { name: 'Gold Champion', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.4)' };
    if (hours >= 20) return { name: 'Silver Hero', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.4)' };
    return { name: 'Bronze Contributor', color: '#d97706', border: 'rgba(217, 119, 6, 0.4)' };
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">
            Campus Volunteer Honor Roll
          </h2>
          <p className="section-subtitle">
            Celebrating the students dedicating the most hours of public service and civic contribution across all college departments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sort by:</span>
          <select 
            className="form-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ width: 'auto', padding: '0.45rem 1rem' }}
          >
            <option value="hours">Most Hours Served</option>
            <option value="karma">Highest Karma Score</option>
          </select>
        </div>
      </div>

      {/* TOP 3 PODIUM */}
      {top3.length >= 3 && !search && (
        <div className="podium-container">
          {/* #2 Rank */}
          {second && (
            <div className="podium-col podium-2">
              <div className="podium-avatar-wrap">
                <img src={second.avatar} alt={second.name} className="podium-avatar" />
                <div className="rank-badge">2</div>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', textAlign: 'center' }}>
                {second.name.split(' ')[0]}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                {second.totalHours} Hours
              </div>
              <div className="podium-pillar">
                <Medal size={28} color="#94a3b8" />
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700, marginTop: '0.25rem' }}>
                  2nd Rank
                </span>
              </div>
            </div>
          )}

          {/* #1 Rank */}
          {first && (
            <div className="podium-col podium-1">
              <div className="podium-avatar-wrap">
                <img src={first.avatar} alt={first.name} className="podium-avatar" />
                <div className="rank-badge">1</div>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24', textAlign: 'center' }}>
                {first.name.split(' ')[0]}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#fde68a', fontWeight: 700 }}>
                {first.totalHours} Hours
              </div>
              <div className="podium-pillar">
                <Trophy size={34} color="#fbbf24" />
                <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 800, marginTop: '0.25rem' }}>
                  Top Volunteer
                </span>
              </div>
            </div>
          )}

          {/* #3 Rank */}
          {third && (
            <div className="podium-col podium-3">
              <div className="podium-avatar-wrap">
                <img src={third.avatar} alt={third.name} className="podium-avatar" />
                <div className="rank-badge">3</div>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', textAlign: 'center' }}>
                {third.name.split(' ')[0]}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>
                {third.totalHours} Hours
              </div>
              <div className="podium-pillar">
                <Medal size={24} color="#d97706" />
                <span style={{ fontSize: '0.72rem', color: '#fde68a', fontWeight: 700, marginTop: '0.25rem' }}>
                  3rd Rank
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter / Search Bar */}
      <div style={{ marginBottom: '1.25rem', maxWidth: '400px' }}>
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            className="search-input"
            placeholder="Search by student name, roll number, or branch..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="table-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Rank</th>
              <th>Student Volunteer</th>
              <th>Branch / Roll</th>
              <th>Service Tier</th>
              <th>Service Hours</th>
              <th>Karma Points</th>
              <th>Badges</th>
            </tr>
          </thead>
          <tbody>
            {list.map((vol, index) => {
              const tier = getTier(vol.totalHours);
              return (
                <tr key={vol._id || vol.rollNumber}>
                  <td>
                    <div style={{
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#d97706' : 'var(--text-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      {index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img 
                        src={vol.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                        alt={vol.name} 
                        style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{vol.name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{vol.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ color: '#cbd5e1', fontWeight: 600 }}>{vol.department}</div>
                    <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>{vol.rollNumber}</div>
                  </td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${tier.border}`,
                      color: tier.color
                    }}>
                      {tier.name}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: '#34d399', fontSize: '1.05rem' }}>
                      {vol.totalHours} hrs
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Flame size={14} />
                      {vol.karmaPoints}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {vol.badges?.slice(0, 3).map((b, i) => (
                        <span key={i} title={b.name} style={{ fontSize: '1.1rem' }}>
                          {b.icon}
                        </span>
                      ))}
                      {(vol.badges?.length || 0) > 3 && (
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', alignSelf: 'center' }}>
                          +{vol.badges.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
