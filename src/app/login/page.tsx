'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isTenantAutoDetected, setIsTenantAutoDetected] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const segments = window.location.pathname.split('/').filter(Boolean);
      if (segments.length > 0 && segments[0] !== 'login' && segments[0] !== 'api' && segments[0] !== 'saas-admin') {
        setTenantId(segments[0]);
        setIsTenantAutoDetected(true);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          tenantId
        })
      });

      const json = await res.json();
      if (json.success) {
        // Simpan role & nama di localStorage untuk sesi dasbor
        localStorage.setItem('user_role', json.user.role);
        localStorage.setItem('user_name', json.user.nama);
        
        // Arahkan secara presisi dengan prefix tenant
        const targetRole = json.user.role === 'orang_tua' ? 'orang-tua' : json.user.role;
        if (tenantId) {
          router.push(`/${tenantId}/dashboard/${targetRole}`);
        } else {
          router.push(`/dashboard/${targetRole}`);
        }
      } else {
        setError(json.error || 'Autentikasi gagal.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'radial-gradient(circle at bottom left, hsl(var(--color-primary-light)) 0%, #0f172a 90%)',
      padding: 'var(--spacing-4)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div className="card-premium" style={{
        maxWidth: '450px',
        width: '100%',
        padding: '32px',
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 id="login-title" style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#818cf8',
            marginBottom: '6px'
          }}>
            Masuk EduFlow
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#94a3b8',
            margin: 0
          }}>
            Masukkan kredensial sekolah {tenantId ? <strong style={{ color: '#38bdf8' }}>{tenantId}</strong> : ''} Anda
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            marginBottom: '20px',
            lineHeight: '1.4'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} id="login-form">
          {/* Kode Sekolah (Tenant ID) Input */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="login-tenant" style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>
              Kode Sekolah (Tenant ID)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                id="login-tenant"
                className="form-control"
                placeholder="Contoh: sdn01menteng"
                required
                disabled={isTenantAutoDetected}
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value.trim().toLowerCase())}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: isTenantAutoDetected ? 'rgba(15, 23, 42, 0.8)' : 'rgba(15, 23, 42, 0.5)',
                  border: isTenantAutoDetected ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: isTenantAutoDetected ? '#10b981' : '#fff',
                  fontWeight: isTenantAutoDetected ? 700 : 400,
                  outline: 'none',
                  cursor: isTenantAutoDetected ? 'not-allowed' : 'text'
                }}
              />
              {isTenantAutoDetected && (
                <span style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#10b981',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  ✓ Terverifikasi
                </span>
              )}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="login-email" style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Email</label>
            <input
              type="email"
              id="login-email"
              className="form-control"
              placeholder="admin@sekolah.sch.id"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#fff',
                outline: 'none'
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="login-password" style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Kata Sandi</label>
            <input
              type="password"
              id="login-password"
              className="form-control"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                color: '#fff',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            id="btn-login-submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: '#fff',
              fontWeight: 600,
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background 0.2s',
              fontSize: '14px'
            }}
          >
            {loading ? 'Masuk...' : 'Masuk Portal'}
          </button>
        </form>

        <div style={{
          marginTop: '28px',
          background: 'rgba(15, 23, 42, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '12px',
          color: '#94a3b8',
          lineHeight: '1.5'
        }}>
          <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: '#818cf8' }}>🔑 Akun Pengujian Sekolah:</p>
          <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>Admin: <code style={{ color: '#fff' }}>admin@sekolah.sch.id</code> (Sandi: <code style={{ color: '#fff' }}>admin123</code>)</li>
            <li>Guru: <code style={{ color: '#fff' }}>guru@sekolah.sch.id</code> (Sandi: <code style={{ color: '#fff' }}>guru123</code>)</li>
            <li>Siswa: <code style={{ color: '#fff' }}>siswa@sekolah.sch.id</code> (Sandi: <code style={{ color: '#fff' }}>siswa123</code>)</li>
            <li>Orang Tua: <code style={{ color: '#fff' }}>ortu@sekolah.sch.id</code> (Sandi: <code style={{ color: '#fff' }}>ortu123</code>)</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
