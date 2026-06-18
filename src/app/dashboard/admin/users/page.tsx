'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  identifier: string;
  alamat: string;
  telepon: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'siswa',
    identifier: '',
    password: '',
    alamat: '',
    telepon: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const roles = [
    { value: 'all', label: 'Semua' },
    { value: 'admin', label: 'Admin' },
    { value: 'guru', label: 'Guru' },
    { value: 'siswa', label: 'Siswa' },
    { value: 'orang_tua', label: 'Orang Tua' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, selectedRole]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users?role=all');
      const json = await res.json();
      if (json.success) {
        setUsers(json.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(u => u.role === selectedRole);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.identifier.toLowerCase().includes(q)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        identifier: user.identifier,
        password: '',
        alamat: user.alamat,
        telepon: user.telepon
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'siswa',
        identifier: '',
        password: '',
        alamat: '',
        telepon: ''
      });
    }
    setFormError(null);
    setFormSuccess(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    try {
      const url = editingUser 
        ? '/api/admin/users' 
        : '/api/admin/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const body = editingUser 
        ? { id: editingUser.id, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const json = await res.json();

      if (json.success) {
        setFormSuccess(editingUser ? 'User berhasil diperbarui!' : 'User berhasil ditambahkan!');
        await fetchUsers();
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
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE'
      });

      const json = await res.json();
      if (json.success) {
        setFormSuccess('User berhasil dihapus!');
        await fetchUsers();
        setShowDeleteConfirm(null);
        setTimeout(() => setFormSuccess(null), 3000);
      } else {
        setFormError(json.error || 'Gagal menghapus user');
      }
    } catch (err: any) {
      setFormError(err.message || 'Gagal menghubungi server');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return '#4f46e5';
      case 'guru': return '#10b981';
      case 'siswa': return '#3b82f6';
      case 'orang_tua': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'guru': return 'Guru';
      case 'siswa': return 'Siswa';
      case 'orang_tua': return 'Orang Tua';
      default: return role;
    }
  };

  return (
    <DashboardLayout 
      activeMenu="users" 
      pageTitle="Manajemen Pengguna" 
      pageSubtitle="Kelola akun siswa, guru, staf, dan orang tua"
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
            position: 'relative'
          }}>
            <input
              type="text"
              placeholder="🔍 Cari nama, email, atau NISN/NIP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
            />
          </div>

          {/* Role Filter */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {roles.map(role => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: selectedRole === role.value ? '#4f46e5' : '#e2e8f0',
                  background: selectedRole === role.value ? '#4f46e5' : '#ffffff',
                  color: selectedRole === role.value ? '#ffffff' : '#64748b',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {role.label}
              </button>
            ))}
          </div>

          {/* Add User Button */}
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
            Tambah Pengguna
          </button>
        </div>

        {/* Users Table */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Memuat data pengguna...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              {searchQuery || selectedRole !== 'all' 
                ? 'Tidak ada pengguna yang sesuai dengan filter.' 
                : 'Belum ada pengguna terdaftar.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Pengguna
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Email
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Peran
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      NISN/NIP
                    </th>
                    <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            flexShrink: 0
                          }}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                              {user.name}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0' }}>
                              {user.alamat || 'Alamat belum diisi'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#475569' }}>
                        {user.email}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: `${getRoleBadgeColor(user.role)}15`,
                          color: getRoleBadgeColor(user.role),
                          border: `1px solid ${getRoleBadgeColor(user.role)}30`
                        }}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#475569', fontFamily: 'monospace' }}>
                        {user.identifier || '-'}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenModal(user)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid #4f46e5',
                              background: 'transparent',
                              color: '#4f46e5',
                              fontSize: '0.8rem',
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
                            onClick={() => setShowDeleteConfirm(user.id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '1px solid #ef4444',
                              background: 'transparent',
                              color: '#ef4444',
                              fontSize: '0.8rem',
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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
            <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>Total Pengguna</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4f46e5', margin: 0 }}>{users.length}</p>
          </div>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>Guru</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', margin: 0 }}>
              {users.filter(u => u.role === 'guru').length}
            </p>
          </div>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>Siswa</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6', margin: 0 }}>
              {users.filter(u => u.role === 'siswa').length}
            </p>
          </div>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0' }}>Orang Tua</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', margin: 0 }}>
              {users.filter(u => u.role === 'orang_tua').length}
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
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
                {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
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
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  Peran *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="guru">Guru</option>
                  <option value="siswa">Siswa</option>
                  <option value="orang_tua">Orang Tua</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  NISN / NIP
                </label>
                <input
                  type="text"
                  value={formData.identifier}
                  onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
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

              {!editingUser && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Alamat
                </label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
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

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Telepon
                </label>
                <input
                  type="tel"
                  value={formData.telepon}
                  onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
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
                  {submitting ? 'Menyimpan...' : (editingUser ? 'Perbarui' : 'Tambah Pengguna')}
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
                Hapus Pengguna?
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                Tindakan ini tidak dapat dibatalkan. Data pengguna akan dihapus permanently.
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
    </DashboardLayout>
  );
}