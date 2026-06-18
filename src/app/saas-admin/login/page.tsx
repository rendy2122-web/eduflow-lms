'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SaasAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/saas/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const json = await res.json();
      if (json.success) {
        router.push('/saas-admin');
      } else {
        setError(json.error || 'Email atau Kata Sandi salah.');
      }
    } catch (err: any) {
      console.error('SaaS login error:', err);
      setError('Terjadi kesalahan saat masuk. Silakan coba lagi.');
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
      background: 'radial-gradient(circle at bottom left, #1e1b4b 0%, #030712 80%)',
      padding: 'var(--spacing-4)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Decorative blurred mesh spheres */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'rgba(99, 102, 241, 0.15)',
        filter: 'blur(80px)',
        borderRadius: '50%',
        top: '15%',
        left: '20%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        background: 'rgba(236, 72, 153, 0.1)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        bottom: '15%',
        right: '15%',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div className="card-premium" style={{
        maxWidth: '450px',
        width: '100%',
        padding: 'var(--spacing-8)',
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        zIndex: 1,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        {/* SaaS Logo / Branding */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            borderRadius: '12px',
            marginBottom: '12px',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#fff',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
          }}>
            EF
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            background: 'linear-gradient(to right, #fff, #a1a1aa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            EduFlow Owner Portal
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#71717a',
            marginTop: '4px'
          }}>
            Masuk untuk memantau semua penyewa & analitik platform
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
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

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#a1a1aa',
              marginBottom: '6px'
            }}>
              Email Admin
            </label>
            <input
              type="email"
              required
              placeholder="admin@eduflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s, background-color 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#a1a1aa',
              marginBottom: '6px'
            }}>
              Kata Sandi
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s, background-color 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: '#fff',
              fontWeight: 600,
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'transform 0.2s, box-shadow 0.2s',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)';
            }}
          >
            {loading ? 'Menghubungkan...' : 'Masuk Dashboard'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          padding: '12px',
          fontSize: '12px',
          color: '#a1a1aa'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#818cf8' }}>🔑 Akun Demo SaaS Owner:</p>
          <p style={{ margin: '0 0 2px 0' }}>Email: <code style={{ color: '#fff' }}>admin@eduflow.com</code></p>
          <p style={{ margin: 0 }}>Sandi: <code style={{ color: '#fff' }}>adminpassword</code></p>
        </div>
      </div>
    </main>
  );
}
