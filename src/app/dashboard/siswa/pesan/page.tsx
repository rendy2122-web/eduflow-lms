'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface CommunicationLog {
  id: string;
  student_id: string;
  sender_role: 'guru' | 'orang_tua' | 'siswa';
  sender_name: string;
  message: string;
  date: string;
  created_at: string;
}

export default function SiswaPesanPage() {
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch Student Profile ID
  const fetchStudentProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/siswa/dashboard');
      const json = await res.json();
      if (json.success && json.studentInfo?.id) {
        setStudentId(json.studentInfo.id);
        setStudentName(json.studentInfo.nama);
      }
    } catch (error) {
      console.error('Error fetching student profile for messaging:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentProfile();
  }, [fetchStudentProfile]);

  // Fetch Logs
  const fetchLogs = useCallback(async (id: string) => {
    try {
      setLogsLoading(true);
      const res = await fetch(`/api/guru/consultation?studentId=${id}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching student consultation logs:', error);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (studentId) {
      fetchLogs(studentId);
    }
  }, [studentId, fetchLogs]);

  // Scroll to Bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !studentId || sending) return;

    try {
      setSending(true);
      const res = await fetch('/api/guru/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: studentId,
          senderRole: 'siswa',
          senderName: studentName || 'Siswa',
          message: message.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage('');
        fetchLogs(studentId);
      } else {
        alert('Gagal mengirim pesan: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending student message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="pesan">
        <div style={{ padding: 'var(--spacing-8)', textAlign: 'center', color: 'hsl(var(--color-neutral-gray))' }}>
          Memuat halaman Konsultasi...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="pesan">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        
        {/* Header */}
        <div>
          <h1 style={{ font: 'var(--font-h2)' }}>Konsultasi & Tanya Guru</h1>
          <p style={{ color: 'hsl(var(--color-neutral-gray))', fontSize: '0.9rem' }}>
            Ajukan pertanyaan tentang tugas atau materi pembelajaran langsung ke Wali Kelas Sarah Jenkins, S.Pd.
          </p>
        </div>

        {studentId ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            overflow: 'hidden',
            height: 'calc(100vh - 220px)',
            minHeight: 0
          }}>
            
            {/* Chat Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              gap: '12px'
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                backgroundColor: 'rgba(13, 148, 136, 0.1)', color: '#0d9488',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
              }}>
                SJ
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Sarah Jenkins, S.Pd</h3>
                <span style={{ fontSize: '0.78rem', color: '#0d9488', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                  Wali Kelas / Guru Pembimbing
                </span>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div style={{
              flex: 1,
              padding: '24px',
              overflowY: 'auto',
              backgroundColor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              minHeight: 0
            }}>
              {logsLoading ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '20px', fontSize: '0.9rem' }}>Memuat pesan...</div>
              ) : logs.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: '40px', fontSize: '0.9rem' }}>
                  Belum ada pesan. Kirim pertanyaan pertama Anda kepada guru pembimbing di bawah.
                </div>
              ) : (
                logs.map((log) => {
                  const isMe = log.sender_role === 'siswa';
                  const isTeacher = log.sender_role === 'guru';
                  
                  let bubbleBg = '#ffffff';
                  let textColor = '#1e293b';
                  let alignSelf = 'flex-start';
                  let borderRadius = '16px 16px 16px 4px';
                  let border = '1px solid #e2e8f0';

                  if (isMe) {
                    bubbleBg = '#4f46e5';
                    textColor = '#ffffff';
                    alignSelf = 'flex-end';
                    borderRadius = '16px 16px 4px 16px';
                    border = 'none';
                  } else if (log.sender_role === 'orang_tua') {
                    bubbleBg = '#fffbeb';
                    border = '1px solid #fde68a';
                    borderRadius = '16px 16px 16px 4px';
                  }

                  return (
                    <div
                      key={log.id}
                      style={{
                        alignSelf,
                        maxWidth: '75%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      {/* Sender Info */}
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        color: isMe ? '#4f46e5' : '#64748b',
                        textAlign: isMe ? 'right' : 'left',
                        paddingLeft: isMe ? 0 : '8px',
                        paddingRight: isMe ? '8px' : 0
                      }}>
                        {log.sender_name} {log.sender_role === 'orang_tua' && '(Orang Tua)'}
                      </span>
                      
                      {/* Message Bubble */}
                      <div style={{
                        backgroundColor: bubbleBg,
                        color: textColor,
                        padding: '12px 16px',
                        borderRadius,
                        border,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        wordBreak: 'break-word'
                      }}>
                        {log.message}
                      </div>

                      {/* Timestamp */}
                      <span style={{ 
                        fontSize: '0.625rem', 
                        color: '#94a3b8',
                        textAlign: isMe ? 'right' : 'left',
                        paddingLeft: isMe ? 0 : '8px',
                        paddingRight: isMe ? '8px' : 0
                      }}>
                        {new Date(log.created_at || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input form */}
            <form 
              onSubmit={handleSendMessage}
              style={{
                padding: '16px 24px 20px 24px',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Ketik pertanyaan konsultasi untuk Ustadz/Ustadzah..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                style={{ flex: 1, padding: '12px 16px', borderRadius: '12px' }}
                required
                disabled={sending}
              />
              <button
                type="submit"
                className="btn-primary"
                disabled={!message.trim() || sending}
                style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: 700 }}
              >
                {sending ? '...' : 'Kirim'}
              </button>
            </form>
          </div>
        ) : (
          <div className="card-premium" style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'hsl(var(--color-neutral-gray))' }}>
            Data profil siswa tidak ditemukan.
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
