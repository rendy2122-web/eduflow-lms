'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import PortfolioForm from '@/components/PortfolioForm';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SiswaTask {
  id: string;
  title: string;
  subject: string;
  deadline: string;
  status: 'belum_kirim' | 'sudah_kirim';
  score?: number | null;
}

interface TahfidzLog {
  id: string;
  surah_name: string;
  range: string;
  status: string;
  date: string;
  progress: number;
}

interface StudentInfo {
  id: string;
  nama: string;
  email: string;
  class: string;
  nisn: string;
}

interface AiRecommendation {
  type: 'warning' | 'success' | 'info';
  message: string;
  notes: string;
  tips: string;
}

interface ExamItem {
  id: string;
  title: string;
  description: string;
  duration: number;
  deadline: string;
  subjectName: string;
  totalQuestions: number;
  status: 'belum_kirim' | 'sudah_kirim';
  score?: number | null;
}

interface QuestionItem {
  id: string;
  question_text: string;
  options: string[];
  correct_option: string;
}

interface OnlineClassItem {
  id: string;
  title: string;
  date: string;
  time: string;
  platform: string;
  link: string;
  class_name: string;
  subject_name: string;
  notes?: string;
  created_at: string;
}

export default function SiswaDashboardPage() {
  const pathname = usePathname();
  const getTenantId = (path: string | null): string => {
    if (!path) return '';
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 0 && segments[0] !== 'dashboard' && segments[0] !== 'login' && segments[0] !== 'api' && segments[0] !== 'saas-admin') {
      return segments[0];
    }
    return '';
  };
  const tenantId = getTenantId(pathname);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [tasks, setTasks] = useState<SiswaTask[]>([]);
  const [tahfidzLogs, setTahfidzLogs] = useState<TahfidzLog[]>([]);
  const [attendanceRate, setAttendanceRate] = useState(100);
  const [averageGrade, setAverageGrade] = useState(0);
  const [aiRecommendation, setAiRecommendation] = useState<AiRecommendation | null>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [onlineClasses, setOnlineClasses] = useState<OnlineClassItem[]>([]);


  // Exam States
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [showExamModal, setShowExamModal] = useState(false);
  const [activeExam, setActiveExam] = useState<any>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const answersRef = useRef(studentAnswers);
  useEffect(() => {
    answersRef.current = studentAnswers;
  }, [studentAnswers]);
  const [examTimer, setExamTimer] = useState(0);
  const [examSubmitting, setExamSubmitting] = useState(false);

  // Habit Tracker States
  const [habitLogs, setHabitLogs] = useState<any[]>([]);
  const [selectedHabitDate, setSelectedHabitDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [savingHabit, setSavingHabit] = useState(false);
  const [habitMessage, setHabitMessage] = useState<string | null>(null);

  // File Upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Self-paced milestones state
  const [milestones, setMilestones] = useState<any[]>([]);
  const [milestonesLoading, setMilestonesLoading] = useState(false);

  // Homeschooling Tab & Consultation Chat & Portfolios states
  const [activeDashboardTab, setActiveDashboardTab] = useState<'main' | 'homeschool'>('main');
  const [studentChats, setStudentChats] = useState<any[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [newChatMsg, setNewChatMsg] = useState('');
  const [sendingChatMsg, setSendingChatMsg] = useState(false);
  const [hsPortfolios, setHsPortfolios] = useState<any[]>([]);
  const [hsLoading, setHsLoading] = useState(false);
  const [newHsTitle, setNewHsTitle] = useState('');
  const [newHsSubject, setNewHsSubject] = useState('IPAS');
  const [newHsNotes, setNewHsNotes] = useState('');
  const [newHsDate, setNewHsDate] = useState(new Date().toISOString().split('T')[0]);
  const [newHsType, setNewHsType] = useState('Akademik');
  const [newHsDuration, setNewHsDuration] = useState('1 Jam');
  const [newHsReflection, setNewHsReflection] = useState('');
  const [hsFile, setHsFile] = useState<File | null>(null);
  const [hsSubmitStatus, setHsSubmitStatus] = useState<string | null>(null);

  // Fetch student profile & dashboard metrics
  const fetchStudentData = useCallback(async () => {
    try {
      setLoading(true);
      const [res, onlineClassRes] = await Promise.all([
        fetch('/api/siswa/dashboard'),
        fetch('/api/siswa/online-class')
      ]);
      const json = await res.json();
      const onlineClassJson = await onlineClassRes.json();
      
      if (json.success) {
        setStudentInfo(json.studentInfo);
        setTasks(json.tasks);
        setTahfidzLogs(json.tahfidz);
        setAttendanceRate(json.attendanceRate);
        setAverageGrade(json.averageGrade);
        setAiRecommendation(json.aiRecommendation);
        setBadges(json.badges || []);
      }
      if (onlineClassJson.success) {
        setOnlineClasses(onlineClassJson.classes);
      }
    } catch (err) {
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch student exams list
  const fetchExams = useCallback(async () => {
    try {
      const res = await fetch('/api/exams?role=siswa');
      const json = await res.json();
      if (json.success) {
        setExams(json.exams);
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
    }
  }, []);

  // Fetch weekly habit logs
  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch('/api/siswa/habit?range=weekly');
      const json = await res.json();
      if (json.success) {
        setHabitLogs(json.logs || []);
      }
    } catch (err) {
      console.error('Error fetching weekly habits:', err);
    }
  }, []);

  const fetchMilestones = useCallback(async () => {
    try {
      setMilestonesLoading(true);
      const res = await fetch('/api/siswa/progress-tracker');
      const json = await res.json();
      if (json.success) {
        setMilestones(json.milestones || []);
      }
    } catch (err) {
      console.error('Error fetching milestones:', err);
    } finally {
      setMilestonesLoading(false);
    }
  }, []);

  const fetchStudentPortfolios = useCallback(async () => {
    try {
      setHsLoading(true);
      const res = await fetch('/api/orang-tua/co-teacher');
      const json = await res.json();
      if (json.success) {
        setHsPortfolios(json.portfolios || []);
      }
    } catch (err) {
      console.error('Error fetching student portfolios:', err);
    } finally {
      setHsLoading(false);
    }
  }, []);

  const fetchStudentChats = useCallback(async (studentId: string) => {
    if (!studentId) return;
    try {
      setLoadingChats(true);
      const res = await fetch(`/api/guru/consultation?studentId=${studentId}`);
      const json = await res.json();
      if (json.success) {
        setStudentChats(json.logs || []);
      }
    } catch (err) {
      console.error('Error fetching student chats:', err);
    } finally {
      setLoadingChats(false);
    }
  }, []);

  const handleSendChatMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMsg.trim() || !studentInfo) return;

    try {
      setSendingChatMsg(true);
      const res = await fetch('/api/guru/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentInfo.id,
          senderRole: 'siswa',
          senderName: studentInfo.nama,
          message: newChatMsg.trim()
        })
      });
      const json = await res.json();
      if (json.success) {
        setNewChatMsg('');
        await fetchStudentChats(studentInfo.id);
      }
    } catch (err) {
      console.error('Error sending chat:', err);
    } finally {
      setSendingChatMsg(false);
    }
  };

  const handleSubmitHsPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHsTitle.trim() || !newHsSubject) return;

    try {
      setHsSubmitStatus('Mengirim laporan...');
      const formData = new FormData();
      formData.append('title', newHsTitle.trim());
      formData.append('subject', newHsSubject);
      
      // Serialize detailed fields into notes
      const serializedNotes = `[Tanggal: ${newHsDate}] [Kategori: ${newHsType}] [Durasi: ${newHsDuration}]\nDeskripsi: ${newHsNotes.trim()}\nRefleksi: ${newHsReflection.trim()}`;
      formData.append('notes', serializedNotes);
      
      if (hsFile) {
        formData.append('file', hsFile);
      }

      const res = await fetch('/api/orang-tua/co-teacher', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      if (json.success) {
        setHsSubmitStatus('Laporan portofolio berhasil dikirim! 👍');
        setNewHsTitle('');
        setNewHsNotes('');
        setNewHsReflection('');
        setNewHsType('Akademik');
        setNewHsDuration('1 Jam');
        setNewHsDate(new Date().toISOString().split('T')[0]);
        setHsFile(null);
        const fileEl = document.getElementById('hs-file-input') as HTMLInputElement;
        if (fileEl) fileEl.value = '';
        await fetchStudentPortfolios();
        setTimeout(() => setHsSubmitStatus(null), 3500);
      } else {
        setHsSubmitStatus(`Gagal mengirim: ${json.error}`);
        setTimeout(() => setHsSubmitStatus(null), 3500);
      }
    } catch (err: any) {
      setHsSubmitStatus(`Error: ${err.message}`);
      setTimeout(() => setHsSubmitStatus(null), 3500);
    }
  };

  const handleToggleMilestone = async (milestoneId: string, completed: boolean) => {
    try {
      // Optimistic update
      setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, completed } : m));

      const res = await fetch('/api/siswa/progress-tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId, completed })
      });
      const json = await res.json();
      if (json.success) {
        await fetchStudentData();
      } else {
        // Rollback
        setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, completed: !completed } : m));
        alert('Gagal mengupdate progres: ' + json.error);
      }
    } catch (err) {
      console.error('Error updating milestone:', err);
    }
  };

  useEffect(() => {
    fetchStudentData();
    fetchExams();
    fetchHabits();
    fetchMilestones();
  }, [fetchStudentData, fetchExams, fetchHabits, fetchMilestones]);

  useEffect(() => {
    if (studentInfo) {
      fetchStudentPortfolios();
      fetchStudentChats(studentInfo.id);
    }
  }, [studentInfo, fetchStudentPortfolios, fetchStudentChats]);

  const triggerUploadModal = (id: string) => {
    setUploadingTaskId(id);
    setSelectedFile(null);
    setShowUploadModal(true);
  };

  const handleUploadAssignment = async () => {
    if (!uploadingTaskId || !selectedFile) {
      alert('Silakan pilih file terlebih dahulu');
      return;
    }

    try {
      setUploadStatus('Mengunggah berkas...');
      
      const formData = new FormData();
      formData.append('task_id', uploadingTaskId);
      formData.append('file', selectedFile);

      const res = await fetch('/api/siswa/submit-task', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();
      if (json.success) {
        setUploadStatus('Tugas berhasil dikirim! 📂');
        setShowUploadModal(false);
        await fetchStudentData();
        setTimeout(() => setUploadStatus(null), 3000);
      } else {
        setUploadStatus(`Gagal mengirim: ${json.error}`);
        setTimeout(() => setUploadStatus(null), 3000);
      }
    } catch (err: any) {
      setUploadStatus(`Error: ${err.message}`);
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  // Start Exam Sesi
  const handleStartExam = async (exam: ExamItem) => {
    if (!confirm(`Apakah Anda siap memulai ujian "${exam.title}"? Waktu pengerjaan adalah ${exam.duration} menit dan halaman akan dikunci.`)) return;

    try {
      const res = await fetch(`/api/exams?role=siswa&examId=${exam.id}`);
      const json = await res.json();
      if (json.success) {
        setActiveExam(json.exam);
        setStudentAnswers({});
        setExamTimer(json.exam.duration * 60); // convert minutes to seconds
        setShowExamModal(true);
      } else {
        alert('Gagal memuat detail ujian: ' + json.error);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal terhubung ke server ujian.');
    }
  };

  // Select Option for a Question
  const handleOptionChange = (questionId: string, option: string) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));
  };

  // Submit Exam manually by student
  const handleSubmitExam = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const answeredCount = Object.keys(studentAnswers).length;
    const totalCount = activeExam?.questions?.length || 0;

    if (answeredCount < totalCount) {
      if (!confirm(`Anda baru menjawab ${answeredCount} dari ${totalCount} soal. Tetap kirimkan ujian?`)) {
        return;
      }
    } else {
      if (!confirm('Apakah Anda yakin ingin mengumpulkan ujian Anda sekarang?')) {
        return;
      }
    }

    setExamSubmitting(true);
    try {
      const res = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: activeExam.id,
          answers: studentAnswers
        })
      });
      const json = await res.json();
      if (json.success) {
        alert(`Ujian selesai dikumpulkan! 🎉\nSkor Anda: ${json.score} / 100\nBenar: ${json.correctCount} dari ${json.totalQuestions} soal.`);
        setShowExamModal(false);
        setActiveExam(null);
        await fetchStudentData();
        await fetchExams();
      } else {
        alert('Gagal mengirim jawaban: ' + json.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error saat mengumpulkan ujian.');
    } finally {
      setExamSubmitting(false);
    }
  };

  // Auto Submit when Timer hits 0
  const handleAutoSubmit = useCallback(async () => {
    if (!activeExam) return;
    setExamSubmitting(true);
    try {
      const res = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: activeExam.id,
          answers: answersRef.current
        })
      });
      const json = await res.json();
      if (json.success) {
        alert(`Waktu ujian telah HABIS! Ujian Anda otomatis dikumpulkan.\nSkor Anda: ${json.score} / 100`);
        setShowExamModal(false);
        setActiveExam(null);
        await fetchStudentData();
        await fetchExams();
      }
    } catch (err) {
      console.error('Auto-submit failed:', err);
    } finally {
      setExamSubmitting(false);
    }
  }, [activeExam, fetchStudentData, fetchExams]);

  // Habit Tracker Handlers
  const updateHabitField = (field: string, value: any) => {
    setHabitLogs((prev) =>
      prev.map((log) => {
        if (log.date === selectedHabitDate) {
          return { ...log, [field]: value, verified: false };
        }
        return log;
      })
    );
  };

  const handleSaveHabit = async () => {
    const logToSave = habitLogs.find((l) => l.date === selectedHabitDate);
    if (!logToSave) return;

    try {
      setSavingHabit(true);
      setHabitMessage('Menyimpan jurnal amalan...');
      const res = await fetch('/api/siswa/habit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedHabitDate,
          subuh: logToSave.subuh,
          dzuhur: logToSave.dzuhur,
          ashar: logToSave.ashar,
          maghrib: logToSave.maghrib,
          isya: logToSave.isya,
          duha: logToSave.duha,
          tahajjud: logToSave.tahajjud,
          tadarrus: logToSave.tadarrus,
          birrul_walidain: logToSave.birrul_walidain,
          belajar: logToSave.belajar
        })
      });

      const json = await res.json();
      if (json.success) {
        setHabitMessage('Jurnal amalan berhasil disimpan! 🕌');
        await fetchHabits();
        setTimeout(() => setHabitMessage(null), 3500);
      } else {
        setHabitMessage(`Gagal menyimpan: ${json.error}`);
        setTimeout(() => setHabitMessage(null), 3500);
      }
    } catch (err: any) {
      setHabitMessage(`Error: ${err.message}`);
      setTimeout(() => setHabitMessage(null), 3500);
    } finally {
      setSavingHabit(false);
    }
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

  // Handle countdown timer inside the exam session
  useEffect(() => {
    if (showExamModal && examTimer > 0) {
      const interval = setInterval(() => {
        setExamTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showExamModal, examTimer, handleAutoSubmit]);

  if (loading) {
    return (
      <DashboardLayout activeMenu="dashboard" pageTitle="Dasbor Siswa" pageSubtitle="Memuat portofolio belajar...">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '24px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ height: '52px', borderRadius: '10px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  // Linear Chart Coordinates
  const gradedTasks = tasks.filter(t => t.status === 'sudah_kirim' && t.score !== null);
  const chartData = gradedTasks.length > 0 
    ? gradedTasks.map((t) => ({ label: t.subject.substring(0, 8), value: t.score || 0 }))
    : [
        { label: 'PAI', value: 90 },
        { label: 'Math', value: 85 },
        { label: 'Fisika', value: 82 },
        { label: 'Sains', value: 88 }
      ];

  const chartMax = 100;
  const chartHeight = 150;
  const chartWidth = 380;
  const padding = 30;

  const points = chartData.map((d, i) => {
    const x = padding + (i * (chartWidth - padding * 2)) / (chartData.length - 1 || 1);
    const y = chartHeight - padding - (d.value * (chartHeight - padding * 2)) / chartMax;
    return `${x},${y}`;
  }).join(' ');

  // Timer Formatting (MM:SS)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };



  return (
    <DashboardLayout activeMenu="dashboard" pageTitle={`Selamat Datang, ${studentInfo?.nama}!`} pageSubtitle={`Dasbor Siswa Kelas ${studentInfo?.class || '4A'} | NISN. ${studentInfo?.nisn || '-'}`}>
      
      {/* Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scaleIn { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulseAlert { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); color: #ef4444; } }
        .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .timer-warning { animation: pulseAlert 1s infinite; font-weight: 800; color: #dc2626; }
        .card-premium-hover { transition: all 0.3s ease; }
        .card-premium-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -10px rgba(99, 102, 241, 0.12); }
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      ` }} />

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        gap: '12px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '16px',
        marginBottom: '24px'
      }}>
        <button
          type="button"
          onClick={() => setActiveDashboardTab('main')}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: activeDashboardTab === 'main' ? '#4f46e5' : '#f1f5f9',
            color: activeDashboardTab === 'main' ? '#ffffff' : '#64748b',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeDashboardTab === 'main' ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none'
          }}
        >
          🏫 Dasbor Utama & Ujian
        </button>
        <button
          type="button"
          onClick={() => setActiveDashboardTab('homeschool')}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: activeDashboardTab === 'homeschool' ? '#4f46e5' : '#f1f5f9',
            color: activeDashboardTab === 'homeschool' ? '#ffffff' : '#64748b',
            fontWeight: 800,
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeDashboardTab === 'homeschool' ? '0 4px 12px rgba(79, 70, 229, 0.25)' : 'none'
          }}
        >
          🏡 Ruang Belajar Homeschooling
        </button>
      </div>

      <div className="dashboard-grid">
        
        {/* Left Column: Main Dashboard Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {activeDashboardTab === 'main' ? (
            <>
              {/* Stats Grid */}
              <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                {/* Card 1: Attendance */}
                <div className="card-premium card-premium-hover" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Persentase Kehadiran</p>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 850, color: '#10b981', margin: 0 }}>{attendanceRate}%</h3>
                  </div>
                  <svg width="50" height="50" viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray={`${attendanceRate}, 100`} strokeLinecap="round" />
                  </svg>
                </div>

                {/* Card 2: Average Grades */}
                <div className="card-premium card-premium-hover" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px' }}>
                  <p style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Rata-rata Nilai Tugas</p>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 850, color: '#4f46e5', margin: 0 }}>
                    {averageGrade} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#94a3b8' }}>/ 100</span>
                  </h3>
                </div>

                {/* Card 3: Tasks Left */}
                <div className="card-premium card-premium-hover" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px' }}>
                  <p style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Tugas Belum Dikirim</p>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 850, color: '#f59e0b', margin: 0 }}>
                    {tasks.filter(t => t.status === 'belum_kirim').length} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#94a3b8' }}>Materi</span>
                  </h3>
                </div>
              </section>

              {/* Widget Kelas Online Hari Ini */}
              {onlineClasses.length > 0 && (
                <section className="card-premium animate-scale-in" style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)',
                  padding: '24px',
                  boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.25rem' }}>🎥</span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                        Kelas Online Hari Ini
                      </h3>
                    </div>
                    <Link
                      href={tenantId ? `/${tenantId}/dashboard/siswa/online-class` : '/dashboard/siswa/online-class'}
                      style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}
                    >
                      Lihat Semua →
                    </Link>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    {onlineClasses.slice(0, 2).map((item) => {
                      const isGMeet = item.platform === 'gmeet';
                      const platformColor = isGMeet ? '#10b981' : '#2563eb';
                      const platformBg = isGMeet ? '#ecfdf5' : '#eff6ff';

                      return (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#ffffff',
                            padding: '16px 20px',
                            borderRadius: '14px',
                            border: '1px solid #e2e8f0',
                            gap: '16px'
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: platformColor, backgroundColor: platformBg, padding: '2px 6px', borderRadius: '4px' }}>
                                {isGMeet ? 'Google Meet' : 'Zoom'}
                              </span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                                {item.subject_name}
                              </span>
                            </div>
                            <h4 style={{ fontSize: '0.925rem', fontWeight: 800, color: '#0f172a', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {item.title}
                            </h4>
                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>
                              🕒 {item.time}
                            </p>
                          </div>
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '8px 16px',
                              background: platformColor,
                              color: '#ffffff',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              boxShadow: `0 4px 10px -2px ${platformColor}4D`,
                              display: 'block',
                              flexShrink: 0
                            }}
                          >
                            Gabung
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* AI Assistants Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* AI Murajaah Assistant Card */}
                {aiRecommendation && (
                  <section className="card-premium" style={{
                    background: aiRecommendation.type === 'warning' 
                      ? 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)' 
                      : 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                    border: aiRecommendation.type === 'warning' 
                      ? '1px solid #fde047' 
                      : '1px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px 24px',
                    borderRadius: '16px'
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      backgroundColor: aiRecommendation.type === 'warning' ? '#fef3c7' : '#dcfce7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>🤖</span>
                    </div>
                    <div>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700,
                        color: aiRecommendation.type === 'warning' ? '#b45309' : '#166534',
                        textTransform: 'uppercase', letterSpacing: '0.05em'
                      }}>
                        Rekomendasi Asisten Murajaah AI
                      </span>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginTop: '2px', marginBottom: '1px' }}>
                        {aiRecommendation.message}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                        {aiRecommendation.notes}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: '#1e293b', marginTop: '4px', margin: 0 }}>
                        💡 <strong>Tips Hafalan:</strong> {aiRecommendation.tips}
                      </p>
                    </div>
                  </section>
                )}

                {/* AI Study Advisor Card */}
                {(() => {
                  const lowestGradedTask = tasks
                    .filter(t => t.status === 'sudah_kirim' && t.score !== null && t.score !== undefined)
                    .reduce((minTask, currentTask) => {
                      if (!minTask) return currentTask;
                      return (currentTask.score ?? 100) < (minTask.score ?? 100) ? currentTask : minTask;
                    }, null as SiswaTask | null);

                  const needsRemedial = lowestGradedTask && (lowestGradedTask.score ?? 100) < 75;

                  return (
                    <section className="card-premium" style={{
                      background: needsRemedial 
                        ? 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)' 
                        : 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
                      border: needsRemedial 
                        ? '1px solid #fed7aa' 
                        : '1px solid #bfdbfe',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '20px 24px',
                      borderRadius: '16px'
                    }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        backgroundColor: needsRemedial ? '#ffedd5' : '#dbeafe',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <span style={{ fontSize: '1.2rem' }}>🤖</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 700,
                          color: needsRemedial ? '#c2410c' : '#1d4ed8',
                          textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>
                          Rekomendasi Akademik AI Study Advisor
                        </span>
                        {needsRemedial ? (
                          <>
                            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginTop: '2px', marginBottom: '1px' }}>
                              Perlu Remedial Akademik: Nilai tugas &ldquo;{lowestGradedTask?.title}&rdquo; Anda untuk mata pelajaran {lowestGradedTask?.subject} terdeteksi {lowestGradedTask?.score} (di bawah KKM 75).
                            </p>
                            <p style={{ fontSize: '0.85rem', color: '#1e293b', marginTop: '4px', margin: 0 }}>
                              💡 <strong>Saran AI:</strong> {
                                lowestGradedTask?.subject.toLowerCase().includes('matematika') || lowestGradedTask?.subject.toLowerCase().includes('math')
                                  ? 'Silakan kerjakan ulang soal-soal latihan mandiri pecahan desimal / aljabar di modul belajar LMS dan tonton video pembahasan matematika kelas 4.'
                                  : lowestGradedTask?.subject.toLowerCase().includes('pai') || lowestGradedTask?.subject.toLowerCase().includes('agama')
                                  ? 'Silakan pelajari kembali bab materi Akhlak Mulia / Tajwid di LMS, dengarkan audio materi, lalu mintalah bimbingan guru via Buku Penghubung.'
                                  : 'Baca kembali rangkuman bab materi bersangkutan di e-book kelas, buat peta konsep (mindmap) kecil untuk mempermudah ingatan, dan kerjakan kuis latihan kembali.'
                              }
                            </p>
                          </>
                        ) : (
                          <>
                            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginTop: '2px', marginBottom: '1px' }}>
                              Mumtaz! Seluruh nilai tugas Anda berada di atas ambang ketuntasan (&gt;= 75).
                            </p>
                            <p style={{ fontSize: '0.85rem', color: '#1e293b', marginTop: '4px', margin: 0 }}>
                              💡 <strong>Saran AI:</strong> Anda siap mengeksplorasi bab materi baru berikutnya di modul belajar LMS. Tetap konsisten dan rajin membaca!
                            </p>
                          </>
                        )}
                      </div>
                    </section>
                  );
                })()}
              </div>

              {/* Jurnal Mutaba'ah Yaumiyah (Worship Tracker) */}
              <section className="card-premium animate-scale-in" style={{ border: '1px solid #e2e8f0', borderRadius: '20px', background: '#ffffff', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '18px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      🕌 Jurnal Mutaba&apos;ah Yaumiyah (Worship Tracker)
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>Catat aktivitas ibadah shalat dan amalan karakter harian Anda.</p>
                  </div>
                  {habitMessage && (
                    <span className="animate-fade-in" style={{ fontSize: '0.82rem', color: '#4f46e5', fontWeight: 700, backgroundColor: '#eef2ff', padding: '6px 12px', borderRadius: '8px' }}>
                      {habitMessage}
                    </span>
                  )}
                </div>

                {/* 7-Day Calendar */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
                  {habitLogs.map((log) => {
                    const isActive = selectedHabitDate === log.date;
                    const isVerified = log.verified;
                    const isFilled = log.subuh !== 'lewat' || log.dzuhur !== 'lewat' || log.ashar !== 'lewat' || log.maghrib !== 'lewat' || log.isya !== 'lewat' || log.duha || log.tahajjud || log.tadarrus || log.birrul_walidain || log.belajar;
                    const dateObj = new Date(log.date);
                    const dayName = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][dateObj.getDay()];
                    const dayNum = log.date.split('-')[2];

                    return (
                      <button
                        key={log.date}
                        type="button"
                        onClick={() => setSelectedHabitDate(log.date)}
                        style={{
                          flex: '1',
                          minWidth: '60px',
                          padding: '12px 8px',
                          borderRadius: '14px',
                          border: isActive ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                          backgroundColor: isActive ? '#f5f3ff' : '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          outline: 'none'
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isActive ? '#4f46e5' : '#64748b' }}>{dayName}</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: isActive ? '#4f46e5' : '#1e293b' }}>{dayNum}</span>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: isVerified ? '#10b981' : isFilled ? '#3b82f6' : '#cbd5e1'
                        }} />
                      </button>
                    );
                  })}
                </div>

                {/* Habit Editor for Selected Date */}
                {(() => {
                  const activeLog = habitLogs.find(l => l.date === selectedHabitDate) || {
                    subuh: 'lewat', dzuhur: 'lewat', ashar: 'lewat', maghrib: 'lewat', isya: 'lewat',
                    duha: false, tahajjud: false, tadarrus: false, birrul_walidain: false, belajar: false,
                    verified: false
                  };

                  return (
                    <div className="animate-scale-in" style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                        <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                          📅 Jurnal Tanggal: {formatIndonesianDate(selectedHabitDate)}
                        </h3>
                        {activeLog.verified ? (
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#047857', backgroundColor: '#d1fae5', padding: '4px 10px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            ✓ Terverifikasi Orang Tua 👍
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', fontWeight: 750, color: '#b45309', backgroundColor: '#fef3c7', padding: '4px 10px', borderRadius: '99px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            ⏳ Menunggu Verifikasi Orang Tua
                          </span>
                        )}
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '10px' }}>🕌 Kepatuhan Shalat 5 Waktu</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                          {[
                            { key: 'subuh', label: 'Subuh 🌅' },
                            { key: 'dzuhur', label: 'Dzuhur ☀️' },
                            { key: 'ashar', label: 'Ashar ⛅' },
                            { key: 'maghrib', label: 'Maghrib 🌇' },
                            { key: 'isya', label: 'Isya 🌌' }
                          ].map((shalat) => {
                            const currentValue = activeLog[shalat.key as keyof typeof activeLog];
                            return (
                              <div key={shalat.key} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>{shalat.label}</span>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  {[
                                    { val: 'masjid', label: 'Masjid', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
                                    { val: 'rumah', label: 'Rumah', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
                                    { val: 'lewat', label: 'Tidak', color: '#ef4444', bg: '#fef2f2', border: '#fca5a5' }
                                  ].map((opt) => {
                                    const isSelected = currentValue === opt.val;
                                    return (
                                      <button
                                        key={opt.val}
                                        type="button"
                                        onClick={() => updateHabitField(shalat.key, opt.val)}
                                        style={{
                                          flex: 1,
                                          padding: '6px 2px',
                                          fontSize: '0.72rem',
                                          fontWeight: 700,
                                          borderRadius: '6px',
                                          border: isSelected ? `1px solid ${opt.border}` : '1px solid #e2e8f0',
                                          backgroundColor: isSelected ? opt.bg : '#ffffff',
                                          color: isSelected ? opt.color : '#64748b',
                                          cursor: 'pointer',
                                          transition: 'all 0.15s'
                                        }}
                                      >
                                        {opt.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '10px' }}>🌟 Amalan Sunnah & Karakter Harian</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                          {[
                            { key: 'duha', label: '🌅 Shalat Duha', desc: 'Melaksanakan shalat sunnah Duha' },
                            { key: 'tahajjud', label: '🌌 Shalat Tahajjud', desc: 'Melaksanakan shalat Qiyamul Lail' },
                            { key: 'tadarrus', label: '📖 Tadarrus Al-Qur\'an', desc: 'Membaca mushaf Al-Qur\'an harian' },
                            { key: 'birrul_walidain', label: '🤝 Membantu Orang Tua', desc: 'Birrul Walidain & berbakti' },
                            { key: 'belajar', label: '✏️ Belajar Mandiri', desc: 'Mengulang materi pelajaran/baca buku' }
                          ].map((sunnah) => {
                            const isChecked = !!activeLog[sunnah.key as keyof typeof activeLog];
                            return (
                              <button
                                key={sunnah.key}
                                type="button"
                                onClick={() => updateHabitField(sunnah.key, !isChecked)}
                                style={{
                                  textAlign: 'left',
                                  border: isChecked ? '1px solid #818cf8' : '1px solid #e2e8f0',
                                  backgroundColor: isChecked ? '#f5f3ff' : '#ffffff',
                                  borderRadius: '12px',
                                  padding: '12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px',
                                  transition: 'all 0.15s',
                                  outline: 'none'
                                }}
                              >
                                <div style={{
                                  width: '18px', height: '18px', borderRadius: '4px',
                                  border: isChecked ? '2px solid #4f46e5' : '2px solid #cbd5e1',
                                  backgroundColor: isChecked ? '#4f46e5' : 'transparent',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                  {isChecked && <span style={{ color: '#ffffff', fontSize: '0.65rem', fontWeight: 'bold' }}>✓</span>}
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isChecked ? '#4f46e5' : '#1e293b', display: 'block' }}>{sunnah.label}</span>
                                  <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginTop: '2px' }}>{sunnah.desc}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={handleSaveHabit}
                          disabled={savingHabit}
                          style={{
                            padding: '12px 24px',
                            borderRadius: '10px',
                            backgroundColor: '#4f46e5',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                          }}
                        >
                          {savingHabit ? 'Menyimpan...' : 'Simpan Jurnal Hari Ini 💾'}
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </section>

              {/* Achievements Section */}
              <section className="card-premium" style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      🏆 Pencapaian & Badge Tahfidz Siswa
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>Badge motivasi berdasarkan rekap hafalan Al-Qur&apos;an Anda.</p>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#10b981', color: '#ffffff', padding: '4px 10px', borderRadius: '99px' }}>
                    {badges.length} Badge Aktif
                  </span>
                </div>

                {badges.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, padding: '12px 0', textAlign: 'center' }}>
                    Belum ada badge yang terbuka. Terus lakukan setoran hafalan Quran untuk membuka badge pertama Anda!
                  </p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {badges.map((b) => (
                      <div key={b.id} style={{
                        backgroundColor: b.bgColor, border: `1px solid ${b.color}33`, borderRadius: '12px',
                        padding: '16px', display: 'flex', alignItems: 'center', gap: '12px'
                      }} title={`Didapatkan pada ${b.earnedAt}`}>
                        <div style={{
                          fontSize: '1.8rem', width: '44px', height: '44px', borderRadius: '50%',
                          backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', flexShrink: 0
                        }}>
                          {b.icon}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{b.title}</h4>
                          <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0 0', lineHeight: '1.3' }}>{b.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Online Exams List */}
              <section className="card-premium" style={{ border: '1px solid #e2e8f0', borderRadius: '20px', background: '#ffffff', padding: '24px' }}>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '18px' }}>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    📝 Ujian & Kuis Online Mandiri
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>Selesaikan ujian pilihan ganda terjadwal dari guru mata pelajaran.</p>
                </div>

                {exams.length === 0 ? (
                  <div style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8' }}>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>🎉</span>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>Tidak ada kuis atau ujian terjadwal saat ini.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {exams.map((ex) => {
                      const isFinished = ex.status === 'sudah_kirim';
                      return (
                        <div 
                          key={ex.id} 
                          style={{
                            border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px',
                            backgroundColor: isFinished ? '#f8fafc' : '#ffffff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div>
                            <span style={{
                              fontSize: '0.72rem', fontWeight: 700, color: '#4f46e5',
                              backgroundColor: '#e0e7ff', padding: '3px 8px', borderRadius: '6px'
                            }}>
                              {ex.subjectName}
                            </span>
                            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px 0' }}>
                              {ex.title}
                            </h4>
                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                              {ex.description || 'Tidak ada deskripsi.'}
                            </p>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>⏱️ Durasi:</span>
                              <strong style={{ color: '#0f172a' }}>{ex.duration} Menit</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>📅 Tenggat:</span>
                              <strong style={{ color: '#ef4444' }}>{ex.deadline.split('T')[0]}</strong>
                            </div>
                          </div>

                          {isFinished ? (
                            <div style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px',
                              padding: '10px 14px', fontSize: '0.82rem'
                            }}>
                              <span style={{ color: '#059669', fontWeight: 700 }}>Selesai ✓</span>
                              <span style={{ color: '#047857', fontWeight: 800 }}>Skor: {ex.score}/100</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartExam(ex)}
                              style={{
                                width: '100%', padding: '10px 0', borderRadius: '10px',
                                background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                                color: '#ffffff', fontWeight: 700, fontSize: '0.82rem', border: 'none',
                                cursor: 'pointer', boxShadow: '0 6px 12px -3px rgba(79, 70, 229, 0.25)',
                                transition: 'all 0.2s'
                              }}
                            >
                              Mulai Ujian 📝
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Tasks List & Trends Chart */}
              <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                {/* List Tugas & Upload */}
                <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ font: 'var(--font-h3)' }}>Tugas Kelas Mandiri</h2>
                    {uploadStatus && <span style={{ fontSize: '0.82rem', color: '#4f46e5', fontWeight: 700 }}>{uploadStatus}</span>}
                  </div>

                  {tasks.length === 0 ? (
                    <p style={{ font: 'var(--font-body)', color: 'hsl(var(--color-neutral-gray))', padding: 'var(--spacing-4) 0' }}>Tidak ada tugas yang ditugaskan ke kelas Anda.</p>
                  ) : (
                    tasks.map(t => (
                      <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', paddingBottom: '10px' }}>
                        <div>
                          <p style={{ fontWeight: 600 }}>{t.title}</p>
                          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--color-neutral-gray))' }}>
                            {t.subject} | Batas: <span style={{ color: 'red' }}>{t.deadline}</span>
                          </p>
                        </div>
                        {t.status === 'belum_kirim' ? (
                          <button 
                            onClick={() => triggerUploadModal(t.id)}
                            className="btn-primary" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            Kumpulkan
                          </button>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                            <span className="badge badge-success">Sudah Kirim</span>
                            {t.score !== null && t.score !== undefined && (
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--color-secondary))' }}>
                                Nilai: {t.score}/100
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Grafik Perkembangan Akademik */}
                <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                  <h2 style={{ font: 'var(--font-h3)' }}>Tren Perkembangan Nilai Akademik</h2>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: 'visible' }}>
                      <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(0,0,0,0.05)" strokeDasharray="3" />
                      <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="rgba(0,0,0,0.05)" strokeDasharray="3" />
                      <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(0,0,0,0.1)" />
                      <polyline fill="none" stroke="hsl(var(--color-primary))" strokeWidth="3.5" points={points} />
                      {chartData.map((d, i) => {
                        const x = padding + (i * (chartWidth - padding * 2)) / (chartData.length - 1 || 1);
                        const y = chartHeight - padding - (d.value * (chartHeight - padding * 2)) / chartMax;
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r="5" fill="hsl(var(--color-primary))" stroke="#fff" strokeWidth="2" />
                            <text x={x} y={y - 10} textAnchor="middle" fontSize="0.75rem" fontWeight="700" fill="#0f172a">{d.value}</text>
                            <text x={x} y={chartHeight - 10} textAnchor="middle" fontSize="0.65rem" fill="gray">{d.label}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </section>

              {/* Tahfidz Section */}
              <section>
                <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ font: 'var(--font-h3)', margin: 0 }}>Perkembangan Hafalan Al-Qur&apos;an (Tahfidz)</h2>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)', color: 'gray' }}>
                          <th style={{ paddingBottom: '8px' }}>Tanggal</th>
                          <th style={{ paddingBottom: '8px' }}>Surah / Ayat</th>
                          <th style={{ paddingBottom: '8px', textAlign: 'right' }}>Progres</th>
                          <th style={{ paddingBottom: '8px', textAlign: 'right' }}>Kelancaran</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tahfidzLogs.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ padding: '12px 0', textAlign: 'center', color: 'gray' }}>Belum ada catatan setoran Tahfidz.</td>
                          </tr>
                        ) : (
                          tahfidzLogs.map((log) => (
                            <tr key={log.id} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                              <td style={{ padding: '8px 0', color: 'gray' }}>{log.date}</td>
                              <td style={{ padding: '8px 0', fontWeight: 600 }}>{log.surah_name} ({log.range})</td>
                              <td style={{ padding: '8px 0', textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                  <span style={{ fontSize: '0.8rem', color: 'hsl(var(--color-neutral-gray))' }}>{log.progress}%</span>
                                  <div style={{ width: '80px', height: '6px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${log.progress}%`, height: '100%', backgroundColor: 'hsl(var(--color-primary))' }}></div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '8px 0', textAlign: 'right' }}>
                                <span className={`badge badge-${log.status === 'lancar' ? 'success' : 'warning'}`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              {/* SECTION: RENCANA BELAJAR MANDIRI TERBIMBING (R&D FITUR HOMESCHOOLING) */}
              <section className="card-premium animate-scale-in" style={{ border: '1px solid #e2e8f0', borderRadius: '20px', background: '#ffffff', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '18px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🎯 Rencana Belajar Mandiri Terbimbing (Self-Paced Learning Path)
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>Tandai bab materi yang telah selesai Anda pelajari di rumah secara mandiri.</p>
                  </div>
                  {(() => {
                    const total = milestones.length;
                    const completed = milestones.filter(m => m.completed).length;
                    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                    return (
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b' }}>PROGRES MANDIRI</span>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#4f46e5', margin: 0 }}>{percent}% Selesai</h3>
                      </div>
                    );
                  })()}
                </div>

                {/* Progress Bar */}
                {(() => {
                  const total = milestones.length;
                  const completed = milestones.filter(m => m.completed).length;
                  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                  return (
                    <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden', marginBottom: '20px' }}>
                      <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#4f46e5', transition: 'width 0.3s ease-in-out' }}></div>
                    </div>
                  );
                })()}

                {milestonesLoading ? (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>Memuat target belajar mandiri...</div>
                ) : milestones.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>Tidak ada target belajar mandiri.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {Array.from(new Set(milestones.map(m => m.subject))).map(subject => {
                      const subjectMilestones = milestones.filter(m => m.subject === subject);
                      return (
                        <div key={subject} style={{ border: '1px solid #f1f5f9', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc' }}>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4f46e5', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            📚 {subject}
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {subjectMilestones.map(m => (
                              <label key={m.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: m.completed ? '#64748b' : '#1e293b', fontWeight: m.completed ? 500 : 600 }}>
                                <input
                                  type="checkbox"
                                  checked={m.completed}
                                  onChange={(e) => handleToggleMilestone(m.id, e.target.checked)}
                                  style={{ cursor: 'pointer', marginTop: '3px' }}
                                />
                                <span style={{ textDecoration: m.completed ? 'line-through' : 'none' }}>
                                  {m.title}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Consultation Chat and Portfolio Submission Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                
                {/* Direct Consultation Chat Room */}
                <div className="card-premium animate-scale-in" style={{ border: '1px solid #e2e8f0', borderRadius: '20px', background: '#ffffff', padding: '24px' }}>
                  <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '18px' }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      💬 Konsultasi Langsung dengan Guru Kelas
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>Kirim pesan atau konsultasikan pembelajaran mandiri Anda dengan Wali Kelas.</p>
                  </div>

                  <div style={{
                    height: '320px',
                    overflowY: 'auto',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    {loadingChats ? (
                      <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.82rem', padding: '20px' }}>Memuat pesan...</div>
                    ) : studentChats.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem', padding: '20px' }}>Belum ada riwayat percakapan. Mulai percakapan pertama Anda!</div>
                    ) : (
                      studentChats.map((c) => {
                        const isMe = c.sender_role === 'siswa';
                        return (
                          <div key={c.id} style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start'
                          }}>
                            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, marginBottom: '2px' }}>
                              {c.sender_name} ({c.sender_role === 'guru' ? 'Guru' : c.sender_role === 'orang_tua' ? 'Orang Tua' : 'Siswa'})
                            </span>
                            <div style={{
                              backgroundColor: isMe ? '#4f46e5' : '#ffffff',
                              color: isMe ? '#ffffff' : '#1e293b',
                              padding: '10px 14px',
                              borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                              border: isMe ? 'none' : '1px solid #e2e8f0',
                              fontSize: '0.82rem',
                              lineHeight: '1.4',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {c.message}
                            </div>
                            <span style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: '2px' }}>{c.date}</span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={handleSendChatMsg} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Ketik pesan konsultasi Anda..."
                      value={newChatMsg}
                      onChange={(e) => setNewChatMsg(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        outline: 'none',
                        color: '#1e293b'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={sendingChatMsg || !newChatMsg.trim()}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        backgroundColor: '#4f46e5',
                        color: '#ffffff',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        boxShadow: '0 4px 10px rgba(79, 70, 229, 0.15)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {sendingChatMsg ? 'Mengirim...' : 'Kirim'}
                    </button>
                  </form>
                </div>

                {/* Portfolio / Task Submission Form */}
                <PortfolioForm
                  role="siswa"
                  title="📤 Pelaporan Portofolio & Tugas Mandiri"
                  description="Laporkan aktivitas belajar fisik/mandiri di rumah lengkap dengan lampiran berkas."
                  formState={{
                    title: newHsTitle,
                    subject: newHsSubject,
                    date: newHsDate,
                    type: newHsType,
                    duration: newHsDuration,
                    notes: newHsNotes,
                    reflection: newHsReflection,
                  }}
                  fileName={hsFile?.name}
                  onFieldChange={(field, value) => {
                    switch (field) {
                      case 'title':
                        setNewHsTitle(value);
                        break;
                      case 'subject':
                        setNewHsSubject(value);
                        break;
                      case 'date':
                        setNewHsDate(value);
                        break;
                      case 'type':
                        setNewHsType(value);
                        break;
                      case 'duration':
                        setNewHsDuration(value);
                        break;
                      case 'notes':
                        setNewHsNotes(value);
                        break;
                      case 'reflection':
                        setNewHsReflection(value);
                        break;
                    }
                  }}
                  onFileClick={() => document.getElementById('hs-file-input')?.click()}
                  onFileChange={(file) => setHsFile(file)}
                  onSubmit={handleSubmitHsPortfolio}
                  submitStatus={hsSubmitStatus}
                  isSubmitting={false}
                  fileInputRef={undefined}
                />

              </div>

              {/* List of Submitted Portfolios / Reports */}
              <section className="card-premium animate-scale-in" style={{ border: '1px solid #e2e8f0', borderRadius: '20px', background: '#ffffff', padding: '24px' }}>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '18px' }}>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    📂 Riwayat Portofolio Homeschooling & Tugas Mandiri Terkirim
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>Daftar aktivitas pembelajaran fisik yang telah dikumpulkan beserta konversi nilai dari Guru.</p>
                </div>

                {hsLoading ? (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>Memuat riwayat portofolio...</div>
                ) : hsPortfolios.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', margin: 0, padding: '12px 0' }}>Belum ada laporan portofolio atau tugas mandiri terkirim.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {hsPortfolios.map((p) => {
                      const isGraded = p.status === 'graded';
                      return (
                        <div key={p.id} style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '16px',
                          padding: '20px',
                          backgroundColor: '#ffffff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4f46e5', backgroundColor: '#e0e7ff', padding: '3px 8px', borderRadius: '6px', marginRight: '6px' }}>
                                {p.subject}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>📅 {p.date}</span>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 2px 0' }}>{p.title}</h4>
                              <p style={{ fontSize: '0.82rem', color: '#475569', margin: '4px 0 0 0' }}>{p.notes}</p>
                            </div>
                            <span className={`badge badge-${isGraded ? 'success' : 'warning'}`} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '99px' }}>
                              {isGraded ? 'Telah Dinilai' : 'Menunggu Review'}
                            </span>
                          </div>

                          {p.fileUrl && (
                            <div style={{ fontSize: '0.8rem', color: '#4f46e5' }}>
                              📁 Lampiran Bukti: <a href={p.fileUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: '#4f46e5', fontWeight: 600 }}>Unduh / Lihat Berkas</a>
                            </div>
                          )}

                          {isGraded ? (
                            <div style={{
                              backgroundColor: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              borderRadius: '12px',
                              padding: '14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              fontSize: '0.82rem'
                            }}>
                              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <div>🎓 <strong>Nilai Akademik:</strong> <span style={{ color: '#166534', fontWeight: 800, fontSize: '0.95rem' }}>{p.academicScore || '-'}</span></div>
                                {p.adabScore !== undefined && p.adabScore !== null && (
                                  <div>⭐ <strong>Nilai Adab Rumah:</strong> <span style={{ color: '#b45309', fontWeight: 800, fontSize: '0.95rem' }}>{p.adabScore}</span></div>
                                )}
                              </div>
                              {p.teacherFeedback && (
                                <div style={{ color: '#166534', fontStyle: 'italic', marginTop: '4px' }}>
                                  💬 <strong>Feedback Guru:</strong> &ldquo;{p.teacherFeedback}&rdquo;
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.78rem', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '10px', padding: '8px 12px', border: '1px dashed #cbd5e1' }}>
                              ⏳ Laporan Anda telah tersimpan. Guru akan segera memverifikasi aktivitas belajar fisik ini dan memberikan feedback serta konversi nilai akademik.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}

        </div>

        {/* Right Column: Student Profile & School Announcements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '24px' }}>
          {/* Student Profile Summary Card */}
          <div className="card-premium animate-scale-in" style={{ border: '1px solid #e2e8f0', borderRadius: '20px', background: '#ffffff', padding: '24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 850, color: '#0f172a', margin: 0 }}>
                👤 Profil Siswa
              </h3>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '6px' }}>
                AKTIF
              </span>
            </div>

            {/* Avatar Circle with Initials */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 800,
                boxShadow: '0 8px 16px rgba(79, 70, 229, 0.2)',
                textTransform: 'uppercase'
              }}>
                {studentInfo?.nama ? studentInfo.nama.charAt(0) : 'B'}
              </div>
            </div>

            {/* Student Name & NISN */}
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              {studentInfo?.nama || 'Bilal Al-Mansoori'}
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 16px 0', fontFamily: 'monospace' }}>
              NISN: {studentInfo?.nisn || '3120958172'}
            </p>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: '#f1f5f9', width: '100%', marginBottom: '16px' }} />

            {/* Profile Info Details List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Kelas:</span>
                <strong style={{ color: '#0f172a' }}>{studentInfo?.class || 'Kelas 5 - SD'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Email:</span>
                <strong style={{ color: '#0f172a' }}>{studentInfo?.email || 'siswa@sekolah.sch.id'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Kehadiran:</span>
                <strong style={{ color: '#10b981' }}>{attendanceRate}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Rata-rata Nilai:</span>
                <strong style={{ color: '#4f46e5' }}>{averageGrade} / 100</strong>
              </div>
            </div>

            {/* School Announcements Card */}
            <div style={{
              marginTop: '20px',
              padding: '14px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              textAlign: 'left'
            }}>
              <h5 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                📢 Pengumuman Sekolah
              </h5>
              <p style={{ fontSize: '0.74rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                Ujian Tengah Semester Ganjil akan dilaksanakan secara serentak mulai tanggal 20 Juni 2026. Persiapkan diri Anda!
              </p>
            </div>

          </div>
        </div>
      </div>


      {/* ════════════════════════════════════════════════════════════════
           SECTION: EXAM SESSION WORKSTATION FULLSCREEN MODAL
         ════════════════════════════════════════════════════════════════ */}
      {showExamModal && activeExam && (
        <div className="animate-fade-in" style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: '#f8fafc', zIndex: 99999, overflowY: 'auto',
          display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif'
        }}>
          {/* Header Bar */}
          <header style={{
            position: 'sticky', top: 0, background: '#ffffff', borderBottom: '1px solid #e2e8f0',
            padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4f46e5', backgroundColor: '#e0e7ff', padding: '3px 8px', borderRadius: '6px' }}>
                {activeExam.subjectName}
              </span>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 850, color: '#0f172a', margin: '4px 0 0 0' }}>
                {activeExam.title}
              </h2>
            </div>

            {/* Countdown Timer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', backgroundColor: examTimer < 60 ? '#fef2f2' : '#f8fafc', border: `1px solid ${examTimer < 60 ? '#fca5a5' : '#e2e8f0'}` }}>
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Sisa Waktu:</span>
              <span className={examTimer < 60 ? 'timer-warning' : ''} style={{ fontSize: '1.1rem', fontFamily: 'monospace', fontWeight: 700 }}>
                {formatTime(examTimer)}
              </span>
            </div>
          </header>

          {/* Test Questions Container */}
          <main style={{ maxWidth: '740px', width: '100%', margin: '0 auto', padding: '40px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}>
            <form onSubmit={handleSubmitExam} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {activeExam.questions.map((q: QuestionItem, index: number) => {
                const isSelected = studentAnswers[q.id];
                
                return (
                  <div 
                    key={q.id} 
                    style={{
                      background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px',
                      padding: '28px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <span style={{
                        width: '26px', height: '26px', borderRadius: '8px', backgroundColor: '#f1f5f9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.85rem', fontWeight: 700, color: '#475569', flexShrink: 0
                      }}>
                        {index + 1}
                      </span>
                      <p style={{ fontSize: '0.94rem', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: '1.5' }}>
                        {q.question_text}
                      </p>
                    </div>

                    {/* Radio Options Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '38px' }}>
                      {q.options.map((option: string, optIdx: number) => {
                        const optKey = String.fromCharCode(65 + optIdx); // 'A', 'B', 'C', 'D'
                        const checked = studentAnswers[q.id] === optKey;

                        return (
                          <label 
                            key={optIdx}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                              borderRadius: '12px', border: `1px solid ${checked ? '#818cf8' : '#e2e8f0'}`,
                              backgroundColor: checked ? '#f5f3ff' : '#ffffff',
                              cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.88rem', fontWeight: checked ? 600 : 500,
                              color: checked ? '#4f46e5' : '#334155'
                            }}
                            onMouseEnter={(e) => {
                              if (!checked) e.currentTarget.style.borderColor = '#cbd5e1';
                            }}
                            onMouseLeave={(e) => {
                              if (!checked) e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                          >
                            <input 
                              type="radio" 
                              name={`q-${q.id}`} 
                              value={optKey}
                              checked={checked}
                              onChange={() => handleOptionChange(q.id, optKey)}
                              style={{ accentColor: '#4f46e5', width: '16px', height: '16px' }}
                            />
                            <span style={{ fontWeight: 700, color: checked ? '#4f46e5' : '#64748b' }}>{optKey}.</span>
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Form Footer Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '20px' }}>
                <button
                  type="submit"
                  disabled={examSubmitting}
                  style={{
                    padding: '12px 32px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff', fontWeight: 700, fontSize: '0.88rem', border: 'none',
                    cursor: 'pointer', boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.2s'
                  }}
                >
                  {examSubmitting ? 'Mengumpulkan...' : 'Kumpulkan Ujian Sekarang ✓'}
                </button>
              </div>

            </form>
          </main>
        </div>
      )}
      {/* MODAL UPLOAD TUGAS INTERAKTIF (R&D FILE UPLOAD) */}
      {showUploadModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px', animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '480px',
            padding: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative'
          }}>
            <button
              onClick={() => setShowUploadModal(false)}
              style={{
                position: 'absolute', top: '20px', right: '20px', border: 'none',
                backgroundColor: 'transparent', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b'
              }}
            >
              ✕
            </button>

            <div>
              <span style={{ fontSize: '2rem' }}>📂</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 850, color: '#0f172a', margin: '10px 0 4px 0' }}>
                Kumpulkan Berkas Tugas
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                Pilih file tugas Anda (PDF, Gambar, atau Dokumen) untuk dikirim langsung ke ustadz.
              </p>
            </div>

            <div style={{
              border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '30px 20px',
              textAlign: 'center', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '10px', cursor: 'pointer'
            }} onClick={() => document.getElementById('assignment-file-input')?.click()}>
              <input
                id="assignment-file-input"
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
              <span style={{ fontSize: '1.8rem' }}>📤</span>
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#4f46e5', display: 'block' }}>
                  {selectedFile ? selectedFile.name : 'Pilih Berkas dari Komputer'}
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                  {selectedFile ? `${Math.round(selectedFile.size / 1024)} KB` : 'Mendukung PDF, PNG, JPG (Maks. 5MB)'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{
                  padding: '10px 20px', borderRadius: '10px', backgroundColor: 'transparent',
                  border: '1.5px solid #cbd5e1', color: '#475569', fontWeight: 700,
                  fontSize: '0.85rem', cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                onClick={handleUploadAssignment}
                disabled={!selectedFile}
                style={{
                  padding: '10px 24px', borderRadius: '10px',
                  background: selectedFile 
                    ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' 
                    : '#e2e8f0',
                  color: selectedFile ? '#ffffff' : '#94a3b8',
                  fontWeight: 800, fontSize: '0.85rem', border: 'none',
                  cursor: selectedFile ? 'pointer' : 'default',
                  boxShadow: selectedFile ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none'
                }}
              >
                Kirim Berkas 📤
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
