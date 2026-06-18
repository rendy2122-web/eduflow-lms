'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  User, 
  Award,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  nisn: string;
  classId: string;
  className: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  alamat: string;
  telepon: string;
  progress: number;
  totalMilestones: number;
  completedMilestones: number;
  attendanceRate: number;
  averageGrade: number;
  catatanWali: string;
}

interface ClassItem {
  id: string;
  name: string;
}

export default function GuruStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Academic note local states
  const [localNote, setLocalNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Sync selectedStudent notes to local editor state
  useEffect(() => {
    if (selectedStudent) {
      setLocalNote(selectedStudent.catatanWali || '');
    } else {
      setLocalNote('');
    }
  }, [selectedStudent]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/guru/students');
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
        setClasses(data.classes);
      }
    } catch (err) {
      console.error('Failed to fetch students data for guru:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save Academic Note
  const handleSaveNote = async () => {
    if (!selectedStudent) return;
    try {
      setSavingNote(true);
      const res = await fetch('/api/guru/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          catatanWali: localNote
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Catatan wali berhasil disimpan!');
        // Update state
        setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, catatanWali: localNote } : s));
        setSelectedStudent(prev => prev ? { ...prev, catatanWali: localNote } : null);
      } else {
        alert('Gagal menyimpan catatan: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan catatan karena masalah koneksi.');
    } finally {
      setSavingNote(false);
    }
  };

  // SaaS tenant router helper
  const getTenantId = () => {
    if (typeof window === 'undefined') return '';
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.length > 0 && segments[0] !== 'dashboard' && segments[0] !== 'login' && segments[0] !== 'api' && segments[0] !== 'saas-admin') {
      return segments[0];
    }
    return '';
  };

  const handleChatRedirect = (studentId: string) => {
    const tenant = getTenantId();
    const prefix = tenant ? `/${tenant}` : '';
    window.location.href = `${prefix}/dashboard/guru/pesan?select=${studentId}`;
  };

  // Filtering Logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.nisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass === 'all' || s.classId === filterClass;
    return matchesSearch && matchesClass;
  });

  const totalCount = students.length;
  const homeschoolCount = students.filter(s => s.progress > 0).length;
  const avgProgress = students.length > 0 
    ? Math.round(students.reduce((acc, curr) => acc + curr.progress, 0) / students.length)
    : 0;

  return (
    <DashboardLayout activeMenu="students" pageTitle="Direktori & Progres Siswa" pageSubtitle="Pantau progres kurikulum belajar mandiri, rekam tahfidz, dan kontak wali murid.">
      
      {/* Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fade { animation: fadeIn 0.2s ease-out forwards; }
        .animate-slide { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .hover-card { transition: all 0.25s ease; }
        .hover-card:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -10px rgba(99, 102, 241, 0.15); border-color: rgba(99, 102, 241, 0.2); }
      ` }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* 📊 Summary Metrics */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div className="card-premium" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px 0' }}>Total Siswa Diajar</p>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{loading ? '...' : `${totalCount} Siswa`}</h3>
            </div>
          </div>

          <div className="card-premium" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(13, 148, 136, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px 0' }}>Rerata Progres Milestones</p>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{loading ? '...' : `${avgProgress}% Selesai`}</h3>
            </div>
          </div>

          <div className="card-premium" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px 0' }}>Siswa Homeschooling</p>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{loading ? '...' : `${homeschoolCount} Anak`}</h3>
            </div>
          </div>
        </section>

        {/* 🔍 Filter & Search Bar */}
        <section className="card-premium" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px', position: 'relative' }}>
            <Search className="w-4 h-4 text-gray-400" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="Cari siswa berdasarkan nama, NISN, atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '36px', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              <Filter className="w-4 h-4" />
              <span>Kelas:</span>
            </div>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="form-control"
              style={{ width: '160px', fontSize: '0.85rem', backgroundColor: '#ffffff', padding: '8px' }}
            >
              <option value="all">Semua Kelas</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
        </section>

        {/* 👥 Student Cards Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="card-premium" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '60px', textAlign: 'center', color: '#64748b' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '16px' }}>👥</span>
            <h3>Tidak Ada Murid Ditemukan</h3>
            <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>Coba ubah filter kelas atau kata kunci pencarian Anda.</p>
          </div>
        ) : (
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {filteredStudents.map((s) => {
              const isHomeschool = s.progress > 0;
              return (
                <div 
                  key={s.id} 
                  className="card-premium hover-card animate-slide" 
                  style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }}
                  onClick={() => setSelectedStudent(s)}
                >
                  {/* Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#4f46e5' }}>
                        {s.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{s.name}</h4>
                        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>NISN: {s.nisn}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: '100px', fontWeight: 700, backgroundColor: isHomeschool ? 'rgba(168, 85, 247, 0.08)' : 'rgba(79, 70, 229, 0.08)', color: isHomeschool ? '#9333ea' : '#4f46e5', border: '1px solid', borderColor: isHomeschool ? 'rgba(168, 85, 247, 0.15)' : 'rgba(79, 70, 229, 0.15)' }}>
                      {s.className}
                    </span>
                  </div>

                  {/* Progress Bar for Homeschooling / Learning Path */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(15,23,42,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                      <span style={{ color: '#475569' }}>Progres Belajar Mandiri:</span>
                      <span style={{ color: '#4f46e5' }}>{s.progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${s.progress}%`, height: '100%', background: 'linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)', borderRadius: '4px' }}></div>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                      {s.completedMilestones} dari {s.totalMilestones} milestone kurikulum diselesaikan
                    </span>
                  </div>

                  {/* Guardian Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Mitra Pengajar (Ortu):</span>
                      <strong style={{ color: '#0f172a' }}>{s.parentName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Kontak Wali:</span>
                      <span style={{ color: '#64748b' }}>{s.parentPhone || '-'}</span>
                    </div>
                  </div>

                  {/* Quick Action Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: 'auto', paddingTop: '6px' }}>
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChatRedirect(s.id);
                      }}
                      style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 0', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700, color: '#475569', backgroundColor: '#f8fafc', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Chat Konsultasi
                    </button>
                    <button 
                      type="button"
                      style={{ padding: '8px 12px', border: 'none', borderRadius: '10px', backgroundColor: 'rgba(79, 70, 229, 0.08)', color: '#4f46e5', cursor: 'pointer' }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* 🔍 Details Modal Sidebar */}
        {selectedStudent && (
          <div 
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', justifyContent: 'flex-end', animation: 'fadeIn 0.25s ease-out' }}
            onClick={() => setSelectedStudent(null)}
          >
            <div 
              style={{ width: '100%', maxWidth: '480px', height: '100%', backgroundColor: '#ffffff', boxShadow: '-10px 0 30px rgba(15, 23, 42, 0.15)', display: 'flex', flexDirection: 'column', padding: '36px', overflowY: 'auto', animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '28px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '100px', fontWeight: 700, backgroundColor: 'rgba(79, 70, 229, 0.08)', color: '#4f46e5', textTransform: 'uppercase' }}>
                    {selectedStudent.className}
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 850, color: '#0f172a', marginTop: '6px' }}>{selectedStudent.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>NISN: {selectedStudent.nisn}</span>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#f1f5f9', border: 'none', fontSize: '0.9rem', fontWeight: 700, color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>

              {/* Progres Detail */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 750, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  Rencana Belajar Homeschooling
                </h4>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Kemajuan Belajar</span>
                    <span style={{ color: '#4f46e5' }}>{selectedStudent.progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${selectedStudent.progress}%`, height: '100%', backgroundColor: '#4f46e5', borderRadius: '4px' }}></div>
                  </div>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: '1.5' }}>
                  Siswa ini telah menyelesaikan <strong>{selectedStudent.completedMilestones}</strong> dari <strong>{selectedStudent.totalMilestones}</strong> milestone kurikulum yang ditugaskan oleh pengawas kurikulum.
                </span>
              </div>

              {/* 📚 Profil Akademik */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Award className="w-4 h-4 text-indigo-500" />
                  Profil Akademik Siswa
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.06)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                    <span style={{ fontSize: '0.68rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kehadiran</span>
                    <strong style={{ fontSize: '1.2rem', color: '#065f46', marginTop: '4px' }}>{selectedStudent.attendanceRate}%</strong>
                    <span style={{ fontSize: '0.62rem', color: '#047857', marginTop: '2px' }}>Rerata Harian</span>
                  </div>
                  <div style={{ backgroundColor: 'rgba(79, 70, 229, 0.06)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
                    <span style={{ fontSize: '0.68rem', color: '#4f46e5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rerata Nilai</span>
                    <strong style={{ fontSize: '1.2rem', color: '#3730a3', marginTop: '4px' }}>{selectedStudent.averageGrade > 0 ? `${selectedStudent.averageGrade} / 100` : 'Belum Ada'}</strong>
                    <span style={{ fontSize: '0.62rem', color: '#4f46e5', marginTop: '2px' }}>Tugas & Ujian</span>
                  </div>
                </div>
              </div>

              {/* ✍️ Catatan Akademik / Perkembangan */}
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Catatan Akademik & Karakter
                </h4>
                <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>
                  Rekam perkembangan akademik, sikap, adab, atau catatan khusus untuk menjadi evaluasi bersama dengan orang tua siswa.
                </p>
                <textarea
                  placeholder="Ketik catatan perkembangan akademik siswa di sini..."
                  value={localNote}
                  onChange={(e) => setLocalNote(e.target.value)}
                  style={{
                    width: '100%',
                    height: '90px',
                    padding: '10px 12px',
                    fontSize: '0.82rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    resize: 'none',
                    fontFamily: 'inherit',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  style={{
                    alignSelf: 'flex-end',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: savingNote ? 'not-allowed' : 'pointer',
                    opacity: savingNote ? 0.7 : 1,
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => { if(!savingNote) e.currentTarget.style.backgroundColor = '#4338ca'; }}
                  onMouseLeave={(e) => { if(!savingNote) e.currentTarget.style.backgroundColor = '#4f46e5'; }}
                >
                  {savingNote ? 'Menyimpan...' : 'Simpan Catatan'}
                </button>
              </div>

              {/* Biodata Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 750, color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', margin: 0 }}>
                  Detail Kontak Siswa
                </h4>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Surel / Email</span>
                    <span style={{ fontSize: '0.85rem', color: '#334155' }}>{selectedStudent.email}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Nomor Telepon</span>
                    <span style={{ fontSize: '0.85rem', color: '#334155' }}>{selectedStudent.telepon || '-'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Alamat Tinggal</span>
                    <span style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.4' }}>{selectedStudent.alamat || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Wali Murid / Co-Teacher Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 750, color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', margin: 0 }}>
                  Informasi Mitra Pengajar (Orang Tua)
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <User className="w-4 h-4 text-gray-400" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Nama Orang Tua / Wali</span>
                    <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>{selectedStudent.parentName}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Email Orang Tua</span>
                    <span style={{ fontSize: '0.85rem', color: '#334155' }}>{selectedStudent.parentEmail || '-'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Nomor HP Wali</span>
                    <span style={{ fontSize: '0.85rem', color: '#334155' }}>{selectedStudent.parentPhone || '-'}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  onClick={() => {
                    setSelectedStudent(null);
                    handleChatRedirect(selectedStudent.id);
                  }}
                  className="btn-primary" 
                  style={{ width: '100%', padding: '12px 0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <MessageSquare className="w-4 h-4" />
                  Hubungi Mitra Pengajar via Chat
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

    </DashboardLayout>
  );
}
