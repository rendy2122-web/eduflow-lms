'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 'Rp 499.000',
    yearlyPrice: 'Rp 4.790.000',
    period: 'per bulan / sekolah',
    yearlyPeriod: 'per tahun / sekolah (hemat 20%)',
    desc: 'Sempurna untuk sekolah kecil atau yayasan baru yang ingin mendigitalisasi kas & presensi.',
    features: [
      'Manajemen s.d. 150 Siswa',
      'Presensi Digital Staf & Murid',
      'Jurnal Kas Keuangan Dasar',
      'Laporan Bulanan Otomatis',
      'Support via Email & Chat',
    ],
    cta: 'Coba Gratis 7 Hari',
    popular: false,
  },
  {
    name: 'Professional',
    price: 'Rp 999.000',
    yearlyPrice: 'Rp 9.590.000',
    period: 'per bulan / sekolah',
    yearlyPeriod: 'per tahun / sekolah (hemat 20%)',
    desc: 'Solusi lengkap terintegrasi untuk sekolah reguler yang membutuhkan LMS & tracking Tahfidz.',
    features: [
      'Siswa & Kelas Tanpa Batas',
      'Sistem LMS & Pengumpulan Tugas',
      'Modul Catatan Hafalan Tahfidz',
      'Grafik Kas & Keuangan Lanjutan',
      'Akses Akun Guru & Staf Tanpa Batas',
      'Support Prioritas WA 24/7',
    ],
    cta: 'Mulai Uji Coba Pro',
    popular: true,
  },
  {
    name: 'Hybrid & Homeschool',
    price: 'Rp 1.499.000',
    yearlyPrice: 'Rp 14.390.000',
    period: 'per bulan / sekolah',
    yearlyPeriod: 'per tahun / sekolah (hemat 20%)',
    desc: 'Paket terlengkap khusus sekolah modern dengan kurikulum hybrid dan homeschooling terpandu.',
    features: [
      'Semua Fitur Paket Professional',
      'Portal Co-Teacher Orang Tua',
      'Form Jurnal & Penilaian Adab Murid',
      'Milestone Path Belajar Mandiri',
      'Konsultasi Chat Guru & Parent',
      'Domain Kustom Sekolah (sch.id)',
      'Pelatihan Staf Pendampingan Penuh',
    ],
    cta: 'Hubungi Tim Penjualan',
    popular: false,
  },
];

export default function LandingPricing() {
  return (
    <section id="pricing" className="section section-pricing">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">HARGA</span>
          <h2 className="section-title">Investasi Transparan untuk Sekolah Anda</h2>
          <p className="section-subtitle">
            Pilih paket langganan yang sesuai dengan skala operasional dan metode pembelajaran sekolah Anda.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, idx) => (
            <div key={idx} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="pricing-badge">REKOMENDASI</div>}
              <h3 className="pricing-name">{plan.name}</h3>
              <p className="pricing-desc">{plan.desc}</p>
              <div className="pricing-price">
                <span className="price">{plan.price}</span>
                <span className="period">{plan.period}</span>
              </div>
              <Link href="/login" className={`pricing-cta ${plan.popular ? 'primary' : 'secondary'}`}>
                {plan.cta}
              </Link>
              <ul className="pricing-features">
                {plan.features.map((feat, i) => (
                  <li key={i}>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
