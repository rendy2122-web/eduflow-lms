'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface Grade {
  id: string;
  type: 'assignment' | 'exam';
  title: string;
  subject: {
    id: string;
    name: string;
    code: string;
    class: {
      id: string;
      name: string;
    };
  };
  student: {
    id: string;
    nama: string;
    email: string;
  };
  score: number;
  maxScore: number;
  date: string;
  gradedAt: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  class: {
    id: string;
    name: string;
  };
}

interface Student {
  id: string;
  nama: string;
  email: string;
  profile: {
    id: string;
    nisn_or_nip: string;
  };
}

export default function GuruGradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const [showGradeModal, setShowGradeModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [gradeFormData, setGradeFormData] = useState({
    submissionId: '',
    score: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSubject) params.append('subjectId', selectedSubject);
      if (selectedStudent) params.append('studentId', selectedStudent);
      if (selectedType !== 'all') params.append('type', selectedType);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/guru/grades?${params}`);
      const json = await res.json();
      if (json.success) {
        setGrades(json.grades);
        setSubjects(json.subjects);
        setStudents(json.students);
      }
    } catch (err) {
      console.error('Error fetching grades:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGradeModal = (grade: Grade) => {
    setEditingGrade(grade);
    setGradeFormData({
      submissionId: grade.id,
      score: grade.score.toString()
    });
    setFormError(null);
    setFormSuccess(null);
    setShowGradeModal(true);
  };

  const handleCloseGradeModal = () => {
    setShowGradeModal(false);
    setEditingGrade(null);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    try {
      const score = parseInt(gradeFormData.score);
      
      if (isNaN(score) || score < 0 || score > 100) {
        setFormError('Nilai harus antara 0-100');
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/guru/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: gradeFormData.submissionId,
          score: score
        })
      });

      const json = await res.json();
      if (json.success) {
        setFormSuccess('Nilai berhasil disimpan!');
        await fetchGrades();
        setTimeout(() => {
          handleCloseGradeModal();
        }, 1500);
      } else {
        setFormError(json.error || 'Gagal menyimpan nilai');
      }
    } catch (err: any) {
      setFormError(err.message || 'Gagal menghubungi server');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = grade.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         grade.student.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !selectedSubject || grade.subject.id === selectedSubject;
    const matchesStudent = !selectedStudent || grade.student.id === selectedStudent;
    const matchesType = selectedType === 'all' || grade.type === selectedType;
    return matchesSearch && matchesSubject && matchesStudent && matchesType;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getGradeColor = (score: number) => {
    if (score >= 90) return '#10b981'; // Green - Excellent
    if (score >= 80) return '#3b82f6'; // Blue - Good
    if (score >= 70) return '#f59e0b'; // Yellow - Average
    if (score >= 60) return '#f97316'; // Orange - Pass
    return '#ef4444'; // Red - Fail
  };

  const getGradeLabel = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'E';
  };

  const averageGrade = grades.length > 0 
    ? Math.round(grades.reduce((sum, g) => sum + g.score, 0) / grades.length)
    : 0;

  const highestGrade = grades.length > 0 
    ? Math.max(...grades.map(g => g.score))
    : 0;

  const lowestGrade = grades.length > 0 
    ? Math.min(...grades.map(g => g.score))
    : 0;

  return (
    <DashboardLayout 
      activeMenu="reports" 
      pageTitle="Manajemen Nilai" 
      pageSubtitle="Kelola dan pantau nilai siswa"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Success/Error Messages */}
        {formSuccess && (
          <div style={{
            background: '#dcfce7',
            border: '1px solid #10b981',
            color: '#166534',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ✓ {formSuccess}
          </div>
        )}

        {formError && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #ef4444',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⚠️ {formError}
          </div>
        )}

        {/* Stats Cards - MOVED TO TOP */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px'
        }}>
          {/* Rata-rata Nilai Card */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            padding: '24px',
            color: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, margin: '0 0 8px 0' }}>Rata-rata Nilai</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{averageGrade}</p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                📊
              </div>
            </div>
            <div style={{
              height: '4px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: '#ffffff',
                width: `${averageGrade}%`,
                borderRadius: '2px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Nilai Tertinggi Card */}
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '20px',
            padding: '24px',
            color: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(240, 147, 251, 0.4)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, margin: '0 0 8px 0' }}>Nilai Tertinggi</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{highestGrade}</p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                🏆
              </div>
            </div>
            <div style={{
              height: '4px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: '#ffffff',
                width: `${highestGrade}%`,
                borderRadius: '2px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Nilai Terendah Card */}
          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            borderRadius: '20px',
            padding: '24px',
            color: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(79, 172, 254, 0.4)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, margin: '0 0 8px 0' }}>Nilai Terendah</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{lowestGrade}</p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                📉
              </div>
            </div>
            <div style={{
              height: '4px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: '#ffffff',
                width: `${lowestGrade}%`,
                borderRadius: '2px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Total Nilai Card */}
          <div style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            borderRadius: '20px',
            padding: '24px',
            color: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(250, 112, 154, 0.4)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, margin: '0 0 8px 0' }}>Total Nilai</p>
                <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, lineHeight: 1 }}>{grades.length}</p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                📝
              </div>
            </div>
            <div style={{
              height: '4px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: '#ffffff',
                width: '100%',
                borderRadius: '2px'
              }} />
            </div>
          </div>
        </div>

        {/* Filters */}
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
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
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
            <option value="">Semua Mata Pelajaran</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name} - {subject.class.name}
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
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.nama} ({student.profile?.nisn_or_nip || '-'})
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              padding: '10px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '0.9rem',
              outline: 'none',
              background: '#ffffff',
              minWidth: '150px'
            }}
          >
            <option value="all">Semua Jenis</option>
            <option value="assignment">Tugas</option>
            <option value="exam">Ujian</option>
          </select>

          <input
            type="text"
            placeholder="🔍 Cari judul atau nama siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '10px 14px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Grades Table */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Memuat data nilai...
          </div>
        ) : filteredGrades.length === 0 ? (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '60px 40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
              {searchQuery || selectedSubject || selectedStudent ? 'Tidak ada nilai yang sesuai' : 'Belum ada nilai'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              {searchQuery || selectedSubject || selectedStudent ? 'Coba filter lain' : 'Nilai akan muncul setelah siswa mengumpulkan tugas/ujian'}
            </p>
          </div>
        ) : (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{
                    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                    borderBottom: '2px solid #e2e8f0'
                  }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Siswa</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tugas/Ujian</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mata Pelajaran</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nilai</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grade</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tanggal</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrades.map((grade, idx) => (
                    <tr 
                      key={grade.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            flexShrink: 0
                          }}>
                            {grade.student.nama.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{grade.student.nama}</p>
                            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>{grade.student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0' }}>{grade.title}</p>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            background: grade.type === 'assignment' ? '#e0e7ff' : '#fef3c7',
                            color: grade.type === 'assignment' ? '#4f46e5' : '#b45309'
                          }}>
                            {grade.type === 'assignment' ? '📋 Tugas' : '📝 Ujian'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{grade.subject.code}</p>
                          <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>{grade.subject.class.name}</p>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '6px 14px',
                          borderRadius: '10px',
                          fontSize: '1rem',
                          fontWeight: 800,
                          background: `${getGradeColor(grade.score)}20`,
                          color: getGradeColor(grade.score),
                          border: `2px solid ${getGradeColor(grade.score)}`
                        }}>
                          {grade.score}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          fontSize: '0.9rem',
                          fontWeight: 800,
                          background: getGradeColor(grade.score),
                          color: '#ffffff'
                        }}>
                          {getGradeLabel(grade.score)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                        {formatDate(grade.date)}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleOpenGradeModal(grade)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            border: '1px solid #4f46e5',
                            background: 'transparent',
                            color: '#4f46e5',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#4f46e5';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#4f46e5';
                          }}
                        >
                          Edit Nilai
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Grade Modal */}
      {showGradeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '450px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Edit Nilai
              </h2>
              <button
                onClick={handleCloseGradeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {editingGrade && (
              <div style={{
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 4px 0' }}>Siswa</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>{editingGrade.student.nama}</p>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 4px 0' }}>Tugas/Ujian</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{editingGrade.title}</p>
              </div>
            )}

            <form onSubmit={handleGradeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Nilai (0-100) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={gradeFormData.score}
                  onChange={(e) => setGradeFormData({ ...gradeFormData, score: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    outline: 'none'
                  }}
                />
              </div>

              {formError && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #ef4444',
                  color: '#991b1b',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem'
                }}>
                  {formError}
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '8px'
              }}>
                <button
                  type="button"
                  onClick={handleCloseGradeModal}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#64748b',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1
                  }}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Nilai'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}