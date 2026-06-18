'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Wallet, Award, MessageSquare, Activity, Heart } from 'lucide-react';

const featureCards = [
  {
    icon: <BookOpen className="w-6 h-6" style={{ color: '#6366f1' }} />,
    title: 'LMS & Modul Digital',
    desc: 'Kelola kelas online, bagikan modul materi ajar (PDF/Video), dan beri penugasan interaktif dalam hitungan detik.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop',
    color: '#6366f1',
  },
  {
    icon: <Activity className="w-6 h-6" style={{ color: '#0d9488' }} />,
    title: 'Absensi Anti-Manipulatif',
    desc: 'Pencatatan kehadiran guru dan siswa terintegrasi langsung dengan timestamp server untuk validitas data.',
    image: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=600&h=400&fit=crop',
    color: '#0d9488',
  },
  {
    icon: <Wallet className="w-6 h-6" style={{ color: '#10b981' }} />,
    title: 'Jurnal Kas Keuangan',
    desc: 'Sistem keuangan transparan untuk pembukuan SPP masuk, donasi, pengeluaran operasional, dan laporan rugi laba.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop',
    color: '#10b981',
  },
  {
    icon: <Award className="w-6 h-6" style={{ color: '#3b82f6' }} />,
    title: 'Tahfidz & Hafalan Qur\'an',
    desc: 'Catat progres hafalan surah, ayat, kelancaran tajwid, dan status kelulusan juz secara terstruktur.',
    image: 'https://images.unsplash.com/photo-1609599006353-e629f1dca0a9?w=600&h=400&fit=crop',
    color: '#3b82f6',
  },
  {
    icon: <MessageSquare className="w-6 h-6" style={{ color: '#8b5cf6' }} />,
    title: 'Jalur Belajar Homeschooling',
    desc: 'Dukungan penuh kurikulum mandiri dengan milestone dinamis yang memandu kemajuan siswa secara fleksibel.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop',
    color: '#8b5cf6',
  },
  {
    icon: <Heart className="w-6 h-6" style={{ color: '#f43f5e' }} />,
    title: 'Konsol Orang Tua (Co-Teacher)',
    desc: 'Wadah bagi wali murid untuk melaporkan adab harian anak dan berkolaborasi langsung dengan guru sekolah.',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&h=400&fit=crop',
    color: '#f43f5e',
  },
];

export default function LandingFeatures() {
  const [filter, setFilter] = useState<'all' | 'admin' | 'guru' | 'siswa' | 'orang-tua'>('all');

  const filtered = filter === 'all' ? featureCards : featureCards;

  return (
    <section id="fitur" className="section section-features">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">FITUR UNGGULAN</span>
          <h2 className="section-title">Platform Terintegrasi untuk Setiap Peran</h2>
          <p className="section-subtitle">
            EduFlow menjembatani kebutuhan administratif sekolah, proses mengajar guru, kemandirian siswa, dan pengawasan orang tua.
          </p>
        </div>

        <div className="feature-filter" role="tablist" aria-label="Filter fitur per peran">
          {(['all', 'admin', 'guru', 'siswa', 'orang-tua'] as const).map((role) => (
            <button
              key={role}
              role="tab"
              aria-selected={filter === role}
              className={`filter-btn ${filter === role ? 'active' : ''}`}
              onClick={() => setFilter(role)}
            >
              {role === 'all' ? 'Semua' : role === 'orang-tua' ? 'Orang Tua' : role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>

        <div className="feature-cards-grid">
          {filtered.map((card, idx) => (
            <article key={idx} className="feature-card">
              <div className="feature-card-inner">
                <div className="feature-icon" style={{ backgroundColor: `${card.color}10`, color: card.color }}>
                  {card.icon}
                </div>
                <div className="feature-image-wrap">
                  <img src={card.image} alt={card.title} className="feature-image" loading="lazy" />
                </div>
                <h3 className="feature-title">{card.title}</h3>
                <p className="feature-desc">{card.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
