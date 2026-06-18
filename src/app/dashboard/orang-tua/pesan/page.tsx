'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface ChildData {
  id: string;
  name: string;
  class: string;
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

export default function OrangTuaPesanPage() {
  const [children, setChildren] = useState<Record<string, ChildData>>({});
  const [childrenNames, setChildrenNames] = useState<string[]>([]);
  const [selectedChild, setSelectedChild] = useState('');
  
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch children info
  const fetchChildren = useCallback(async () => {
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
    } catch (error) {
      console.error('Error fetching parent dashboard children:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  // Fetch Logs for selected child
  const fetchLogs = useCallback(async (studentId: string) => {
    try {
      setLogsLoading(true);
      const res = await fetch(`/api/guru/consultation?studentId=${studentId}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Error fetching communication logs for parent:', error);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  const child = children[selectedChild] || null;

  useEffect(() => {
    if (child && child.id) {
      fetchLogs(child.id);
    } else {
      setLogs([]);
    }
  }, [selectedChild, children, child, fetchLogs]);

  // Scroll to Bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Send Message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || message;
    if (!textToSend.trim() || !child || sending) return;

    try {
      setSending(true);
      const parentName = localStorage.getItem('user_name') || 'Pak Andi';
      const childFirstName = child.name.split(' ')[0];
      const senderName = `${parentName} (Wali ${childFirstName})`;

      const res = await fetch('/api/guru/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: child.id,
          senderRole: 'orang_tua',
          senderName: senderName,
          message: textToSend.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        if (!customText) setMessage('');
        fetchLogs(child.id);
      } else {
        alert('Gagal mengirim pesan: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending parent message:', error);
    } finally {
      setSending(false);
    }
  };

  const onQuickReply = (text: string) => {
    handleSendMessage(text);
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="pesan">
        <div style={{ padding: 'var(--spacing-8)', textAlign: 'center', color: 'hsl(var(--color-neutral-gray))' }}>
          Memuat Portal Orang Tua...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="pesan">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        
        {/* Header Child Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
          <div>
            <h1 style={{ font: 'var(--font-h2)' }}>Buku Penghubung & Konsultasi</h1>
            <p style={{ color: 'hsl(var(--color-neutral-gray))', fontSize: '0.9rem' }}>
              Komunikasi harian dua arah secara langsung antara Orang Tua dan Wali Kelas.
            </p>
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
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            overflow: 'hidden',
            height: 'calc(100vh - 250px)',
            minHeight: 0
          }}>
            
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
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                  Wali Kelas: Sarah Jenkins, S.Pd
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Buku Penghubung ananda <strong>{child.name}</strong> ({child.class})
                </span>
              </div>
            </div>

            {/* Chat Logs viewport */}
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
                  Belum ada pesan terkirim. Kirim pesan pertama Anda kepada wali kelas ananda di bawah.
                </div>
              ) : (
                logs.map((log) => {
                  const isMe = log.sender_role === 'orang_tua';
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
                      {/* Sender Info */}
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        color: isMe ? '#4f46e5' : '#64748b',
                        textAlign: isMe ? 'right' : 'left',
                        paddingLeft: isMe ? 0 : '8px',
                        paddingRight: isMe ? '8px' : 0
                      }}>
                        {log.sender_name} {log.sender_role === 'siswa' && '(Ananda/Siswa)'}
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

            {/* Quick replies bar */}
            <div style={{
              padding: '12px 24px 0 24px',
              backgroundColor: '#ffffff',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              borderTop: '1px solid #e2e8f0',
              paddingBottom: '4px'
            }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onQuickReply('Baik ustadz/ustadzah, terima kasih banyak atas infonya.')}
                style={{ fontSize: '0.75rem', padding: '6px 12px', flexShrink: 0, borderRadius: '99px' }}
              >
                👍 Terima Kasih
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onQuickReply('Insya Allah malam ini kami dampingi untuk murajaah kembali di rumah.')}
                style={{ fontSize: '0.75rem', padding: '6px 12px', flexShrink: 0, borderRadius: '99px' }}
              >
                📖 Murajaah di Rumah
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onQuickReply('Ananda hari ini kurang sehat/sakit, mohon izin ustadz/ustadzah.')}
                style={{ fontSize: '0.75rem', padding: '6px 12px', flexShrink: 0, borderRadius: '99px' }}
              >
                🤒 Izin Sakit
              </button>
            </div>

            {/* Chat Input form */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              style={{
                padding: '12px 24px 20px 24px',
                backgroundColor: '#ffffff',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Ketik pesan balasan untuk Wali Kelas..."
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
            Data anak tidak ditemukan atau profil anak belum terhubung.
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
