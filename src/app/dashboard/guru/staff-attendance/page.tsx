'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface StaffLog {
  id: string;
  name: string;
  role: string;
  email: string;
  clockIn: string;
  clockOut: string;
  status: 'hadir' | 'terlambat' | 'izin' | 'alpa' | 'belum_absen';
  isMock: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: string }> = {
  hadir: { label: 'Hadir', color: '#059669', bgColor: 'rgba(5, 150, 105, 0.1)', borderColor: 'rgba(5, 150, 105, 0.3)', icon: '✅' },
  terlambat: { label: 'Terlambat', color: '#d97706', bgColor: 'rgba(217, 119, 6, 0.08)', borderColor: 'rgba(217, 119, 6, 0.25)', icon: '⏳' },
  izin: { label: 'Izin', color: '#2563eb', bgColor: 'rgba(37, 99, 235, 0.08)', borderColor: 'rgba(37, 99, 235, 0.25)', icon: '📋' },
  alpa: { label: 'Alpa', color: '#dc2626', bgColor: 'rgba(220, 38, 38, 0.08)', borderColor: 'rgba(220, 38, 38, 0.25)', icon: '❌' },
  belum_absen: { label: 'Belum Absen', color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.08)', borderColor: 'rgba(100, 116, 139, 0.2)', icon: '💤' },
};

