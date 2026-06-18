'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface TahfidzRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  teacherName: string;
  date: string;
  surahName: string;
  startAyat: number;
  endAyat: number;
  category: 'ziyadah' | 'sabqi' | 'manzil' | 'murajaah';
  status: 'lancar' | 'kurang_lancar' | 'perlu_diulang';
  notes: string;
  progress: number;
}

const CATEGORY_INFO = {
  ziyadah: {
    label: 'Ziyadah',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  sabqi: {
    label: 'Sabqi',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  manzil: {
    label: 'Manzil',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  murajaah: {
    label: 'Murajaah',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200'
  }
};

export default function SiswaTahfidzPage() {
  const [records, setRecords] = useState<TahfidzRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');

  const fetchTahfidzData = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Get logged in student's ID from dashboard API
      const profileRes = await fetch('/api/siswa/dashboard');
      const profileJson = await profileRes.json();
      
      if (profileJson.success && profileJson.studentInfo?.id) {
        setStudentName(profileJson.studentInfo.nama);
        const studentId = profileJson.studentInfo.id;
        
        // 2. Fetch Tahfidz records
        const res = await fetch(`/api/guru/tahfidz?studentId=${studentId}`);
        const data = await res.json();
        if (data.success) {
          setRecords(data.records);
        }
      }
    } catch (error) {
      console.error('Error fetching student tahfidz records:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTahfidzData();
  }, [fetchTahfidzData]);

  // Statistics calculation
  const totalSetoran = records.length;
  
  const lastZiyadah = records.find(r => r.category === 'ziyadah');
  const latestZiyadahStr = lastZiyadah 
    ? `${lastZiyadah.surahName} (Ayat ${lastZiyadah.startAyat}-${lastZiyadah.endAyat})`
    : 'Belum ada';

  const lancarCount = records.filter(r => r.status === 'lancar').length;
  const averageKelancaran = totalSetoran > 0 ? Math.round((lancarCount / totalSetoran) * 100) : 0;

  const lastMurajaah = records.find(r => r.category === 'murajaah');
  const latestMurajaahStr = lastMurajaah 
    ? `${new Date(lastMurajaah.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}: ${lastMurajaah.surahName}`
    : 'Belum ada';

  // Predicate label
  const getPredicate = (percent: number) => {
    if (percent >= 85) return 'Mumtaz (Sangat Baik)';
    if (percent >= 70) return 'Jayyid (Baik)';
    if (percent >= 60) return 'Maqbul (Cukup)';
    return 'Perlu Latihan Lagi';
  };

  // Filter records
  const filteredRecords = records.filter(r => activeTab === 'all' || r.category === activeTab);

  return (
    <DashboardLayout activeMenu="tahfidz">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ font: 'var(--font-h2)' }}>Jurnal Hafalan Qur&apos;an</h1>
            <p style={{ color: 'hsl(var(--color-neutral-gray))', fontSize: '0.9rem' }}>
              Pantau progres hafalan Al-Qur&apos;an, review mingguan, dan umpan balik langsung dari ustadz pembimbing.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-4)' }}>
          {/* Total Setoran */}
          <div className="card-premium" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'rgb(99, 102, 241)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p style={{ color: 'hsl(var(--color-neutral-gray))', fontSize: '0.85rem' }}>Total Setoran</p>
              <h3 style={{ font: 'var(--font-h3)', margin: 0 }}>{totalSetoran} <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'hsl(var(--color-neutral-gray))' }}>kali</span></h3>
            </div>
          </div>

          {/* Hafalan Terbaru */}
          <div className="card-premium" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'rgb(16, 185, 129)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <p style={{ color: 'hsl(var(--color-neutral-gray))', fontSize: '0.85rem' }}>Hafalan Baru (Ziyadah)</p>
              <h3 style={{ font: 'var(--font-h4)', margin: 0, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }} title={latestZiyadahStr}>
                {latestZiyadahStr}
              </h3>
            </div>
          </div>

          {/* Rata-rata Kelancaran */}
          <div className="card-premium" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'rgb(59, 130, 246)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p style={{ color: 'hsl(var(--color-neutral-gray))', fontSize: '0.85rem' }}>Rata-rata Kelancaran</p>
              <h3 style={{ font: 'var(--font-h3)', margin: 0 }}>{averageKelancaran}%</h3>
            </div>
          </div>

          {/* Murajaah Terakhir */}
          <div className="card-premium" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'rgb(245, 158, 11)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p style={{ color: 'hsl(var(--color-neutral-gray))', fontSize: '0.85rem' }}>Murajaah Terakhir</p>
              <h3 style={{ font: 'var(--font-h4)', margin: 0, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }} title={latestMurajaahStr}>
                {latestMurajaahStr}
              </h3>
            </div>
          </div>
        </div>

        {/* Narrative Journey Summary */}
        {!loading && totalSetoran > 0 && (
          <div className="card-premium" style={{ 
            backgroundColor: 'hsl(var(--color-primary-light) / 0.1)', 
            border: '1px solid hsl(var(--color-primary-light))',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--spacing-4)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>📖</span>
            <div>
              <h4 style={{ font: 'var(--font-h4)', margin: '0 0 4px 0', color: 'hsl(var(--color-primary-dark))' }}>Catatan Perjalanan Hafalan Anda</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6', color: '#374151' }}>
                Alhamdulillah, <strong>{studentName}</strong> telah menyelesaikan <strong>{totalSetoran} kali</strong> setoran hafalan Al-Qur&apos;an. 
                Hafalan baru (Ziyadah) terakhirmu adalah <strong>{latestZiyadahStr}</strong>. 
                Tingkat kelancaran rata-rata hafalanmu mencapai <strong>{averageKelancaran}%</strong> yang masuk dalam kategori <strong>{getPredicate(averageKelancaran)}</strong>. 
                {lastMurajaah && ` Murajaah terakhir diselesaikan pada tanggal ${new Date(lastMurajaah.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.`}
                {' '}Terus pertahankan semangat menghafal dan jaga murajaah agar selalu lancar!
              </p>
            </div>
          </div>
        )}

        {/* Tab Switcher & Table */}
        <section className="card-premium" style={{ padding: 0 }}>
          {/* Tabs */}
          <div style={{ 
            display: 'flex', 
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)', 
            padding: 'var(--spacing-4) var(--spacing-6) 0 var(--spacing-6)',
            gap: 'var(--spacing-6)',
            overflowX: 'auto'
          }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                paddingBottom: 'var(--spacing-3)',
                borderBottom: activeTab === 'all' ? '2px solid rgb(99, 102, 241)' : '2px solid transparent',
                color: activeTab === 'all' ? 'rgb(99, 102, 241)' : 'hsl(var(--color-neutral-gray))',
                fontWeight: activeTab === 'all' ? 'bold' : 'normal',
                background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontSize: '0.9rem'
              }}
            >
              Semua Setoran
            </button>
            <button
              onClick={() => setActiveTab('ziyadah')}
              style={{
                paddingBottom: 'var(--spacing-3)',
                borderBottom: activeTab === 'ziyadah' ? '2px solid rgb(16, 185, 129)' : '2px solid transparent',
                color: activeTab === 'ziyadah' ? 'rgb(16, 185, 129)' : 'hsl(var(--color-neutral-gray))',
                fontWeight: activeTab === 'ziyadah' ? 'bold' : 'normal',
                background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontSize: '0.9rem'
              }}
            >
              🟢 Ziyadah
            </button>
            <button
              onClick={() => setActiveTab('sabqi')}
              style={{
                paddingBottom: 'var(--spacing-3)',
                borderBottom: activeTab === 'sabqi' ? '2px solid rgb(59, 130, 246)' : '2px solid transparent',
                color: activeTab === 'sabqi' ? 'rgb(59, 130, 246)' : 'hsl(var(--color-neutral-gray))',
                fontWeight: activeTab === 'sabqi' ? 'bold' : 'normal',
                background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontSize: '0.9rem'
              }}
            >
              🔵 Sabqi
            </button>
            <button
              onClick={() => setActiveTab('manzil')}
              style={{
                paddingBottom: 'var(--spacing-3)',
                borderBottom: activeTab === 'manzil' ? '2px solid rgb(109, 40, 217)' : '2px solid transparent',
                color: activeTab === 'manzil' ? 'rgb(109, 40, 217)' : 'hsl(var(--color-neutral-gray))',
                fontWeight: activeTab === 'manzil' ? 'bold' : 'normal',
                background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontSize: '0.9rem'
              }}
            >
              🟣 Manzil
            </button>
            <button
              onClick={() => setActiveTab('murajaah')}
              style={{
                paddingBottom: 'var(--spacing-3)',
                borderBottom: activeTab === 'murajaah' ? '2px solid rgb(245, 158, 11)' : '2px solid transparent',
                color: activeTab === 'murajaah' ? 'rgb(245, 158, 11)' : 'hsl(var(--color-neutral-gray))',
                fontWeight: activeTab === 'murajaah' ? 'bold' : 'normal',
                background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', fontSize: '0.9rem'
              }}
            >
              🟡 Murajaah
            </button>
          </div>

          {/* Log Table */}
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--color-neutral-gray))' }}>
                Mengambil data setoran...
              </div>
            ) : filteredRecords.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--color-neutral-gray))' }}>
                Tidak ada data riwayat setoran pada kategori ini.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(0, 0, 0, 0.05)', backgroundColor: 'hsl(var(--color-primary-light) / 0.15)' }}>
                    <th style={{ padding: 'var(--spacing-4) var(--spacing-6)' }}>Tanggal</th>
                    <th style={{ padding: 'var(--spacing-4)' }}>Kategori</th>
                    <th style={{ padding: 'var(--spacing-4)' }}>Surah & Ayat</th>
                    <th style={{ padding: 'var(--spacing-4)' }}>Tingkat Kelancaran</th>
                    <th style={{ padding: 'var(--spacing-4)' }}>Ustadz Penyimak</th>
                    <th style={{ padding: 'var(--spacing-4) var(--spacing-6)', width: '40%' }}>Catatan & Koreksi Tajwid</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((r) => {
                    const catInfo = CATEGORY_INFO[r.category as keyof typeof CATEGORY_INFO] || {
                      label: r.category,
                      badgeClass: 'bg-neutral-100 text-neutral-800 border-neutral-200'
                    };

                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }} className="hover:bg-neutral-light/20">
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', color: 'hsl(var(--color-neutral-gray))', fontSize: '0.875rem' }}>
                          {new Date(r.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: 'var(--spacing-4)' }}>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${catInfo.badgeClass}`}>
                            {catInfo.label}
                          </span>
                        </td>
                        <td style={{ padding: 'var(--spacing-4)' }}>
                          <strong>{r.surahName}</strong> 
                          <span style={{ color: 'hsl(var(--color-neutral-gray))', fontSize: '0.85rem', marginLeft: '4px' }}>
                            (Ayat {r.startAyat} - {r.endAyat})
                          </span>
                        </td>
                        <td style={{ padding: 'var(--spacing-4)' }}>
                          <span className={`badge badge-${r.status === 'lancar' ? 'success' : r.status === 'kurang_lancar' ? 'warning' : 'error'}`}>
                            {r.status === 'lancar' ? 'Lancar' : r.status === 'kurang_lancar' ? 'Kurang Lancar' : 'Perlu Diulang'}
                          </span>
                        </td>
                        <td style={{ padding: 'var(--spacing-4)', fontWeight: 500 }}>{r.teacherName}</td>
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.5' }}>
                          {r.notes || <span style={{ color: 'hsl(var(--color-neutral-gray))', fontStyle: 'italic' }}>Tidak ada catatan khusus</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
}
