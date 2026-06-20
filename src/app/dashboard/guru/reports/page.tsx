'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface Report {
  student: {
    id: string;
    nama: string;
    email: string;
    nisn_or_nip: string;
  };
  statistics: {
    totalGrades: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    totalScore: number;
  };
  subjectGrades: {
    [key: string]: {
      subjectName: string;
      grades: {
        type: string;
        subject: string;
        subjectCode: string;
        title: string;
        score: number;
        maxScore: number;
        date: string;
      }[];
    };
  };
  allGrades: {
    type: string;
    subject: string;
    subjectCode: string;
    title: string;
    score: number;
    maxScore: number;
    date: string;
  }[];
}

interface Class {
  id: string;
  name: string;
}

export default function GuruReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedClass) params.append('classId', selectedClass);
      if (selectedStudent) params.append('studentId', selectedStudent);

      const res = await fetch(`/api/guru/reports?${params}`);
      const json = await res.json();
      if (json.success) {
        setReports(json.reports);
        setClasses(json.classes);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
    setSelectedStudent('');
  };

  const getGradeColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    if (score >= 60) return '#f97316';
    return '#ef4444';
  };

  const getGradeLabel = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'E';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const averageScore = reports.length > 0
    ? Math.round(reports.reduce((sum, r) => sum + r.statistics.averageScore, 0) / reports.length)
    : 0;

  return (
    <DashboardLayout 
      activeMenu="reports" 
      pageTitle="Rapor Digital" 
      pageSubtitle="Lihat statistik nilai, filter berdasarkan kelas/siswa, dan cetak laporan lengkap dalam format digital"
    >
      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          .dashboard-sidebar,
          .dashboard-header,
          .no-print,
          button,
          select {
            display: none !important;
          }
          
          .dashboard-main {
            margin: 0 !important;
            padding: 20px !important;
            overflow: visible !important;
          }
          
          .dashboard-layout {
            background: white !important;
          }
          
          body {
            background: white !important;
          }
          
          /* Ensure content is visible */
          div[style*="display: 'flex'"] {
            display: block !important;
          }
        }
      `}</style>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Stats Overview */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '24px',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(102, 126, 234, 0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, margin: '0 0 8px 0' }}>Rata-rata Kelas</p>
              <p style={{ fontSize: '3rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{averageScore}</p>
              <p style={{ fontSize: '0.8rem', margin: '8px 0 0 0', opacity: 0.9 }}>
                {reports.length} siswa terdaftar
              </p>
            </div>
            <div style={{ fontSize: '3rem' }}>📊</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <select
            value={selectedClass}
            onChange={handleClassChange}
            style={{
              padding: '10px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '0.9rem',
              outline: 'none',
              background: '#ffffff',
              minWidth: '180px'
            }}
          >
            <option value="">Semua Kelas</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            style={{
              padding: '10px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '0.9rem',
              outline: 'none',
              background: '#ffffff',
              minWidth: '180px'
            }}
          >
            <option value="">Semua Siswa</option>
            {reports.map(report => (
              <option key={report.student.id} value={report.student.id}>
                {report.student.nama} ({report.student.nisn_or_nip})
              </option>
            ))}
          </select>

          <div style={{ flex: 1 }} />

          <button
            onClick={() => window.print()}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px -2px rgba(79, 70, 229, 0.3)'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Cetak Rapor
          </button>
        </div>

        {/* Reports List */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Memuat laporan...
          </div>
        ) : reports.length === 0 ? (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '60px 40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
              Belum ada laporan
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Laporan akan muncul setelah siswa mengumpulkan tugas/ujian
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {reports.map((report) => (
              <div
                key={report.student.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Student Header */}
                <div
                  style={{
                    padding: '20px 24px',
                    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                    borderBottom: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onClick={() => setExpandedStudent(expandedStudent === report.student.id ? null : report.student.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      flexShrink: 0
                    }}>
                      {report.student.nama.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                        {report.student.nama}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                        {report.student.nisn_or_nip} • {report.student.email}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>Rata-rata</p>
                      <p style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: getGradeColor(report.statistics.averageScore),
                        margin: 0
                      }}>
                        {report.statistics.averageScore}
                      </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>Total Nilai</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4f46e5', margin: 0 }}>
                        {report.statistics.totalGrades}
                      </p>
                    </div>
                    <div style={{
                      transform: expandedStudent === report.student.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      fontSize: '1.5rem',
                      color: '#64748b'
                    }}>
                      ▼
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedStudent === report.student.id && (
                  <div style={{ padding: '24px' }}>
                    {/* Statistics Cards */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '12px',
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        background: '#f8fafc',
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        textAlign: 'center'
                      }}>
                        <p style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>Tertinggi</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', margin: 0 }}>
                          {report.statistics.highestScore}
                        </p>
                      </div>
                      <div style={{
                        background: '#f8fafc',
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        textAlign: 'center'
                      }}>
                        <p style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>Terendah</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444', margin: 0 }}>
                          {report.statistics.lowestScore}
                        </p>
                      </div>
                      <div style={{
                        background: '#f8fafc',
                        padding: '12px',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        textAlign: 'center'
                      }}>
                        <p style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>Total Skor</p>
                        <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4f46e5', margin: 0 }}>
                          {report.statistics.totalScore}
                        </p>
                      </div>
                    </div>

                    {/* Grades by Subject */}
                    {Object.entries(report.subjectGrades).map(([subjectCode, data]: [string, any]) => (
                      <div key={subjectCode} style={{ marginBottom: '16px' }}>
                        <h4 style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          margin: '0 0 8px 0',
                          paddingBottom: '8px',
                          borderBottom: '2px solid #e2e8f0'
                        }}>
                          {data.subjectName} ({subjectCode})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {data.grades.map((grade: any, idx: number) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 12px',
                                background: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0'
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0' }}>
                                  {grade.title}
                                </p>
                                <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>
                                  {grade.type} • {formatDate(grade.date)}
                                </p>
                              </div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <span style={{
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  background: `${getGradeColor(grade.score)}20`,
                                  color: getGradeColor(grade.score),
                                  border: `1px solid ${getGradeColor(grade.score)}`
                                }}>
                                  {grade.score}
                                </span>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  background: getGradeColor(grade.score),
                                  color: '#ffffff'
                                }}>
                                  {getGradeLabel(grade.score)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}