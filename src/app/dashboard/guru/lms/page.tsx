'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface SubjectOption {
  id: string;
  name: string;
  className: string;
}

interface SubmissionItem {
  id: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string;
  file_url: string;
  score: number | null;
  graded_at: string | Date | null;
  created_at: string | Date;
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  deadline: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  submissionsCount: number;
  totalStudentsCount: number;
  submissions: SubmissionItem[];
}

interface MaterialItem {
  id: string;
  title: string;
  description: string;
  file_url: string;
  subjectName: string;
  className: string;
  created_at: string;
}

export default function GuruLmsPage() {
  const [activeTab, setActiveTab] = useState<'assignments' | 'materials' | 'homeschool'>('assignments');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<SubjectOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected states
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);

  // Modals & Form states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);

  // Form Task inputs
  const [tTitle, setTTitle] = useState('');
  const [tDesc, setTDesc] = useState('');
  const [tSubjId, setTSubjId] = useState('');
  const [tDeadline, setTDeadline] = useState('');
  const [tSubmissionType, setTSubmissionType] = useState('pdf_img');
  const [tWeight, setTWeight] = useState('10%');
  const [submittingTask, setSubmittingTask] = useState(false);

  // Form Material inputs
  const [mTitle, setMTitle] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mSubjId, setMSubjId] = useState('');
  const [mFormat, setMFormat] = useState<'pdf' | 'video' | 'link'>('pdf');
  const [mUrl, setMUrl] = useState('');
  const [mChapter, setMChapter] = useState('Bab 1');
  const [mEstimatedDuration, setMEstimatedDuration] = useState('1 Jam');
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [submittingMaterial, setSubmittingMaterial] = useState(false);

  // Form Grading inputs
  const [gradeScore, setGradeScore] = useState<number | ''>('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  // Homeschooling states
  interface PortfolioItem {
    id: string;
    title: string;
    subject: string;
    notes: string;
    fileUrl: string;
    studentId: string;
    studentName: string;
    parentId: string;
    date: string;
    status: 'pending' | 'graded';
    academicScore?: number | null;
    teacherFeedback?: string | null;
    adabScore?: number | null;
    created_at: string;
  }
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState(false);
  const [showPortfolioGradingModal, setShowPortfolioGradingModal] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const [portfolioGradeScore, setPortfolioGradeScore] = useState<number | ''>('');
  const [portfolioGradeFeedback, setPortfolioGradeFeedback] = useState('');
  const [submittingPortfolioGrade, setSubmittingPortfolioGrade] = useState(false);

  // Hover/Active states
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [hoveredMaterialId, setHoveredMaterialId] = useState<string | null>(null);

  async function fetchLmsData() {
    try {
      setLoading(true);
      const res = await fetch('/api/guru/lms');
      const json = await res.json();
      if (json.success) {
        setTasks(json.tasks);
        setMaterials(json.materials);
        setSubjectOptions(json.subjects);

        // Auto-select first task if exists
        if (json.tasks.length > 0 && !selectedTaskId) {
          setSelectedTaskId(json.tasks[0].id);
        }

        // Set default dropdown values
        if (json.subjects.length > 0) {
          setTSubjId(json.subjects[0].id);
          setMSubjId(json.subjects[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching LMS data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPortfolios() {
    try {
      setLoadingPortfolios(true);
      const res = await fetch('/api/orang-tua/co-teacher');
      const json = await res.json();
      if (json.success) {
        setPortfolios(json.portfolios);
      }
    } catch (err) {
      console.error('Error fetching portfolios:', err);
    } finally {
      setLoadingPortfolios(false);
    }
  }

  useEffect(() => {
    fetchLmsData();
    fetchPortfolios();
  }, []);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  // Create Task Action
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tTitle.trim() || !tSubjId || !tDeadline) return;

    try {
      setSubmittingTask(true);
      // Format description with extra metadata
      const formattedDesc = `[Tipe Pengumpulan: ${tSubmissionType === 'pdf_img' ? 'PDF / Gambar' : tSubmissionType === 'handwritten' ? 'Tulis Tangan' : 'Tautan Link'}] [Bobot: ${tWeight}]\nInstruksi: ${tDesc.trim()}`;
      
      const res = await fetch('/api/guru/lms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_task',
          title: tTitle.trim(),
          description: formattedDesc,
          subjectId: tSubjId,
          deadline: tDeadline
        })
      });
      const json = await res.json();
      if (json.success) {
        setTTitle('');
        setTDesc('');
        setTDeadline('');
        setTSubmissionType('pdf_img');
        setTWeight('10%');
        setShowTaskModal(false);
        await fetchLmsData();
      } else {
        alert('Gagal membuat tugas: ' + json.error);
      }
    } catch (err) {
      console.error('Error creating task:', err);
    } finally {
      setSubmittingTask(false);
    }
  };

  // Upload Material Action
  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle.trim() || !mSubjId) return;
    if (mFormat !== 'pdf' && !mUrl.trim()) return;
    if (mFormat === 'pdf' && !materialFile) {
      alert('Silakan pilih berkas dokumen yang ingin diunggah');
      return;
    }

    try {
      setSubmittingMaterial(true);
      const formData = new FormData();
      formData.append('action', 'upload_material');
      formData.append('title', mTitle.trim());
      
      // Format description with extra metadata
      const formattedDesc = `[Materi: ${mChapter}] [Estimasi Membaca: ${mEstimatedDuration}]\nRingkasan: ${mDesc.trim()}`;
      formData.append('description', formattedDesc);
      
      formData.append('subjectId', mSubjId);
      
      if (mFormat === 'pdf' && materialFile) {
        formData.append('file', materialFile);
      } else {
        formData.append('fileUrl', mUrl.trim());
      }

      const res = await fetch('/api/guru/lms', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      if (json.success) {
        setMTitle('');
        setMDesc('');
        setMUrl('');
        setMChapter('Bab 1');
        setMEstimatedDuration('1 Jam');
        setMaterialFile(null);
        setShowMaterialModal(false);
        await fetchLmsData();
      } else {
        alert('Gagal mengunggah materi: ' + json.error);
      }
    } catch (err) {
      console.error('Error uploading material:', err);
    } finally {
      setSubmittingMaterial(false);
    }
  };

  // Grade Submission Action
  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || gradeScore === '') return;

    const parsed = Number(gradeScore);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      alert('Nilai harus berupa angka dari 0 sampai 100');
      return;
    }

    try {
      setSubmittingGrade(true);
      const res = await fetch('/api/guru/lms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grade_submission',
          submissionId: selectedSubmission.id,
          score: parsed
        })
      });
      const json = await res.json();
      if (json.success) {
        setShowGradingModal(false);
        setSelectedSubmission(null);
        setGradeScore('');
        setGradeFeedback('');
        
        // Optimistic local state update to keep things snappy and premium
        if (json.mockUpdate) {
          // If it was mock/virtual update, apply locally
          setTasks(prevTasks => 
            prevTasks.map(t => {
              if (t.id === selectedTaskId) {
                return {
                  ...t,
                  submissions: t.submissions.map(sub => {
                    if (sub.id === json.mockUpdate.id) {
                      return {
                        ...sub,
                        score: json.mockUpdate.score,
                        graded_at: json.mockUpdate.graded_at
                      };
                    }
                    return sub;
                  })
                };
              }
              return t;
            })
          );
        } else {
          // Full refresh
          await fetchLmsData();
        }
      } else {
        alert('Gagal memberikan nilai: ' + json.error);
      }
    } catch (err) {
      console.error('Error grading submission:', err);
    } finally {
      setSubmittingGrade(false);
    }
  };

  // Grade Portfolio Action
  const handleGradePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortfolio || portfolioGradeScore === '') return;

    const parsed = Number(portfolioGradeScore);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      alert('Nilai harus berupa angka dari 0 sampai 100');
      return;
    }

    try {
      setSubmittingPortfolioGrade(true);
      const res = await fetch('/api/guru/portfolio-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioId: selectedPortfolio.id,
          academicScore: parsed,
          teacherFeedback: portfolioGradeFeedback.trim()
        })
      });
      const json = await res.json();
      if (json.success) {
        setShowPortfolioGradingModal(false);
        setSelectedPortfolio(null);
        setPortfolioGradeScore('');
        setPortfolioGradeFeedback('');
        await fetchPortfolios();
      } else {
        alert('Gagal menyimpan penilaian portofolio: ' + json.error);
      }
    } catch (err) {
      console.error('Error grading portfolio:', err);
    } finally {
      setSubmittingPortfolioGrade(false);
    }
  };

  // Delete Material Action
  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus materi ini dari database?')) return;

    try {
      const res = await fetch('/api/guru/lms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_material',
          materialId: id
        })
      });
      const json = await res.json();
      if (json.success) {
        await fetchLmsData();
      } else {
        alert('Gagal menghapus materi: ' + json.error);
      }
    } catch (err) {
      console.error('Error deleting material:', err);
    }
  };

  // Helpers for formatting
  const getFormatIcon = (url: string) => {
    const lower = url.toLowerCase();
    if (lower.endsWith('.pdf') || lower.includes('pdf')) return '📄';
    if (lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('watch')) return '🎥';
    return '🔗';
  };

  const getFormatBadgeColor = (url: string) => {
    const lower = url.toLowerCase();
    if (lower.endsWith('.pdf') || lower.includes('pdf')) return { bg: '#fee2e2', text: '#ef4444' }; // Red
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return { bg: '#ffedd5', text: '#f97316' }; // Orange
    return { bg: '#ecfeff', text: '#0891b2' }; // Cyan
  };

  const formatDate = (dateStr: string | Date) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate stats
  const totalTasks = tasks.length;
  const totalMaterials = materials.length;
  const pendingGradingCount = tasks.reduce((total, task) => {
    const ungraded = task.submissions.filter(s => s.score === null).length;
    return total + ungraded;
  }, 0);

  const theme = {
    primary: '#4f46e5', // Indigo
    primaryLight: '#eef2ff',
    primaryDark: '#3730a3',
    success: '#10b981', // Emerald
    successLight: '#ecfdf5',
    warning: '#f59e0b', // Amber
    warningLight: '#fef3c7',
    info: '#06b6d4', // Cyan
    infoLight: '#ecfeff',
    danger: '#ef4444',
    cardBg: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(226, 232, 240, 0.7)'
  };

  return (
    <DashboardLayout 
      activeMenu="lms" 
      pageTitle="Portal Pembelajaran Digital (LMS)"
      pageSubtitle="Unggah materi pembelajaran, publikasikan tugas, dan beri nilai pengumpulan siswa secara langsung."
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .tab-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tab-btn-active {
          background-color: #4f46e5 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        }
        .btn-action-hover {
          transition: all 0.2s ease;
        }
        .btn-action-hover:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .task-card-item {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .pulse-ungraded {
          animation: pulse-glow 2s infinite;
        }
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3); }
          70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      ` }} />

      {/* 1. Global Metrics Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {[
          { title: 'Total Tugas Aktif', val: `${totalTasks} Tugas`, color: theme.primary, bg: theme.primaryLight, icon: '📋' },
          { title: 'Tugas Belum Dinilai', val: `${pendingGradingCount} Siswa`, color: theme.danger, bg: '#fef2f2', icon: '✍️', glow: pendingGradingCount > 0 },
          { title: 'Total Modul Terbit', val: `${totalMaterials} Modul`, color: theme.success, bg: theme.successLight, icon: '📚' },
          { title: 'Portofolio Pending', val: `${portfolios.filter(p => p.status === 'pending').length} Berkas`, color: theme.info, bg: theme.infoLight, icon: '🏠', glow: portfolios.filter(p => p.status === 'pending').length > 0 }
        ].map((stat, idx) => (
          <div 
            key={idx}
            className={`card-premium ${stat.glow ? 'pulse-ungraded' : ''}`}
            style={{
              background: theme.cardBg,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: theme.border,
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)'
            }}
          >
            <div>
              <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0, fontWeight: 600 }}>{stat.title}</p>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{stat.val}</h3>
            </div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: stat.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Tab Navigation & Add Buttons Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          backgroundColor: 'rgba(226, 232, 240, 0.5)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid #cbd5e1'
        }}>
          {[
            { id: 'assignments', label: '📋 Tugas & Penilaian' },
            { id: 'materials', label: '📚 Modul & Materi Ajar' },
            { id: 'homeschool', label: '🏠 Portofolio Homeschooling' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#475569'
              }}
              className={`tab-btn ${activeTab === tab.id ? 'tab-btn-active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Create/Upload actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowTaskModal(true)}
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#2563eb',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            className="btn-action-hover"
          >
            + Buat Tugas Baru
          </button>
          <button
            onClick={() => setShowMaterialModal(true)}
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#059669',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            className="btn-action-hover"
          >
            + Unggah Materi
          </button>
        </div>
      </div>

      {/* 3. Main Dynamic Content Tab Section */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
          Memuat portal pembelajaran LMS...
        </div>
      ) : activeTab === 'assignments' ? (
        
        /* TAB 1: Assignments Split View */
        <div style={{
          display: 'grid',
          gridTemplateColumns: '0.85fr 1.15fr',
          gap: '24px',
          alignItems: 'start'
        }}>
          
          {/* Left Panel: Tasks Roster list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>
              Daftar Tugas Kelas
            </h3>
            
            {tasks.length === 0 ? (
              <div className="card-premium" style={{ background: '#ffffff', border: theme.border, borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                Belum ada tugas yang dibuat. Silakan tambahkan tugas baru.
              </div>
            ) : (
              tasks.map(task => {
                const isSelected = selectedTaskId === task.id;
                const isHovered = hoveredTaskId === task.id;
                const progressPercentage = task.totalStudentsCount > 0 
                  ? Math.round((task.submissionsCount / task.totalStudentsCount) * 100)
                  : 0;

                // Calculate ungraded count
                const ungradedInTask = task.submissions.filter(s => s.score === null).length;

                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    onMouseEnter={() => setHoveredTaskId(task.id)}
                    onMouseLeave={() => setHoveredTaskId(null)}
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      border: isSelected ? '2px solid #4f46e5' : '1px solid rgba(226, 232, 240, 0.8)',
                      backgroundColor: isSelected ? '#f5f6ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      transform: isHovered ? 'scale(1.01)' : 'scale(1)',
                      boxShadow: isSelected 
                        ? '0 10px 15px -3px rgba(79, 70, 229, 0.06)' 
                        : '0 1px 3px rgba(0,0,0,0.01)'
                    }}
                    className="task-card-item"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, backgroundColor: '#e0e7ff', color: '#4338ca', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                        {task.className} | {task.subjectName}
                      </span>
                      {ungradedInTask > 0 && (
                        <span style={{ fontSize: '0.6rem', fontWeight: 800, backgroundColor: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px' }}>
                          ✍️ {ungradedInTask} Perlu Dinilai
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                      {task.title}
                    </h4>

                    <p style={{ fontSize: '0.68rem', color: '#64748b', margin: '0 0 12px 0' }}>
                      📅 Deadline: <strong>{formatDate(task.deadline)}</strong>
                    </p>

                    {/* Progress Bar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#475569' }}>
                        <span>Pengumpulan siswa:</span>
                        <strong>{task.submissionsCount}/{task.totalStudentsCount} ({progressPercentage}%)</strong>
                      </div>
                      <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${progressPercentage}%`,
                          height: '100%',
                          backgroundColor: progressPercentage === 100 ? theme.success : theme.primary,
                          borderRadius: '99px'
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Panel: Student Submissions table for the selected task */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>
              Roster Pengumpulan Siswa
            </h3>

            {selectedTask ? (
              <section
                className="card-premium"
                style={{
                  background: '#ffffff',
                  border: theme.border,
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)'
                }}
              >
                {/* Selected task header info */}
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: theme.primary, backgroundColor: theme.primaryLight, padding: '3px 8px', borderRadius: '4px' }}>
                    {selectedTask.className} — {selectedTask.subjectName}
                  </span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px 0' }}>
                    {selectedTask.title}
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                    {selectedTask.description || 'Tidak ada deskripsi instruksi tambahan.'}
                  </p>
                </div>

                {/* Submissions Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #cbd5e1', color: '#64748b', fontSize: '0.72rem', fontWeight: 700 }}>
                        <th style={{ padding: '8px', fontWeight: 700 }}>Siswa</th>
                        <th style={{ padding: '8px', fontWeight: 700 }}>Dikirim Pada</th>
                        <th style={{ padding: '8px', fontWeight: 700 }}>File Jawaban</th>
                        <th style={{ padding: '8px', fontWeight: 700, textAlign: 'center' }}>Nilai</th>
                        <th style={{ padding: '8px', fontWeight: 700, textAlign: 'center' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTask.submissions.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.78rem' }}>
                            Belum ada siswa yang mengirimkan jawaban.
                          </td>
                        </tr>
                      ) : (
                        selectedTask.submissions.map((sub) => (
                          <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img 
                                src={sub.studentAvatar} 
                                alt={sub.studentName} 
                                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
                              />
                              <div>
                                <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{sub.studentName}</p>
                                <p style={{ fontSize: '0.62rem', color: '#94a3b8', margin: 0 }}>{sub.studentEmail}</p>
                              </div>
                            </td>
                            <td style={{ padding: '10px 8px', fontSize: '0.72rem', color: '#475569' }}>
                              {formatDate(sub.created_at)}
                            </td>
                            <td style={{ padding: '10px 8px', fontSize: '0.72rem' }}>
                              <a 
                                href={sub.file_url} 
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}
                              >
                                📂 Unduh / Lihat Berkas
                              </a>
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                              {sub.score !== null ? (
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#ecfdf5', color: '#065f46', padding: '2px 6px', borderRadius: '6px' }}>
                                  {sub.score} / 100
                                </span>
                              ) : (
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#fef2f2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px' }}>
                                  Belum Dinilai
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                              <button
                                onClick={() => {
                                  setSelectedSubmission(sub);
                                  setGradeScore(sub.score !== null ? sub.score : '');
                                  setShowGradingModal(true);
                                }}
                                style={{
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #cbd5e1',
                                  color: '#334155',
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                                className="btn-action-hover"
                              >
                                {sub.score !== null ? 'Koreksi' : 'Beri Nilai'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : (
              <div className="card-premium" style={{ background: '#ffffff', border: theme.border, borderRadius: '16px', padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                Silakan pilih salah satu tugas di kolom kiri untuk melihat pengumpulan siswa.
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'materials' ? (
        
        /* TAB 2: Materials Grid View */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px'
        }}>
          {materials.length === 0 ? (
            <div style={{ gridColumn: 'span 3', padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              Belum ada materi pelajaran yang diunggah. Klik &quot;+ Unggah Materi&quot; untuk memulai.
            </div>
          ) : (
            materials.map(mat => {
              const isHovered = hoveredMaterialId === mat.id;
              const formatBadge = getFormatBadgeColor(mat.file_url);

              return (
                <div
                  key={mat.id}
                  onMouseEnter={() => setHoveredMaterialId(mat.id)}
                  onMouseLeave={() => setHoveredMaterialId(null)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    borderRadius: '16px',
                    padding: '16px',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: isHovered 
                      ? '0 12px 20px -8px rgba(0,0,0,0.04)' 
                      : '0 2px 4px rgba(0,0,0,0.01)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '180px'
                  }}
                >
                  <div>
                    {/* Header info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                        {mat.className} | {mat.subjectName}
                      </span>
                      <span style={{ 
                        fontSize: '0.58rem', 
                        fontWeight: 800, 
                        backgroundColor: formatBadge.bg, 
                        color: formatBadge.text, 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}>
                        {getFormatIcon(mat.file_url)} {mat.file_url.toLowerCase().endsWith('.pdf') ? 'PDF' : mat.file_url.includes('youtube') ? 'VIDEO' : 'LINK'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                      {mat.title}
                    </h4>

                    <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '0 0 14px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.4 }}>
                      {mat.description || 'Tidak ada deskripsi modul.'}
                    </p>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    borderTop: '1px solid #f1f5f9', 
                    paddingTop: '10px', 
                    marginTop: '10px' 
                  }}>
                    <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>
                      Terbit: {formatDate(mat.created_at)}
                    </span>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => window.open(mat.file_url, '_blank')}
                        style={{
                          backgroundColor: '#eff6ff',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Buka
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(mat.id)}
                        style={{
                          backgroundColor: '#fef2f2',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* TAB 3: Homeschooling Portfolios View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Review Portofolio Homeschooling (Co-Teacher)
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Total Portofolio: <strong>{portfolios.length} Berkas</strong>
            </span>
          </div>

          {loadingPortfolios ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              Memuat portofolio homeschooling...
            </div>
          ) : portfolios.length === 0 ? (
            <div className="card-premium" style={{ background: '#ffffff', border: theme.border, borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              Belum ada berkas portofolio atau penilaian harian yang diunggah oleh orang tua.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {portfolios.map(port => {
                const isPending = port.status === 'pending';
                const hasAttachment = !!port.fileUrl;
                
                return (
                  <div
                    key={port.id}
                    className="card-premium btn-action-hover"
                    style={{
                      background: '#ffffff',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      borderRadius: '16px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '260px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)'
                    }}
                  >
                    <div>
                      {/* Top status bar */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px' }}>
                          📚 {port.subject}
                        </span>
                        
                        {isPending ? (
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            backgroundColor: '#fef3c7',
                            color: '#d97706',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            animation: 'pulse-glow 2s infinite'
                          }}>
                            ⏳ Menunggu Review
                          </span>
                        ) : (
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            ✅ Dinilai: {port.academicScore}/100
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', lineHeight: 1.4 }}>
                        {port.title}
                      </h4>
                      
                      {/* Sub-info */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.65rem', color: '#64748b', marginBottom: '10px' }}>
                        <span>Siswa: <strong>{port.studentName}</strong></span>
                        <span>•</span>
                        <span>📅 {formatDate(port.date)}</span>
                      </div>

                      {/* Notes / Description */}
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#475569',
                        margin: '0 0 12px 0',
                        backgroundColor: '#f8fafc',
                        padding: '8px',
                        borderRadius: '8px',
                        lineHeight: 1.4,
                        borderLeft: `3px solid ${theme.primary}`
                      }}>
                        {port.notes || 'Tidak ada catatan tambahan.'}
                      </p>

                      {/* Attachment Link */}
                      {hasAttachment ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                          <span style={{ fontSize: '0.75rem' }}>📎</span>
                          <a
                            href={port.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.72rem',
                              color: theme.primary,
                              fontWeight: 700,
                              textDecoration: 'none'
                            }}
                          >
                            Lihat Lampiran Portofolio
                          </a>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '12px' }}>
                          Tanpa lampiran berkas
                        </div>
                      )}

                      {/* Adab score (parent submitted) */}
                      {port.adabScore !== undefined && port.adabScore !== null && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: '#fef2f2',
                          color: '#b91c1c',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          marginBottom: '12px'
                        }}>
                          ⭐ Adab Rumah: {port.adabScore}
                        </div>
                      )}

                      {/* Feedback display */}
                      {!isPending && port.teacherFeedback && (
                        <div style={{
                          backgroundColor: '#f0fdf4',
                          border: '1px dashed #bbf7d0',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          color: '#166534',
                          marginTop: '8px',
                          lineHeight: 1.4
                        }}>
                          <strong>Feedback Ustadz:</strong> {port.teacherFeedback}
                        </div>
                      )}
                    </div>

                    {/* Action button */}
                    <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                      <button
                        onClick={() => {
                          setSelectedPortfolio(port);
                          setPortfolioGradeScore(port.academicScore !== null && port.academicScore !== undefined ? port.academicScore : '');
                          setPortfolioGradeFeedback(port.teacherFeedback || '');
                          setShowPortfolioGradingModal(true);
                        }}
                        style={{
                          width: '100%',
                          backgroundColor: isPending ? theme.primary : '#ffffff',
                          color: isPending ? '#ffffff' : '#334155',
                          border: isPending ? 'none' : '1px solid #cbd5e1',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                        className="btn-action-hover"
                      >
                        {isPending ? 'Beri Nilai Konversi' : 'Koreksi Nilai Konversi'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. Modal Popup: Create Task */}
      {showTaskModal && (
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
            onSubmit={handleCreateTask}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              width: '90%',
              maxWidth: '440px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                📋 Buat Tugas Kelas Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
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
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Judul Tugas:</label>
              <input
                type="text"
                placeholder="Contoh: Pekerjaan Rumah Persamaan Linear Halaman 54"
                value={tTitle}
                onChange={(e) => setTTitle(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', outline: 'none', color: '#1e293b' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Instruksi / Detail Tugas:</label>
              <textarea
                placeholder="Tuliskan petunjuk pengerjaan tugas di sini..."
                value={tDesc}
                onChange={(e) => setTDesc(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', outline: 'none', height: '60px', resize: 'none', color: '#1e293b' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Format Pengumpulan:</label>
                <select
                  value={tSubmissionType}
                  onChange={(e) => setTSubmissionType(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#ffffff', color: '#334155' }}
                  required
                >
                  <option value="pdf_img">Unggah PDF / Foto</option>
                  <option value="handwritten">Tulis Tangan Fisik</option>
                  <option value="link">Tautan Link Web</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Bobot Nilai Tugas:</label>
                <select
                  value={tWeight}
                  onChange={(e) => setTWeight(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#ffffff', color: '#334155' }}
                  required
                >
                  <option value="10%">10% (Kuis / Latihan)</option>
                  <option value="20%">20% (Tugas Mandiri)</option>
                  <option value="30%">30% (Proyek Utama)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Mata Pelajaran & Kelas:</label>
              <select
                value={tSubjId}
                onChange={(e) => setTSubjId(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#ffffff', color: '#334155' }}
                required
              >
                {subjectOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.className} - {opt.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Tenggat Waktu (Deadline):</label>
              <input
                type="date"
                value={tDeadline}
                onChange={(e) => setTDeadline(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#ffffff', color: '#1e293b' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submittingTask}
              style={{
                padding: '10px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 800,
                backgroundColor: theme.primary,
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                marginTop: '8px'
              }}
              className="btn-action-hover"
            >
              {submittingTask ? 'Membuat Tugas...' : 'Tugaskan Sekarang'}
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. Modal Popup: Upload Material */}
      {showMaterialModal && (
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
            onSubmit={handleUploadMaterial}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              width: '90%',
              maxWidth: '440px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                📚 Unggah Modul / Materi Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowMaterialModal(false)}
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
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Judul Materi:</label>
              <input
                type="text"
                placeholder="Contoh: Bab 4 - Aljabar Khwarizmi"
                value={mTitle}
                onChange={(e) => setMTitle(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', outline: 'none', color: '#1e293b' }}
                required
              />
            </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Bab Pembelajaran:</label>
                <select
                  value={mChapter}
                  onChange={(e) => setMChapter(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#ffffff', color: '#334155' }}
                  required
                >
                  <option value="Bab 1">Bab 1</option>
                  <option value="Bab 2">Bab 2</option>
                  <option value="Bab 3">Bab 3</option>
                  <option value="Bab 4">Bab 4</option>
                  <option value="Bab 5">Bab 5</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Estimasi Belajar:</label>
                <select
                  value={mEstimatedDuration}
                  onChange={(e) => setMEstimatedDuration(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#ffffff', color: '#334155' }}
                  required
                >
                  <option value="15 Menit">15 Menit</option>
                  <option value="30 Menit">30 Menit</option>
                  <option value="1 Jam">1 Jam</option>
                  <option value="2 Jam">2 Jam</option>
                  <option value="Mandiri">Mandiri</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Deskripsi Singkat:</label>
              <input
                type="text"
                placeholder="Contoh: Modul pengenalan rumus dasar kuadrat"
                value={mDesc}
                onChange={(e) => setMDesc(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', outline: 'none', color: '#1e293b' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Format Modul:</label>
              <select
                value={mFormat}
                onChange={(e) => setMFormat(e.target.value as any)}
                style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#ffffff', color: '#334155' }}
              >
                <option value="pdf">Dokumen PDF / Gambar (Unggah Berkas)</option>
                <option value="video">Link Video YouTube</option>
                <option value="link">Tautan Web URL</option>
              </select>
            </div>

            {mFormat === 'pdf' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Unggah Berkas Dokumen (PDF/Gambar):</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setMaterialFile(e.target.files[0]);
                    }
                  }}
                  style={{ padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Tautan URL / Link Video:</label>
                <input
                  type="text"
                  placeholder="https://youtube.com/watch?v=... atau https://link-web.com"
                  value={mUrl}
                  onChange={(e) => setMUrl(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', outline: 'none', color: '#1e293b' }}
                  required
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Mata Pelajaran & Kelas:</label>
              <select
                value={mSubjId}
                onChange={(e) => setMSubjId(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#ffffff', color: '#334155' }}
                required
              >
                {subjectOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.className} - {opt.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submittingMaterial}
              style={{
                padding: '10px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 800,
                backgroundColor: theme.success,
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                marginTop: '8px'
              }}
              className="btn-action-hover"
            >
              {submittingMaterial ? 'Mengunggah...' : 'Publikasikan Modul'}
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. Modal Popup: Grading Console (Beri Nilai) */}
      {showGradingModal && selectedSubmission && (
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
            onSubmit={handleGradeSubmission}
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
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  ✍️ Penilaian Tugas Siswa
                </h3>
                <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Siswa: <strong>{selectedSubmission.studentName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setShowGradingModal(false); setSelectedSubmission(null); }}
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

            {/* Answer Link Preview */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '0.75rem'
            }}>
              <p style={{ margin: '0 0 6px 0', color: '#64748b', fontWeight: 600 }}>Berkas Jawaban Murid:</p>
              <a 
                href={selectedSubmission.file_url} 
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                📂 Buka Berkas Jawaban (Klik untuk review)
              </a>
            </div>

            {/* Score Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Nilai Siswa (Skala 0 - 100):</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Masukkan skor nilai..."
                value={gradeScore}
                onChange={(e) => setGradeScore(e.target.value !== '' ? Number(e.target.value) : '')}
                style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #cbd5e1', outline: 'none', fontWeight: 800, color: '#1e293b' }}
                required
              />
            </div>

            {/* Quick Grades Buttons Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>Pintasan Skor Cepat:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[100, 95, 90, 85, 75, 70].map((scoreVal) => (
                  <button
                    key={scoreVal}
                    type="button"
                    onClick={() => setGradeScore(scoreVal)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {scoreVal}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Umpan Balik Guru (Feedback):</label>
              <textarea
                placeholder="Tulis saran atau evaluasi pengerjaan siswa..."
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', border: '1px solid #cbd5e1', outline: 'none', height: '50px', resize: 'none', color: '#1e293b' }}
              />
            </div>

            {/* Submit btn */}
            <button
              type="submit"
              disabled={submittingGrade}
              style={{
                padding: '10px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 800,
                backgroundColor: theme.primary,
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                marginTop: '8px'
              }}
              className="btn-action-hover"
            >
              {submittingGrade ? 'Menyimpan Nilai...' : 'Simpan Penilaian'}
            </button>
          </form>
        </div>
      )}

      {/* 7. Modal Popup: Portfolio Grading Console (Beri Nilai Konversi) */}
      {showPortfolioGradingModal && selectedPortfolio && (
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
            onSubmit={handleGradePortfolio}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              width: '90%',
              maxWidth: '420px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  🏠 Penilaian Portofolio Homeschooling
                </h3>
                <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Siswa: <strong>{selectedPortfolio.studentName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setShowPortfolioGradingModal(false); setSelectedPortfolio(null); }}
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

            {/* Portfolio detail summary */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '0.75rem'
            }}>
              <p style={{ margin: '0 0 4px 0', color: '#64748b', fontWeight: 600 }}>Judul Portofolio:</p>
              <p style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#1e293b' }}>{selectedPortfolio.title}</p>
              
              {selectedPortfolio.fileUrl && (
                <a 
                  href={selectedPortfolio.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  📂 Buka Lampiran Portofolio
                </a>
              )}
            </div>

            {/* Score Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Nilai Konversi Akademik (0 - 100):</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Masukkan nilai konversi..."
                value={portfolioGradeScore}
                onChange={(e) => setPortfolioGradeScore(e.target.value !== '' ? Number(e.target.value) : '')}
                style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #cbd5e1', outline: 'none', fontWeight: 800, color: '#1e293b' }}
                required
              />
            </div>

            {/* Quick Grades Buttons Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>Pintasan Skor Cepat:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[100, 95, 90, 85, 80, 75].map((scoreVal) => (
                  <button
                    key={scoreVal}
                    type="button"
                    onClick={() => setPortfolioGradeScore(scoreVal)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {scoreVal}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Feedback / Catatan Evaluasi Ustadz:</label>
              <textarea
                placeholder="Tulis umpan balik guru atau ulasan apresiasi..."
                value={portfolioGradeFeedback}
                onChange={(e) => setPortfolioGradeFeedback(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', border: '1px solid #cbd5e1', outline: 'none', height: '60px', resize: 'none', color: '#1e293b' }}
              />
            </div>

            {/* Submit btn */}
            <button
              type="submit"
              disabled={submittingPortfolioGrade}
              style={{
                padding: '10px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 800,
                backgroundColor: theme.primary,
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                marginTop: '8px'
              }}
              className="btn-action-hover"
            >
              {submittingPortfolioGrade ? 'Menyimpan Nilai Konversi...' : 'Simpan Nilai Konversi'}
            </button>
          </form>
        </div>
      )}

    </DashboardLayout>
  );
}
