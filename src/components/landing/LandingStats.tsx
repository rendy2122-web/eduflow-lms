'use client';

import React from 'react';

const stats = [
  { value: '500+', label: 'Sekolah Aktif', color: '#4f46e5' },
  { value: '75,000+', label: 'Siswa & Wali Murid', color: '#0d9488' },
  { value: '12,000+', label: 'Guru & Pendidik', color: '#6366f1' },
  { value: '99.4%', label: 'Kepuasan Pengguna', color: '#10b981' },
];

export default function LandingStats() {
  return (
    <section className="section section-stats">
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <span className="stat-value" style={{ color: stat.color }}>{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
