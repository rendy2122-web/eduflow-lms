'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface Student {
  id: string;
  name: string;
  className: string;
  parentName: string;
  email: string;
}

interface CommunicationLog {
  id: string;
  student_id: string;
  sender_role: 'guru' | 'orang_tua' | 'siswa';
  sender_name: string;
  message: string;
  date: string;
  created_at: string;
}

export default function GuruPesanPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch Students
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/guru/students');
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
        if (data.students.length > 0) {
          const params = new URLSearchParams(window.location.search);
          const selectId = params.get('select');
          const matched = selectId ? data.students.find((s: any) => s.id === selectId) : null;
          setSelectedStudent(matched || data.students[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Fetch Logs
  const fetchLogs = useCallback(async (studentId: string) => {
    try {
      setLogsLoading(true);
      const res = await fetch(`/api/guru/consultation?studentId=${studentId}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching communication logs:', error);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchLogs(selectedStudent.id);
    }
  }, [selectedStudent, fetchLogs]);

  // Auto Scroll to Bottom of Chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || !selectedStudent || sending) return;

    try {
      setSending(true);
      const teacherName = localStorage.getItem('user_name') || 'Sarah Jenkins, S.Pd';
      const res = await fetch('/api/guru/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          senderRole: 'guru',
          senderName: teacherName,
          message: message.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage('');
        fetchLogs(selectedStudent.id);
      } else {
        alert('Gagal mengirim pesan: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Quick template trigger
  const applyTemplate = (templateType: string) => {
    if (!selectedStudent) return;
    
    let text = '';
    const firstName = selectedStudent.name.split(' ')[0];
    
    if (templateType === 'hafalan') {
      text = `Alhamdulillah, setoran hafalan ${firstName} hari ini berjalan sangat lancar. Tajwid dan kelancarannya sangat baik, mohon bantuannya untuk terus dimurajaah di rumah agar hafalannya tetap terjaga.`;
    } else if (templateType === 'tugas') {
      text = `Pemberitahuan: Mohon bantuannya untuk mendampingi ${firstName} menyelesaikan tugas sekolah di rumah, karena ada beberapa materi tugas yang masih menumpuk dan belum diselesaikan. Terima kasih Bapak/Ibu.`;
    } else if (templateType === 'kehadiran') {
      text = `Pemberitahuan: ${selectedStudent.name} hari ini tidak menghadiri kelas tanpa keterangan (alpa). Mohon konfirmasi dari Bapak/Ibu mengenai kondisi ananda hari ini.`;
    }
    
    setMessage(text);
  };

  // Filtered Students
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout activeMenu="pesan">
      <div className="chat-layout-grid" style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        overflow: 'hidden',
        height: 'calc(100vh - 200px)',
        minHeight: '500px'
      }}>
        
        {/* Left pane: Students List */}
        <div style={{
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f8fafc',
          minHeight: 0
        }}>
          {/* Search bar */}
          <div style={{ padding: 'var(--spacing-4)', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: '0 0 12px 0' }}>Buku Penghubung</h3>
            <input 
              type="text"
              className="form-control"
              placeholder="Cari nama murid..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '0.85rem', width: '100%' }}
            />
          </div>

          {/* Students Roster list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px', minHeight: 0 }}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>Memuat murid...</div>
            ) : filteredStudents.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>Murid tidak ditemukan</div>
            ) : (
              filteredStudents.map((student) => {
                const isSelected = selectedStudent?.id === student.id;
                const initials = student.name.split(' ').map(n => n[0]).join('').substring(0, 2);
                
                return (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: isSelected ? '#e0e7ff' : 'transparent',
                      color: isSelected ? '#4f46e5' : '#1e293b',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      outline: 'none',
                      marginBottom: '4px'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9';
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      backgroundColor: isSelected ? '#4f46e5' : '#cbd5e1',
                      color: '#ffffff', fontWeight: 'bold', fontSize: '0.85rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {initials}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {student.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: isSelected ? '#6366f1' : '#64748b' }}>
                        {student.className}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right pane: Chat Area */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', minHeight: 0 }}>
          {selectedStudent ? (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#ffffff'
              }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>{selectedStudent.name}</h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Wali Murid: <strong>{selectedStudent.parentName}</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Template buttons */}
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => applyTemplate('hafalan')}
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    📖 Templat Hafalan
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => applyTemplate('tugas')}
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    📝 Templat Tugas
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => applyTemplate('kehadiran')}
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    🚨 Templat Alpa
                  </button>
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
                gap: '16px'
              }}>
                {logsLoading ? (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: '20px', fontSize: '0.9rem' }}>Memuat pesan...</div>
                ) : logs.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: '40px', fontSize: '0.9rem' }}>
                    Belum ada obrolan Buku Penghubung. Tulis pesan pertama Anda di bawah.
                  </div>
                ) : (
                  logs.map((log) => {
                    const isMe = log.sender_role === 'guru';
                    const isParent = log.sender_role === 'orang_tua';
                    
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
                    } else if (log.sender_role === 'siswa') {
                      bubbleBg = '#f0fdf4';
                      border = '1px solid #bbf7d0';
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
                        {/* Sender info */}
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: 700, 
                          color: isMe ? '#4f46e5' : '#64748b',
                          textAlign: isMe ? 'right' : 'left',
                          paddingLeft: isMe ? 0 : '8px',
                          paddingRight: isMe ? '8px' : 0
                        }}>
                          {log.sender_name} {log.sender_role === 'siswa' && '(Siswa)'}
                        </span>
                        
                        {/* Message bubble */}
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

              {/* Chat Input area */}
              <form 
                onSubmit={handleSendMessage}
                style={{
                  padding: '16px 24px',
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
                  placeholder="Ketik pesan Buku Penghubung di sini..."
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
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              padding: '40px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</span>
              <h4 style={{ margin: 0, fontWeight: 700 }}>Buku Penghubung Kelas</h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '8px', maxWidth: '320px' }}>
                Pilih salah satu nama murid di daftar sebelah kiri untuk memuat riwayat percakapan.
              </p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
