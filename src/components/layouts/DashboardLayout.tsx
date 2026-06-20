'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeMenu: string;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function DashboardLayout({ children, activeMenu, pageTitle, pageSubtitle }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState('Sarah');
  const [userRole, setUserRole] = useState('admin');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState(2);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  } | null>(null);

  // Dropdown & Notification states
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  const getHelpContent = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          { step: '1', title: 'Impor Data Massal', desc: 'Buka menu "Students" -> klik "Impor Massal (CSV)" -> unggah data kelas, murid, & ortu secara instan.' },
          { step: '2', title: 'Manajemen Keuangan', desc: 'Buka menu "Finances" -> catat pemasukan/pengeluaran -> ekspor pembukuan kas ke Excel.' },
          { step: '3', title: 'Manajemen Staf', desc: 'Buka menu "Staff Attendance" -> pantau jam kehadiran guru harian.' }
        ];
      case 'guru':
        return [
          { step: '1', title: 'Presensi Harian', desc: 'Buka menu "Attendance" -> pilih kelas -> klik status murid harian (Hadir/Sakit/Izin) -> tersimpan otomatis.' },
          { step: '2', title: 'Buku Penghubung', desc: 'Buka menu "Students" -> klik "Buku Penghubung" di samping profil murid untuk chat wali kelas secara langsung.' },
          { step: '3', title: 'Digital Rapor', desc: 'Buka menu "Rapor Digital" -> pilih siswa -> input Catatan Wali Kelas -> klik "Cetak Rapor PDF" untuk wali murid.' }
        ];
      case 'siswa':
        return [
          { step: '1', title: 'Kelas Online', desc: 'Lihat jadwal kelas video hari ini -> klik tombol ungu "Gabung Pertemuan" untuk masuk Google Meet/Zoom.' },
          { step: '2', title: 'Habit Tracker', desc: 'Gulir ke bagian "Habit Tracker" -> centang shalat berjamaah & amalan harian Anda.' },
          { step: '3', title: 'Hasil Belajar', desc: 'Buka menu "Rapor Hasil Belajar" -> lihat perkembangan nilai & unduh rapor secara mandiri.' }
        ];
      default: // orang tua
        return [
          { step: '1', title: 'Dropdown Kakak-Adik', desc: 'Gunakan dropdown "Pilih Nama Anak" di bagian atas dasbor untuk memantau data anak yang berbeda secara instan.' },
          { step: '2', title: 'Co-Teacher Console', desc: 'Klik tab "Co-Teacher" -> laporkan aktivitas anak dari rumah & berikan skor Adab harian.' },
          { step: '3', title: 'Konsultasi Guru', desc: 'Buka menu "Buku Penghubung" -> kirim pesan langsung ke Wali Kelas Sarah Jenkins.' }
        ];
    }
  };

  const getNotificationsList = (role: string) => {
    if (role === 'guru') {
      return [
        { id: 1, text: 'Ibu Fatimah mengirim pesan Buku Penghubung baru', time: '2 jam lalu', type: 'message' },
        { id: 2, text: 'Pak Andi mengonfirmasi kehadiran Bilal', time: '15 menit lalu', type: 'attendance' },
        { id: 3, text: 'Siswa Ahmad Luthfi mengumpulkan Tugas Aljabar', time: '1 hari lalu', type: 'assignment' }
      ];
    }
    if (role === 'siswa') {
      return [
        { id: 1, text: 'Tugas Aljabar baru diunggah oleh Ustadzah Sarah', time: '3 jam lalu', type: 'assignment' },
        { id: 2, text: 'Kuis Agama Islam baru telah aktif', time: '1 hari lalu', type: 'exam' },
        { id: 3, text: 'Selamat! Level RPG Anda meningkat ke Level 2', time: '2 hari lalu', type: 'rpg' }
      ];
    }
    return [
      { id: 1, text: 'Ustadzah Sarah membalas pesan Buku Penghubung', time: '1 jam lalu', type: 'message' },
      { id: 2, text: 'Ustadzah Sarah memberikan catatan akademik untuk Bilal', time: 'Baru saja', type: 'note' },
      { id: 3, text: 'Bilal terdeteksi belum mengumpulkan Tugas Aljabar', time: '5 jam lalu', type: 'assignment' }
    ];
  };

  useEffect(() => {
    const handleOutsideClick = () => {
      setShowNotifications(false);
      setShowProfileDropdown(false);
    };
    if (showNotifications || showProfileDropdown) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [showNotifications, showProfileDropdown]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.alert = (message: string) => {
        const lower = message.toLowerCase();
        let type: 'success' | 'error' | 'info' = 'info';
        if (
          lower.includes('berhasil') ||
          lower.includes('sukses') ||
          lower.includes('🎉') ||
          lower.includes('👍') ||
          lower.includes('selesai') ||
          lower.includes('mengunduh') ||
          lower.includes('membuka') ||
          lower.includes('dikirim')
        ) {
          type = 'success';
        } else if (
          lower.includes('gagal') ||
          lower.includes('error') ||
          lower.includes('salah') ||
          lower.includes('wajib') ||
          lower.includes('tidak') ||
          lower.includes('minimal')
        ) {
          type = 'error';
        }
        setToast({ message, type, visible: true });
      };
    }
  }, []);

  useEffect(() => {
    if (toast && toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => prev ? { ...prev, visible: false } : null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Helper functions for SaaS Tenant Path Routing
  const getTenantId = (path: string | null): string => {
    if (!path) return '';
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 0 && segments[0] !== 'dashboard' && segments[0] !== 'login' && segments[0] !== 'api' && segments[0] !== 'saas-admin') {
      return segments[0];
    }
    return '';
  };

  const getCleanPathname = (path: string | null): string => {
    if (!path) return '';
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 0 && segments[0] !== 'dashboard' && segments[0] !== 'login' && segments[0] !== 'api' && segments[0] !== 'saas-admin') {
      return '/' + segments.slice(1).join('/');
    }
    return path;
  };

  const tenantId = getTenantId(pathname);
  const cleanPath = getCleanPathname(pathname);

  const getTenantPath = (path: string): string => {
    if (tenantId && path.startsWith('/dashboard')) {
      return `/${tenantId}${path}`;
    }
    return path;
  };

  useEffect(() => {
    if (pathname === null) return;

    // Check cookie session validity
    async function verifySession() {
      try {
        const res = await fetch('/api/auth/session');
        const json = await res.json();
        if (!json.success) {
          localStorage.clear();
          window.location.href = tenantId ? `/${tenantId}/login` : '/login';
          return;
        }
      } catch (err) {
        console.error('Session verification error:', err);
      }
    }
    verifySession();

    const role = localStorage.getItem('user_role') || 'admin';
    const name = localStorage.getItem('user_name') || 'Sarah';
    setUserRole(role);
    setUserName(name);

    // Proteksi Rute: Periksa kecocokan rute aktif dengan role pengguna (menggunakan cleanPath)
    let authorized = true;
    if (cleanPath === '/dashboard/profile') {
      authorized = true;
    } else if (role === 'admin') {
      authorized = true;
    } else if (role === 'guru') {
      if (!cleanPath.startsWith('/dashboard/guru')) {
        authorized = false;
      }
    } else if (role === 'siswa') {
      if (!cleanPath.startsWith('/dashboard/siswa')) {
        authorized = false;
      }
    } else if (role === 'orang_tua' || role === 'orang-tua') {
      if (!cleanPath.startsWith('/dashboard/orang-tua')) {
        authorized = false;
      }
    } else {
      authorized = false;
    }

    setIsAuthorized(authorized);

    if (!authorized) {
      // Lakukan auto-redirect dalam 2 detik ke dasbor penyewa yang sesuai
      const targetDashboard = tenantId
        ? `/${tenantId}/dashboard/${role === 'orang_tua' ? 'orang-tua' : role}`
        : `/dashboard/${role === 'orang_tua' ? 'orang-tua' : role}`;
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            router.replace(targetDashboard);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [pathname, cleanPath, router, tenantId]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Failed to log out cleanly on server:', err);
    }
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    if (tenantId) {
      router.push(`/${tenantId}/login`);
    } else {
      router.push('/login');
    }
  };

  const isAdmin = userRole === 'admin';

  // Helper to map avatars dynamically for all 4 roles
  const getAvatarUrl = (role: string) => {
    if (role === 'admin') return 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'; // Sarah Admin
    if (role === 'guru') return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'; // Sarah Johnson (Guru)
    if (role === 'siswa') return 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'; // Bilal (Siswa)
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'; // Wali Pak Andi (Parent)
  };

  const getProfileTitle = (role: string, name: string) => {
    if (role === 'admin') return name || 'Sarah Jenkins';
    if (role === 'guru') return name || 'Ms. Sarah Jenkins';
    if (role === 'siswa') return name || 'Bilal Al-Mansoori';
    return name || 'Pak Andi';
  };

  const getProfileSubtitle = (role: string) => {
    if (role === 'admin') return 'Super Administrator';
    if (role === 'guru') return 'Grade 4 Teacher';
    if (role === 'siswa') return 'Siswa Kelas 4A';
    return 'Wali Bilal & Aisha';
  };

  // Menu items for Admin
  const adminMenuItems = [
    { type: 'header', label: 'Admin Console' },
    { 
      id: 'dashboard', 
      label: 'Dashboard Admin', 
      path: '/dashboard/admin',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    },
    { 
      id: 'finance', 
      label: 'Finances', 
      path: '/dashboard/admin/finance',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      )
    },
    { 
      id: 'users', 
      label: 'Users', 
      path: '/dashboard/admin/users',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    { 
      id: 'classes', 
      label: 'Classes', 
      path: '/dashboard/admin/classes',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M21 9H3M21 15H3M12 3v18" />
        </svg>
      )
    },
    { 
      id: 'bulk-upload', 
      label: 'Bulk Upload', 
      path: '/dashboard/admin/bulk-upload',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      )
    },
    { 
      id: 'students', 
      label: 'Students', 
      path: '/dashboard/admin/students',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
      )
    },
    { 
      id: 'staff-attendance', 
      label: 'Staff Attendance', 
      path: '/dashboard/admin/staff-attendance',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },

    { type: 'header', label: 'Guru Portal' },
    {
      id: 'guru-dashboard',
      label: 'Dashboard Guru',
      path: '/dashboard/guru',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    },
    {
      id: 'guru-classes',
      label: 'Classes',
      path: '/dashboard/guru/classes',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M21 9H3M21 15H3M12 3v18" />
        </svg>
      )
    },
    {
      id: 'guru-attendance',
      label: 'Attendance',
      path: '/dashboard/guru/attendance',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    {
      id: 'guru-staff-attendance',
      label: 'Self Attendance',
      path: '/dashboard/guru/staff-attendance',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
    {
      id: 'guru-announcements',
      label: 'Announcements',
      path: '/dashboard/guru/announcements',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      )
    },
    {
      id: 'guru-tahfidz',
      label: 'Quran Tahfidz',
      path: '/dashboard/guru/tahfidz',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      )
    },
    { 
      id: 'mutabah', 
      label: 'Habit Tracker', 
      path: '/dashboard/guru/mutabah',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      )
    },

    { type: 'header', label: 'Siswa & Wali Portal' },
    {
      id: 'siswa-dashboard',
      label: 'Portal Siswa',
      path: '/dashboard/siswa',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    },
    {
      id: 'ortu-dashboard',
      label: 'Portal Orang Tua',
      path: '/dashboard/orang-tua',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    }
  ];

  // Menu items for Guru
  const guruMenuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      path: '/dashboard/guru',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    },
    { 
      id: 'online-class',
      label: 'Kelas Online',
      path: '/dashboard/guru/online-class',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 7a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7z" />
          <polygon points="23 7 16 12 23 17 23 7" />
        </svg>
      )
    },
    { 
      id: 'classes', 
      label: 'Classes', 
      path: '/dashboard/guru/classes',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M21 9H3M21 15H3M12 3v18" />
        </svg>
      )
    },
    { 
      id: 'students', 
      label: 'Students', 
      path: '/dashboard/guru/students',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        </svg>
      )
    },
    { 
      id: 'attendance', 
      label: 'Attendance', 
      path: '/dashboard/guru/attendance',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    { 
      id: 'staff-attendance', 
      label: 'Staff Attendance', 
      path: '/dashboard/guru/staff-attendance',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      )
    },
    { 
      id: 'lms', 
      label: 'LMS', 
      path: '/dashboard/guru/lms',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      )
    },
    { 
      id: 'announcements', 
      label: 'Announcements', 
      path: '/dashboard/guru/announcements',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      )
    },
    { 
      id: 'tahfidz', 
      label: 'Quran Tahfidz', 
      path: '/dashboard/guru/tahfidz',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      )
    },
    { 
      id: 'pesan', 
      label: 'Buku Penghubung', 
      path: '/dashboard/guru/pesan',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    },
    { 
      id: 'guru-exams', 
      label: 'Ujian & Kuis', 
      path: '/dashboard/guru/exams',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="15" x2="15" y2="15" />
          <line x1="9" y1="11" x2="15" y2="11" />
          <line x1="9" y1="7" x2="10" y2="7" />
        </svg>
      )
    },
    { 
      id: 'mutabah', 
      label: 'Habit Tracker', 
      path: '/dashboard/guru/mutabah',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      )
    },
    { 
      id: 'grades', 
      label: 'Gradebook', 
      path: '/dashboard/guru/grades',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="9" y1="7" x2="16" y2="7" />
          <line x1="9" y1="11" x2="14" y2="11" />
        </svg>
      )
    },
    { 
      id: 'teaching-schedule', 
      label: 'Jadwal Mengajar', 
      path: '/dashboard/guru/teaching-schedule',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
        </svg>
      )
    },
    { 
      id: 'rapor', 
      label: 'Rapor Digital', 
      path: '/dashboard/guru/rapor',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    }
  ];

  // Menu items for Siswa
  const siswaMenuItems = [
    { 
      id: 'dashboard', 
      label: 'Dasbor Siswa', 
      path: '/dashboard/siswa',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    },
    {
      id: 'online-class',
      label: 'Kelas Online',
      path: '/dashboard/siswa/online-class',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 7a2 2 0 0 0-2-2H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7z" />
          <polygon points="23 7 16 12 23 17 23 7" />
        </svg>
      )
    },
    { 
      id: 'tahfidz', 
      label: 'Quran Tahfidz', 
      path: '/dashboard/siswa/tahfidz',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      )
    },
    { 
      id: 'pesan', 
      label: 'Konsultasi Guru', 
      path: '/dashboard/siswa/pesan',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    },
    { 
      id: 'Rapor Digital', 
      label: 'Rapor Hasil Belajar', 
      path: '/dashboard/siswa/rapor',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    }
  ];

  // Menu items for Orang Tua
  const ortuMenuItems = [
    { 
      id: 'dashboard', 
      label: 'Portal Orang Tua', 
      path: '/dashboard/orang-tua',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    },
    { 
      id: 'tahfidz', 
      label: 'Quran Tahfidz', 
      path: '/dashboard/orang-tua/tahfidz',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      )
    },
    { 
      id: 'pesan', 
      label: 'Buku Penghubung', 
      path: '/dashboard/orang-tua/pesan',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    },
    { 
      id: 'Rapor Digital', 
      label: 'Rapor Hasil Belajar', 
      path: '/dashboard/orang-tua/rapor',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      )
    }
  ];

  // Map active menus
  let menuItems = adminMenuItems;
  if (userRole === 'guru') {
    menuItems = guruMenuItems;
  } else if (userRole === 'siswa') {
    menuItems = siswaMenuItems;
  } else if (userRole === 'orang_tua' || userRole === 'orang-tua') {
    menuItems = ortuMenuItems;
  }

  // Synchronize avatar and username from localStorage or fallback
  useEffect(() => {
    const savedAvatar = localStorage.getItem('user_avatar');
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    } else {
      setAvatarUrl(getAvatarUrl(userRole));
    }

    const handleStorageChange = () => {
      const updatedAvatar = localStorage.getItem('user_avatar');
      if (updatedAvatar) {
        setAvatarUrl(updatedAvatar);
      }
      const updatedName = localStorage.getItem('user_name');
      if (updatedName) {
        setUserName(updatedName);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userRole]);

  if (isAuthorized === null) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #e2e8f0', borderTopColor: '#4f46e5', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Memuat halaman...</p>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  if (isAuthorized === false) {
    const targetDashboard = tenantId 
      ? `/${tenantId}/dashboard/${userRole === 'orang_tua' ? 'orang-tua' : userRole}`
      : `/dashboard/${userRole === 'orang_tua' ? 'orang-tua' : userRole}`;
    
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
        <div className="card-premium" style={{ maxWidth: '440px', width: '100%', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.15)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '36px', height: '36px' }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Akses Ditolak</h1>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5', margin: 0 }}>
              Peran Anda (<strong>{getProfileSubtitle(userRole)}</strong>) tidak memiliki izin untuk mengakses halaman ini.
            </p>
          </div>

          <div style={{ width: '100%', height: '4px', backgroundColor: '#f1f5f9', borderRadius: '99px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', backgroundColor: '#ef4444', width: '100%', animation: 'shrink 2s linear forwards' }} />
          </div>

          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            Mengarahkan ke dasbor Anda secara otomatis dalam <strong>{countdown} detik</strong>...
          </p>

          <Link href={targetDashboard} className="btn-primary" style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none', color: '#ffffff', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px -4px rgba(239, 68, 68, 0.3)', textDecoration: 'none' }}>
            Kembali ke Dasbor Saya
          </Link>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Background mesh glows */}
      <div className="dashboard-bg-glow-1" />
      <div className="dashboard-bg-glow-2" />
      
      {/* Sidebar Backdrop Overlay */}
      <div 
        className={`sidebar-backdrop ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar Layout */}
      <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isAdmin ? (
              // Admin Graduation Cap Green Logo
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '26px', height: '26px' }}>
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
              </svg>
            ) : (
              // Guru Teal Swirl Logo
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '26px', height: '26px' }}>
                <path d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10H12V2z" />
                <path d="M12 2a10 10 0 0 1 10 10H12V2z" />
              </svg>
            )}
            <span style={{ 
              fontSize: '1.35rem', 
              fontWeight: 800, 
              color: '#0f172a',
              letterSpacing: '-0.03em'
            }}>
              EduFlow
            </span>
          </div>

          {/* Close Button on Mobile Drawer */}
          <button 
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              cursor: 'pointer',
              border: '1px solid #e2e8f0'
            }}
          >
            ✕
          </button>
        </div>

        {/* Profile Card (always shown for all roles) */}
        <div className="sidebar-profile-card" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 14px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          marginBottom: '28px'
        }}>
          <img 
            src={avatarUrl} 
            alt={getProfileTitle(userRole, userName)} 
            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} 
          />
          <div style={{ minWidth: 0 }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {getProfileTitle(userRole, userName)}
            </h4>
            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>
              {getProfileSubtitle(userRole)}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', paddingRight: '4px' }}>
          {menuItems.map((item: any, idx) => {
            if (item.type === 'header') {
              return (
                <div key={`header-${idx}`} style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '14px', marginBottom: '4px', paddingLeft: '12px' }}>
                  {item.label}
                </div>
              );
            }

            const isMenuLinkActive = cleanPath === item.path || activeMenu === item.id;
            
            return (
              <Link
                key={item.id}
                href={getTenantPath(item.path) || '#'}
                id={`menu-${userRole}-${item.id}`}
                className={`sidebar-link ${isMenuLinkActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Logout Button */}
        <div style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <button
            onClick={handleLogout}
            id="btn-logout"
            className="btn-secondary"
            style={{ 
              width: '100%', 
              fontSize: '0.825rem', 
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              fontWeight: 600,
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            Keluar Sesi
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Header Bar */}
        <header className="no-print dashboard-header">
          {/* Header Left Title */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Hamburger Button (Mobile Only) */}
            <button 
              className="menu-toggle-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Toggle Sidebar Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                {pageTitle || `Selamat Datang, ${userName}!`}
              </h2>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, marginTop: '2px' }}>
                {pageSubtitle || `Dasbor EduFlow - ${getProfileSubtitle(userRole)}`}
              </p>
            </div>
          </div>

          {/* Header Right Widgets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Search Pill */}
            <div className="search-container" style={{ position: 'relative', width: '220px' }}>
              <input 
                type="text" 
                placeholder="Search" 
                style={{
                  width: '100%',
                  padding: '8px 16px 8px 36px',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  outline: 'none',
                  color: '#0f172a'
                }}
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#64748b" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ position: 'absolute', left: '12px', top: '10px', width: '14px', height: '14px' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Notification Bell */}
            <div 
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
                setShowProfileDropdown(false);
                setUnreadNotifications(0);
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#64748b" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ width: '20px', height: '20px', display: 'block' }}
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {/* Red Notification Badge */}
              {unreadNotifications > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff'
                }}>
                  {unreadNotifications}
                </span>
              )}

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '35px',
                  right: '-10px',
                  width: '320px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  zIndex: 99999,
                  padding: '16px',
                  cursor: 'default'
                }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Notifikasi Terbaru</h4>
                    <span style={{ fontSize: '0.65rem', color: '#4f46e5', cursor: 'pointer', fontWeight: 700 }} onClick={() => setShowNotifications(false)}>Tutup</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {getNotificationsList(userRole).map((n) => (
                      <div key={n.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '8px 10px', borderRadius: '8px', backgroundColor: '#f8fafc', borderLeft: '3px solid #4f46e5', transition: 'background-color 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                        <span style={{ fontSize: '0.76rem', color: '#334155', fontWeight: 500, lineHeight: '1.4' }}>{n.text}</span>
                        <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 600 }}>{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar block */}
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', position: 'relative' }}
              onClick={(e) => {
                e.stopPropagation();
                setShowProfileDropdown(!showProfileDropdown);
                setShowNotifications(false);
              }}
            >
              <img 
                src={avatarUrl} 
                alt={userName} 
                style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} 
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                Profile
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '10px', height: '10px' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>

              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '45px',
                  right: 0,
                  width: '240px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  zIndex: 99999,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  cursor: 'default'
                }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                    <img src={avatarUrl} alt={userName} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>{userName}</span>
                      <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'capitalize' }}>{getProfileSubtitle(userRole)}</span>
                    </div>
                  </div>
                  {tenantId && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Sekolah (Tenant ID)</span>
                      <span style={{ fontSize: '0.74rem', color: '#334155', fontWeight: 700 }}>{tenantId}</span>
                    </div>
                  )}

                  <Link
                    href={getTenantPath('/dashboard/profile')}
                    onClick={() => setShowProfileDropdown(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      backgroundColor: '#f5f3ff',
                      border: '1px solid #ddd6fe',
                      color: '#7c3aed',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ddd6fe'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f3ff'}
                  >
                    👤 Lihat & Edit Profil
                  </Link>

                  <button 
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '8px 0',
                      borderRadius: '8px',
                      backgroundColor: '#fef2f2',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fee2e2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    Keluar Aplikasi
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="dashboard-main">
          {children}
        </main>
      </div>

      {/* Toast Notification Container */}
      {toast && toast.visible && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: toast.type === 'success' 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
            : toast.type === 'error' 
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
              : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: '#ffffff',
          padding: '16px 24px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '380px',
          animation: 'slideIn 0.3s ease forwards',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <style>{`
            @keyframes slideIn {
              from { transform: translateY(100px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
          <span style={{ fontSize: '1.2rem' }}>
            {toast.type === 'success' ? '🎉' : toast.type === 'error' ? '⚠️' : 'ℹ️'}
          </span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.4 }}>
              {toast.message}
            </p>
          </div>
          <button 
            onClick={() => setToast(prev => prev ? { ...prev, visible: false } : null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '1rem',
              cursor: 'pointer',
              opacity: 0.8,
              padding: '0 4px',
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>
      )}
      {/* Floating Help Widget */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999 }}>
        {/* Toggle Button */}
        <button
          onClick={() => setShowHelp(!showHelp)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '9999px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)',
            transition: 'all 0.2s'
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>💡</span>
          <span>Panduan Fitur</span>
        </button>

        {/* Popover Panel */}
        {showHelp && (
          <div style={{
            position: 'absolute',
            bottom: '60px',
            right: 0,
            width: '320px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.15)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            animation: 'slideUpHelp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Panduan Dasbor {userRole === 'orang_tua' ? 'Orang Tua' : userRole.toUpperCase()}
              </h4>
              <button onClick={() => setShowHelp(false)} style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, cursor: 'pointer' }}>Tutup</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              {getHelpContent(userRole).map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#e0e7ff',
                    color: '#4f46e5',
                    fontSize: '0.74rem',
                    fontWeight: 800
                  }}>
                    {h.step}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>{h.title}</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>{h.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .mobile-close-btn {
            display: flex !important;
          }
        }
        @keyframes slideUpHelp {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
}
