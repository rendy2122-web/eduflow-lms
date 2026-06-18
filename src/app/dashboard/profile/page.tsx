'use client';

import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Camera,
  Calendar,
  ShieldAlert,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ProfilePage() {
  // Profile Data States
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [nisnOrNip, setNisnOrNip] = useState('');
  const [alamat, setAlamat] = useState('');
  const [telepon, setTelepon] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [rpgLevel, setRpgLevel] = useState(1);
  const [rpgXp, setRpgXp] = useState(0);
  const [rpgGold, setRpgGold] = useState(50);

  // Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Status States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'biodata' | 'sekolah' | 'keamanan'>('biodata');
  
  // 3D Parallax Tilt Card Ref & Style State
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password strength checker helper
  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, text: 'Belum Diisi', color: '#94a3b8' };
    let score = 0;
    if (newPassword.length >= 6) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 1) return { score, text: 'Lemah 🔴', color: '#ef4444' };
    if (score === 2) return { score, text: 'Sedang 🟡', color: '#f59e0b' };
    return { score, text: 'Kuat 🟢', color: '#10b981' };
  };

  // Mouse Move Parallax Tilt Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((centerY - y) / centerY) * 5; // max tilt 5 deg
    const rotateY = ((x - centerX) / centerX) * 5;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    });
  };

  // Fetch initial profile
  async function fetchProfileData() {
    try {
      setLoading(true);
      const res = await fetch('/api/profile');
      const json = await res.json();
      if (json.success) {
        setNama(json.user.nama);
        setEmail(json.user.email);
        setRole(json.user.role);
        setCreatedAt(new Date(json.user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
        setNisnOrNip(json.profile.nisn_or_nip);
        setAlamat(json.profile.alamat);
        setTelepon(json.profile.telepon);
        setAvatarUrl(json.profile.avatar_url || getFallbackAvatar(json.user.role));
        setRpgLevel(json.profile.rpg_level);
        setRpgXp(json.profile.rpg_xp);
        setRpgGold(json.profile.rpg_gold);
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfileData();
  }, []);

  const getFallbackAvatar = (roleStr: string) => {
    if (roleStr === 'admin') return 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150';
    if (roleStr === 'guru') return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150';
    if (roleStr === 'siswa') return 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150';
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
  };

  // Handle Photo upload click
  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Convert uploaded photo file to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran berkas foto tidak boleh melebihi 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save changes to API & update LocalStorage
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'keamanan') {
      if (newPassword) {
        if (!oldPassword) {
          alert('Mohon masukkan kata sandi lama Anda.');
          return;
        }
        if (newPassword !== confirmPassword) {
          alert('Konfirmasi kata sandi baru tidak cocok.');
          return;
        }
        if (newPassword.length < 6) {
          alert('Kata sandi baru minimal harus terdiri dari 6 karakter.');
          return;
        }
      }
    }

    try {
      setSaving(false);
      setSaving(true);
      const payload: any = {
        nama,
        alamat,
        telepon,
        avatarUrl
      };

      if (activeTab === 'keamanan' && newPassword) {
        payload.oldPassword = oldPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (json.success) {
        // Sync local storage so header and sidebar reflect the modifications immediately
        localStorage.setItem('user_name', nama);
        localStorage.setItem('user_avatar', avatarUrl);
        
        // Dispatch storage event to trigger listener in DashboardLayout if active
        window.dispatchEvent(new Event('storage'));

        alert('Profil Anda berhasil diperbarui!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        await fetchProfileData();
      } else {
        alert('Gagal memperbarui profil: ' + json.error);
      }
    } catch (err) {
      console.error('Error saving profile changes:', err);
      alert('Gagal memperbarui karena masalah koneksi.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeColor = (roleStr: string) => {
    if (roleStr === 'admin') return { bg: 'rgba(34, 197, 94, 0.08)', color: '#22c55e', label: 'Super Admin' };
    if (roleStr === 'guru') return { bg: 'rgba(13, 148, 136, 0.08)', color: '#0d9488', label: 'Tenaga Pendidik' };
    if (roleStr === 'siswa') return { bg: 'rgba(168, 85, 247, 0.08)', color: '#a855f7', label: 'Siswa Aktif' };
    return { bg: 'rgba(249, 115, 22, 0.08)', color: '#f97316', label: 'Wali Siswa' };
  };

  const badge = getRoleBadgeColor(role);

  return (
    <DashboardLayout
      activeMenu=""
      pageTitle="Detail Profil Akun"
      pageSubtitle="Kelola data pribadi, perbarui foto profil, dan pantau identitas sekolah Anda"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes rotateGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .avatar-halo-ring {
          background: linear-gradient(45deg, #6366f1, #10b981, #f59e0b, #6366f1);
          background-size: 400% 400%;
          animation: rotateGradient 6s linear infinite;
        }
        .profile-card-3d {
          transform-style: preserve-3d;
          transition: transform 0.1s ease, box-shadow 0.2s ease;
        }
        .profile-tab-btn {
          transition: all 0.2s;
        }
        .profile-tab-btn.active {
          background-color: #6366f1 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }
      ` }} />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
          
          {/* Column 1: 3D Profile Summary Card */}
          <div 
            ref={cardRef}
            className="profile-card-3d"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              ...tiltStyle,
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(226, 232, 240, 0.7)',
              borderRadius: '24px',
              padding: '36px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top decorative glow */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)' }} />

            {/* Avatar Uploader with Neon Halo Ring */}
            <div 
              style={{ position: 'relative', cursor: 'pointer', marginBottom: '20px' }}
              onClick={handlePhotoUploadClick}
              title="Klik untuk mengubah foto profil"
            >
              {/* Outer Neon rotating circle */}
              <div 
                className="avatar-halo-ring"
                style={{
                  width: '108px',
                  height: '108px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
              >
                {/* Inner White core for avatar masking */}
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '3px solid #ffffff', backgroundColor: '#f1f5f9', position: 'relative' }}>
                  <img 
                    src={avatarUrl} 
                    alt={nama} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  {/* Camera overlay hover effect */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(15,23,42,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    color: '#ffffff'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                  >
                    <Camera className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Hidden File Input */}
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {/* Name & Role Identity */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: 850, color: '#0f172a', margin: '0 0 6px 0', textAlign: 'center' }}>{nama}</h3>
            <span style={{ 
              fontSize: '0.7rem', 
              padding: '4px 12px', 
              borderRadius: '100px', 
              fontWeight: 800, 
              backgroundColor: badge.bg, 
              color: badge.color,
              border: `1px solid ${badge.color}1e`,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '20px'
            }}>
              {badge.label}
            </span>

            {/* RPG Gamification badge if Student */}
            {role === 'siswa' && (
              <div style={{ width: '100%', backgroundColor: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.1)', borderRadius: '16px', padding: '14px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Tingkat Level RPG</span>
                  <span style={{ fontSize: '0.78rem', color: '#6366f1', fontWeight: 800 }}>Lvl {rpgLevel}</span>
                </div>
                {/* Exp bar */}
                <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, rpgXp)}%`, height: '100%', backgroundColor: '#6366f1', borderRadius: '4px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#94a3b8', fontWeight: 600 }}>
                  <span>{rpgXp}/100 XP</span>
                  <span style={{ color: '#eab308', fontWeight: 700 }}>🪙 {rpgGold} Koin Emas</span>
                </div>
              </div>
            )}

            {/* Metadata attributes list */}
            <div style={{ width: '100%', borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.78rem', color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Surel Resmi:</span>
                <span style={{ color: '#1e293b', fontWeight: 700 }}>{email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Bergabung Sejak:</span>
                <span style={{ color: '#1e293b', fontWeight: 700 }}>{createdAt}</span>
              </div>
            </div>

          </div>

          {/* Column 2: Details / Form Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Tab switchers bar */}
            <div style={{ display: 'flex', gap: '10px', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '12px', alignSelf: 'flex-start' }}>
              {[
                { id: 'biodata', label: '👤 Biodata Diri' },
                { id: 'sekolah', label: '🏫 Informasi Sekolah' },
                { id: 'keamanan', label: '🔒 Keamanan Akun' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`profile-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#475569',
                    backgroundColor: 'transparent'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Main Profile Form Card */}
            <form 
              onSubmit={handleSaveProfile}
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(226, 232, 240, 0.7)',
                borderRadius: '24px',
                padding: '36px',
                boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}
            >
              {activeTab === 'biodata' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', margin: 0 }}>
                    Kelola Informasi Biodata Personal
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Nama Lengkap:</label>
                      <input 
                        type="text"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', border: '1px solid #cbd5e1', color: '#1e293b', outline: 'none' }}
                        required
                      />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Nomor Telepon / HP:</label>
                      <input 
                        type="text"
                        value={telepon}
                        onChange={(e) => setTelepon(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', border: '1px solid #cbd5e1', color: '#1e293b', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Alamat Tinggal Lengkap:</label>
                    <textarea 
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      placeholder="Masukkan alamat tinggal Anda saat ini..."
                      style={{ padding: '12px 14px', borderRadius: '10px', fontSize: '0.85rem', border: '1px solid #cbd5e1', color: '#1e293b', outline: 'none', height: '80px', resize: 'none', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'sekolah' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', margin: 0 }}>
                    Informasi & Atribut Sekolah Terdaftar
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Nomor Induk Siswa/Pendidik (NISN/NIP):</span>
                      <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                        {nisnOrNip || '-'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Peran Sistem Aktif (Role):</span>
                      <div style={{ padding: '10px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'capitalize' }}>
                        {role}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Status Keanggotaan Multi-Tenant:</span>
                    <p style={{ fontSize: '0.78rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                      Akun Anda terdaftar sebagai bagian dari tenant lembaga pendidikan sekolah ini. Segala aktivitas pengajaran, absensi, dan data akademik diisolasi secara transaksional dalam basis data sekolah penyewa.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'keamanan' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', margin: 0 }}>
                    Manajemen Kata Sandi & Keamanan Akun
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Kata Sandi Lama:</label>
                    <input 
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Ketik kata sandi Anda saat ini..."
                      style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', border: '1px solid #cbd5e1', color: '#1e293b', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Kata Sandi Baru:</label>
                      <input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter..."
                        style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', border: '1px solid #cbd5e1', color: '#1e293b', outline: 'none' }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>Konfirmasi Kata Sandi Baru:</label>
                      <input 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi baru..."
                        style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', border: '1px solid #cbd5e1', color: '#1e293b', outline: 'none' }}
                      />
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 600 }}>
                        <span style={{ color: '#64748b' }}>Kekuatan Kata Sandi:</span>
                        <span style={{ color: getPasswordStrength().color }}>{getPasswordStrength().text}</span>
                      </div>
                      <div style={{ width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${(getPasswordStrength().score / 4) * 100}%`, 
                          height: '100%', 
                          backgroundColor: getPasswordStrength().color, 
                          borderRadius: '2px',
                          transition: 'all 0.3s'
                        }}></div>
                      </div>
                      <span style={{ fontSize: '0.62rem', color: '#94a3b8', lineHeight: '1.4' }}>
                        Gunakan kombinasi huruf besar, angka, dan karakter simbol khusus untuk keamanan tingkat lanjut.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    backgroundColor: '#6366f1',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.backgroundColor = '#4f46e5'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                  onMouseLeave={(e) => { if (!saving) { e.currentTarget.style.backgroundColor = '#6366f1'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </div>

            </form>
          </div>

        </div>
      )}
    </DashboardLayout>
  );
}
