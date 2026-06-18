'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

// ============================================================================
// TYPES
// ============================================================================
interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string; // 'akademik' | 'kegiatan' | 'informasi' | 'urgen'
  target: string;   // 'semua' | 'guru' | 'siswa' | 'orang_tua'
  author_name: string;
  author_role: string;
  created_at: string;
}

// ============================================================================
// CATEGORY & TARGET CONFIGS
// ============================================================================
const CATEGORY_CONFIG: Record<string, { label: string; icon: string; color: string; bgColor: string; borderColor: string; glowColor: string }> = {
  urgen: {
    label: 'Urgen / Penting',
    icon: '🚨',
    color: '#dc2626',
    bgColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    glowColor: 'rgba(239, 68, 68, 0.15)',
  },
  akademik: {
    label: 'Akademik',
    icon: '📘',
    color: '#2563eb',
    bgColor: 'rgba(37, 99, 235, 0.06)',
    borderColor: 'rgba(37, 99, 235, 0.2)',
    glowColor: 'rgba(37, 99, 235, 0.1)',
  },
  kegiatan: {
    label: 'Kegiatan',
    icon: '🏆',
    color: '#d97706',
    bgColor: 'rgba(217, 119, 6, 0.06)',
    borderColor: 'rgba(217, 119, 6, 0.2)',
    glowColor: 'rgba(217, 119, 6, 0.1)',
  },
  informasi: {
    label: 'Informasi Umum',
    icon: '📢',
    color: '#059669',
    bgColor: 'rgba(5, 150, 105, 0.06)',
    borderColor: 'rgba(5, 150, 105, 0.2)',
    glowColor: 'rgba(5, 150, 105, 0.1)',
  },
};

const TARGET_OPTIONS = [
  { value: 'semua', label: 'Semua' },
  { value: 'guru', label: 'Guru' },
  { value: 'siswa', label: 'Siswa' },
  { value: 'orang_tua', label: 'Orang Tua' },
];

const TARGET_LABELS: Record<string, string> = {
  semua: 'Semua',
  guru: 'Guru',
  siswa: 'Siswa',
  orang_tua: 'Orang Tua',
};

