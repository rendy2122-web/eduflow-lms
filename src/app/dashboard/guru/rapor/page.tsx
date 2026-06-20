'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { exportToCSV, exportToExcel } from '@/utils/export';

interface ClassItem {
  id: string;
  name: string;
}

interface StudentItem {
  id: string;
  name: string;
  nisn: string;
}

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

export default function GuruRaporPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [activeClassId, setActiveClassId] = useState('');
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [raporData, setRaporData] = useState<RaporData | null>(null);
  const [catatanWaliInput, setCatatanWaliInput] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingRapor, setLoadingRapor] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Fetch classes & student list
  const fetchStudentList = useCallback(async () => {
    try {
      setLoadingList(true);
      const res = await fetch(`/api/guru/habit?classId=${activeClassId}`);
      const json = await res.json();
      if (json.success) {
        setClasses(json.classes || []);
        if (json.activeClassId && !activeClassId) {
          setActiveClassId(json.activeClassId);
        }
        
        // Extract students list
        const rosterStudents = (json.roster || []).map((student: any) => ({
          id: student.id,
          name: student.name,
          nisn: student.nisn
        }));
        
        setStudents(rosterStudents);
        
        if (rosterStudents.length > 0) {
          // Select first student if none selected or if selected student no longer in list
          if (!selectedStudentId || !rosterStudents.some((s: any) => s.id === selectedStudentId)) {
            setSelectedStudentId(rosterStudents[0].id);
          }
        } else {
          setSelectedStudentId('');
          setRaporData(null);
        }
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoadingList(false);
    }
  }, [activeClassId, selectedStudentId]);

  useEffect(() => {
    fetchStudentList();
  }, [activeClassId]);

  // Fetch report card data for selected student
  const fetchRapor = useCallback(async () => {
    if (!selectedStudentId) return;

    try {
      setLoadingRapor(true);
      const res = await fetch(`/api/guru/rapor?studentId=${selectedStudentId}`);
      const json = await res.json();
      if (json.success) {
        setRaporData(json);
        setCatatanWaliInput(json.studentInfo.catatanWali || '');
      } else {
        setRaporData(null);
      }
    } catch (err) {
      console.error('Error fetching report card details:', err);
    } finally {
      setLoadingRapor(false);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    fetchRapor();
  }, [selectedStudentId, fetchRapor]);

  // Save notes to database
  const handleSaveNotes = async () => {
    if (!selectedStudentId) return;

    try {
      setSavingNotes(true);
      const res = await fetch('/api/guru/rapor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentId,
          catatanWali: catatanWaliInput
        })
      });

      const json = await res.json();
      if (json.success) {
        setMessage('Catatan wali kelas berhasil disimpan! 💾');
        // Refresh local data
        if (raporData) {
          setRaporData({
            ...raporData,
            studentInfo: {
              ...raporData.studentInfo,
              catatanWali: catatanWaliInput
            }
          });
        }
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage(`Gagal menyimpan: ${json.error}`);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleClassRecapExport = async (format: 'excel' | 'csv') => {
    if (!activeClassId) return;
    try {
      const res = await fetch(`/api/guru/rapor/class?classId=${activeClassId}`);
      const data = await res.json();
      if (data.success && data.students) {
        const className = data.className || 'Kelas';
        const cleanClassName = className.replace(/\s+/g, '_');
        const filename = `Rekap_Nilai_${cleanClassName}_${new Date().toISOString().split('T')[0]}`;

        // Headers: No, Nama Siswa, NISN, [Subjects], Rata-rata Kelas, Predikat Kelulusan
        const headers = ['No', 'Nama Siswa', 'NISN', ...data.subjects, 'Rata-rata Kelas', 'Predikat Kelulusan'];

        const rows = data.students.map((student: any, idx: number) => {
          const subjectCols = data.subjects.map((subject: string) => student.subjectGrades[subject] || 0);
          return [
            idx + 1,
            student.name,
            student.nisn,
            ...subjectCols,
            student.averageGrade,
            getPredicate(student.averageGrade)
          ];
        });

        if (format === 'csv') {
          exportToCSV(`${filename}.csv`, headers, rows);
        } else {
          exportToExcel(`${filename}.xls`, 'Rekap Nilai Kelas', headers, rows);
        }
      }
    } catch (err) {
      console.error('Failed to export class grades recap:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = (format: 'excel' | 'csv') => {
    if (!raporData) return;

    const studentName = raporData.studentInfo.nama;
    const cleanStudentName = studentName.replace(/\s+/g, '_');
    const filename = `Rapor_${cleanStudentName}_Kelas_${raporData.studentInfo.class.replace(/\s+/g, '_')}`;

    const headers = ['Kategori', 'Detail / Mata Pelajaran', 'Nilai / Rekap', 'Predikat / Info', 'Deskripsi'];
    
    const rows: any[][] = [
      // Identitas
      ['Identitas', 'Nama Siswa', raporData.studentInfo.nama, '', ''],
      ['Identitas', 'NISN', raporData.studentInfo.nisn, '', ''],
      ['Identitas', 'Kelas', raporData.studentInfo.class, '', ''],
      ['Identitas', 'Email', raporData.studentInfo.email, '', ''],
      
      // Pembatas kosong
      ['', '', '', '', ''],
      
      // Kehadiran
      ['Kehadiran', 'Hadir', raporData.attendance.hadir, '', 'Hari'],
      ['Kehadiran', 'Sakit', raporData.attendance.sakit, '', 'Hari'],
      ['Kehadiran', 'Izin', raporData.attendance.izin, '', 'Hari'],
      ['Kehadiran', 'Alpa', raporData.attendance.alpa, '', 'Hari'],
      ['Kehadiran', 'Persentase Kehadiran', `${raporData.attendance.rate}%`, '', ''],
      
      // Pembatas kosong
      ['', '', '', '', ''],
    ];

    // Nilai Akademik
    raporData.subjectGrades.forEach(sg => {
      rows.push([
        'Nilai Akademik',
        sg.subjectName,
        sg.average,
        getPredicate(sg.average),
        getPredicateDesc(sg.average)
      ]);
    });
    rows.push(['Nilai Akademik', 'Rata-rata Keseluruhan', raporData.averageGrade, getPredicate(raporData.averageGrade), getPredicateDesc(raporData.averageGrade)]);
    
    // Pembatas kosong
    rows.push(['', '', '', '', '']);

    // Ibadah Harian
    rows.push(['Ibadah Harian', 'Persentase Shalat di Masjid', `${raporData.habitSummary.masjidPercentage}%`, '', '']);
    rows.push(['Ibadah Harian', 'Rata-rata Sunnah Harian', raporData.habitSummary.avgSunnahCount, '', 'Shalat']);
    rows.push(['Ibadah Harian', 'Total Log Catatan', raporData.habitSummary.totalLogs, '', 'Hari']);

    // Pembatas kosong
    rows.push(['', '', '', '', '']);

    // Catatan Wali
    rows.push(['Catatan Wali Kelas', 'Deskripsi Catatan', raporData.studentInfo.catatanWali || '-', '', '']);

    if (format === 'csv') {
      exportToCSV(`${filename}.csv`, headers, rows);
    } else {
      exportToExcel(`${filename}.xls`, 'Rapor Siswa', headers, rows);
    }
  };

  // Convert score to letter predicate
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

  return (
    <DashboardLayout activeMenu="rapor" pageTitle="Kelola Rapor Digital" pageSubtitle="Pilih kelas dan siswa untuk melihat, mengedit, dan mencetak rapor lengkap (nilai akademik, kehadiran, tahfidz, dan catatan wali kelas).">
      
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="no-print">
        
        {/* Selection filters */}
        <section className="card-premium" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
          <div className="form-group" style={{ margin: 0, minWidth: '180px' }}>
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Pilih Kelas</label>
            <select
              className="form-control"
              value={activeClassId}
              onChange={(e) => setActiveClassId(e.target.value)}
              style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0, minWidth: '220px' }}>
            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Pilih Siswa</label>
            <select
              className="form-control"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={students.length === 0}
              style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
            >
              {students.length === 0 ? (
                <option value="">Tidak ada siswa</option>
              ) : (
                students.map((student) => (
                  <option key={student.id} value={student.id}>{student.name} (NISN. {student.nisn})</option>
                ))
              )}
            </select>
          </div>

          {/* Class Recap Export Buttons */}
          {students.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleClassRecapExport('excel')}
                style={{
                  padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)',
                  background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', fontSize: '0.82rem', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)'; }}
              >
                🟢 Rekap Nilai Kelas (Excel)
              </button>
              <button
                type="button"
                onClick={() => handleClassRecapExport('csv')}
                style={{
                  padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(2, 132, 199, 0.3)',
                  background: 'rgba(2, 132, 199, 0.08)', color: '#0284c7', fontSize: '0.82rem', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(2, 132, 199, 0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(2, 132, 199, 0.08)'; }}
              >
                🔵 Rekap Nilai Kelas (CSV)
              </button>
            </div>
          )}
        </section>

        {loadingRapor ? (
          <div style={{ padding: '64px', textAlign: 'center', color: '#64748b' }}>
            Memuat detail rapor siswa...
          </div>
        ) : raporData ? (
          <div className="workspace-grid" style={{ gap: '28px', alignItems: 'start' }}>
            
            {/* Left Column: Report Card Preview Sheet */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
                {/* Print button */}
                <button
                  onClick={handlePrint}
                  type="button"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    backgroundColor: '#6366f1',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#4f46e5'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#6366f1'; }}
                >
                  Cetak Rapor PDF 🖨️
                </button>

                {/* Export Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    id="btn-export-dropdown"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    style={{
                      padding: '10px 18px', borderRadius: '10px', border: '1px solid #cbd5e1',
                      background: '#ffffff', color: '#1f2937',
                      fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; }}
                  >
                    📥 Ekspor Data <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showExportMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </button>
                  {showExportMenu && (
                    <>
                      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} onClick={() => setShowExportMenu(false)} />
                      <div style={{
                        position: 'absolute', right: 0, marginTop: '8px', width: '180px',
                        background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                        zIndex: 1000, padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px',
                        animation: 'slideDown 0.2s ease-out'
                      }}>
                        <button
                          onClick={() => { handleExport('excel'); setShowExportMenu(false); }}
                          style={{
                            padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent',
                            textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#10b981'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1e293b'; }}
                        >
                          🟢 Excel (.xls)
                        </button>
                        <button
                          onClick={() => { handleExport('csv'); setShowExportMenu(false); }}
                          style={{
                            padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent',
                            textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0284c7'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1e293b'; }}
                        >
                          🔵 CSV (.csv)
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Printable Rapor Sheet */}
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
                {/* Official Letter Header */}
                <div style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', borderBottom: '3px double #000000', paddingBottom: '16px' }}>
                  <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Yayasan Pendidikan {raporData.studentInfo.schoolName || 'Eduflow Indonesia'}</h1>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'sans-serif', color: '#4f46e5' }}>{raporData.studentInfo.schoolName || 'Sekolah Dasar Islam Integral EduFlow'}</h2>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'sans-serif', fontStyle: 'italic', color: '#64748b' }}>Jl. Tekno Kreatif No. 100, Wilayah {raporData.studentInfo.schoolName || 'EduFlow'} | Telp: (021) 777-8888</p>
                </div>

                {/* Document Title */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', textDecoration: 'underline' }}>LAPORAN HASIL BELAJAR PESERTA DIDIK (RAPOR)</h3>
                  <span style={{ fontSize: '0.85rem' }}>Semester Genap - Tahun Ajaran 2025/2026</span>
                </div>

                {/* Student Metadata Table */}
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

                {/* Section A: Academic Grades */}
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

                {/* Section B: Attendance and Character Tracker side-by-side */}
                <div className="grid-info-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '24px' }}>
                  {/* Attendance */}
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 'bold', fontFamily: 'sans-serif', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '4px' }}>B. Rekapitulasi Kehadiran</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '8px 4px', border: '1px solid #000' }}>1. Hadir (Present)</td>
                          <td style={{ padding: '8px 4px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', width: '80px' }}>{raporData.attendance.hadir} Hari</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '8px 4px', border: '1px solid #000' }}>2. Sakit (Sick Leave)</td>
                          <td style={{ padding: '8px 4px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{raporData.attendance.sakit} Hari</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '8px 4px', border: '1px solid #000' }}>3. Izin (Excused)</td>
                          <td style={{ padding: '8px 4px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{raporData.attendance.izin} Hari</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '8px 4px', border: '1px solid #000' }}>4. Tanpa Keterangan (Alpa)</td>
                          <td style={{ padding: '8px 4px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', color: raporData.attendance.alpa > 0 ? 'red' : 'inherit' }}>{raporData.attendance.alpa} Hari</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Character/Habit Tracker */}
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 'bold', fontFamily: 'sans-serif', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '4px' }}>C. Mutaba&apos;ah Yaumiyah</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '8px 4px', border: '1px solid #000' }}>1. Kepatuhan Shalat Berjamaah di Masjid</td>
                          <td style={{ padding: '8px 4px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', width: '80px', color: '#10b981' }}>{raporData.habitSummary.masjidPercentage}%</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '8px 4px', border: '1px solid #000' }}>2. Rata-rata Amalan Sunnah Harian</td>
                          <td style={{ padding: '8px 4px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold', color: '#4f46e5' }}>{raporData.habitSummary.avgSunnahCount} / 5</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '8px 4px', border: '1px solid #000' }}>3. Total Hari Jurnal Terisi</td>
                          <td style={{ padding: '8px 4px', border: '1px solid #000', textAlign: 'center', fontWeight: 'bold' }}>{raporData.habitSummary.totalLogs} Jurnal</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section C: Tahfidz */}
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

                {/* Section D: Homeroom Notes */}
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

            {/* Right Column: Homeroom Comments Editor */}
            <aside className="card-premium animate-scale-in" style={{ border: '1px solid #e2e8f0', borderRadius: '18px', background: '#ffffff', padding: '24px', position: 'sticky', top: '28px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
                ✍️ Catatan Wali Kelas ({raporData.studentInfo.nama})
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <textarea
                  value={catatanWaliInput}
                  onChange={(e) => setCatatanWaliInput(e.target.value)}
                  placeholder="Ketik catatan evaluasi, motivasi, dan perilaku sosial siswa di sini..."
                  style={{
                    width: '100%',
                    height: '200px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    resize: 'none',
                    lineHeight: '1.4'
                  }}
                />

                {message && (
                  <div style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 700, backgroundColor: '#f5f3ff', padding: '8px 12px', borderRadius: '6px' }}>
                    {message}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    borderRadius: '8px',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
                    transition: 'all 0.2s'
                  }}
                >
                  {savingNotes ? 'Menyimpan...' : 'Simpan Catatan Wali Kelas 💾'}
                </button>
              </div>
            </aside>

          </div>
        ) : (
          <div style={{ padding: '64px', textAlign: 'center', color: '#64748b' }}>
            Silakan pilih siswa untuk menampilkan lembar pratinjau Rapor Hasil Belajar.
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
