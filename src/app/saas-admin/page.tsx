'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TenantItem {
  id: string;
  name: string;
  pathSegment: string;
  dbFilePath: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
  created_at: string;
  dbSizeKb?: number;
  subscription?: {
    plan: 'FREE' | 'BASIC' | 'PREMIUM';
    expiresAt: string;
    maxUsers: number;
  } | null;
}

export default function SaasAdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Onboarding Form States
  const [schoolName, setSchoolName] = useState('');
  const [pathSegment, setPathSegment] = useState('');
  const [formStatus, setFormStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    activeCount: 0,
    totalStorageMb: 0,
    mrrEst: 0,
  });

  async function fetchSaaSMetrics() {
    try {
      setLoading(true);
      const res = await fetch('/api/saas/metrics');
      const json = await res.json();
      if (json.success) {
        setTenants(json.tenants || []);
        setStats({
          activeCount: json.activeCount || 0,
          totalStorageMb: json.totalStorageMb || 0,
          mrrEst: json.mrrEst || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching SaaS metrics:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function verifyOwnerSession() {
      try {
        const res = await fetch('/api/saas/session');
        const json = await res.json();
        if (json.success) {
          setAuthorized(true);
          await fetchSaaSMetrics();
        } else {
          router.push('/saas-admin/login');
        }
      } catch (err) {
        console.error('Error verifying SaaS owner session:', err);
        router.push('/saas-admin/login');
      } finally {
        setSessionChecked(true);
      }
    }

    verifyOwnerSession();
  }, [router]);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim() || !pathSegment.trim()) {
      alert('Semua bidang wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormStatus('Memproses pembuatan database sekolah...');
      
      const res = await fetch('/api/saas/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: schoolName.trim(),
          pathSegment: pathSegment.trim().toLowerCase()
        })
      });

      const json = await res.json();
      if (json.success) {
        setFormStatus('Sekolah baru berhasil dibuat & database terisolasi telah siap! 🎉');
        setSchoolName('');
        setPathSegment('');
        await fetchSaaSMetrics();
        setTimeout(() => setFormStatus(null), 4000);
      } else {
        setFormStatus(`Gagal: ${json.error}`);
        setTimeout(() => setFormStatus(null), 4000);
      }
    } catch (err: any) {
      setFormStatus(`Error: ${err.message}`);
      setTimeout(() => setFormStatus(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (tenantId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const conf = window.confirm(`Apakah Anda yakin ingin mengubah status sekolah ini menjadi ${nextStatus}?`);
    if (!conf) return;

    try {
      const res = await fetch('/api/saas/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          status: nextStatus
        })
      });
      const json = await res.json();
      if (json.success) {
        await fetchSaaSMetrics();
      } else {
        alert('Gagal memperbarui status: ' + json.error);
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  if (!sessionChecked || !authorized) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0f172a',
        color: '#f8fafc',
        fontFamily: 'Inter, sans-serif'
      }}>
        Memuat data...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: 'Inter, sans-serif',
      padding: '40px 20px',
      background: 'radial-gradient(circle at top right, #1e1b4b, #0f172a 70%)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '24px'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6366f1', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em' }}>SaaS Master Console</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>EduFlow Master Control Panel</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981', display: 'inline-block'
              }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>Koneksi Database: AKTIF</span>
            </div>
            <button
              onClick={async () => {
                try {
                  await fetch('/api/saas/logout', { method: 'POST' });
                } catch (err) {
                  console.error('Logout error:', err);
                }
                localStorage.removeItem('saas_owner_logged_in');
                router.push('/saas-admin/login');
              }}
              style={{
                padding: '6px 14px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s, border-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
              }}
            >
              Keluar
            </button>
          </div>
        </header>

        {/* Stats Section */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.45)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '20px',
            padding: '24px'
          }}>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, fontWeight: 600 }}>Total Sekolah Aktif</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#6366f1', margin: '12px 0 0 0' }}>{stats.activeCount} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 400 }}>Sekolah</span></h2>
          </div>
          
          <div style={{
            background: 'rgba(30, 41, 59, 0.45)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '20px',
            padding: '24px'
          }}>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, fontWeight: 600 }}>Kapasitas Database Terpakai</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10b981', margin: '12px 0 0 0' }}>{stats.totalStorageMb.toFixed(2)} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 400 }}>MB</span></h2>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.45)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '20px',
            padding: '24px'
          }}>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, fontWeight: 600 }}>Estimasi MRR (Midtrans Billing)</p>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#f59e0b', margin: '12px 0 0 0' }}>
              Rp {(stats.mrrEst / 1000).toFixed(0)}k <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 400 }}>/ bln</span>
            </h2>
          </div>
        </section>

        {/* Main Grid split */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', alignItems: 'start' }}>
          
          {/* Left panel: Onboarding Form */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '24px',
            padding: '28px'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 8px 0', color: '#ffffff' }}>🏢 Daftarkan & Buat Database Client</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 24px 0', lineHeight: '1.4' }}>
              Masukkan identitas sekolah. Sistem akan otomatis membagi database SQLite baru dan mengisolasi datanya secara terstruktur.
            </p>

            <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1' }}>Nama Sekolah / Lembaga:</label>
                <input
                  type="text"
                  placeholder="Contoh: SD Ceria Nusantara"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  style={{
                    backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', padding: '12px 16px', fontSize: '0.88rem', color: '#ffffff', outline: 'none'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1' }}>Folder Path URL Segment (Tenant ID):</label>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', padding: '12px 0 12px 16px', userSelect: 'none' }}>eduflow.com/</span>
                  <input
                    type="text"
                    placeholder="sdceria"
                    value={pathSegment}
                    onChange={(e) => setPathSegment(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                    style={{
                      backgroundColor: 'transparent', border: 'none',
                      padding: '12px 16px 12px 2px', fontSize: '0.88rem', color: '#ffffff', outline: 'none', flex: 1
                    }}
                    required
                  />
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Gunakan huruf kecil, angka, atau tanda strip saja.</span>
              </div>

              {formStatus && (
                <div style={{
                  padding: '12px', borderRadius: '10px', backgroundColor: formStatus.startsWith('Gagal') ? '#451a1a' : '#14532d',
                  color: formStatus.startsWith('Gagal') ? '#fca5a5' : '#bbf7d0', fontSize: '0.78rem', fontWeight: 600, border: formStatus.startsWith('Gagal') ? '1px solid #7f1d1d' : '1px solid #166534'
                }}>
                  {formStatus}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: '#6366f1', color: '#ffffff', fontSize: '0.88rem', fontWeight: 800,
                  border: 'none', borderRadius: '12px', padding: '14px', cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
                }}
              >
                {isSubmitting ? 'Memproses Database...' : 'Onboard Sekolah Baru 📤'}
              </button>
            </form>
          </div>

          {/* Right panel: Table Registry */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '24px',
            padding: '28px'
          }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 16px 0', color: '#ffffff' }}>📂 Registrasi Database Client</h3>

            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Memuat metrik sekolah...</div>
            ) : tenants.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Belum ada sekolah terdaftar.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {tenants.map((tenant) => (
                  <div key={tenant.id} style={{
                    backgroundColor: '#1e293b',
                    borderRadius: '16px',
                    padding: '16px',
                    border: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>{tenant.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#6366f1', display: 'inline-block', marginTop: '2px' }}>
                          Path URL: /{tenant.pathSegment}
                        </span>
                      </div>
                      
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '20px',
                        backgroundColor: tenant.status === 'ACTIVE' ? '#064e3b' : '#7f1d1d',
                        color: tenant.status === 'ACTIVE' ? '#34d399' : '#fca5a5'
                      }}>
                        {tenant.status}
                      </span>
                    </div>

                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
                      backgroundColor: '#0f172a', padding: '10px 14px', borderRadius: '12px', fontSize: '0.75rem', color: '#94a3b8'
                    }}>
                      <div>Paket: <strong style={{ color: '#ffffff' }}>{tenant.subscription?.plan || 'FREE'}</strong></div>
                      <div>Ukuran DB: <strong style={{ color: '#ffffff' }}>{((tenant.dbSizeKb || 0) / 1024).toFixed(2)} MB</strong></div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <button
                        onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                        style={{
                          fontSize: '0.72rem', fontWeight: 800, border: '1px solid rgba(255,255,255,0.1)',
                          backgroundColor: 'transparent', color: tenant.status === 'ACTIVE' ? '#f87171' : '#34d399',
                          borderRadius: '8px', padding: '6px 12px', cursor: 'pointer'
                        }}
                      >
                        {tenant.status === 'ACTIVE' ? 'Suspend ❌' : 'Aktifkan ✓'}
                      </button>
                      
                      <a
                        href={`/${tenant.pathSegment}/login`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '0.72rem', fontWeight: 800, backgroundColor: '#3b82f6', color: '#ffffff',
                          borderRadius: '8px', padding: '6px 12px', textDecoration: 'none', display: 'flex', alignItems: 'center'
                        }}
                      >
                        Buka Login Portal 🚪
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
