'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

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

interface ClassItem {
  id: string;
  name: string;
  subjects: Array<{ id: string; name: string }>;
}

export default function GuruOnlineClassPage() {
  const [onlineClasses, setOnlineClasses] = useState<OnlineClassItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:30');
  const [platform, setPlatform] = useState('gmeet');
  const [link, setLink] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectName, setSelectedSubjectName] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch classes and scheduled online classes
  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      
      const [classRes, onlineClassRes] = await Promise.all([
        fetch('/api/guru/classes'),
        fetch('/api/guru/online-class')
      ]);

      const classData = await classRes.json();
      const onlineClassData = await onlineClassRes.json();

      if (classData.success) {
        setClasses(classData.classes);
        if (classData.classes.length > 0) {
          setSelectedClassId(classData.classes[0].id);
          if (classData.classes[0].subjects.length > 0) {
            setSelectedSubjectName(classData.classes[0].subjects[0].name);
          }
        }
      }

      if (onlineClassData.success) {
        setOnlineClasses(onlineClassData.classes);
      }
    } catch (err: any) {
      console.error('Error fetching online class data:', err);
      setError('Gagal memuat data dari server.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Update subject list when class selection changes
  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const selectedClass = classes.find(c => c.id === classId);
    if (selectedClass && selectedClass.subjects.length > 0) {
      setSelectedSubjectName(selectedClass.subjects[0].name);
    } else {
      setSelectedSubjectName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    if (!title.trim() || !date || !startTime || !endTime || !link.trim() || !selectedClassId || !selectedSubjectName) {
      setError('Mohon lengkapi semua kolom yang bertanda wajib.');
      setSubmitting(false);
      return;
    }

    const classObj = classes.find(c => c.id === selectedClassId);
    if (!classObj) {
      setError('Kelas terpilih tidak valid.');
      setSubmitting(false);
      return;
    }

    const timeString = `${startTime} - ${endTime}`;

    try {
      const res = await fetch('/api/guru/online-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          date,
          time: timeString,
          platform,
          link: link.trim(),
          class_name: classObj.name,
          subject_name: selectedSubjectName,
          notes: notes.trim(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg('Kelas online berhasil dijadwalkan!');
        setTitle('');
        setLink('');
        setNotes('');
        // Refresh list
        const listRes = await fetch('/api/guru/online-class');
        const listJson = await listRes.json();
        if (listJson.success) {
          setOnlineClasses(listJson.classes);
        }
      } else {
        setError(json.error || 'Gagal menyimpan jadwal kelas.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal kelas online ini?')) return;
    
    try {
      const res = await fetch(`/api/guru/online-class?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setOnlineClasses(prev => prev.filter(item => item.id !== id));
        setSuccessMsg('Kelas online berhasil dihapus.');
      } else {
        setError(json.error || 'Gagal menghapus kelas online.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    }
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <DashboardLayout
      activeMenu="online-class"
      pageTitle="Kelas Online Console"
      pageSubtitle="Jadwalkan dan kelola pertemuan video interaktif Google Meet & Zoom untuk siswa Anda"
    >
      <div className="split-layout-grid" style={{ gap: '32px', fontFamily: 'system-ui, sans-serif' }}>
        
        {/* Left Side: Schedule Form */}
        <section className="card-premium" style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '32px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
          height: 'fit-content'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 24px 0', letterSpacing: '-0.02em' }}>
            Buat Kelas Online Baru
          </h3>

          {error && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '20px' }}>
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #86efac', color: '#15803d', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '20px' }}>
              ✓ {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Judul Sesi *
              </label>
              <input
                type="text"
                placeholder="Contoh: Diskusi Matematika Aljabar"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Target Kelas *
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff' }}
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Mata Pelajaran *
                </label>
                <select
                  value={selectedSubjectName}
                  onChange={(e) => setSelectedSubjectName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff' }}
                >
                  {selectedClass && selectedClass.subjects.length > 0 ? (
                    selectedClass.subjects.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))
                  ) : (
                    <option value="">Tidak ada mapel</option>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Tanggal Pelaksanaan *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Waktu Mulai *
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Waktu Selesai *
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Platform *
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', backgroundColor: '#fff' }}
                >
                  <option value="gmeet">Google Meet</option>
                  <option value="zoom">Zoom Meeting</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  Link Meeting *
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  required
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                placeholder="Petunjuk persiapan belajar..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: '12px',
                padding: '12px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!submitting) e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                if (!submitting) e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {submitting ? 'Menyimpan...' : 'Jadwal Kelas Online'}
            </button>
          </form>
        </section>

        {/* Right Side: List of Scheduled Classes */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Daftar Kelas Online Terjadwal
            </h3>
            <span style={{ fontSize: '0.8rem', padding: '6px 12px', backgroundColor: '#e2e8f0', color: '#475569', borderRadius: '999px', fontWeight: 600 }}>
              {onlineClasses.length} Sesi Terjadwal
            </span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '4px solid #f3f3f3', borderTopColor: '#4f46e5', animation: 'spin 1s linear infinite' }} />
              <style dangerouslySetInnerHTML={{__html: `@keyframes spin { to { transform: rotate(360deg); } }`}} />
            </div>
          ) : onlineClasses.length === 0 ? (
            <div className="card-premium" style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: '60px 40px',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              color: '#64748b'
            }}>
              <span style={{ fontSize: '3rem' }}>📅</span>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>Belum ada kelas terjadwal</h4>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>Isi formulir di sebelah kiri untuk menjadwalkan kelas virtual pertamamu.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {onlineClasses.map((item) => {
                const isGMeet = item.platform === 'gmeet';
                const platformColor = isGMeet ? '#10b981' : '#2563eb';
                const platformBg = isGMeet ? '#ecfdf5' : '#eff6ff';
                const platformLabel = isGMeet ? 'Google Meet' : 'Zoom Meeting';

                return (
                  <div
                    key={item.id}
                    className="card-premium"
                    style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      padding: '24px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '20px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(15, 23, 42, 0.05)';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(15, 23, 42, 0.02)';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          color: platformColor,
                          backgroundColor: platformBg
                        }}>
                          {platformLabel}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                          Kelas: <strong style={{ color: '#0f172a' }}>{item.class_name}</strong>
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                          Mapel: <strong style={{ color: '#0f172a' }}>{item.subject_name}</strong>
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </h4>

                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          📅 {item.date}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          🕒 {item.time}
                        </span>
                      </div>

                      {item.notes && (
                        <p style={{ fontSize: '0.78rem', color: '#64748b', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', borderLeft: `3px solid ${platformColor}`, margin: '8px 0 0 0' }}>
                          Catatan: {item.notes}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '10px 18px',
                          background: platformColor,
                          color: '#ffffff',
                          borderRadius: '10px',
                          fontSize: '0.825rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          textAlign: 'center',
                          boxShadow: `0 4px 10px -2px ${platformColor}4D`,
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        Mulai Kelas
                      </a>

                      <button
                        onClick={() => handleDelete(item.id)}
                        style={{
                          padding: '8px 14px',
                          background: '#fef2f2',
                          color: '#b91c1c',
                          border: '1px solid #fca5a5',
                          borderRadius: '10px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fee2e2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fef2f2';
                        }}
                      >
                        Hapus Jadwal
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </DashboardLayout>
  );
}
