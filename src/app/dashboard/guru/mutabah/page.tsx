'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface ClassItem {
  id: string;
  name: string;
}

interface HabitLog {
  id: string;
  student_id: string;
  date: string;
  subuh: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  duha: boolean;
  tahajjud: boolean;
  tadarrus: boolean;
  birrul_walidain: boolean;
  belajar: boolean;
  verified: boolean;
}

interface StudentHabitRow {
  id: string;
  name: string;
  email: string;
  nisn: string;
  className: string;
  log: HabitLog;
}

export default function GuruMutabahPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [activeClassId, setActiveClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState<StudentHabitRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected student for detail popup/drawer
  const [selectedStudent, setSelectedStudent] = useState<StudentHabitRow | null>(null);

  const fetchRoster = useCallback(async () => {
    try {
      setLoading(true);
      const url = `/api/guru/habit?classId=${activeClassId}&date=${selectedDate}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setRoster(json.roster || []);
        setClasses(json.classes || []);
        if (json.activeClassId && !activeClassId) {
          setActiveClassId(json.activeClassId);
        }
      }
    } catch (err) {
      console.error('Error fetching habit roster:', err);
    } finally {
      setLoading(false);
    }
  }, [activeClassId, selectedDate]);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  // Calculations for stats
  const totalStudents = roster.length;
  
  // Calculate average masjid prayers percentage
  let avgMasjidPercent = 0;
  let avgSunnahCount = 0;
  let verifiedCount = 0;

  if (totalStudents > 0) {
    let totalMasjidPrayers = 0;
    let totalSunnahItems = 0;

    roster.forEach((row) => {
      const log = row.log;
      // 5 prayers
      if (log.subuh === 'masjid') totalMasjidPrayers++;
      if (log.dzuhur === 'masjid') totalMasjidPrayers++;
      if (log.ashar === 'masjid') totalMasjidPrayers++;
      if (log.maghrib === 'masjid') totalMasjidPrayers++;
      if (log.isya === 'masjid') totalMasjidPrayers++;

      // 5 sunnah
      if (log.duha) totalSunnahItems++;
      if (log.tahajjud) totalSunnahItems++;
      if (log.tadarrus) totalSunnahItems++;
      if (log.birrul_walidain) totalSunnahItems++;
      if (log.belajar) totalSunnahItems++;

      if (log.verified) verifiedCount++;
    });

    avgMasjidPercent = Math.round((totalMasjidPrayers / (totalStudents * 5)) * 100);
    avgSunnahCount = Math.round((totalSunnahItems / totalStudents) * 10) / 10;
  }

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

  const getPrayerBadgeColor = (status: string) => {
    if (status === 'masjid') return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0', label: 'M' };
    if (status === 'rumah') return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', label: 'R' };
    return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5', label: 'X' };
  };

  return (
    <DashboardLayout activeMenu="mutabah" pageTitle="Rekap Mutaba'ah Yaumiyah" pageSubtitle="Monitoring kepatuhan ibadah shalat dan amalan harian siswa.">
      
      {/* Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scaleIn { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-scale-in { animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .card-premium-hover { transition: all 0.3s ease; }
        .card-premium-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -10px rgba(99, 102, 241, 0.12); }
      ` }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Filters Panel */}
        <section className="card-premium" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0, minWidth: '180px' }}>
              <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Pilih Kelas</label>
              <select
                className="form-control"
                value={activeClassId}
                onChange={(e) => setActiveClassId(e.target.value)}
                style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="all">Semua Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0, minWidth: '180px' }}>
              <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>Tanggal Rekap</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <button
            onClick={fetchRoster}
            type="button"
            className="btn-primary"
            style={{ height: '42px', padding: '0 20px', borderRadius: '8px', fontWeight: 700, marginTop: '14px' }}
          >
            Refresh Data 🔄
          </button>
        </section>

        {/* Stats Grid */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {/* Card 1: Total Siswa */}
          <div className="card-premium card-premium-hover" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px' }}>
            <p style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Total Roster Siswa</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 850, color: '#1e293b', margin: 0 }}>{totalStudents} Siswa</h3>
          </div>

          {/* Card 2: Average Masjid Prayers */}
          <div className="card-premium card-premium-hover" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Berjamaah di Masjid</p>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 850, color: '#10b981', margin: 0 }}>{avgMasjidPercent}%</h3>
            </div>
            <svg width="46" height="46" viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray={`${avgMasjidPercent}, 100`} strokeLinecap="round" />
            </svg>
          </div>

          {/* Card 3: Avg Sunnah Completed */}
          <div className="card-premium card-premium-hover" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px' }}>
            <p style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Rata-rata Amalan Sunnah</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 850, color: '#4f46e5', margin: 0 }}>
              {avgSunnahCount} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#94a3b8' }}>/ 5 Amalan</span>
            </h3>
          </div>

          {/* Card 4: Verified Percentage */}
          <div className="card-premium card-premium-hover" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px' }}>
            <p style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Verifikasi Orang Tua</p>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 850, color: '#f59e0b', margin: 0 }}>
              {totalStudents > 0 ? Math.round((verifiedCount / totalStudents) * 100) : 0}% <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#94a3b8' }}>Siswa</span>
            </h3>
          </div>
        </section>

        {/* Main Roster List */}
        <section className="card-premium" style={{ border: '1px solid #e2e8f0', borderRadius: '20px', background: '#ffffff', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              📋 Roster Monitoring Jurnal Ibadah ({formatIndonesianDate(selectedDate)})
            </h2>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} /> Masjid
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} /> Rumah
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} /> Tidak
              </span>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: '#94a3b8' }}>
              Memuat data roster mutaba&apos;ah...
            </div>
          ) : roster.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: '#94a3b8' }}>
              Tidak ada siswa terdaftar untuk kelas ini.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontWeight: 700 }}>
                    <th style={{ padding: '12px 8px' }}>Nama Siswa</th>
                    <th style={{ padding: '12px 8px' }}>NISN</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Shalat 5 Waktu</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Amalan Sunnah</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center' }}>Verifikasi Ortu</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((row) => {
                    const log = row.log;
                    let sunnahCount = 0;
                    if (log.duha) sunnahCount++;
                    if (log.tahajjud) sunnahCount++;
                    if (log.tadarrus) sunnahCount++;
                    if (log.birrul_walidain) sunnahCount++;
                    if (log.belajar) sunnahCount++;

                    return (
                      <tr
                        key={row.id}
                        style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '14px 8px', fontWeight: 700, color: '#1e293b' }}>
                          {row.name}
                        </td>
                        <td style={{ padding: '14px 8px', color: '#64748b' }}>
                          {row.nisn}
                        </td>
                        <td style={{ padding: '14px 8px' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            {['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'].map((prayer) => {
                              const val = log[prayer as keyof typeof log] as string;
                              const style = getPrayerBadgeColor(val);
                              return (
                                <span
                                  key={prayer}
                                  title={`${prayer.toUpperCase()}: ${val.toUpperCase()}`}
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '6px',
                                    border: `1px solid ${style.border}`,
                                    backgroundColor: style.bg,
                                    color: style.text,
                                    fontSize: '0.68rem',
                                    fontWeight: 800,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  {style.label}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td style={{ padding: '14px 8px', textAlign: 'center', fontWeight: 700, color: '#4f46e5' }}>
                          {sunnahCount} / 5
                        </td>
                        <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                          {log.verified ? (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857', backgroundColor: '#d1fae5', padding: '3px 8px', borderRadius: '99px' }}>
                              Terverifikasi 👍
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '99px' }}>
                              Belum ⏳
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedStudent(row)}
                            type="button"
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              backgroundColor: '#e0e7ff',
                              color: '#4f46e5',
                              border: 'none',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c7d2fe'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e0e7ff'}
                          >
                            Detail 🔍
                          </button>
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

      {/* Detail Modal Overlay */}
      {selectedStudent && (
        <div className="animate-fade-in" style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setSelectedStudent(null)}>
          <div
            className="animate-scale-in"
            style={{
              backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px',
              padding: '28px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              display: 'flex', flexDirection: 'column', gap: '18px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 850, color: '#0f172a', margin: 0 }}>
                  {selectedStudent.name}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  NISN. {selectedStudent.nisn} | Kelas {selectedStudent.className}
                </span>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748b' }}
              >
                ×
              </button>
            </div>

            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '10px' }}>
                🕌 Ibadah Shalat 5 Waktu ({formatIndonesianDate(selectedDate)})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { key: 'subuh', label: 'Subuh' },
                  { key: 'dzuhur', label: 'Dzuhur' },
                  { key: 'ashar', label: 'Ashar' },
                  { key: 'maghrib', label: 'Maghrib' },
                  { key: 'isya', label: 'Isya' }
                ].map((s) => {
                  const val = selectedStudent.log[s.key as keyof HabitLog] as string;
                  const style = getPrayerBadgeColor(val);
                  return (
                    <div
                      key={s.key}
                      style={{
                        padding: '6px 12px', borderRadius: '8px', border: `1px solid ${style.border}`,
                        backgroundColor: style.bg, display: 'flex', alignItems: 'center', gap: '6px',
                        fontSize: '0.78rem', fontWeight: 700, color: style.text
                      }}
                    >
                      <span>{s.label}</span>
                      <span>-</span>
                      <span style={{ textTransform: 'capitalize' }}>{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', marginBottom: '10px' }}>
                🌟 Amalan Sunnah & Karakter Harian
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { key: 'duha', label: '🌅 Shalat Duha' },
                  { key: 'tahajjud', label: '🌌 Shalat Tahajjud' },
                  { key: 'tadarrus', label: '📖 Tadarrus Al-Qur\'an' },
                  { key: 'birrul_walidain', label: '🤝 Membantu Orang Tua' },
                  { key: 'belajar', label: '✏️ Belajar Mandiri' }
                ].map((su) => {
                  const done = !!selectedStudent.log[su.key as keyof HabitLog];
                  return (
                    <div
                      key={su.key}
                      style={{
                        padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
                        backgroundColor: done ? '#f5f3ff' : '#f8fafc',
                        fontSize: '0.78rem', fontWeight: 600, color: done ? '#4f46e5' : '#64748b',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span>{su.label}</span>
                      <span>{done ? '🟢' : '⚪'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Status Verifikasi: {selectedStudent.log.verified ? 'Terverifikasi 👍' : 'Belum Terverifikasi ⏳'}
              </span>
              <button
                onClick={() => setSelectedStudent(null)}
                className="btn-primary"
                style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
