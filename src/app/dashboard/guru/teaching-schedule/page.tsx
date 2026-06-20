'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface Class {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface TeachingSchedule {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string | null;
  created_at: string;
  class: Class;
  subject: Subject;
}

const DAYS = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'AHAD'];
const DAYS_INDONESIA: { [key: string]: string } = {
  'SENIN': 'Senin',
  'SELASA': 'Selasa',
  'RABU': 'Rabu',
  'KAMIS': 'Kamis',
  'JUMAT': 'Jumat',
  'SABTU': 'Sabtu',
  'AHAD': 'Ahad'
};

export default function TeachingSchedulePage() {
  const [schedules, setSchedules] = useState<TeachingSchedule[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    class_id: '',
    subject_id: '',
    day_of_week: 'SENIN',
    start_time: '07:00',
    end_time: '08:30',
    room: ''
  });

  const teacherId = typeof window !== 'undefined' ? localStorage.getItem('user_id') || 'guru-001' : 'guru-001';

  // Fetch schedules
  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch(`/api/guru/teaching-schedule?teacherId=${teacherId}`);
      const json = await res.json();
      if (json.success) {
        setSchedules(json.schedules);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  // Fetch classes & subjects
  const fetchClassesAndSubjects = useCallback(async () => {
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        fetch('/api/guru/classes'),
        fetch('/api/guru/subjects')
      ]);

      const classesJson = await classesRes.json();
      const subjectsJson = await subjectsRes.json();

      if (classesJson.success) {
        setClasses(classesJson.classes || []);
      }
      if (subjectsJson.success) {
        setSubjects(subjectsJson.subjects || []);
      }
    } catch (err) {
      console.error('Error fetching classes/subjects:', err);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
    fetchClassesAndSubjects();
  }, [fetchSchedules, fetchClassesAndSubjects]);

  // Reset form
  const resetForm = () => {
    setFormData({
      class_id: '',
      subject_id: '',
      day_of_week: 'SENIN',
      start_time: '07:00',
      end_time: '08:30',
      room: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Handle edit
  const handleEdit = (schedule: TeachingSchedule) => {
    setFormData({
      class_id: schedule.class_id,
      subject_id: schedule.subject_id,
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      room: schedule.room || ''
    });
    setEditingId(schedule.id);
    setShowForm(true);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const url = '/api/guru/teaching-schedule';
      const method = editingId ? 'PUT' : 'POST';
      
      const body = editingId 
        ? { id: editingId, ...formData }
        : { teacher_id: teacherId, ...formData };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const json = await res.json();
      
      if (json.success) {
        setSuccess(editingId ? 'Jadwal berhasil diupdate!' : 'Jadwal berhasil ditambahkan!');
        resetForm();
        fetchSchedules();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(json.error || 'Gagal menyimpan jadwal');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

    try {
      const res = await fetch(`/api/guru/teaching-schedule?id=${id}`, {
        method: 'DELETE'
      });

      const json = await res.json();
      
      if (json.success) {
        setSuccess('Jadwal berhasil dihapus!');
        fetchSchedules();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(json.error || 'Gagal menghapus jadwal');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    }
  };

  // Group schedules by day
  const groupedSchedules = DAYS.reduce((acc, day) => {
    acc[day] = schedules.filter(s => s.day_of_week === day);
    return acc;
  }, {} as { [key: string]: TeachingSchedule[] });

  // Get subject color
  const getSubjectColor = (subjectCode: string) => {
    const colors: { [key: string]: string } = {
      'MTK': '#3b82f6',
      'IPA': '#10b981',
      'IPS': '#f59e0b',
      'BIN': '#ef4444',
      'BIG': '#8b5cf6',
      'PAI': '#06b6d4',
      'PKN': '#ec4899',
      'SBK': '#f97316'
    };
    return colors[subjectCode] || '#6366f1';
  };

  return (
    <DashboardLayout activeMenu="teaching-schedule" pageTitle="Jadwal Mengajar" pageSubtitle="Kelola jadwal mengajar mingguan Anda">
      
      {/* Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slideDown 0.2s ease-out forwards;
        }
      ` }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Success/Error Messages */}
        {success && (
          <div style={{
            padding: '12px 16px',
            background: '#10b981',
            color: '#ffffff',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            ✅ {success}
          </div>
        )}
        {error && (
          <div style={{
            padding: '12px 16px',
            background: '#ef4444',
            color: '#ffffff',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 600
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Add Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px -2px rgba(79, 70, 229, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Tambah Jadwal
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="animate-slide-down" style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 20px 0' }}>
              {editingId ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '6px', display: 'block' }}>
                    Kelas
                  </label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      background: '#ffffff'
                    }}
                  >
                    <option value="">Pilih Kelas</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '6px', display: 'block' }}>
                    Mata Pelajaran
                  </label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      background: '#ffffff'
                    }}
                  >
                    <option value="">Pilih Mata Pelajaran</option>
                    {subjects.map((subj) => (
                      <option key={subj.id} value={subj.id}>{subj.name} ({subj.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '6px', display: 'block' }}>
                    Hari
                  </label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      background: '#ffffff'
                    }}
                  >
                    {DAYS.map((day) => (
                      <option key={day} value={day}>{DAYS_INDONESIA[day]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '6px', display: 'block' }}>
                    Waktu Mulai
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '6px', display: 'block' }}>
                    Waktu Selesai
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '6px', display: 'block' }}>
                    Ruangan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="Contoh: Ruang 101"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '10px 20px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.6 : 1
                  }}
                >
                  {saving ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Schedule Grid */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
            Memuat jadwal...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {DAYS.map((day) => (
              <div
                key={day}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}
              >
                {/* Day Header */}
                <div style={{
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff'
                }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                    {DAYS_INDONESIA[day]}
                  </h3>
                  <p style={{ fontSize: '0.75rem', margin: '4px 0 0 0', opacity: 0.9 }}>
                    {groupedSchedules[day].length} jadwal
                  </p>
                </div>

                {/* Schedule List */}
                <div style={{ padding: '12px' }}>
                  {groupedSchedules[day].length === 0 ? (
                    <div style={{
                      padding: '24px',
                      textAlign: 'center',
                      color: '#94a3b8',
                      fontSize: '0.85rem'
                    }}>
                      Tidak ada jadwal
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {groupedSchedules[day].map((schedule) => (
                        <div
                          key={schedule.id}
                          style={{
                            padding: '12px',
                            background: '#f8fafc',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            borderLeft: `4px solid ${getSubjectColor(schedule.subject.code)}`
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                                {schedule.subject.name}
                              </h4>
                              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                                {schedule.class.name}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                onClick={() => handleEdit(schedule)}
                                style={{
                                  padding: '4px 8px',
                                  background: '#3b82f6',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(schedule.id)}
                                style={{
                                  padding: '4px 8px',
                                  background: '#ef4444',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.75rem',
                            color: '#64748b',
                            marginTop: '8px'
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>{schedule.start_time} - {schedule.end_time}</span>
                            {schedule.room && (
                              <>
                                <span>•</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                  <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <span>{schedule.room}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}