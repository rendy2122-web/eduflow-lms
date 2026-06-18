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

export default function SiswaOnlineClassPage() {
  const [onlineClasses, setOnlineClasses] = useState<OnlineClassItem[]>([]);
  const [studentId, setStudentId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchOnlineClasses() {
    try {
      setLoading(true);
      setError(null);
      
      const classRes = await fetch('/api/siswa/online-class');
      const classJson = await classRes.json();
      if (classJson.success) {
        setOnlineClasses(classJson.classes);
      } else {
        setError(classJson.error || 'Gagal memuat kelas online.');
      }

      const profileRes = await fetch('/api/siswa/dashboard');
      const profileJson = await profileRes.json();
      if (profileJson.success && profileJson.studentInfo?.id) {
        setStudentId(profileJson.studentInfo.id);
      }
    } catch (err: any) {
      console.error('Error fetching online classes or student profile:', err);
      setError('Terjadi kesalahan koneksi server.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOnlineClasses();
  }, []);

  const handleJoinClass = (item: OnlineClassItem) => {
    if (typeof window !== 'undefined') {
      window.open(item.link, '_blank');
    }

     if (studentId) {
       const todayDate = new Date().toISOString().split('T')[0];
       fetch('/api/guru/attendance/student', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           studentId: studentId,
           date: todayDate,
           status: 'hadir',
           notes: `Hadir otomatis via Klik Gabung Kelas Daring (${item.title})`
         })
       })
       .then(res => res.json())
       .then(() => {
         // Attendance logged successfully
       })
       .catch(() => {
         // Attendance logging failed silently
       });
     }
  };

  return (
    <DashboardLayout
      activeMenu="online-class"
      pageTitle="Kelas Online Virtual"
      pageSubtitle="Bergabunglah ke ruang belajar tatap muka daring melalui Google Meet atau Zoom"
    >
      <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Banner Card */}
        <div className="card-premium" style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
          borderRadius: '24px',
          padding: '36px',
          color: '#ffffff',
          marginBottom: '32px',
          boxShadow: '0 20px 40px -15px rgba(79, 70, 229, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '24px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-0.03em' }}>
              Selamat Belajar Virtual! 🚀
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#c7d2fe', margin: 0, maxWidth: '500px', lineHeight: '1.5' }}>
              Silakan periksa daftar sesi di bawah ini. Tombol <strong>&quot;Gabung Kelas&quot;</strong> akan menyala untuk membantumu langsung terhubung ke ruang pertemuan daring.
            </p>
          </div>
          <span style={{ fontSize: '4rem', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))' }}>💻</span>
        </div>

        {error && (
          <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: '16px', fontSize: '0.9rem', marginBottom: '24px' }}>
            ⚠️ {error}
          </div>
        )}

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px', letterSpacing: '-0.02em' }}>
          Jadwal Pertemuan Kelas Online Anda
        </h3>

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
            <span style={{ fontSize: '3rem' }}>🎉</span>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>Tidak ada kelas online terjadwal</h4>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>Belum ada jadwal pertemuan virtual dari gurumu saat ini. Nikmati waktu belajarmu!</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                    padding: '28px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '24px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 12px 30px -5px rgba(15, 23, 42, 0.04)';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(15, 23, 42, 0.02)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
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
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4f46e5', backgroundColor: '#e0e7ff', padding: '4px 8px', borderRadius: '6px' }}>
                        {item.subject_name}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 0 0', letterSpacing: '-0.01em' }}>
                      {item.title}
                    </h4>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: '#475569', marginTop: '6px', fontWeight: 500 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📅 Tanggal: {item.date}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        🕒 Jam: {item.time}
                      </span>
                    </div>

                    {item.notes && (
                      <p style={{ fontSize: '0.8rem', color: '#475569', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', borderLeft: `3px solid ${platformColor}`, margin: '12px 0 0 0', lineHeight: '1.4' }}>
                        💡 <strong>Catatan Guru:</strong> {item.notes}
                      </p>
                    )}
                  </div>

                  <div style={{ flexShrink: 0 }}>
                    <button
                      onClick={() => handleJoinClass(item)}
                      className="btn-join-class"
                      style={{
                        display: 'block',
                        padding: '14px 28px',
                        background: `linear-gradient(135deg, ${platformColor} 0%, #1e293b 100%)`,
                        color: '#ffffff',
                        borderRadius: '14px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        border: 'none',
                        outline: 'none',
                        textAlign: 'center',
                        boxShadow: `0 8px 20px -4px ${platformColor}66`,
                        animation: 'pulse 2s infinite',
                        cursor: 'pointer'
                      }}
                    >
                      Gabung Kelas
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CSS Keyframes for Pulsing Effect */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
            }
          }
        `}} />
      </div>
    </DashboardLayout>
  );
}
