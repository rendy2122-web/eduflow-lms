'use client';

import React from 'react';
import Link from 'next/link';
import { School, BookOpen, Wallet, MessageSquare } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="brand">
              <div className="brand-icon">
                <School className="w-5 h-5 text-white" />
              </div>
              <span className="brand-text">EduFlow</span>
            </Link>
            <p className="footer-desc">
              Platform SaaS terintegrasi untuk mengelola sekolah reguler, kurikulum hybrid, dan pembelajaran homeschooling terpadu.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">FITUR</h4>
            <Link href="#fitur" className="footer-link">LMS Kelas</Link>
            <Link href="#fitur" className="footer-link">Keuangan Kas</Link>
            <Link href="#fitur" className="footer-link">Presensi Karyawan</Link>
            <Link href="#fitur" className="footer-link">Jurnal Tahfidz</Link>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">SOLUSI</h4>
            <Link href="#solusi" className="footer-link">Sekolah Reguler</Link>
            <Link href="#solusi" className="footer-link">Homeschooling</Link>
            <Link href="#solusi" className="footer-link">Mitra Pengajar</Link>
            <Link href="#solusi" className="footer-link">Yayasan Pendidikan</Link>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">KONTAK</h4>
            <span className="footer-text">support@eduflow.sch.id</span>
            <span className="footer-text">+62 812-3456-7890</span>
            <span className="footer-text">Jakarta, Indonesia</span>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} EduFlow LMS. Hak Cipta Dilindungi Undang-Undang.</span>
          <div className="footer-legal">
            <a href="mailto:support@eduflow.sch.id?subject=Kebijakan%20Privasi">Kebijakan Privasi</a>
            <a href="mailto:support@eduflow.sch.id?subject=Syarat%20%26%20Ketentuan">Syarat & Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
