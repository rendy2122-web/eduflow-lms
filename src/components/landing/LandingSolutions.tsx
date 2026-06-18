'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';

const roleBenefits = {
  admin: {
    title: 'Solusi Manajemen Sekolah Terpusat',
    subtitle: 'Ambil kendali operasional sekolah dalam satu dasbor administratif modern.',
    features: [
      'Manajemen Data Akademik, Kelas, dan Staf secara real-time.',
      'Jurnal Kas Keuangan terpadu untuk pencatatan SPP, operasional, dan donasi.',
      'Absensi Guru & Karyawan anti-manipulatif dengan pelacakan server.',
      'Laporan analitik otomatis untuk pengambilan keputusan kepala sekolah.',
    ],
  },
  guru: {
    title: 'Kurangi Beban Kerja, Fokus Mengajar',
    subtitle: 'Digitalisasi administrasi kelas agar proses belajar mengajar lebih efisien.',
    features: [
      'LMS Mandiri untuk distribusi modul ajar (PDF, video, dan link).',
      'Pembuat tugas digital dengan deadline otomatis dan grading praktis.',
      'Pencatatan setoran hafalan Al-Qur\'an (Tahfidz) per murid terintegrasi.',
      'Rekap kehadiran siswa digital yang langsung tersinkronisasi.',
    ],
  },
  siswa: {
    title: 'Ruang Belajar Mandiri & Homeschooling',
    subtitle: 'Wadah belajar modern bagi murid reguler maupun homeschooling penuh.',
    features: [
      'Akses rencana belajar terstruktur (Milestones Path) yang self-paced.',
      'Fitur pengumpulan tugas/portofolio riil dengan drag-and-drop upload.',
      'Ruang chat konsultasi langsung dengan guru kelas & co-teacher.',
      'Laporan grafik progres akademik dan hafalan harian yang memotivasi.',
    ],
  },
  'orang-tua': {
    title: 'Kemitraan Pendidik yang Transparan',
    subtitle: 'Konsol Co-Teacher untuk memantau dan membimbing tumbuh kembang anak.',
    features: [
      'Jurnal Aktivitas Harian untuk homeschooling terpantau langsung oleh guru.',
      'Penilaian adab dan karakter harian anak dari rumah secara objektif.',
      'Akses instan ke nilai tugas, riwayat absensi, dan laporan akhir.',
      'Komunikasi interaktif dua arah tanpa hambatan dengan sekolah.',
    ],
  },
};

export default function LandingSolutions() {
  const [selectedRole, setSelectedRole] = useState('admin');

  const current = roleBenefits[selectedRole as keyof typeof roleBenefits];

  return (
    <section id="solusi" className="section section-solutions">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">SOLUSI PERAN</span>
          <h2 className="section-title">Platform Terintegrasi untuk Setiap Peran</h2>
          <p className="section-subtitle">
            EduFlow menjembatani kebutuhan administratif sekolah, proses mengajar guru, kemandirian siswa, dan pengawasan orang tua.
          </p>
        </div>

        <div className="solutions-layout">
          <div className="role-tabs">
            {Object.keys(roleBenefits).map((role) => (
              <button
                key={role}
                className={`role-tab ${selectedRole === role ? 'active' : ''}`}
                onClick={() => setSelectedRole(role)}
                aria-pressed={selectedRole === role}
              >
                <span className="role-tab-label">
                  {role === 'admin' && 'Administrator Sekolah'}
                  {role === 'guru' && 'Guru & Pendidik'}
                  {role === 'siswa' && 'Siswa & Pendidik Mandiri'}
                  {role === 'orang-tua' && 'Orang Tua / Co-Teacher'}
                </span>
                <span className="role-tab-desc">
                  {role === 'admin' && 'Kelola kas, staf, & perizinan'}
                  {role === 'guru' && 'LMS kelas & rekap Tahfidz'}
                  {role === 'siswa' && 'Milestones & kumpul tugas'}
                  {role === 'orang-tua' && 'Pantau harian & nilai adab'}
                </span>
              </button>
            ))}
          </div>

          <div className="solution-content">
            <div className="solution-title">{current.title}</div>
            <p className="solution-subtitle">{current.subtitle}</p>
            <ul className="solution-features">
              {current.features.map((feat, idx) => (
                <li key={idx}>
                  <div className="feature-icon">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <Link href="/login" className="solution-cta">
              Akses Portal Masuk <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}