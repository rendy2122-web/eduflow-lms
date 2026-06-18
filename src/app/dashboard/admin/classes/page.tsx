'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface Class {
  id: string;
  name: string;
  description: string;
  subjects: any[];
  profiles: any[];
  _count: {
    subjects: number;
    profiles: number;
  };
}

interface Teacher {
  id: string;
  nama: string;
  email: string;
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [subjectFormData, setSubjectFormData] = useState({
    name: '',
    code: '',
    teacherId: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/admin/classes');
      const json = await res.json();
      if (json.success) {
        setClasses(json.classes);
        setTeachers(json.teachers);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (classData?: Class) => {
    if (classData) {
      setEditingClass(classData);
      setFormData({
        name: classData.name,
        description: classData.description || ''
      });
    } else {
      setEditingClass(null);
      setFormData({
        name: '',
        description: ''
      });
    }
    setFormError(null);
    setFormSuccess(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClass(null);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    try {
      const url = '/api/admin/classes';
      const method = editingClass ? 'PUT' : 'POST';
      
      const body = editingClass 
        ? { id: editingClass.id, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const json = await res.json();

      if (json.success) {
        setFormSuccess(editingClass ? 'Kelas berhasil diperbarui!' : 'Kelas berhasil ditambahkan!');
        await fetchClasses();
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        setFormError(json.error || 'Terjadi kesalahan');
      }
    } catch (err: any) {
      setFormError(err.message || 'Gagal menghubungi server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/classes?id=${id}`, {
        method: 'DELETE'
      });

      const json = await res.json();
      if (json.success) {
        setFormSuccess('Kelas berhasil dihapus!');
        await fetchClasses();
        setShowDeleteConfirm(null);
        setTimeout(() => setFormSuccess(null), 3000);
      } else {
        setFormError(json.error || 'Gagal menghapus kelas');
      }
    } catch (err: any) {
      setFormError(err.message || 'Gagal menghubungi server');
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !subjectFormData.name || !subjectFormData.code || !subjectFormData.teacherId) {
      setFormError('Semua field mata pelajaran wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      // Note: This is a simplified version. In production, you'd create Subject records
      // For now, we'll just show a success message
      setFormSuccess('Fitur tambah mata pelajaran akan segera tersedia');
      setShowSubjectModal(false);
      setSubjectFormData({ name: '', code: '', teacherId: '' });
      setTimeout(() => setFormSuccess(null), 3000);
    } catch (err: any) {
      setFormError(err.message || 'Gagal menambah mata pelajaran');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = () => {
    setSearchTrigger(prev => prev + 1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout 
      activeMenu="classes" 
      pageTitle="Manajemen Kelas & Mata Pelajaran" 
      pageSubtitle="Kelola struktur kelas, mata pelajaran, dan penugasan guru"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Success/Error Messages */}
        {formSuccess && (
          <div style={{
            background: '#dcfce7',
            border: '1px solid #10b981',
            color: '#166534',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ✓ {formSuccess}
          </div>
        )}

        {formError && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #ef4444',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ⚠️ {formError}
          </div>
        )}

        {/* Actions Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Search */}
          <div style={{
            flex: 1,
            minWidth: '240px',
            maxWidth: '400px',
            display: 'flex',
            gap: '8px'
          }}>
            <input
              type="text"
              placeholder="🔍 Cari nama kelas atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              <span>🔍</span>
              Cari
            </button>
          </div>

          {/* Add Class Button */}
          <button
            onClick={() => handleOpenModal()}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              color: '#ffffff',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>+</span>
            Tambah Kelas
          </button>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Memuat data kelas...
          </div>
        ) : filteredClasses.length === 0 ? (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '60px 40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏫</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
              {searchQuery ? 'Tidak ada kelas yang sesuai' : 'Belum ada kelas'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 20px 0' }}>
              {searchQuery ? 'Coba kata kunci pencarian lain' : 'Mulai dengan membuat kelas pertama untuk sekolah Anda'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => handleOpenModal()}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + Tambah Kelas Pertama
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {filteredClasses.map((cls) => (
              <div
                key={cls.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '24px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Class Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    flexShrink: 0
                  }}>
                    {cls.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '6px'
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(cls);
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #4f46e5',
                        background: 'transparent',
                        color: '#4f46e5',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#4f46e5';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#4f46e5';
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(cls.id);
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #ef4444',
                        background: 'transparent',
                        color: '#ef4444',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ef4444';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                {/* Class Info */}
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: '0 0 8px 0'
                }}>
                  {cls.name}
                </h3>
                
                {cls.description && (
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#64748b',
                    margin: '0 0 16px 0',
                    lineHeight: '1.5'
                  }}>
                    {cls.description}
                  </p>
                )}

                {/* Stats */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #f1f5f9'
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '0.72rem',
                      color: '#64748b',
                      fontWeight: 600,
                      margin: '0 0 4px 0'
                    }}>
                      Mata Pelajaran
                    </p>
                    <p style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#4f46e5',
                      margin: 0
                    }}>
                      {cls._count.subjects}
                    </p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '0.72rem',
                      color: '#64748b',
                      fontWeight: 600,
                      margin: '0 0 4px 0'
                    }}>
                      Siswa
                    </p>
                    <p style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#10b981',
                      margin: 0
                    }}>
                      {cls._count.profiles}
                    </p>
                  </div>
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedClass(cls)}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#4f46e5';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.borderColor = '#4f46e5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.color = '#475569';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  Lihat Detail →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>Total Kelas</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4f46e5', margin: 0 }}>{classes.length}</p>
          </div>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>Total Mata Pelajaran</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', margin: 0 }}>
              {classes.reduce((sum, cls) => sum + cls._count.subjects, 0)}
            </p>
          </div>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>Total Siswa</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6', margin: 0 }}>
              {classes.reduce((sum, cls) => sum + cls._count.profiles, 0)}
            </p>
          </div>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>Total Guru</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', margin: 0 }}>{teachers.length}</p>
          </div>
        </div>
      </div>

      {/* Add/Edit Class Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {editingClass ? 'Edit Kelas' : 'Tambah Kelas Baru'}
              </h2>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Nama Kelas *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Kelas 4A, XII IPA 1"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi opsional untuk kelas ini..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              {formError && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #ef4444',
                  color: '#991b1b',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem'
                }}>
                  {formError}
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '8px'
              }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#64748b',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1
                  }}
                >
                  {submitting ? 'Menyimpan...' : (editingClass ? 'Perbarui' : 'Tambah Kelas')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                fontSize: '2rem'
              }}>
                ⚠️
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                Hapus Kelas?
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                Tindakan ini tidak dapat dibatalkan. Pastikan tidak ada siswa di kelas ini.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#64748b',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Detail Modal */}
      {selectedClass && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Detail Kelas: {selectedClass.name}
              </h2>
              <button
                onClick={() => setSelectedClass(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Class Info */}
            <div style={{
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 4px 0' }}>Deskripsi</p>
              <p style={{ fontSize: '0.95rem', color: '#0f172a', margin: 0 }}>
                {selectedClass.description || 'Tidak ada deskripsi'}
              </p>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '16px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 4px 0' }}>Mata Pelajaran</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4f46e5', margin: 0 }}>
                  {selectedClass._count.subjects}
                </p>
              </div>
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '16px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 4px 0' }}>Siswa</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', margin: 0 }}>
                  {selectedClass._count.profiles}
                </p>
              </div>
            </div>

            {/* Subjects List */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
                Mata Pelajaran di Kelas Ini
              </h3>
              {!selectedClass.subjects || selectedClass.subjects.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                  Belum ada mata pelajaran
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedClass.subjects.map((subject: any) => (
                    <div key={subject.id} style={{
                      padding: '12px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0' }}>
                        {subject.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                        {subject.code} • {subject.teacher?.nama || 'Belum ada guru'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Students List */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
                Daftar Siswa
              </h3>
              {!selectedClass.profiles || selectedClass.profiles.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic' }}>
                  Belum ada siswa di kelas ini
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                  {selectedClass.profiles.map((profile: any) => (
                    <div key={profile.id} style={{
                      padding: '8px 12px',
                      background: '#f8fafc',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        flexShrink: 0
                      }}>
                        {profile.user?.nama?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {profile.user?.nama || 'Unknown'}
                        </p>
                        <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>
                          {profile.nisn_or_nip || '-'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedClass(null)}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#64748b',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}