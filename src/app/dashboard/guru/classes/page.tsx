'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import {
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  FileText,
  User,
  Award,
  TrendingUp
} from 'lucide-react';

interface SubjectItem {
  id: string;
  name: string;
  code: string;
  teacherName: string;
}

interface StudentItem {
  id: string;
  name: string;
  email: string;
  avatar: string;
  presenceRate: number;
  tasksPending: number;
}

interface ClassItem {
  id: string;
  name: string;
  description: string;
  studentsCount: number;
  averagePresence: number;
  isTaughtByMe: boolean;
  subjects: SubjectItem[];
  students: StudentItem[];
}

export default function GuruClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  
  // Student detail modal states
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null);
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

  const handleViewStudentDetail = async (studentId: string) => {
    try {
      setLoadingStudentId(studentId);
      const res = await fetch('/api/guru/students');
      const json = await res.json();
      if (json.success) {
        const found = json.students.find((s: any) => s.id === studentId);
        if (found) {
          setSelectedStudent(found);
        } else {
          alert('Data detail siswa tidak ditemukan.');
        }
      } else {
        alert('Gagal mengambil detail siswa: ' + json.error);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal memuat detail siswa karena kendala koneksi.');
    } finally {
      setLoadingStudentId(null);
    }
  };

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
        // Update local classes state to reflect the edited note
        setClasses(prev => prev.map(c => {
          return {
            ...c,
            students: c.students.map(s => s.id === selectedStudent.id ? { ...s, catatanWali: localNote } : s)
          };
        }));
        setSelectedStudent((prev: any) => prev ? { ...prev, catatanWali: localNote } : null);
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
  const [globalStats, setGlobalStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    averageAttendance: 100,
    activeSubjects: 0
  });
  const [teacherName, setTeacherName] = useState('Sarah Jenkins');
  const [teacherId, setTeacherId] = useState('');
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'low_attendance' | 'missing_tasks'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'attendance_desc' | 'attendance_asc'>('name');
  
  // Pagination states
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [visibleCount, setVisibleCount] = useState<number>(10);

  // Modal & Form states
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [submittingClass, setSubmittingClass] = useState(false);

  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newSubjClassId, setNewSubjClassId] = useState('');
  const [submittingSubject, setSubmittingSubject] = useState(false);

  // Homeroom inputs mock state
  const [classNotes, setClassNotes] = useState<Record<string, string>>({
    'Kelas 10-A': 'Persiapan ujian tengah semester dimulai minggu depan. Fokus latihan soal Aljabar.',
    'Kelas 11-B': 'Bimbingan praktikum sains eksperimental dijadwalkan ulang hari Rabu.'
  });
  const [activeNote, setActiveNote] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);

  // Homeroom announcement sender
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementCategory, setAnnouncementCategory] = useState('Akademik');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);

  // Hover states
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  async function fetchClassesData() {
    try {
      setLoading(true);
      const res = await fetch('/api/guru/classes');
      const json = await res.json();
      if (json.success) {
        setClasses(json.classes);
        setGlobalStats(json.globalStats);
        setTeacherName(json.teacherName);
        setTeacherId(json.teacherId);
        
        // Auto-select first class if none selected
        if (json.classes.length > 0 && !selectedClassId) {
          setSelectedClassId(json.classes[0].id);
          // Set initial homeroom note
          const firstClassName = json.classes[0].name;
          setActiveNote(classNotes[firstClassName] || '');
        }
      }
    } catch (err) {
      console.error('Error fetching classes data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClassesData();
  }, []);

  const handleClassSelect = (cls: ClassItem) => {
    setSelectedClassId(cls.id);
    setActiveNote(classNotes[cls.name] || '');
    setNotesSuccess(false);
  };

  const activeClass = classes.find(c => c.id === selectedClassId);

  // Apply filters, search and sorting to active class students list
  const getFilteredStudents = () => {
    if (!activeClass) return [];
    
    let result = [...activeClass.students];

    // 1. Search Query
    if (searchQuery.trim() !== '') {
      result = result.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Performance Filters
    if (activeFilter === 'low_attendance') {
      result = result.filter(s => s.presenceRate < 85);
    } else if (activeFilter === 'missing_tasks') {
      result = result.filter(s => s.tasksPending > 0);
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'attendance_desc') {
        return b.presenceRate - a.presenceRate;
      } else if (sortBy === 'attendance_asc') {
        return a.presenceRate - b.presenceRate;
      }
      return 0;
    });

    return result;
  };

  const filteredStudents = getFilteredStudents();
  const displayedStudents = filteredStudents.slice(0, visibleCount);
  const hasMoreStudents = visibleCount < filteredStudents.length;

  // Create Class POST
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      setSubmittingClass(true);
      const res = await fetch('/api/guru/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_class',
          className: newClassName.trim(),
          description: newClassDesc.trim()
        })
      });
      const json = await res.json();
      if (json.success) {
        setNewClassName('');
        setNewClassDesc('');
        setShowClassModal(false);
        await fetchClassesData();
      } else {
        alert('Gagal membuat kelas: ' + json.error);
      }
    } catch (err) {
      console.error('Error creating class:', err);
    } finally {
      setSubmittingClass(false);
    }
  };

  // Create Subject POST
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim() || !newSubjCode.trim() || !newSubjClassId || !teacherId) return;

    try {
      setSubmittingSubject(true);
      const res = await fetch('/api/guru/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_subject',
          subjectName: newSubjName.trim(),
          subjectCode: newSubjCode.trim(),
          classId: newSubjClassId,
          teacherId
        })
      });
      const json = await res.json();
      if (json.success) {
        setNewSubjName('');
        setNewSubjCode('');
        setNewSubjClassId('');
        setShowSubjectModal(false);
        await fetchClassesData();
      } else {
        alert('Gagal membuat subjek: ' + json.error);
      }
    } catch (err) {
      console.error('Error creating subject:', err);
    } finally {
      setSubmittingSubject(false);
    }
  };

  // Save Homeroom Notes Mock
  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass) return;

    setSavingNotes(true);
    setTimeout(() => {
      setClassNotes(prev => ({
        ...prev,
        [activeClass.name]: activeNote
      }));
      setSavingNotes(false);
      setNotesSuccess(true);
      setTimeout(() => setNotesSuccess(false), 3000);
    }, 800);
  };

  // Send Homeroom Announcement Mock
  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    setSendingAnnouncement(true);
    setTimeout(() => {
      setAnnouncementText('');
      setSendingAnnouncement(false);
      setAnnouncementSuccess(true);
      setTimeout(() => setAnnouncementSuccess(false), 3500);
    }, 1000);
  };

  // Export Class Roster to Print Window
  const handleExportRoster = () => {
    if (!activeClass) return;

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Mohon izinkan pop-up untuk mencetak roster kelas.');
      return;
    }

    let rowsHtml = '';
    activeClass.students.forEach((s, idx) => {
      rowsHtml += `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${s.name}</strong></td>
          <td>${s.email}</td>
          <td style="text-align: center; font-weight: bold; color: ${s.presenceRate >= 85 ? '#16a34a' : '#dc2626'}">${s.presenceRate}%</td>
          <td style="text-align: center; color: ${s.tasksPending > 0 ? '#ea580c' : '#475569'}">${s.tasksPending === 0 ? 'Lengkap ✓' : `${s.tasksPending} Tugas`}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Roster & Presensi Kelas - ${activeClass.name}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; margin: 40px; }
            .header { text-align: center; border-bottom: 3px double #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 1.5rem; font-weight: 800; text-transform: uppercase; color: #0f172a; margin: 0; }
            .subtitle { font-size: 0.95rem; color: #64748b; margin: 5px 0 0 0; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #f1f5f9; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; font-size: 0.9rem; }
            th { background-color: #f1f5f9; font-weight: 700; color: #334155; }
            .footer { margin-top: 50px; text-align: right; font-size: 0.9rem; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Roster Resmi & Laporan Presensi Kelas</div>
            <div class="subtitle">Sekolah Dasar Islam Edutree | Dokumen Internal Akademik</div>
          </div>
          <div class="info-grid">
            <div><strong>Kelas:</strong> ${activeClass.name}</div>
            <div><strong>Wali Kelas / Guru:</strong> ${teacherName}</div>
            <div><strong>Total Murid:</strong> ${activeClass.studentsCount} Siswa</div>
            <div><strong>Rata-rata Kehadiran:</strong> ${activeClass.averagePresence}%</div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 50px;">No</th>
                <th>Nama Lengkap</th>
                <th>Alamat Email</th>
                <th style="text-align: center; width: 120px;">Presensi</th>
                <th style="text-align: center; width: 120px;">Status Tugas</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="footer">
            <p>Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p style="margin-top: 60px;"><strong> Sarah Jenkins, S.Pd </strong><br>Wali Kelas</p>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const theme = {
    primary: '#6366f1',
    primaryLight: '#e0e7ff',
    primaryDark: '#4f46e5',
    success: '#10b981',
    successLight: '#ecfdf5',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    info: '#06b6d4',
    infoLight: '#ecfeff',
    cardBg: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(226, 232, 240, 0.7)'
  };

  return (
    <DashboardLayout 
      activeMenu="classes" 
      pageTitle="Manajemen Kelas Diajar" 
      pageSubtitle="Kelola kelas, mata pelajaran, dan pantau perkembangan murid secara detail"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .btn-hover-active {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-hover-active:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }
      ` }} />

      {/* 1. Global statistics header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {[
          { title: 'Total Kelas Diajar', val: `${globalStats.totalClasses} Kelas`, color: theme.primary, bg: theme.primaryLight, path: 'M3 9H21M3 15H21M12 3V21' },
          { title: 'Total Siswa Aktif', val: `${globalStats.totalStudents} Siswa`, color: theme.info, bg: theme.infoLight, path: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
          { title: 'Rata-rata Kehadiran', val: `${globalStats.averageAttendance}%`, color: theme.success, bg: theme.successLight, path: 'M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
          { title: 'Mata Pelajaran Aktif', val: `${globalStats.activeSubjects} Mapel`, color: theme.warning, bg: theme.warningLight, path: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' }
        ].map((metric, idx) => (
          <div 
            key={idx}
            className="card-premium" 
            style={{ 
              background: theme.cardBg, 
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: theme.border, 
              borderRadius: '16px', 
              padding: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
            }}
          >
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '12px', 
              backgroundColor: metric.bg, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexShrink: 0
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={metric.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                <path d={metric.path} />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0, fontWeight: 600 }}>{metric.title}</p>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{metric.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Main content area splits into Classes Grid and Sidebar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.25fr 0.75fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Taught Classes and Student Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Section: List of Taught Classes */}
          <section 
            className="card-premium"
            style={{
              background: theme.cardBg,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: theme.border,
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Kelas yang Diajar</h2>
                <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0 0' }}>Pilih salah satu kelas untuk menampilkan daftar murid dan mata pelajaran</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled
                  style={{
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    color: '#94a3b8',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Hanya Admin yang bisa menambah kelas"
                >
                  🔒 Tambah Kelas (Admin)
                </button>
                <button
                  disabled
                  style={{
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    color: '#94a3b8',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    cursor: 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Hanya Admin yang bisa menambah mapel"
                >
                  🔒 Tambah Mapel (Admin)
                </button>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px'
            }}>
              {loading ? (
                <div style={{ gridColumn: 'span 2', padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                  Memuat list kelas diajar...
                </div>
              ) : classes.length === 0 ? (
                <div style={{ gridColumn: 'span 2', padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                  Belum ada kelas yang terdaftar. Silakan tambahkan kelas baru.
                </div>
              ) : (
                classes.map((cls) => {
                  const isSelected = selectedClassId === cls.id;
                  const isHovered = hoveredCard === cls.id;
                  return (
                    <div
                      key={cls.id}
                      onClick={() => handleClassSelect(cls)}
                      onMouseEnter={() => setHoveredCard(cls.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        padding: '16px',
                        borderRadius: '14px',
                        border: isSelected ? '2px solid #6366f1' : '1px solid rgba(226, 232, 240, 0.8)',
                        backgroundColor: isSelected ? '#f5f7ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: isSelected 
                          ? '0 10px 15px -3px rgba(99, 102, 241, 0.08)' 
                          : '0 2px 4px rgba(0,0,0,0.01)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{cls.name}</h4>
                          <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '4px 0 0 0' }}>{cls.description}</p>
                        </div>
                        {cls.isTaughtByMe && (
                          <span style={{ fontSize: '0.58rem', fontWeight: 800, backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                            Diampu Anda
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', fontSize: '0.72rem', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                        <div style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          👤 <strong>{cls.studentsCount} Murid</strong>
                        </div>
                        <div style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          📈 Avg Kehadiran: <strong>{cls.averagePresence}%</strong>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Section: List of Students / Class Roster with Filter Actions */}
          {activeClass && (
            <section
              className="card-premium"
              style={{
                background: theme.cardBg,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: theme.border,
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Roster Murid: {activeClass.name}
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Kelola dan saring list murid aktif di kelas ini
                  </p>
                </div>
                
                <button
                  onClick={handleExportRoster}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  className="btn-hover-active"
                >
                  🖨️ Cetak Roster Resmi
                </button>
              </div>

              {/* Filters toolbar wrapper */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '10px 14px',
                borderRadius: '12px',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                {/* Search input */}
                <input 
                  type="text"
                  placeholder="🔍 Cari murid berdasarkan nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    width: '200px',
                    backgroundColor: '#ffffff',
                    color: '#1f2937'
                  }}
                />

                {/* Filter buttons */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { label: 'Semua Murid', value: 'all' },
                    { label: 'Kehadiran Rendah (<85%)', value: 'low_attendance' },
                    { label: 'Tugas Menumpuk', value: 'missing_tasks' }
                  ].map(btn => (
                    <button
                      key={btn.value}
                      onClick={() => setActiveFilter(btn.value as any)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: activeFilter === btn.value ? '#cbd5e1' : 'transparent',
                        backgroundColor: activeFilter === btn.value ? '#ffffff' : 'transparent',
                        color: activeFilter === btn.value ? '#4f46e5' : '#64748b',
                        transition: 'all 0.15s'
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Sorting drop-down */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>Urutkan:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor: '#ffffff',
                      color: '#334155'
                    }}
                  >
                    <option value="name">Nama (A-Z)</option>
                    <option value="attendance_desc">Kehadiran Tertinggi</option>
                    <option value="attendance_asc">Kehadiran Terendah</option>
                  </select>
                </div>
              </div>

              {/* Student roster table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #cbd5e1', color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>
                      <th style={{ padding: '10px 8px', fontWeight: 600 }}>Siswa</th>
                      <th style={{ padding: '10px 8px', fontWeight: 600 }}>Email</th>
                      <th style={{ padding: '10px 8px', fontWeight: 600, textAlign: 'center' }}>Kehadiran</th>
                      <th style={{ padding: '10px 8px', fontWeight: 600, textAlign: 'center' }}>Status Tugas</th>
                      <th style={{ padding: '10px 8px', fontWeight: 600, textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                          Tidak ada murid yang cocok dengan kriteria saringan Anda.
                        </td>
                      </tr>
                    ) : (
                      displayedStudents.map((student) => (
                        <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img 
                              src={student.avatar} 
                              alt={student.name} 
                              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }} 
                            />
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>{student.name}</span>
                          </td>
                          <td style={{ padding: '10px 8px', fontSize: '0.78rem', color: '#475569' }}>
                            {student.email}
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                              <span style={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 800, 
                                color: student.presenceRate >= 85 ? '#10b981' : '#ef4444' 
                              }}>
                                {student.presenceRate}%
                              </span>
                              <div style={{ width: '40px', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ 
                                  width: `${student.presenceRate}%`, 
                                  height: '100%', 
                                  backgroundColor: student.presenceRate >= 85 ? '#10b981' : '#ef4444' 
                                }} />
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            {student.tasksPending === 0 ? (
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: '4px' }}>
                                Lengkap ✓
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#fff7ed', color: '#c2410c', padding: '2px 8px', borderRadius: '4px' }}>
                                {student.tasksPending} Pending
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleViewStudentDetail(student.id)}
                              disabled={loadingStudentId !== null}
                              style={{
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#ffffff',
                                color: '#475569',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                cursor: loadingStudentId !== null ? 'not-allowed' : 'pointer'
                              }}
                              className="btn-hover-active"
                            >
                              {loadingStudentId === student.id ? 'Memuat...' : 'Detail'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {filteredStudents.length > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e2e8f0',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Tampilkan:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value);
                        setItemsPerPage(newValue);
                        setVisibleCount(newValue);
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: '#ffffff',
                        color: '#334155',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="10">10</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      dari {filteredStudents.length} siswa
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                      Menampilkan {displayedStudents.length} dari {filteredStudents.length}
                    </span>
                    {hasMoreStudents && (
                      <button
                        onClick={() => setVisibleCount(prev => prev + itemsPerPage)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(79, 70, 229, 0.2)'
                        }}
                      >
                        Tampilkan Lebih Banyak ({Math.min(itemsPerPage, filteredStudents.length - visibleCount)} lagi)
                      </button>
                    )}
                    {visibleCount > itemsPerPage && (
                      <button
                        onClick={() => setVisibleCount(itemsPerPage)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: '#ffffff',
                          color: '#4f46e5',
                          border: '1px solid #4f46e5',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Tampilkan Lebih Sedikit
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

        </div>

        {/* Right Column: Class Subject List, Homeroom Insights, and Add Modals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Widget 1: Subjects list of the active class */}
          {activeClass && (
            <section
              className="card-premium"
              style={{
                background: theme.cardBg,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: theme.border,
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
              }}
            >
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0' }}>
                Mata Pelajaran Kelas: {activeClass.name}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeClass.subjects.length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, textAlign: 'center', padding: '12px' }}>
                    Belum ada mata pelajaran terdaftar di kelas ini.
                  </p>
                ) : (
                  activeClass.subjects.map((subj) => (
                    <div 
                      key={subj.id}
                      style={{
                        padding: '12px',
                        border: '1px solid #f1f5f9',
                        borderRadius: '12px',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                          {subj.name}
                        </h4>
                        <p style={{ fontSize: '0.68rem', color: '#64748b', margin: '2px 0 0 0' }}>
                          Guru: <strong>{subj.teacherName}</strong>
                        </p>
                      </div>
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, backgroundColor: '#f3e8ff', color: '#7c3aed', padding: '3px 8px', borderRadius: '6px' }}>
                        {subj.code}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* Widget 2: Homeroom Teacher Insights (Sarah Jenkins -> Wali Kelas 10-A) */}
          {activeClass && (
            <section
              className="card-premium"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,253,250,0.85) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: theme.border,
                borderLeft: '4px solid #0d9488',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#ccfbf1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0d9488'
                }}>
                  🎓
                </div>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Dasbor Wali Kelas ({activeClass.name})
                  </h3>
                  <p style={{ fontSize: '0.68rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Ms. Sarah Jenkins — Grade IV Wali Kelas
                  </p>
                </div>
              </div>

              {/* Part 1: Notes form */}
              <form onSubmit={handleSaveNotes} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>
                    Buku Harian / Catatan Wali Kelas:
                  </label>
                  {notesSuccess && (
                    <span style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 700 }}>
                      Catatan Tersimpan ✓
                    </span>
                  )}
                </div>
                
                <textarea
                  value={activeNote}
                  onChange={(e) => setActiveNote(e.target.value)}
                  placeholder="Ketik catatan khusus wali kelas untuk kelas ini..."
                  style={{
                    width: '100%',
                    height: '60px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    border: '1px solid #cbd5e1',
                    marginBottom: '8px',
                    outline: 'none',
                    resize: 'none',
                    backgroundColor: '#ffffff',
                    color: '#1e293b'
                  }}
                />

                <button
                  type="submit"
                  disabled={savingNotes}
                  style={{
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%'
                  }}
                  className="btn-hover-active"
                >
                  {savingNotes ? 'Menyimpan...' : 'Simpan Catatan Kelas'}
                </button>
              </form>

              {/* Part 2: Quick Announcement Sender */}
              <form onSubmit={handleSendAnnouncement}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>
                    Sebarkan Pengumuman Cepat:
                  </label>
                  {announcementSuccess && (
                    <span style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 700 }}>
                      📢 Broadcast Terkirim!
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                  <select
                    value={announcementCategory}
                    onChange={(e) => setAnnouncementCategory(e.target.value)}
                    style={{
                      padding: '4px 6px',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#334155'
                    }}
                  >
                    <option value="Akademik">Akademik</option>
                    <option value="Pengumuman">Pengumuman</option>
                    <option value="Agenda">Agenda</option>
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Isi pengumuman yang ingin dibroadcast ke grup..."
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    border: '1px solid #cbd5e1',
                    marginBottom: '8px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    color: '#1e293b'
                  }}
                  required
                />

                <button
                  type="submit"
                  disabled={sendingAnnouncement}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    width: '100%'
                  }}
                  className="btn-hover-active"
                >
                  {sendingAnnouncement ? 'Mengirim...' : 'Kirim Ke Murid & Orang Tua'}
                </button>
              </form>
            </section>
          )}

        </div>

      </div>

      {/* 3. Modal Popup: Add Class */}
      {showClassModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <form 
            onSubmit={handleCreateClass}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              width: '90%',
              maxWidth: '400px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                🏫 Tambah Kelas Belajar Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowClassModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  fontSize: '1.2rem',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Nama Kelas:</label>
              <input
                type="text"
                placeholder="Contoh: Kelas 10-A, Kelas 12-B"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #cbd5e1', outline: 'none', color: '#1e293b' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Deskripsi Kelas:</label>
              <input
                type="text"
                placeholder="Masukkan info atau jenjang kelas..."
                value={newClassDesc}
                onChange={(e) => setNewClassDesc(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #cbd5e1', outline: 'none', color: '#1e293b' }}
              />
            </div>

            <button
              type="submit"
              disabled={submittingClass}
              style={{
                padding: '10px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 800,
                backgroundColor: '#6366f1',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                marginTop: '8px'
              }}
              className="btn-hover-active"
            >
              {submittingClass ? 'Menambahkan...' : 'Tambah Kelas'}
            </button>
          </form>
        </div>
      )}

      {/* 4. Modal Popup: Add Subject */}
      {showSubjectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <form 
            onSubmit={handleCreateSubject}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              width: '90%',
              maxWidth: '400px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                📚 Tambah Mata Pelajaran Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowSubjectModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  fontSize: '1.2rem',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Nama Mapel:</label>
              <input
                type="text"
                placeholder="Contoh: Matematika, Fisika"
                value={newSubjName}
                onChange={(e) => setNewSubjName(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #cbd5e1', outline: 'none', color: '#1e293b' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Kode Mapel:</label>
              <input
                type="text"
                placeholder="Contoh: MATH102, SCI105"
                value={newSubjCode}
                onChange={(e) => setNewSubjCode(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #cbd5e1', outline: 'none', color: '#1e293b' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Hubungkan ke Kelas:</label>
              <select
                value={newSubjClassId}
                onChange={(e) => setNewSubjClassId(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#ffffff', color: '#334155' }}
                required
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submittingSubject}
              style={{
                padding: '10px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 800,
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                marginTop: '8px'
              }}
              className="btn-hover-active"
            >
              {submittingSubject ? 'Menambahkan...' : 'Tambah Mapel'}
            </button>
          </form>
        </div>
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
              <h4 style={{ fontSize: '0.85rem', fontWeight: 750, color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
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
                  color: '#1e293b'
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
                style={{ width: '100%', padding: '12px 0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <MessageSquare className="w-4 h-4" />
                Hubungi Mitra Pengajar via Chat
              </button>
            </div>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