// ============================================================================
// COMPONENT
// ============================================================================
export default function AnnouncementsPage() {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('semua');
  const [filterTarget, setFilterTarget] = useState('semua');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('informasi');
  const [formTarget, setFormTarget] = useState('semua');
  const [formAuthor, setFormAuthor] = useState('');

  // ---------------------------------------------------------------------------
  // DATA FETCHING
  // ---------------------------------------------------------------------------
  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      if (data.announcements) {
        setAnnouncements(data.announcements);
      }
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
    // Pre-fill author name from localStorage
    const userName = localStorage.getItem('user_name') || 'Ms. Sarah Jenkins';
    setFormAuthor(userName);
  }, [fetchAnnouncements]);

  // ---------------------------------------------------------------------------
  // FILTERS
  // ---------------------------------------------------------------------------
  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      searchQuery === '' ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'semua' || a.category === filterCategory;
    const matchesTarget = filterTarget === 'semua' || a.target === filterTarget;
    return matchesSearch && matchesCategory && matchesTarget;
  });

  // ---------------------------------------------------------------------------
  // STATS
  // ---------------------------------------------------------------------------
  const stats = {
    total: announcements.length,
    urgen: announcements.filter((a) => a.category === 'urgen').length,
    akademik: announcements.filter((a) => a.category === 'akademik').length,
    kegiatan: announcements.filter((a) => a.category === 'kegiatan').length,
  };

  // ---------------------------------------------------------------------------
  // ACTIONS
  // ---------------------------------------------------------------------------
  const handleCreate = async () => {
    if (!formTitle.trim() || !formContent.trim()) return;
    setSubmitLoading(true);

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          content: formContent,
          category: formCategory,
          target: formTarget,
          author_name: formAuthor || 'Ms. Sarah Jenkins',
          author_role: 'guru',
        }),
      });

      if (res.ok) {
        await fetchAnnouncements();
        setShowCreateModal(false);
        setFormTitle('');
        setFormContent('');
        setFormCategory('informasi');
        setFormTarget('semua');
        showSuccess('Pengumuman berhasil dipublikasikan! ✅');
      }
    } catch (err) {
      console.error('Failed to create announcement:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });

      if (res.ok) {
        await fetchAnnouncements();
        setDeleteConfirm(null);
        showSuccess('Pengumuman berhasil dihapus.');
      }
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessBanner(message);
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const d = new Date(dateStr);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
    return formatDate(dateStr);
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <DashboardLayout activeMenu="announcements" pageTitle="Papan Pengumuman" pageSubtitle="Kelola pengumuman resmi sekolah untuk guru, siswa, dan orang tua">

      {/* ── Inline Styles (Keyframes) ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes successSlide {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      ` }} />

      {/* ── Success Banner ── */}
      {successBanner && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: '#ffffff',
          padding: '14px 24px',
          borderRadius: '14px',
          fontWeight: 700,
          fontSize: '0.9rem',
          boxShadow: '0 12px 32px -4px rgba(5, 150, 105, 0.4)',
          animation: 'successSlide 0.3s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{ fontSize: '1.2rem' }}>🎉</span>
          {successBanner}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
           SECTION 1: STATS HEADER
         ════════════════════════════════════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px',
        animation: 'fadeInUp 0.5s ease-out',
      }}>
        {/* Total */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.04)',
          transition: 'all 0.3s ease',
          cursor: 'default',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 32px -8px rgba(99, 102, 241, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px -4px rgba(15, 23, 42, 0.04)';
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Pengumuman</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>{stats.total}</h3>
            </div>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 16px -4px rgba(99, 102, 241, 0.35)',
            }}>
              <span style={{ fontSize: '1.3rem' }}>📋</span>
            </div>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '10px 0 0 0' }}>Semua pengumuman aktif</p>
        </div>

        {/* Urgen */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '24px',
          border: stats.urgen > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #e2e8f0',
          boxShadow: stats.urgen > 0 ? '0 4px 16px -4px rgba(239, 68, 68, 0.1)' : '0 4px 16px -4px rgba(15, 23, 42, 0.04)',
          transition: 'all 0.3s ease',
          cursor: 'default',
          animation: stats.urgen > 0 ? 'pulseGlow 2s ease-in-out infinite' : 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 32px -8px rgba(239, 68, 68, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = stats.urgen > 0 ? '0 4px 16px -4px rgba(239, 68, 68, 0.1)' : '0 4px 16px -4px rgba(15, 23, 42, 0.04)';
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Urgen / Penting</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: stats.urgen > 0 ? '#dc2626' : '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>{stats.urgen}</h3>
            </div>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 16px -4px rgba(239, 68, 68, 0.35)',
            }}>
              <span style={{ fontSize: '1.3rem' }}>🚨</span>
            </div>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '10px 0 0 0' }}>Membutuhkan perhatian segera</p>
        </div>

        {/* Akademik */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.04)',
          transition: 'all 0.3s ease',
          cursor: 'default',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 32px -8px rgba(37, 99, 235, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px -4px rgba(15, 23, 42, 0.04)';
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Akademik</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>{stats.akademik}</h3>
            </div>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 16px -4px rgba(37, 99, 235, 0.35)',
            }}>
              <span style={{ fontSize: '1.3rem' }}>📘</span>
            </div>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '10px 0 0 0' }}>Pengumuman terkait akademik</p>
        </div>

        {/* Kegiatan */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.04)',
          transition: 'all 0.3s ease',
          cursor: 'default',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 32px -8px rgba(217, 119, 6, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px -4px rgba(15, 23, 42, 0.04)';
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kegiatan</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>{stats.kegiatan}</h3>
            </div>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 16px -4px rgba(217, 119, 6, 0.35)',
            }}>
              <span style={{ fontSize: '1.3rem' }}>🏆</span>
            </div>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '10px 0 0 0' }}>Kegiatan &amp; acara sekolah</p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
           SECTION 2: SEARCH, FILTER & CREATE BUTTON
         ════════════════════════════════════════════════════════════════════ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '28px',
        flexWrap: 'wrap',
        animation: 'fadeInUp 0.6s ease-out',
      }}>
        {/* Search Box */}
        <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '220px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px' }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id="search-announcements"
            type="text"
            placeholder="Cari judul atau isi pengumuman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 44px',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              fontSize: '0.88rem',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#6366f1';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 2px 8px -2px rgba(15, 23, 42, 0.04)';
            }}
          />
        </div>

        {/* Category Filter */}
        <select
          id="filter-category"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            fontSize: '0.85rem',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            minWidth: '160px',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <option value="semua">📂 Semua Kategori</option>
          <option value="urgen">🚨 Urgen / Penting</option>
          <option value="akademik">📘 Akademik</option>
          <option value="kegiatan">🏆 Kegiatan</option>
          <option value="informasi">📢 Informasi Umum</option>
        </select>

        {/* Target Audience Filter */}
        <select
          id="filter-target"
          value={filterTarget}
          onChange={(e) => setFilterTarget(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            fontSize: '0.85rem',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            minWidth: '160px',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <option value="semua">👥 Semua Target</option>
          <option value="guru">🧑‍🏫 Guru</option>
          <option value="siswa">🎓 Siswa</option>
          <option value="orang_tua">👨‍👩‍👧 Orang Tua</option>
        </select>

        {/* Create Button */}
        <button
          id="btn-create-announcement"
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '12px 24px',
            borderRadius: '14px',
            border: 'none',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#ffffff',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 6px 20px -4px rgba(99, 102, 241, 0.4)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 28px -4px rgba(99, 102, 241, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 20px -4px rgba(99, 102, 241, 0.4)';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Buat Pengumuman
        </button>
      </div>

      {/* Active Filters Indicator */}
      {(filterCategory !== 'semua' || filterTarget !== 'semua' || searchQuery) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px',
          animation: 'slideDown 0.3s ease-out',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Filter aktif:</span>
          {searchQuery && (
            <span style={{
              padding: '4px 12px',
              borderRadius: '99px',
              backgroundColor: '#ede9fe',
              color: '#7c3aed',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              🔍 &quot;{searchQuery}&quot;
              <span onClick={() => setSearchQuery('')} style={{ cursor: 'pointer', fontWeight: 800 }}>✕</span>
            </span>
          )}
          {filterCategory !== 'semua' && (
            <span style={{
              padding: '4px 12px',
              borderRadius: '99px',
              backgroundColor: CATEGORY_CONFIG[filterCategory]?.bgColor || '#f1f5f9',
              color: CATEGORY_CONFIG[filterCategory]?.color || '#64748b',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              {CATEGORY_CONFIG[filterCategory]?.icon} {CATEGORY_CONFIG[filterCategory]?.label}
              <span onClick={() => setFilterCategory('semua')} style={{ cursor: 'pointer', fontWeight: 800 }}>✕</span>
            </span>
          )}
          {filterTarget !== 'semua' && (
            <span style={{
              padding: '4px 12px',
              borderRadius: '99px',
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              👥 {TARGET_LABELS[filterTarget]}
              <span onClick={() => setFilterTarget('semua')} style={{ cursor: 'pointer', fontWeight: 800 }}>✕</span>
            </span>
          )}
          <button
            onClick={() => { setSearchQuery(''); setFilterCategory('semua'); setFilterTarget('semua'); }}
            style={{
              padding: '4px 12px',
              borderRadius: '99px',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              fontSize: '0.72rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Reset Semua
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
           SECTION 3: ANNOUNCEMENTS FEED
         ════════════════════════════════════════════════════════════════════ */}
      {loading ? (
        /* Shimmer Loading State */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              height: '140px',
              borderRadius: '18px',
              background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }} />
          ))}
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        /* Empty State */
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '64px 40px',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
          animation: 'fadeInUp 0.5s ease-out',
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px auto',
          }}>
            <span style={{ fontSize: '2rem' }}>📢</span>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
            {announcements.length === 0 ? 'Belum Ada Pengumuman' : 'Tidak Ada Hasil'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 24px 0', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
            {announcements.length === 0
              ? 'Buat pengumuman pertama untuk ditampilkan di sini. Pengumuman akan langsung terlihat oleh seluruh warga sekolah.'
              : 'Coba ubah kata kunci pencarian atau filter kategori untuk menemukan pengumuman yang dicari.'}
          </p>
          {announcements.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '12px 28px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 6px 20px -4px rgba(99, 102, 241, 0.4)',
              }}
            >
              ✨ Buat Pengumuman Pertama
            </button>
          )}
        </div>
      ) : (
        /* Announcements List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredAnnouncements.map((announcement, idx) => {
            const config = CATEGORY_CONFIG[announcement.category] || CATEGORY_CONFIG.informasi;
            const isExpanded = expandedCards.has(announcement.id);
            const isUrgen = announcement.category === 'urgen';
            const contentPreview = announcement.content.length > 200 && !isExpanded
              ? announcement.content.substring(0, 200) + '...'
              : announcement.content;

            return (
              <div
                key={announcement.id}
                id={`announcement-${announcement.id}`}
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  padding: '28px',
                  border: `1px solid ${config.borderColor}`,
                  boxShadow: `0 4px 16px -4px ${config.glowColor}`,
                  transition: 'all 0.3s ease',
                  animation: `fadeInUp ${0.3 + idx * 0.08}s ease-out`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 16px 40px -8px ${config.glowColor}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 16px -4px ${config.glowColor}`;
                }}
              >
                {/* Urgen Glow Line */}
                {isUrgen && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s linear infinite',
                  }} />
                )}

                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    {/* Category Badge */}
                    <div style={{
                      padding: '6px 14px',
                      borderRadius: '99px',
                      backgroundColor: config.bgColor,
                      color: config.color,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      border: `1px solid ${config.borderColor}`,
                    }}>
                      <span>{config.icon}</span>
                      {config.label}
                      {isUrgen && (
                        <span style={{ animation: 'blink 1s ease-in-out infinite', fontSize: '0.6rem' }}>🔴</span>
                      )}
                    </div>

                    {/* Target Badge */}
                    <div style={{
                      padding: '4px 10px',
                      borderRadius: '99px',
                      backgroundColor: '#f1f5f9',
                      color: '#64748b',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}>
                      👥 {TARGET_LABELS[announcement.target] || announcement.target}
                    </div>
                  </div>

                  {/* Time & Delete */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {formatTimeAgo(announcement.created_at)}
                    </span>

                    {/* Delete Button */}
                    {deleteConfirm === announcement.id ? (
                      <div style={{ display: 'flex', gap: '6px', animation: 'slideDown 0.2s ease-out' }}>
                        <button
                          onClick={() => handleDelete(announcement.id)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Hapus
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: '#ffffff',
                            color: '#64748b',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(announcement.id)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#ffffff',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.borderColor = '#fecaca';
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.color = '#94a3b8';
                        }}
                        title="Hapus pengumuman"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: '0 0 10px 0',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.4,
                }}>
                  {isUrgen && <span style={{ color: '#ef4444', marginRight: '6px' }}>⚠️</span>}
                  {announcement.title}
                </h3>

                {/* Content */}
                <p style={{
                  fontSize: '0.88rem',
                  color: '#475569',
                  lineHeight: 1.7,
                  margin: '0 0 16px 0',
                  whiteSpace: 'pre-wrap',
                }}>
                  {contentPreview}
                </p>

                {/* Read More Toggle */}
                {announcement.content.length > 200 && (
                  <button
                    onClick={() => toggleExpand(announcement.id)}
                    style={{
                      padding: '0',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#6366f1',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginBottom: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isExpanded ? '▲ Tutup' : '▼ Baca Selengkapnya'}
                  </button>
                )}

                {/* Footer Meta */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '14px',
                  borderTop: '1px solid #f1f5f9',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#ffffff', fontSize: '0.65rem', fontWeight: 800,
                    }}>
                      {announcement.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{announcement.author_name}</p>
                      <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: 0, textTransform: 'capitalize' }}>{announcement.author_role}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
                    📅 {formatDate(announcement.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Results Counter */}
      {!loading && announcements.length > 0 && (
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '0.78rem',
          color: '#94a3b8',
          fontWeight: 500,
        }}>
          Menampilkan {filteredAnnouncements.length} dari {announcements.length} pengumuman
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
           CREATE ANNOUNCEMENT MODAL
         ════════════════════════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div
          id="modal-overlay-create"
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9000,
            padding: '24px',
          }}
          onClick={(e) => {
            if ((e.target as HTMLElement).id === 'modal-overlay-create') setShowCreateModal(false);
          }}
        >
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '36px',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 24px 60px -12px rgba(15, 23, 42, 0.25)',
            animation: 'modalIn 0.3s ease-out',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                  ✨ Buat Pengumuman Baru
                </h2>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Isi detail pengumuman untuk dipublikasikan ke seluruh warga sekolah</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  width: '36px', height: '36px', borderRadius: '12px',
                  border: '1px solid #e2e8f0', backgroundColor: '#f8fafc',
                  color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Title */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '6px', display: 'block' }}>
                  Judul Pengumuman <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  id="input-announcement-title"
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Pengumuman Libur Hari Raya Idul Fitri"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.88rem',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Content */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '6px', display: 'block' }}>
                  Isi Pengumuman <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  id="input-announcement-content"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Tulis isi pengumuman secara lengkap di sini..."
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.88rem',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: 1.6,
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Category & Target Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Kategori
                  </label>
                  <select
                    id="input-announcement-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="informasi">📢 Informasi Umum</option>
                    <option value="akademik">📘 Akademik</option>
                    <option value="kegiatan">🏆 Kegiatan</option>
                    <option value="urgen">🚨 Urgen / Penting</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Target Pembaca
                  </label>
                  <select
                    id="input-announcement-target"
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    {TARGET_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Author Name */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '6px', display: 'block' }}>
                  Nama Pembuat
                </label>
                <input
                  id="input-announcement-author"
                  type="text"
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  placeholder="Nama guru/admin pembuat pengumuman"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.88rem',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#f8fafc',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Preview */}
              {formTitle && (
                <div style={{
                  padding: '16px',
                  borderRadius: '14px',
                  backgroundColor: CATEGORY_CONFIG[formCategory]?.bgColor || '#f8fafc',
                  border: `1px solid ${CATEGORY_CONFIG[formCategory]?.borderColor || '#e2e8f0'}`,
                  animation: 'slideDown 0.3s ease-out',
                }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pratinjau</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.85rem' }}>{CATEGORY_CONFIG[formCategory]?.icon}</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>{formTitle}</span>
                  </div>
                  {formContent && (
                    <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                      {formContent.substring(0, 120)}{formContent.length > 120 ? '...' : ''}
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                id="btn-submit-announcement"
                onClick={handleCreate}
                disabled={submitLoading || !formTitle.trim() || !formContent.trim()}
                style={{
                  padding: '14px 24px',
                  borderRadius: '14px',
                  border: 'none',
                  background: (!formTitle.trim() || !formContent.trim())
                    ? '#e2e8f0'
                    : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: (!formTitle.trim() || !formContent.trim()) ? '#94a3b8' : '#ffffff',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: (!formTitle.trim() || !formContent.trim()) ? 'not-allowed' : 'pointer',
                  boxShadow: (!formTitle.trim() || !formContent.trim())
                    ? 'none'
                    : '0 6px 20px -4px rgba(99, 102, 241, 0.4)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {submitLoading ? (
                  <>
                    <div style={{
                      width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.6s linear infinite',
                    }} />
                    Mempublikasikan...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Publikasikan Pengumuman
                  </>
                )}
              </button>
            </div>

            {/* Spin keyframe for button loading */}
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            ` }} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
