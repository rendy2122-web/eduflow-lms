'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface Student {
  id: string;
  name: string;
  className: string;
}

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

interface Stats {
  totalToday: number;
  ziyadahToday: number;
  lancarPercent: number;
  notDepositedCount: number;
}

const CATEGORY_INFO = {
  ziyadah: {
    label: 'Ziyadah',
    desc: 'Setoran hafalan baru harian',
    color: 'emerald',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: (
      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  sabqi: {
    label: 'Sabqi',
    desc: 'Ulangan hafalan terdekat (1-7 hari sebelumnya)',
    color: 'blue',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: (
      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
      </svg>
    )
  },
  manzil: {
    label: 'Manzil',
    desc: 'Ulangan porsi besar secara periodik (1-5 Juz)',
    color: 'purple',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: (
      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  murajaah: {
    label: 'Murajaah',
    desc: 'Review hafalan lama keseluruhan secara rutin',
    color: 'amber',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: (
      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  }
};

export default function GuruTahfidzPage() {
  const [records, setRecords] = useState<TahfidzRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalToday: 0,
    ziyadahToday: 0,
    lancarPercent: 0,
    notDepositedCount: 0
  });

  // Loading States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Form Input States
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [category, setCategory] = useState<'ziyadah' | 'sabqi' | 'manzil' | 'murajaah'>('ziyadah');
  const [surahName, setSurahName] = useState('An-Naba');
  const [isCustomSurah, setIsCustomSurah] = useState(false);
  const [customSurahName, setCustomSurahName] = useState('');
  const [startAyat, setStartAyat] = useState('');
  const [endAyat, setEndAyat] = useState('');
  const [status, setStatus] = useState<'lancar' | 'kurang_lancar' | 'perlu_diulang'>('lancar');
  const [notes, setNotes] = useState('');

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Students
      const studentRes = await fetch('/api/admin/students');
      const studentData = await studentRes.json();
      if (studentData.success) {
        setStudents(studentData.students);
        if (studentData.students.length > 0) {
          setSelectedStudentId(studentData.students[0].id);
        }
      }

      // Fetch Tahfidz Records
      const tahfidzRes = await fetch('/api/guru/tahfidz');
      const tahfidzData = await tahfidzRes.json();
      if (tahfidzData.success) {
        setRecords(tahfidzData.records);
        if (tahfidzData.stats) {
          setStats(tahfidzData.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching tahfidz data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !startAyat || !endAyat) return;

    setSubmitting(true);
    const finalSurahName = isCustomSurah ? customSurahName : surahName;

    try {
      const res = await fetch('/api/guru/tahfidz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentId,
          surahName: finalSurahName,
          startAyat,
          endAyat,
          category,
          status,
          notes
        })
      });

      const data = await res.json();
      if (data.success) {
        // Reset form & reload
        setStartAyat('');
        setEndAyat('');
        setNotes('');
        setCustomSurahName('');
        setIsCustomSurah(false);
        setShowAddForm(false);
        await fetchData();
      } else {
        alert('Gagal menyimpan setoran: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving setoran:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan setoran ini?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/guru/tahfidz?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      } else {
        alert('Gagal menghapus catatan: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter & Search records
  const filteredRecords = records.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.surahName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout activeMenu="tahfidz">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
          <div>
            <h1 style={{ font: 'var(--font-h2)' }}>Jurnal Quran Tahfidz</h1>
            <p style={{ color: 'hsl(var(--color-neutral-gray))', fontSize: '0.9rem' }}>
              Manajemen setoran hafalan siswa (Ziyadah, Sabqi, Manzil, Murajaah) secara real-time.
            </p>
          </div>
          <button 
            id="btn-add-tahfidz-toggle"
            className={`btn-primary ${showAddForm ? 'bg-neutral-gray hover:bg-neutral-dark' : ''}`}
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ 
              backgroundColor: showAddForm ? 'hsl(var(--color-neutral-gray))' : '',
              borderColor: showAddForm ? 'hsl(var(--color-neutral-gray))' : ''
            }}
          >
            {showAddForm ? 'Batal Input' : 'Input Setoran Baru'}
          </button>
        </div>

        {/* Analytics Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-4)' }}>
          {/* Card 1: Total Setoran */}
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
              <p style={{ color: 'hsl(var(--color-neutral-gray))', fontSize: '0.85rem' }}>Setoran Hari Ini</p>
              <h3 style={{ font: 'var(--font-h3)', margin: 0 }}>{stats.totalToday} <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'hsl(var(--color-neutral-gray))' }}>kali</span></h3>
            </div>
          </div>

          {/* Card 2: Ziyadah */}
          <div className="card-premium" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'rgb(16, 185, 129)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p style={{ color: 'hsl(var(--color-neutral-gray))', fontSize: '0.85rem' }}>Ziyadah Hari Ini</p>
              <h3 style={{ font: 'var(--font-h3)', margin: 0 }}>{stats.ziyadahToday} <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'hsl(var(--color-neutral-gray))' }}>baru</span></h3>
            </div>
          </div>

          {/* Card 3: Rata-rata Kelancaran */}
          <div className="card-premium" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'rgb(59, 130, 246)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <p style={{ color: 'hsl(var(--color-neutral-gray))', fontSize: '0.85rem' }}>Rata-rata Kelancaran</p>
              <h3 style={{ font: 'var(--font-h3)', margin: 0 }}>{stats.lancarPercent}% <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'hsl(var(--color-neutral-gray))' }}>lancar</span></h3>
            </div>
          </div>

          {/* Card 4: Belum Setor */}
          <div className="card-premium" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              backgroundColor: 'rgba(244, 63, 94, 0.1)', color: 'rgb(244, 63, 94)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p style={{ color: 'hsl(var(--color-neutral-gray))', fontSize: '0.85rem' }}>Siswa Belum Setor</p>
              <h3 style={{ font: 'var(--font-h3)', margin: 0 }}>{stats.notDepositedCount} <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'hsl(var(--color-neutral-gray))' }}>anak</span></h3>
            </div>
          </div>
        </div>

        {/* Input Form Section */}
        {showAddForm && (
          <form onSubmit={handleAddRecord} className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)', border: '2px solid hsl(var(--color-primary-light))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ font: 'var(--font-h3)', margin: 0 }}>Pencatatan Setoran Baru</h2>
              <span style={{ fontSize: '0.85rem', color: 'hsl(var(--color-neutral-gray))' }}>Hari ini: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            {/* Student Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="tahfidz-student">Nama Murid</label>
                <select 
                  id="tahfidz-student" 
                  className="form-control" 
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  required
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.className})</option>
                  ))}
                </select>
              </div>

              {/* Surah Selector */}
              <div className="form-group">
                <label className="form-label" htmlFor="tahfidz-surah">Surah</label>
                <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                  {!isCustomSurah ? (
                    <select 
                      id="tahfidz-surah" 
                      className="form-control" 
                      value={surahName}
                      onChange={e => {
                        if (e.target.value === 'custom') {
                          setIsCustomSurah(true);
                        } else {
                          setSurahName(e.target.value);
                        }
                      }}
                      style={{ flex: 1 }}
                    >
                      <option value="An-Naba">An-Naba (40 ayat)</option>
                      <option value="An-Nazi'at">An-Nazi&apos;at (46 ayat)</option>
                      <option value="Al-Mulk">Al-Mulk (30 ayat)</option>
                      <option value="Yasin">Yasin (83 ayat)</option>
                      <option value="Al-Kahfi">Al-Kahfi (110 ayat)</option>
                      <option value="Al-Baqarah">Al-Baqarah (286 ayat)</option>
                      <option value="Al-Waqi'ah">Al-Waqi&apos;ah (96 ayat)</option>
                      <option value="custom">-- Surah Lain (Ketik Manual) --</option>
                    </select>
                  ) : (
                    <div style={{ display: 'flex', gap: 'var(--spacing-2)', flex: 1 }}>
                      <input 
                        type="text"
                        className="form-control"
                        placeholder="Nama Surah (misal: Al-Fatihah)"
                        value={customSurahName}
                        onChange={e => setCustomSurahName(e.target.value)}
                        required
                        style={{ flex: 1 }}
                      />
                      <button 
                        type="button" 
                        className="btn-secondary"
                        onClick={() => setIsCustomSurah(false)}
                        style={{ padding: '0 var(--spacing-3)' }}
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Category Pills (Interaktif) */}
            <div className="form-group">
              <label className="form-label">Kategori Setoran</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-2)' }}>
                {(Object.keys(CATEGORY_INFO) as Array<keyof typeof CATEGORY_INFO>).map((catKey) => {
                  const info = CATEGORY_INFO[catKey];
                  const isSelected = category === catKey;
                  let btnStyle: React.CSSProperties = {
                    display: 'flex',
                    alignItems: 'center',
                    padding: 'var(--spacing-2) var(--spacing-4)',
                    borderRadius: '9999px',
                    border: '1px solid #E5E7EB',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: 'white',
                    color: '#374151'
                  };

                  if (isSelected) {
                    if (catKey === 'ziyadah') {
                      btnStyle = { ...btnStyle, backgroundColor: '#ECFDF5', color: '#047857', borderColor: '#A7F3D0', boxShadow: '0 0 0 2px #A7F3D0' };
                    } else if (catKey === 'sabqi') {
                      btnStyle = { ...btnStyle, backgroundColor: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE', boxShadow: '0 0 0 2px #BFDBFE' };
                    } else if (catKey === 'manzil') {
                      btnStyle = { ...btnStyle, backgroundColor: '#F5F3FF', color: '#6D28D9', borderColor: '#DDD6FE', boxShadow: '0 0 0 2px #DDD6FE' };
                    } else if (catKey === 'murajaah') {
                      btnStyle = { ...btnStyle, backgroundColor: '#FFFBEB', color: '#B45309', borderColor: '#FDE68A', boxShadow: '0 0 0 2px #FDE68A' };
                    }
                  }

                  return (
                    <button
                      key={catKey}
                      type="button"
                      style={btnStyle}
                      onClick={() => setCategory(catKey)}
                    >
                      {info.icon}
                      {info.label}
                    </button>
                  );
                })}
              </div>
              <p style={{ color: 'hsl(var(--color-neutral-gray))', fontSize: '0.825rem', fontStyle: 'italic', margin: 0 }}>
                💡 {CATEGORY_INFO[category].desc}
              </p>
            </div>

            {/* Ayats & Kelancaran */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="ayat-start">Dari Ayat</label>
                <input 
                  type="number" 
                  id="ayat-start" 
                  className="form-control" 
                  placeholder="1"
                  value={startAyat}
                  onChange={e => setStartAyat(e.target.value)}
                  min={1}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ayat-end">Sampai Ayat</label>
                <input 
                  type="number" 
                  id="ayat-end" 
                  className="form-control" 
                  placeholder="10"
                  value={endAyat}
                  onChange={e => setEndAyat(e.target.value)}
                  min={1}
                  required
                />
              </div>

              <div className="form-group" style={{ minWidth: '200px' }}>
                <label className="form-label" htmlFor="tahfidz-status">Tingkat Kelancaran</label>
                <select 
                  id="tahfidz-status" 
                  className="form-control" 
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                >
                  <option value="lancar">🟢 Lancar (Mumtaz)</option>
                  <option value="kurang_lancar">🟡 Kurang Lancar (Jayyid)</option>
                  <option value="perlu_diulang">🔴 Perlu Diulang (Maqbul)</option>
                </select>
              </div>
            </div>

            {/* Notes & Corrections */}
            <div className="form-group">
              <label className="form-label" htmlFor="tahfidz-notes">Catatan & Koreksi Tajwid</label>
              <textarea 
                id="tahfidz-notes" 
                className="form-control" 
                rows={3}
                placeholder="Tulis koreksi makhraj huruf, hukum tajwid (ikhfa, ghunnah, mad), dll..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              id="btn-save-tahfidz" 
              className="btn-primary" 
              disabled={submitting}
              style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center' }}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Menyimpan...
                </>
              ) : 'Simpan Catatan Setoran'}
            </button>
          </form>
        )}

        {/* Logs and History Section */}
        <section className="card-premium" style={{ padding: 0 }}>
          {/* Filters Bar */}
          <div style={{ 
            padding: 'var(--spacing-4) var(--spacing-6)', 
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--spacing-4)'
          }}>
            <h2 style={{ font: 'var(--font-h4)', margin: 0 }}>Jurnal Riwayat Setoran Hafalan Siswa</h2>
            
            <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
              {/* Search */}
              <input 
                type="text"
                className="form-control"
                placeholder="Cari nama atau surah..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '220px', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
              />

              {/* Category Filter */}
              <select
                className="form-control"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                style={{ width: '160px', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
              >
                <option value="all">Semua Kategori</option>
                <option value="ziyadah">Ziyadah (Setoran Baru)</option>
                <option value="sabqi">Sabqi (Ulang Dekat)</option>
                <option value="manzil">Manzil (Ulang Jauh)</option>
                <option value="murajaah">Murajaah (Ulang Lama)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--color-neutral-gray))' }}>
                Mengambil data setoran...
              </div>
            ) : filteredRecords.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--color-neutral-gray))' }}>
                Tidak ada data setoran hafalan yang sesuai.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(0, 0, 0, 0.05)', backgroundColor: 'hsl(var(--color-primary-light) / 0.15)' }}>
                    <th style={{ padding: 'var(--spacing-4) var(--spacing-6)' }}>Tanggal</th>
                    <th style={{ padding: 'var(--spacing-4)' }}>Murid</th>
                    <th style={{ padding: 'var(--spacing-4)' }}>Kategori</th>
                    <th style={{ padding: 'var(--spacing-4)' }}>Surah & Ayat</th>
                    <th style={{ padding: 'var(--spacing-4)' }}>Kelancaran</th>
                    <th style={{ padding: 'var(--spacing-4)', width: '35%' }}>Catatan Guru</th>
                    <th style={{ padding: 'var(--spacing-4) var(--spacing-6)', textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((r) => {
                    const catInfo = CATEGORY_INFO[r.category as keyof typeof CATEGORY_INFO] || {
                      label: r.category,
                      badgeClass: 'bg-neutral-100 text-neutral-800 border-neutral-200'
                    };

                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)', transition: 'background-color 0.2s' }} className="hover:bg-neutral-light/30">
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', color: 'hsl(var(--color-neutral-gray))', fontSize: '0.85rem' }}>
                          {new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: 'var(--spacing-4)' }}>
                          <div style={{ fontWeight: 600 }}>{r.studentName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'hsl(var(--color-neutral-gray))' }}>{r.className}</div>
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
                        <td style={{ padding: 'var(--spacing-4)', fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.4' }}>
                          {r.notes || <span style={{ color: 'hsl(var(--color-neutral-gray))', fontStyle: 'italic' }}>Tidak ada catatan</span>}
                        </td>
                        <td style={{ padding: 'var(--spacing-4) var(--spacing-6)', textAlign: 'right' }}>
                          <button
                            type="button"
                            className="text-error hover:text-error-dark"
                            onClick={() => handleDeleteRecord(r.id)}
                            disabled={deletingId === r.id}
                            style={{ 
                              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                              color: 'hsl(var(--color-error))', opacity: deletingId === r.id ? 0.5 : 1
                            }}
                          >
                            {deletingId === r.id ? '...' : 'Hapus'}
                          </button>
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
