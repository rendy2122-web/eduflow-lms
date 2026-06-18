'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface SubjectGrade {
  subjectName: string;
  average: number;
  count: number;
}

interface RaporData {
  studentInfo: {
    id: string;
    nama: string;
    email: string;
    class: string;
    nisn: string;
    catatanWali: string;
    schoolName?: string;
  };
  attendance: {
    rate: number;
    total: number;
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
  };
  averageGrade: number;
  subjectGrades: SubjectGrade[];
  tahfidz: Array<{
    date: string;
    surahName: string;
    range: string;
    status: string;
    notes: string;
  }>;
  habitSummary: {
    masjidPercentage: number;
    avgSunnahCount: number;
    totalLogs: number;
  };
}

export default function SiswaRaporPage() {
  const [raporData, setRaporData] = useState<RaporData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStudentRapor = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Get logged in student's ID first from dashboard API
      const profileRes = await fetch('/api/siswa/dashboard');
      const profileJson = await profileRes.json();
      
      if (profileJson.success && profileJson.studentInfo?.id) {
        const studentId = profileJson.studentInfo.id;
        
        // 2. Fetch report card details
        const raporRes = await fetch(`/api/guru/rapor?studentId=${studentId}`);
        const raporJson = await raporRes.json();
        
        if (raporJson.success) {
          setRaporData(raporJson);
        }
      }
    } catch (err) {
      console.error('Error fetching student report card:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentRapor();
  }, [fetchStudentRapor]);

  const handlePrint = () => {
    window.print();
  };

  const getPredicate = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    return 'D';
  };

  const getPredicateDesc = (score: number) => {
    if (score >= 90) return 'Sangat Baik';
    if (score >= 80) return 'Baik';
    if (score >= 70) return 'Cukup';
    return 'Kurang';
  };

  const formatIndonesianDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <DashboardLayout activeMenu="reports" pageTitle="Rapor Hasil Belajar Anda" pageSubtitle="Lihat nilai akademik, rekap ibadah harian, hafalan Quran, dan evaluasi wali kelas.">
      
      {/* Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scaleIn { from { transform: scale(0.97); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-scale-in { animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        
        /* PRINT STYLESHEET */
        @media print {
          body * {
            visibility: hidden;
            background: none !important;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      ` }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="no-print">
        
        {loading ? (
          <div style={{ padding: '64px', textAlign: 'center', color: '#64748b' }}>
            Memuat Rapor Hasil Belajar...
          </div>
        ) : raporData ? (
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handlePrint}
                type="button"
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Cetak Rapor Resmi 🖨️
              </button>
            </div>

            {/* Printable Sheet */}
            <div
              id="print-area"
              className="animate-scale-in"
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                borderRadius: '16px',
                padding: '50px',
                color: '#0f172a',
                fontFamily: 'serif',
                lineHeight: '1.5',
                boxSizing: 'border-box'
              }}
            >
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', borderBottom: '3px double #000000', paddingBottom: '16px' }}>
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Yayasan Pendidikan {raporData.studentInfo.schoolName || 'Eduflow Indonesia'}</h1>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'sans-serif', color: '#4f46e5' }}>{raporData.studentInfo.schoolName || 'Sekolah Dasar Islam Integral EduFlow'}</h2>
                <p style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'sans-serif', fontStyle: 'italic', color: '#64748b' }}>Jl. Tekno Kreatif No. 100, Wilayah {raporData.studentInfo.schoolName || 'EduFlow'} | Telp: (021) 777-8888</p>
              </div>

              {/* Title */}
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', textDecoration: 'underline' }}>LAPORAN HASIL BELAJAR PESERTA DIDIK (RAPOR)</h3>
                <span style={{ fontSize: '0.85rem' }}>Semester Genap - Tahun Ajaran 2025/2026</span>
              </div>

              {/* Metadata */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '0.9rem', fontFamily: 'sans-serif' }}>
                <table style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px 12px 4px 0', fontWeight: 'bold' }}>Nama Siswa</td>
                      <td style={{ padding: '4px 6px' }}>:</td>
                      <td style={{ padding: '4px 6px' }}>{raporData.studentInfo.nama}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 12px 4px 0', fontWeight: 'bold' }}>NISN</td>
                      <td style={{ padding: '4px 6px' }}>:</td>
                      <td style={{ padding: '4px 6px' }}>{raporData.studentInfo.nisn}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 12px 4px 0', fontWeight: 'bold' }}>Kelas</td>
                      <td style={{ padding: '4px 6px' }}>:</td>
                      <td style={{ padding: '4px 6px' }}>{raporData.studentInfo.class}</td>
                    </tr>
                  </tbody>
                </table>

                <table style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px 12px 4px 0', fontWeight: 'bold' }}>Tahun Ajaran</td>
                      <td style={{ padding: '4px 6px' }}>:</td>
                      <td style={{ padding: '4px 6px' }}>2025/2026</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 12px 4px 0', fontWeight: 'bold' }}>Semester</td>
                      <td style={{ padding: '4px 6px' }}>:</td>
                      <td style={{ padding: '4px 6px' }}>2 (Genap)</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 12px 4px 0', fontWeight: 'bold' }}>Wali Kelas</td>
                      <td style={{ padding: '4px 6px' }}>:</td>
                      <td style={{ padding: '4px 6px' }}>Ms. Sarah Jenkins, S.Pd</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section A: Academic */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 'bold', fontFamily: 'sans-serif', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '4px' }}>A. Nilai Pencapaian Akademik</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
                      <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', width: '40px' }}>No</th>
                      <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'left' }}>Mata Pelajaran</th>
                      <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', width: '80px' }}>Nilai Rata-rata</th>
                      <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', width: '80px' }}>Predikat</th>
                      <th style={{ padding: '8px', border: '1px solid #000', textAlign: 'left' }}>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {raporData.subjectGrades.map((grade, index) => (
                      <tr key={index}>
                        <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center' }}>{index + 1}</td>
                        <td style={{ padding: '8px', border: '1px solid #000' }}>{grade.subjectName}</td>
                        <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{grade.average}</td>
                        <td style={{ padding: '8px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{getPredicate(grade.average)}</td>
                        <td style={{ padding: '8px', border: '1px solid #000' }}>{getPredicateDesc(grade.average)} memenuhi kompetensi materi ajar.</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section B & C: Attendance & Habits */}
              <div className="grid-info-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '24px' }}>
                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 'bold', fontFamily: 'sans-serif', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '4px' }}>B. Rekapitulasi Kehadiran</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px 4px', border: '1px solid #000' }}>1. Hadir (Present)</td>
                        <td style={{ padding: '8px 4px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', width: '80px' }}>{raporData.attendance.hadir} Hari</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 4px', border: '1px solid #000' }}>2. Sakit (Sick Leave)</td>
                        <td style={{ padding: '8px 4px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{raporData.attendance.sakit} Hari</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 4px', border: '1px solid #000' }}>3. Izin (Excused)</td>
                        <td style={{ padding: '8px 4px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{raporData.attendance.izin} Hari</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 4px', border: '1px solid #000' }}>4. Tanpa Keterangan (Alpa)</td>
                        <td style={{ padding: '8px 4px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', color: raporData.attendance.alpa > 0 ? 'red' : 'inherit' }}>{raporData.attendance.alpa} Hari</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 'bold', fontFamily: 'sans-serif', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '4px' }}>C. Mutaba&apos;ah Yaumiyah</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px 4px', border: '1px solid #000' }}>1. Kepatuhan Shalat Berjamaah di Masjid</td>
                        <td style={{ padding: '8px 4px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', width: '80px', color: '#10b981' }}>{raporData.habitSummary.masjidPercentage}%</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 4px', border: '1px solid #000' }}>2. Rata-rata Amalan Sunnah Harian</td>
                        <td style={{ padding: '8px 4px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', color: '#4f46e5' }}>{raporData.habitSummary.avgSunnahCount} / 5</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 4px', border: '1px solid #000' }}>3. Total Hari Jurnal Terisi</td>
                        <td style={{ padding: '8px 4px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{raporData.habitSummary.totalLogs} Jurnal</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section D: Tahfidz */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 'bold', fontFamily: 'sans-serif', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '4px' }}>D. Perkembangan Hafalan Al-Qur&apos;an (Tahfidz)</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #000' }}>
                      <th style={{ padding: '6px 4px', border: '1px solid #000', textAlign: 'left' }}>Tanggal</th>
                      <th style={{ padding: '6px 4px', border: '1px solid #000', textAlign: 'left' }}>Surah / Ayat</th>
                      <th style={{ padding: '6px 4px', border: '1px solid #000', textAlign: 'center', width: '100px' }}>Kelancaran</th>
                      <th style={{ padding: '6px 4px', border: '1px solid #000', textAlign: 'left' }}>Catatan Penyimak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {raporData.tahfidz.slice(0, 3).map((record, index) => (
                      <tr key={index}>
                        <td style={{ padding: '6px 4px', border: '1px solid #000' }}>{record.date}</td>
                        <td style={{ padding: '6px 4px', border: '1px solid #000', fontWeight: 'bold' }}>{record.surahName} ({record.range})</td>
                        <td style={{ padding: '6px 4px', border: '1px solid #000', textAlign: 'center', textTransform: 'uppercase' }}>{record.status}</td>
                        <td style={{ padding: '6px 4px', border: '1px solid #000', fontStyle: 'italic' }}>{record.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section E: Catatan Wali */}
              <div style={{ marginBottom: '40px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 'bold', fontFamily: 'sans-serif', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '4px' }}>E. Catatan Perkembangan Wali Kelas</h4>
                <div style={{ border: '1px solid #000', borderRadius: '4px', padding: '16px', fontSize: '0.9rem', minHeight: '80px', fontStyle: 'italic', fontFamily: 'serif' }}>
                  {raporData.studentInfo.catatanWali ? raporData.studentInfo.catatanWali : 'Belum ada catatan wali kelas.'}
                </div>
              </div>

              {/* Signatures */}
              <div className="grid-info-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', textAlign: 'center', fontSize: '0.85rem', fontFamily: 'sans-serif', marginTop: '50px' }}>
                <div>
                  <p style={{ margin: '0 0 50px 0' }}>Orang Tua / Wali Murid</p>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>( .................................................... )</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 60px 0' }}>Mengetahui,<br/>Kepala Sekolah</p>
                  <p style={{ margin: 0, fontWeight: 'bold', textDecoration: 'underline' }}>Dr. H. Akhmad Fauzi, M.Pd</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 50px 0' }}>Jakarta, 12 Juni 2026<br/>Wali Kelas</p>
                  <p style={{ margin: 0, fontWeight: 'bold', textDecoration: 'underline' }}>Sarah Jenkins, S.Pd</p>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div style={{ padding: '64px', textAlign: 'center', color: '#64748b' }}>
            Data Rapor Hasil Belajar Anda tidak ditemukan.
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
