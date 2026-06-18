'use client';

import React, { useState } from 'react';

const faqs = [
  {
    q: 'Bagaimana proses migrasi data dari Excel atau sistem lama?',
    a: 'Sangat mudah! Tim onboarding kami siap membantu memindahkan seluruh data siswa, guru, dan inventaris sekolah Anda dari file Excel secara gratis. Proses ini biasanya selesai dalam waktu kurang dari 48 jam.',
  },
  {
    q: 'Apakah wali murid harus membayar akun Orang Tua?',
    a: 'Tidak. Akun Orang Tua (Wali Murid / Co-Teacher) disediakan secara gratis dan terintegrasi penuh dalam paket langganan bulanan sekolah Anda.',
  },
  {
    q: 'Bagaimana EduFlow mendukung kurikulum homeschooling?',
    a: 'EduFlow menyediakan modul khusus rencana belajar terbimbing (Self-Paced Milestones). Orang tua dapat bertindak sebagai mitra pengajar (Co-Teacher) yang mengirimkan laporan portofolio harian dan memberikan penilaian karakter anak yang tersambung langsung dengan guru pengawas dari sekolah.',
  },
  {
    q: 'Apakah data keuangan dan akademik sekolah kami aman?',
    a: 'Keamanan data adalah prioritas utama kami. Seluruh database EduFlow dienkripsi menggunakan protokol SSL/TLS standar industri dan dicadangkan secara harian di server cloud terpercaya untuk mencegah kehilangan data.',
  },
  {
    q: 'Dapatkah kami membatalkan langganan kapan saja?',
    a: 'Tentu. Layanan EduFlow bersifat bulanan tanpa kontrak yang mengikat. Anda dapat melakukan downgrade, upgrade, atau membatalkan langganan kapan saja tanpa dikenakan biaya penalti.',
  },
];

export default function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="section section-faq">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="section-header">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">Pertanyaan yang Sering Diajukan</h2>
          <p className="section-subtitle">
            Semua yang perlu Anda ketahui tentang sistem berlangganan, fitur, dan onboarding EduFlow.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <div key={idx} className={`faq-item ${openIndex === idx ? 'open' : ''}`}>
              <button
                className="faq-question"
                onClick={() => toggle(idx)}
                aria-expanded={openIndex === idx}
              >
                <span>{faq.q}</span>
                <span className="faq-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
              </button>
              <div className="faq-answer" aria-hidden={openIndex !== idx}>
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