export default function GuruStaffAttendancePage() {
  const [logs, setLogs] = useState<StaffLog[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // 1. Fetch data from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('date', selectedDate);
      params.set('role', selectedRole);
      if (searchQuery.trim()) params.set('search', searchQuery);

      const res = await fetch(`/api/admin/staff-attendance?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to fetch staff attendance:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedRole, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Real-time clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    setUserName(localStorage.getItem('user_name') || '');
    setUserRole(localStorage.getItem('user_role') || '');
  }, []);

  // 3. User session info dynamically resolved
  const currentUserLog = logs.find(log => 
    !log.isMock && 
    (log.name.toLowerCase() === userName.toLowerCase() || 
     (userRole === 'guru' && log.role === 'Guru Kelas') ||
     (userRole === 'admin' && log.role === 'Sistem Admin'))
  );
  const userClockInTime = currentUserLog?.clockIn || '--:--';
  const userClockOutTime = currentUserLog?.clockOut || '--:--';
  const hasClockedIn = userClockInTime !== '--:--';
  const hasClockedOut = userClockOutTime !== '--:--';

  // 4. Action handlers
  const handleClockIn = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/staff-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          action: 'clock_in',
          userRole: userRole || 'guru'
        })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Absen masuk Anda berhasil dicatat! 🌅');
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleClockOut = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/staff-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          action: 'clock_out',
          userRole: userRole || 'guru'
        })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Absen pulang Anda berhasil dicatat! 🌇');
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessBanner(message);
    setTimeout(() => setSuccessBanner(null), 3500);
  };

  // 5. Statistics calculation
  const stats = {
    total: logs.length,
    hadir: logs.filter(l => l.status === 'hadir').length,
    terlambat: logs.filter(l => l.status === 'terlambat').length,
    izinAlpa: logs.filter(l => l.status === 'izin' || l.status === 'alpa').length,
    belumAbsen: logs.filter(l => l.status === 'belum_absen').length
  };

  const attendancePercent = stats.total > 0 ? Math.round(((stats.hadir + stats.terlambat) / stats.total) * 100) : 0;

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <DashboardLayout activeMenu="staff-attendance" pageTitle="Absensi Mandiri Guru & Staf" pageSubtitle={`Pencatatan Kehadiran — ${formatDateDisplay(selectedDate)}`}>
      
      {/* Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .card-premium-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-premium-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px -10px rgba(99, 102, 241, 0.12);
        }
      ` }} />

      {/* Success Notification Banner */}
      {successBanner && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
          color: '#ffffff', padding: '14px 24px', borderRadius: '14px',
          fontWeight: 700, fontSize: '0.88rem',
          boxShadow: '0 12px 32px -4px rgba(99, 102, 241, 0.4)',
          animation: 'slideDown 0.3s ease-out',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '1.2rem' }}>⏰</span>
          {successBanner}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', animation: 'fadeInUp 0.4s ease-out' }}>
        
        {/* ════════════════════════════════════════════════════════════════
             SECTION 1: STAFF ATTENDANCE METRICS (4 CARDS)
           ════════════════════════════════════════════════════════════════ */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', flexWrap: 'wrap' }}>
          {/* Card 1: Total Staf */}
          <div className="card-premium card-premium-hover" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Staf Aktif</p>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{stats.total} Orang</h3>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px -4px rgba(99, 102, 241, 0.3)' }}>
                <span style={{ fontSize: '1.1rem' }}>👥</span>
              </div>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '8px 0 0 0', fontWeight: 500 }}>Guru dan Staf terdaftar</p>
          </div>

          {/* Card 2: Hadir Tepat Waktu */}
          <div className="card-premium card-premium-hover" style={{ background: '#ffffff', border: '1px solid rgba(5, 150, 105, 0.2)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tepat Waktu</p>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', margin: 0 }}>{stats.hadir}</h3>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px -4px rgba(5, 150, 105, 0.3)' }}>
                <span style={{ fontSize: '1.1rem' }}>✅</span>
              </div>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#059669', margin: '8px 0 0 0', fontWeight: 600 }}>Kehadiran: {attendancePercent}%</p>
          </div>

          {/* Card 3: Terlambat */}
          <div className="card-premium card-premium-hover" style={{ background: '#ffffff', border: '1px solid rgba(217, 119, 6, 0.2)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Terlambat</p>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706', margin: 0 }}>{stats.terlambat}</h3>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px -4px rgba(217, 119, 6, 0.3)' }}>
                <span style={{ fontSize: '1.1rem' }}>⏳</span>
              </div>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '8px 0 0 0', fontWeight: 500 }}>Masuk melewati 07:00</p>
          </div>

          {/* Card 4: Belum Absen */}
          <div className="card-premium card-premium-hover" style={{ background: '#ffffff', border: '1px solid rgba(100, 116, 139, 0.2)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Belum Absen</p>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#64748b', margin: 0 }}>{stats.belumAbsen}</h3>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #94a3b8, #64748b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px -4px rgba(100, 116, 139, 0.2)' }}>
                <span style={{ fontSize: '1.1rem' }}>💤</span>
              </div>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '8px 0 0 0', fontWeight: 500 }}>Sakit/Izin/Belum clock-in</p>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
             SECTION 2: CLOCK BOARD & PERSONAL ATTENDANCE PANEL
           ════════════════════════════════════════════════════════════════ */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          
          {/* Clock In/Out UI Card */}
          <div className="card-premium" style={{ 
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: 'none', borderRadius: '20px', padding: '28px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '16px', textAlign: 'center', color: '#ffffff',
            boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.3)'
          }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '4px 12px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Simulasi Mandiri Guru</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 850, fontFamily: 'monospace', letterSpacing: '3px', margin: '8px 0', background: 'linear-gradient(to right, #818cf8, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {currentTime || '00:00:00'}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button 
                id="btn-clock-in"
                style={{ 
                  flex: 1, 
                  background: hasClockedIn ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                  color: hasClockedIn ? '#94a3b8' : '#ffffff',
                  border: 'none', borderRadius: '12px', padding: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: hasClockedIn ? 'default' : 'pointer'
                }} 
                onClick={handleClockIn}
                disabled={hasClockedIn || saving}
              >
                {hasClockedIn ? `Masuk: ${userClockInTime}` : 'Absen Masuk'}
              </button>
              
              <button 
                id="btn-clock-out"
                style={{ 
                  flex: 1, 
                  background: !hasClockedIn || hasClockedOut ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', 
                  color: !hasClockedIn || hasClockedOut ? '#94a3b8' : '#ffffff',
                  border: 'none', borderRadius: '12px', padding: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: !hasClockedIn || hasClockedOut ? 'default' : 'pointer'
                }}
                onClick={handleClockOut}
                disabled={!hasClockedIn || hasClockedOut || saving}
              >
                {hasClockedOut ? `Pulang: ${userClockOutTime}` : 'Absen Pulang'}
              </button>
            </div>
          </div>

          {/* User Attendance State Card */}
          <div className="card-premium" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Status Kehadiran Anda</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Absen Masuk</span>
                <span style={{ fontWeight: 700, color: '#1e293b' }}>{userClockInTime}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Absen Pulang</span>
                <span style={{ fontWeight: 700, color: '#1e293b' }}>{userClockOutTime}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Status Kerja</span>
                <span style={{ 
                  borderRadius: '8px', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700,
                  backgroundColor: hasClockedIn ? (hasClockedOut ? '#e2e8f0' : '#dcfce7') : '#fef3c7',
                  color: hasClockedIn ? (hasClockedOut ? '#475569' : '#15803d') : '#b45309'
                }}>
                  {hasClockedIn ? (hasClockedOut ? 'Selesai Bekerja' : 'Aktif Bekerja') : 'Belum Hadir'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
             SECTION 3: SMART FILTER & SEARCH BAR
           ════════════════════════════════════════════════════════════════ */}
        <section style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {/* Search Bar */}
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pencarian Staf</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Cari nama atau email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '10px 16px 10px 38px', borderRadius: '12px', border: '1px solid #e2e8f0',
                  fontSize: '0.88rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box'
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '12px' }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          {/* Role Filter */}
          <div style={{ flex: '0 0 auto' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Peran Jabatan</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{
                padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0',
                fontSize: '0.88rem', fontWeight: 600, color: '#0f172a',
                backgroundColor: '#ffffff', cursor: 'pointer', outline: 'none',
                minWidth: '160px', transition: 'all 0.2s'
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <option value="all">👥 Semua Peran</option>
              <option value="guru">🏫 Guru & Pengajar</option>
              <option value="admin">💻 Administrator</option>
            </select>
          </div>

          {/* Date Picker */}
          <div style={{ flex: '0 0 auto' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tanggal Rekap</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0',
                fontSize: '0.88rem', fontWeight: 600, color: '#0f172a',
                backgroundColor: '#ffffff', outline: 'none', minWidth: '180px',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
            />
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
             SECTION 4: LOG TABLE (READ ONLY FOR GURU)
           ════════════════════════════════════════════════════════════════ */}
        <section className="card-premium" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '20px' }}>
          
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Daftar Rekap Kehadiran Guru & Staf</h2>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{formatDateDisplay(selectedDate)}</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '24px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: '48px', borderRadius: '10px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>🔍</span>
              <p style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>Tidak ada staf yang sesuai dengan filter pencarian.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '14px 24px' }}>Staf / Karyawan</th>
                    <th style={{ padding: '14px 24px' }}>Jabatan</th>
                    <th style={{ padding: '14px 24px' }}>Jam Masuk</th>
                    <th style={{ padding: '14px 24px' }}>Jam Pulang</th>
                    <th style={{ padding: '14px 24px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => {
                    const statusCfg = STATUS_CONFIG[log.status] || STATUS_CONFIG.belum_absen;
                    const initials = log.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                    const hue = (idx * 67) % 360;

                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        {/* Name and Avatar */}
                        <td style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '10px',
                            background: `linear-gradient(135deg, hsl(${hue}, 70%, 60%) 0%, hsl(${(hue + 40) % 360}, 70%, 45%) 100%)`,
                            color: '#ffffff', fontWeight: 800, fontSize: '0.82rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            {initials}
                          </div>
                          <div>
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', display: 'block' }}>{log.name}</span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{log.email}</span>
                          </div>
                        </td>

                        {/* Role */}
                        <td style={{ padding: '12px 24px', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>{log.role}</td>

                        {/* Clock In */}
                        <td style={{ padding: '12px 24px', fontSize: '0.85rem', fontFamily: 'monospace', color: log.clockIn === '--:--' ? '#cbd5e1' : '#1e293b', fontWeight: 600 }}>{log.clockIn}</td>

                        {/* Clock Out */}
                        <td style={{ padding: '12px 24px', fontSize: '0.85rem', fontFamily: 'monospace', color: log.clockOut === '--:--' ? '#cbd5e1' : '#1e293b', fontWeight: 600 }}>{log.clockOut}</td>

                        {/* Status Badge */}
                        <td style={{ padding: '12px 24px' }}>
                          <span style={{ 
                            borderRadius: '8px', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700,
                            backgroundColor: statusCfg.bgColor, color: statusCfg.color, border: `1.5px solid ${statusCfg.borderColor}`,
                            display: 'inline-flex', alignItems: 'center', gap: '4px'
                          }}>
                            <span style={{ fontSize: '0.65rem' }}>{statusCfg.icon}</span>
                            {statusCfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </DashboardLayout>
  );
}
