'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import PortfolioForm from '@/components/PortfolioForm';

interface GradeItem {
  subject: string;
  score: number;
  teacher: string;
}

interface PendingTaskItem {
  title: string;
  subject: string;
  deadline: string;
}

interface TahfidzItem {
  date: string;
  surah: string;
  range: string;
  status: string;
  note: string;
}

interface AiRecommendation {
  type: 'warning' | 'success';
  title: string;
  message: string;
  tips: string;
}

interface ChildData {
  id: string;
  name: string;
  class: string;
  nisn: string;
  attendanceRate: string;
  averageGrade: string;
  pendingTasks: PendingTaskItem[];
  grades: GradeItem[];
  tahfidz: TahfidzItem[];
  aiRecommendation?: AiRecommendation | null;
  badges?: any[];
}

export default function OrtuDashboardPage() {
  const [children, setChildren] = useState<Record<string, ChildData>>({});
  const [childrenNames, setChildrenNames] = useState<string[]>([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [loading, setLoading] = useState(true);

  // States untuk Buku Penghubung
  const [consultationLogs, setConsultationLogs] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Parent-Child Habit Tracker States
  const [childHabitLogs, setChildHabitLogs] = useState<any[]>([]);
  const [selectedHabitDate, setSelectedHabitDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [verifyingHabit, setVerifyingHabit] = useState(false);
  const [habitMessage, setHabitMessage] = useState<string | null>(null);

  // Co-Teacher Console States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'coteacher'>('dashboard');
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [portfoliosLoading, setPortfoliosLoading] = useState(false);
  const [newPortfolioTitle, setNewPortfolioTitle] = useState('');
  const [newPortfolioSubject, setNewPortfolioSubject] = useState('IPAS');
  const [newPortfolioNotes, setNewPortfolioNotes] = useState('');
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [portfolioStatus, setPortfolioStatus] = useState<string | null>(null);
  const [adabScore, setAdabScore] = useState<number>(90);
  const [adabNotes, setAdabNotes] = useState('');
  const [adabStatus, setAdabStatus] = useState<string | null>(null);
  const [newPortfolioDate, setNewPortfolioDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPortfolioType, setNewPortfolioType] = useState('Akademik');
  const [newPortfolioDuration, setNewPortfolioDuration] = useState('1 Jam');
  const [newPortfolioReflection, setNewPortfolioReflection] = useState('');

  // Fetch children data
  async function fetchParentDashboardData() {
    try {
      setLoading(true);
      const res = await fetch('/api/orang-tua/dashboard');
      const json = await res.json();
      if (json.success) {
        setChildren(json.children);
        setChildrenNames(json.childrenNames);
        if (json.childrenNames.length > 0) {
          setSelectedChild(json.childrenNames[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching parent dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  const fetchConsultation = useCallback(async (studentId: string) => {
    try {
      const res = await fetch(`/api/guru/consultation?studentId=${studentId}`);
      const json = await res.json();
      if (json.success) {
        setConsultationLogs(json.logs || []);
      }
    } catch (err) {
      console.error('Error fetching consultation logs:', err);
    }
  }, []);

  const fetchChildHabits = useCallback(async (studentId: string) => {
    try {
      const res = await fetch(`/api/orang-tua/habit?range=weekly&studentId=${studentId}`);
      const json = await res.json();
      if (json.success) {
        setChildHabitLogs(json.logs || []);
      }
    } catch (err) {
      console.error('Error fetching child habits:', err);
    }
  }, []);

  const fetchPortfolios = useCallback(async () => {
    try {
      setPortfoliosLoading(true);
      const res = await fetch('/api/orang-tua/co-teacher');
      const json = await res.json();
      if (json.success) {
        setPortfolios(json.portfolios || []);
      }
    } catch (err) {
      console.error('Error fetching portfolios:', err);
    } finally {
      setPortfoliosLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParentDashboardData();
    fetchPortfolios();
  }, [fetchPortfolios]);

  const child = children[selectedChild] || null;

  useEffect(() => {
    if (child && child.id) {
      fetchConsultation(child.id);
      fetchChildHabits(child.id);
    }
  }, [selectedChild, children, child, fetchConsultation, fetchChildHabits]);

  const handleSubmitPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolioTitle.trim() || !newPortfolioSubject) {
      alert('Judul dan Mata Pelajaran wajib diisi');
      return;
    }

    try {
      setPortfolioStatus('Mengirim portofolio...');
      const formData = new FormData();
      formData.append('title', newPortfolioTitle.trim());
      formData.append('subject', newPortfolioSubject);
      
      const serializedNotes = `[Tanggal: ${newPortfolioDate}] [Kategori: ${newPortfolioType}] [Durasi: ${newPortfolioDuration}]\nDeskripsi: ${newPortfolioNotes.trim()}\nRencana Tindak Lanjut / Refleksi Ortu: ${newPortfolioReflection.trim()}`;
      formData.append('notes', serializedNotes);
      
      if (portfolioFile) {
        formData.append('file', portfolioFile);
      }

      const res = await fetch('/api/orang-tua/co-teacher', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      if (json.success) {
        setPortfolioStatus('Portofolio berhasil dikirim! 📂');
        setNewPortfolioTitle('');
        setNewPortfolioNotes('');
        setNewPortfolioReflection('');
        setNewPortfolioType('Akademik');
        setNewPortfolioDuration('1 Jam');
        setNewPortfolioDate(new Date().toISOString().split('T')[0]);
        setPortfolioFile(null);
        const fileInput = document.getElementById('portfolio-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        await fetchPortfolios();
        setTimeout(() => setPortfolioStatus(null), 3000);
      } else {
        setPortfolioStatus(`Gagal mengirim: ${json.error}`);
        setTimeout(() => setPortfolioStatus(null), 3000);
      }
    } catch (err: any) {
      setPortfolioStatus(`Error: ${err.message}`);
      setTimeout(() => setPortfolioStatus(null), 3000);
    }
  };

  const handleSubmitAdab = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAdabStatus('Mengirim nilai adab...');
      
      const formData = new FormData();
      formData.append('isAdab', 'true');
      formData.append('adabScore', adabScore.toString());
      formData.append('notes', adabNotes.trim());

      const res = await fetch('/api/orang-tua/co-teacher', {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      if (json.success) {
        setAdabStatus('Nilai adab harian berhasil disimpan! 👍');
        setAdabNotes('');
        await fetchPortfolios();
        setTimeout(() => setAdabStatus(null), 3000);
      } else {
        setAdabStatus(`Gagal mengirim: ${json.error}`);
        setTimeout(() => setAdabStatus(null), 3000);
      }
    } catch (err: any) {
      setAdabStatus(`Error: ${err.message}`);
      setTimeout(() => setAdabStatus(null), 3000);
    }
  };

  const handleSendConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !child || !child.id) return;

    try {
      setSendingMsg(true);
      const res = await fetch('/api/guru/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: child.id,
          senderRole: 'orang_tua',
          senderName: 'Pak Andi (Wali ' + child.name.split(' ')[0] + ')',
          message: newMsg.trim()
        })
      });
      const json = await res.json();
      if (json.success) {
        setNewMsg('');
        fetchConsultation(child.id);
      } else {
        alert('Gagal mengirim pesan: ' + json.error);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleVerifyHabit = async (dateStr: string, verifyStatus: boolean) => {
    if (!child || !child.id) return;

    try {
      setVerifyingHabit(true);
      setHabitMessage(verifyStatus ? 'Memverifikasi jurnal amalan...' : 'Membatalkan verifikasi...');
      const res = await fetch('/api/orang-tua/habit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: child.id,
          date: dateStr,
          verified: verifyStatus
        })
      });

      const json = await res.json();
      if (json.success) {
        setHabitMessage(verifyStatus ? 'Jurnal anak berhasil diverifikasi! 👍' : 'Verifikasi dibatalkan.');
        await fetchChildHabits(child.id);
        setTimeout(() => setHabitMessage(null), 3500);
      } else {
        setHabitMessage(`Gagal verifikasi: ${json.error}`);
        setTimeout(() => setHabitMessage(null), 3500);
      }
    } catch (err: any) {
      setHabitMessage(`Error: ${err.message}`);
      setTimeout(() => setHabitMessage(null), 3500);
    } finally {
      setVerifyingHabit(false);
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

  if (loading) {
    return (
      <DashboardLayout activeMenu="dashboard">
        <div style={{ padding: 'var(--spacing-8)', textAlign: 'center', color: 'hsl(var(--color-neutral-gray))' }}>
          Memuat data Portal Orang Tua...
        </div>
      </DashboardLayout>
    );
  }

  // Data koordinat untuk Bar Chart perbandingan nilai mapel
  const chartData = child && child.grades.length > 0
    ? child.grades.map(g => ({ label: g.subject.substring(0, 10), value: g.score }))
    : [
        { label: 'Matematika', value: 85 },
        { label: 'Agama Islam', value: 90 },
        { label: 'Fisika', value: 82 }
      ];

  const chartHeight = 160;
  const chartWidth = 360;
  const padding = 30;
  const barWidth = 40;
  const barGap = 30;

  return (
    <DashboardLayout activeMenu="dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-8)' }}>
        
        {/* Header Child Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
          <div>
            <h1 style={{ font: 'var(--font-h2)' }}>Portal Orang Tua</h1>
            <p style={{ color: 'hsl(var(--color-neutral-gray))', fontSize: '0.9rem' }}>Pantau perkembangan kehadiran, nilai, dan hafalan anak secara real-time.</p>
          </div>
          
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Pilih Nama Anak</label>
            {childrenNames.length === 0 ? (
              <span style={{ fontSize: '0.9rem', color: 'red' }}>Tidak ada profil anak terhubung</span>
            ) : (
              <select 
                className="form-control"
                value={selectedChild}
                onChange={e => setSelectedChild(e.target.value)}
                style={{ width: '220px' }}
              >
                {childrenNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {child ? (
          <>
            {/* TAB SWITCHER */}
            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                style={{
                  padding: '10px 20px', borderRadius: '10px',
                  backgroundColor: activeTab === 'dashboard' ? '#4f46e5' : 'transparent',
                  color: activeTab === 'dashboard' ? '#ffffff' : '#64748b',
                  fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s', boxShadow: activeTab === 'dashboard' ? '0 4px 10px rgba(79, 70, 229, 0.15)' : 'none'
                }}
              >
                📊 Dasbor Utama
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('coteacher')}
                style={{
                  padding: '10px 20px', borderRadius: '10px',
                  backgroundColor: activeTab === 'coteacher' ? '#4f46e5' : 'transparent',
                  color: activeTab === 'coteacher' ? '#ffffff' : '#64748b',
                  fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s', boxShadow: activeTab === 'coteacher' ? '0 4px 10px rgba(79, 70, 229, 0.15)' : 'none'
                }}
              >
                👨‍🏫 Mitra Pengajar (Co-Teacher Console)
              </button>
            </div>

            {activeTab === 'dashboard' ? (
              <>
                {/* Child Info Badge */}
                <div className="card-premium" style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-4) var(--spacing-6)', background: 'linear-gradient(to right, hsl(var(--color-primary-light)) 0%, hsl(var(--color-white)) 100%)', border: '1px solid rgba(var(--color-primary), 0.1)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--color-neutral-gray))', fontWeight: 600 }}>Siswa Aktif</span>
                    <h3 style={{ font: 'var(--font-h3)', color: 'hsl(var(--color-primary))', marginTop: '2px' }}>{child.name}</h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ font: 'var(--font-body)', fontWeight: 600 }}>{child.class}</p>
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--color-neutral-gray))' }}>NISN: {child.nisn}</p>
                  </div>
                </div>

            {/* AI Parenting Guidance Alert */}
            {child.aiRecommendation && (
              <div className="card-premium" style={{
                background: child.aiRecommendation.type === 'warning' 
                  ? 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)' 
                  : 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                border: child.aiRecommendation.type === 'warning' 
                  ? '1px solid #fde047' 
                  : '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-4)',
                padding: '16px 20px',
                borderRadius: '16px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: child.aiRecommendation.type === 'warning' ? '#fef3c7' : '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={child.aiRecommendation.type === 'warning' ? '#b45309' : '#166534'} strokeWidth="2.5" style={{ width: '20px', height: '20px' }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: child.aiRecommendation.type === 'warning' ? '#b45309' : '#166534',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {child.aiRecommendation.title}
                  </span>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginTop: '2px', marginBottom: '1px' }}>
                    {child.aiRecommendation.message}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: '#1e293b', margin: 0 }}>
                    💡 <strong>Tips Pendampingan Ortu:</strong> {child.aiRecommendation.tips}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Stats Grid */}
            <section style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--spacing-6)'
            }}>
              <div className="card-premium">
                <h3 style={{ font: 'var(--font-caption)', color: 'hsl(var(--color-neutral-gray))', marginBottom: 'var(--spacing-2)' }}>Tingkat Kehadiran Anak</h3>
                <p style={{ font: 'var(--font-h1)', color: 'hsl(var(--color-success))' }}>{child.attendanceRate}</p>
              </div>
              <div className="card-premium">
                <h3 style={{ font: 'var(--font-caption)', color: 'hsl(var(--color-neutral-gray))', marginBottom: 'var(--spacing-2)' }}>Rata-rata Nilai Tugas</h3>
                <p style={{ font: 'var(--font-h1)', color: 'hsl(var(--color-primary))' }}>{child.averageGrade} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'gray' }}>/ 100</span></p>
              </div>
              <div className="card-premium">
                <h3 style={{ font: 'var(--font-caption)', color: 'hsl(var(--color-neutral-gray))', marginBottom: 'var(--spacing-2)' }}>Tugas Belum Dikumpul</h3>
                <p style={{ font: 'var(--font-h2)', color: child.pendingTasks.length > 0 ? 'hsl(var(--color-warning))' : 'hsl(var(--color-success))' }}>
                  {child.pendingTasks.length > 0 ? `${child.pendingTasks.length} Tugas` : 'Semua Selesai ✓'}
                </p>
              </div>
            </section>

            {/* Gamifikasi & Badge Pencapaian Anak */}
            {child.badges && child.badges.length > 0 && (
              <section className="card-premium" style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
                border: '1px solid #e2e8f0',
                borderLeft: '4px solid #8b5cf6',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: 'none'
              }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🏆 Pencapaian & Badge Tahfidz {child.name}
                </h3>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  overflowX: 'auto',
                  paddingBottom: '8px'
                }}>
                  {child.badges.map((b) => (
                    <div key={b.id} style={{
                      backgroundColor: '#ffffff',
                      border: `1px solid #e2e8f0`,
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      flexShrink: 0,
                      minWidth: '220px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                    title={`Didapatkan pada ${b.earnedAt}`}>
                      <div style={{
                        fontSize: '1.5rem',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: b.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {b.icon}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                          {b.title}
                        </h4>
                        <p style={{ fontSize: '0.68rem', color: '#64748b', margin: '2px 0 0 0' }}>
                          {b.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Jurnal Mutaba'ah Yaumiyah Anak */}
            <section className="card-premium" style={{ border: '1px solid #e2e8f0', borderRadius: '20px', background: '#ffffff', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '18px' }}>
                <div>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    🕌 Mutaba&apos;ah Yaumiyah (Jurnal Ibadah Anak)
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>Pantau kepatuhan ibadah shalat dan amalan harian {child.name}.</p>
                </div>
                {habitMessage && (
                  <span style={{ fontSize: '0.82rem', color: '#4f46e5', fontWeight: 700, backgroundColor: '#eef2ff', padding: '6px 12px', borderRadius: '8px' }}>
                    {habitMessage}
                  </span>
                )}
              </div>

              {/* 7-Day Calendar Selector */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
                {childHabitLogs.map((log) => {
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
                      
                      {/* Status Dot */}
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

              {/* Active Log Details & Verification Action */}
              {(() => {
                const activeLog = childHabitLogs.find(l => l.date === selectedHabitDate) || {
                  subuh: 'lewat', dzuhur: 'lewat', ashar: 'lewat', maghrib: 'lewat', isya: 'lewat',
                  duha: false, tahajjud: false, tadarrus: false, birrul_walidain: false, belajar: false,
                  verified: false
                };

                return (
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                          📅 Jurnal Tanggal: {formatIndonesianDate(selectedHabitDate)}
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                          Status: {activeLog.verified ? '✓ Terverifikasi' : '⏳ Menunggu Verifikasi'}
                        </span>
                      </div>

                      {/* Verification CTA Button */}
                      {activeLog.verified ? (
                        <button
                          type="button"
                          onClick={() => handleVerifyHabit(selectedHabitDate, false)}
                          disabled={verifyingHabit}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            border: '1.5px solid #ef4444',
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          Batalkan Verifikasi ↩️
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleVerifyHabit(selectedHabitDate, true)}
                          disabled={verifyingHabit}
                          style={{
                            padding: '10px 20px',
                            borderRadius: '10px',
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)',
                            transition: 'all 0.2s'
                          }}
                        >
                          Verifikasi Jurnal Anak 👍
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                      {/* Left: Shalat 5 Waktu */}
                      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                        <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                          🕌 Ibadah Shalat 5 Waktu
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {[
                            { key: 'subuh', label: 'Subuh 🌅' },
                            { key: 'dzuhur', label: 'Dzuhur ☀️' },
                            { key: 'ashar', label: 'Ashar ⛅' },
                            { key: 'maghrib', label: 'Maghrib 🌇' },
                            { key: 'isya', label: 'Isya 🌌' }
                          ].map((s) => {
                            const val = activeLog[s.key as keyof typeof activeLog] as string;
                            const isMasjid = val === 'masjid';
                            const isRumah = val === 'rumah';
                            
                            return (
                              <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>{s.label}</span>
                                {isMasjid ? (
                                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '6px' }}>
                                    Masjid 🕌
                                  </span>
                                ) : isRumah ? (
                                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1d4ed8', backgroundColor: '#dbeafe', padding: '2px 8px', borderRadius: '6px' }}>
                                    Rumah 🏠
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b91c1c', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '6px' }}>
                                    Tidak / Lewat ❌
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: Sunnah & Karakter */}
                      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                        <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                          🌟 Amalan Sunnah & Karakter
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {[
                            { key: 'duha', label: 'Shalat Duha 🌅' },
                            { key: 'tahajjud', label: 'Shalat Tahajjud 🌌' },
                            { key: 'tadarrus', label: 'Tadarrus Al-Qur\'an 📖' },
                            { key: 'birrul_walidain', label: 'Membantu Orang Tua 🤝' },
                            { key: 'belajar', label: 'Belajar Mandiri ✏️' }
                          ].map((su) => {
                            const done = !!activeLog[su.key as keyof typeof activeLog];
                            return (
                              <div key={su.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>{su.label}</span>
                                {done ? (
                                  <span style={{ fontSize: '0.72rem', fontWeight: 750, color: '#15803d', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                    🟢 Dilakukan
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#94a3b8' }}>
                                    ⚪ Belum
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </section>

            {/* Grades Table, Charts & Tahfidz Jurnal Grid */}
            <section style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: 'var(--spacing-6)'
            }}>
              
              {/* Laporan Nilai Akademis */}
              <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <h2 style={{ font: 'var(--font-h3)' }}>Daftar Nilai Tugas Akademik</h2>
                {child.grades.length === 0 ? (
                  <p style={{ color: 'gray', padding: 'var(--spacing-4) 0', fontSize: '0.9rem' }}>Belum ada tugas yang dinilai.</p>
                ) : (
                  child.grades.map((g, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', paddingBottom: '10px' }}>
                      <div>
                        <p style={{ fontWeight: 600 }}>{g.subject}</p>
                        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--color-neutral-gray))' }}>Guru: {g.teacher}</p>
                      </div>
                      <span style={{ font: 'var(--font-h3)', color: g.score >= 85 ? 'green' : 'black' }}>
                        {g.score}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Grafik Perbandingan Nilai Mapel */}
              <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <h2 style={{ font: 'var(--font-h3)' }}>Perbandingan Nilai Mata Pelajaran</h2>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                  <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: 'visible' }}>
                    <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(0,0,0,0.05)" strokeDasharray="3" />
                    <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="rgba(0,0,0,0.05)" strokeDasharray="3" />
                    <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(0,0,0,0.1)" />

                    {chartData.map((d, i) => {
                      const barHeight = (d.value * (chartHeight - padding * 2)) / 100;
                      const x = padding + 15 + i * (barWidth + barGap);
                      const y = chartHeight - padding - barHeight;

                      return (
                        <g key={i}>
                          <rect x={x} y={padding} width={barWidth} height={chartHeight - padding * 2} fill="#f8fafc" rx="4" />
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            fill="url(#parentBarGrad)"
                            rx="4"
                          />
                          <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="0.75rem" fontWeight="700" fill="#4f46e5">
                            {d.value}
                          </text>
                          <text x={x + barWidth / 2} y={chartHeight - 10} textAnchor="middle" fontSize="0.65rem" fill="gray">
                            {d.label}
                          </text>
                        </g>
                      );
                    })}

                    <defs>
                      <linearGradient id="parentBarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--color-primary))" />
                        <stop offset="100%" stopColor="hsl(var(--color-primary-light))" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

            </section>

            {/* Jurnal Tahfidz */}
            <section>
              <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <h2 style={{ font: 'var(--font-h3)' }}>Jurnal Perkembangan Tahfidz Al-Qur&apos;an</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-4)' }}>
                  {child.tahfidz.length === 0 ? (
                    <p style={{ color: 'gray', padding: 'var(--spacing-4) 0', fontSize: '0.9rem' }}>Belum ada setoran hafalan Tahfidz.</p>
                  ) : (
                    child.tahfidz.map((t, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: '12px', padding: '16px', backgroundColor: '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', color: 'gray' }}>{t.date}</span>
                          <span className={`badge badge-${t.status === 'lancar' ? 'success' : 'warning'}`}>
                            {t.status.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p style={{ fontWeight: 600 }}>{t.surah} ({t.range})</p>
                          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--color-neutral-gray))', fontStyle: 'italic', marginTop: '4px' }}>
                            Catatan: &ldquo;{t.note}&rdquo;
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Buku Penghubung & Konsultasi Chat */}
            <section>
              <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                <div>
                  <h2 style={{ font: 'var(--font-h3)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    💬 Buku Penghubung & Konsultasi Guru
                  </h2>
                  <p style={{ color: 'hsl(var(--color-neutral-gray))', fontSize: '0.8rem', marginTop: '2px' }}>
                    Tulis catatan atau ajukan konsultasi langsung dengan Wali Kelas Sarah Jenkins, S.Pd
                  </p>
                </div>

                <div style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {consultationLogs.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>Belum ada pesan terkirim.</p>
                  ) : (
                    consultationLogs.map((log) => {
                      const isGuru = log.sender_role === 'guru';
                      return (
                        <div key={log.id} style={{
                          alignSelf: isGuru ? 'flex-start' : 'flex-end',
                          maxWidth: '80%',
                          backgroundColor: isGuru ? '#ffffff' : '#e0e7ff',
                          border: isGuru ? '1px solid #e2e8f0' : '1px solid #c7d2fe',
                          borderRadius: isGuru ? '12px 12px 12px 0' : '12px 12px 0 12px',
                          padding: '10px 14px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isGuru ? '#475569' : '#4f46e5' }}>
                              {log.sender_name}
                            </span>
                            <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>
                              {log.date}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.82rem', color: '#1e293b', margin: 0, lineHeight: '1.4' }}>
                            {log.message}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleSendConsultation} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ketik pesan atau catatan konsultasi di sini..."
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '10px' }}
                    required
                  />
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={sendingMsg}
                    style={{ padding: '0 20px', borderRadius: '10px', fontWeight: 700 }}
                  >
                    {sendingMsg ? 'Mengirim...' : 'Kirim'}
                  </button>
                </form>
              </div>
            </section>
              </>
            ) : (
              /* TAB CO-TEACHER CONSOLE (R&D FITUR HOMESCHOOLING) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Grid 2-Column: Input Forms */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                  
                  {/* Column 1: Jurnal Aktivitas & Portofolio */}
                  <div className="card-premium" style={{ border: '1px solid #e2e8f0', borderRadius: '20px', background: '#ffffff', padding: '24px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      📖 Jurnal Belajar Mandiri & Portofolio Harian
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 20px 0' }}>Laporkan aktivitas belajar fisik anak di rumah dan lampirkan bukti karya/lembar latihannya.</p>
                    
                    <PortfolioForm
                      role="orang_tua"
                      title="📖 Jurnal Belajar Mandiri & Portofolio Harian"
                      description="Laporkan aktivitas belajar fisik anak di rumah dan lampirkan bukti karya/lembar latihannya."
                      formState={{
                        title: newPortfolioTitle,
                        subject: newPortfolioSubject,
                        date: newPortfolioDate,
                        type: newPortfolioType,
                        duration: newPortfolioDuration,
                        notes: newPortfolioNotes,
                        reflection: newPortfolioReflection,
                      }}
                      fileName={portfolioFile?.name}
                      onFieldChange={(field, value) => {
                        switch (field) {
                          case 'title':
                            setNewPortfolioTitle(value);
                            break;
                          case 'subject':
                            setNewPortfolioSubject(value);
                            break;
                          case 'date':
                            setNewPortfolioDate(value);
                            break;
                          case 'type':
                            setNewPortfolioType(value);
                            break;
                          case 'duration':
                            setNewPortfolioDuration(value);
                            break;
                          case 'notes':
                            setNewPortfolioNotes(value);
                            break;
                          case 'reflection':
                            setNewPortfolioReflection(value);
                            break;
                        }
                      }}
                      onFileClick={() => {}}
                      onFileChange={(file) => setPortfolioFile(file)}
                      onSubmit={handleSubmitPortfolio}
                      submitStatus={portfolioStatus}
                      isSubmitting={false}
                      fileInputRef={useRef<HTMLInputElement>(null)}
                    />
                  </div>

                  {/* Column 2: Penilaian Adab & Karakter Rumah */}
                  <div className="card-premium" style={{ border: '1px solid #e2e8f0', borderRadius: '20px', background: '#ffffff', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🌟 Penilaian Adab & Karakter Harian
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 20px 0' }}>Beri nilai adab, kesopanan, dan kepatuhan anak selama belajar mandiri di rumah hari ini.</p>
                      
                      <form onSubmit={handleSubmitAdab} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Skor Adab & Karakter Rumah</span>
                            <strong style={{ color: '#4f46e5', fontSize: '1rem' }}>{adabScore} / 100</strong>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={adabScore}
                            onChange={(e) => setAdabScore(parseInt(e.target.value, 10))}
                            style={{ width: '100%', accentColor: '#4f46e5', cursor: 'pointer' }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                            <span>Perlu Bimbingan</span>
                            <span>Cukup</span>
                            <span>Sangat Baik</span>
                          </div>
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Catatan Perkembangan Adab Harian</label>
                          <textarea
                            className="form-control"
                            placeholder="Contoh: Bilal menunjukkan sikap mandiri yang sangat baik, mengerjakan tugas tanpa perlu disuruh..."
                            value={adabNotes}
                            onChange={(e) => setAdabNotes(e.target.value)}
                            rows={3}
                            style={{ resize: 'vertical' }}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                          {adabStatus && <span style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 700 }}>{adabStatus}</span>}
                          <button
                            type="submit"
                            className="btn-primary"
                            style={{ padding: '10px 24px', borderRadius: '10px', backgroundColor: '#10b981', marginLeft: 'auto', fontWeight: 700 }}
                          >
                            Simpan Nilai Adab 👍
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Info Tip Box */}
                    <div style={{ marginTop: '20px', padding: '14px 18px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.2rem' }}>📋</span>
                      <p style={{ fontSize: '0.78rem', color: '#166534', margin: 0, lineHeight: '1.4' }}>
                        <strong>Evaluasi Harian:</strong> Setiap pengiriman adab harian dan pengumpulan portofolio akan dievaluasi langsung oleh ustadz/ustadzah kelas untuk memantau perkembangan karakter dan akademis anak secara holistik.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Row 2: History Table */}
                <div className="card-premium" style={{ border: '1px solid #e2e8f0', borderRadius: '20px', background: '#ffffff', padding: '24px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📜 Riwayat Jurnal & Portofolio Rumah Anak
                  </h3>

                  {portfoliosLoading ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>Memuat riwayat portofolio...</div>
                  ) : portfolios.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>Belum ada riwayat aktivitas yang dikirim.</div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#475569' }}>
                            <th style={{ padding: '12px 8px' }}>Tanggal</th>
                            <th style={{ padding: '12px 8px' }}>Kegiatan / Judul</th>
                            <th style={{ padding: '12px 8px' }}>Mata Pelajaran</th>
                            <th style={{ padding: '12px 8px' }}>Catatan Kegiatan</th>
                            <th style={{ padding: '12px 8px', textAlign: 'center' }}>Adab Ortu</th>
                            <th style={{ padding: '12px 8px', textAlign: 'center' }}>Nilai Guru</th>
                            <th style={{ padding: '12px 8px' }}>Feedback Ustadz</th>
                          </tr>
                        </thead>
                        <tbody>
                          {portfolios.map((p) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px 8px', color: '#64748b', whiteSpace: 'nowrap' }}>{p.date}</td>
                              <td style={{ padding: '12px 8px', fontWeight: 700, color: '#1e293b' }}>
                                {p.title}
                                {p.fileUrl && (
                                  <a href={p.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginLeft: '6px', fontSize: '0.75rem', color: '#4f46e5', textDecoration: 'underline' }}>
                                    📎 Berkas Bukti
                                  </a>
                                )}
                              </td>
                              <td style={{ padding: '12px 8px' }}>
                                <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#e0e7ff', color: '#4f46e5', fontWeight: 700, fontSize: '0.72rem' }}>
                                  {p.subject}
                                </span>
                              </td>
                              <td style={{ padding: '12px 8px', color: '#475569', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.notes}>
                                {p.notes}
                              </td>
                              <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700, color: '#10b981' }}>
                                {p.adabScore !== null && p.adabScore !== undefined ? `${p.adabScore}` : '-'}
                              </td>
                              <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                {p.status === 'graded' ? (
                                  <span style={{ fontWeight: 800, color: '#4f46e5', fontSize: '0.9rem' }}>{p.academicScore}</span>
                                ) : p.adabScore !== null ? (
                                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>N/A (Adab)</span>
                                ) : (
                                  <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.75rem', backgroundColor: '#fef3c7', padding: '3px 8px', borderRadius: '6px' }}>Menunggu Review</span>
                                )}
                              </td>
                              <td style={{ padding: '12px 8px', color: '#4b5563', fontStyle: 'italic' }}>
                                {p.teacherFeedback || <span style={{ color: '#94a3b8' }}>Belum ada ulasan</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="card-premium" style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'hsl(var(--color-neutral-gray))' }}>
            Data anak tidak ditemukan atau profil anak belum terhubung dengan akun Anda.
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
