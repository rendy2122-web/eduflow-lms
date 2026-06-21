'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface StudentItem {
  id: string;
  name: string;
  email: string;
  nisn: string;
  classId: string;
  className: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  alamat: string;
  telepon: string;
}

interface ClassItem {
  id: string;
  name: string;
  description: string | null;
}

interface ParentItem {
  id: string;
  name: string;
  email: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [parents, setParents] = useState<ParentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterParentStatus, setFilterParentStatus] = useState('all'); // all, connected, disconnected

  // Selected Student for Detail Sidebar
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);

  // Form Modal States
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formNisn, setFormNisn] = useState('');
  const [formClassId, setFormClassId] = useState('');
  const [formParentId, setFormParentId] = useState('');
  const [formAlamat, setFormAlamat] = useState('');
  const [formTelepon, setFormTelepon] = useState('');

  // Notification Banner
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Bulk Import CSV States
  const [showImportModal, setShowImportModal] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [visibleCount, setVisibleCount] = useState<number>(5);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importData, setImportData] = useState<any[]>([]);

  // Fetch all students, classes, and parents
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/students');
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
        setClasses(data.classes);
        setParents(data.parents);
      } else {
        if (data.error && (data.error.includes('Sesi') || data.error.includes('Akses') || data.error.includes('terdaftar'))) {
          localStorage.clear();
          const segments = window.location.pathname.split('/').filter(Boolean);
          const tenantId = (segments.length > 0 && segments[0] !== 'dashboard' && segments[0] !== 'login' && segments[0] !== 'api' && segments[0] !== 'saas-admin') ? segments[0] : '';
          window.location.href = tenantId ? `/${tenantId}/login` : '/login';
          return;
        }
      }
    } catch (err) {
      console.error('Failed to fetch students data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showSuccess = (message: string) => {
    setSuccessBanner(message);
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  const handleOpenAdd = () => {
    setIsEdit(false);
    setFormId('');
    setFormName('');
    setFormEmail('');
    setFormNisn('');
    setFormClassId(classes[0]?.id || '');
    setFormParentId('');
    setFormAlamat('');
    setFormTelepon('');
    setShowForm(true);
  };

  const handleOpenEdit = (s: StudentItem, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening detail sidebar
    setIsEdit(true);
    setFormId(s.id);
    setFormName(s.name);
    setFormEmail(s.email);
    setFormNisn(s.nisn);
    setFormClassId(s.classId);
    setFormParentId(s.parentId || '');
    setFormAlamat(s.alamat);
    setFormTelepon(s.telepon);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail || !formNisn) return;

    setSaving(true);
    try {
      const url = '/api/admin/students';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formId,
          name: formName,
          email: formEmail,
          nisn: formNisn,
          classId: formClassId,
          parentId: formParentId || null,
          alamat: formAlamat,
          telepon: formTelepon
        })
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(isEdit ? 'Profil murid berhasil diperbarui! ✏️' : 'Murid baru berhasil didaftarkan! 🎓');
        await fetchData();
        setShowForm(false);
        // Update detail panel if active
        if (isEdit && selectedStudent?.id === formId) {
          const updated = students.find(item => item.id === formId);
          if (updated) setSelectedStudent(updated);
        }
      } else {
        alert('Gagal menyimpan data: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s: StudentItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Apakah Anda yakin ingin menghapus murid "${s.name}"? Semua data nilai, tugas, dan rekam absensinya akan ikut terhapus.`)) return;

    try {
      const res = await fetch(`/api/admin/students?id=${s.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('Data murid berhasil dihapus! 🗑️');
        if (selectedStudent?.id === s.id) {
          setSelectedStudent(null);
        }
        await fetchData();
      } else {
        alert('Gagal menghapus data: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "\uFEFFNama,Email,NISN,Nama Kelas,Email Orang Tua,Nama Orang Tua,No Telp Orang Tua,Alamat,Telepon\n" +
      "Ahmad Fauzi,ahmad.fauzi@siswa.sch.id,1234567890,Kelas 4A,budi.fauzi@ortu.sch.id,Budi Fauzi,08123456789,Jl. Mawar No. 12 Jakarta,021555123\n" +
      "Zahra Amalia,zahra.amalia@siswa.sch.id,1234567891,Kelas 4B,siti.amalia@ortu.sch.id,Siti Amalia,08129876543,Jl. Melati No. 45 Jakarta,021555456";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Template_Impor_Siswa.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string) => {
    const lines = [];
    let row = [""];
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i+1];
      if (c === '"') {
        if (inQuotes && next === '"') {
          row[row.length - 1] += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        row.push('');
      } else if ((c === '\r' || c === '\n') && !inQuotes) {
        if (c === '\r' && next === '\n') i++;
        lines.push(row);
        row = [''];
      } else {
        row[row.length - 1] += c;
      }
    }
    if (row.length > 1 || row[0] !== '') {
      lines.push(row);
    }
    return lines;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const rows = parseCSV(text);
        if (rows.length < 2) {
          alert('File CSV kosong atau tidak memiliki data.');
          return;
        }

        const headers = rows[0].map((h: string) => h.trim());
        
        const nameIdx = headers.indexOf('Nama');
        const emailIdx = headers.indexOf('Email');
        const nisnIdx = headers.indexOf('NISN');
        const classIdx = headers.indexOf('Nama Kelas');
        const parentEmailIdx = headers.indexOf('Email Orang Tua');
        const parentNameIdx = headers.indexOf('Nama Orang Tua');
        const parentPhoneIdx = headers.indexOf('No Telp Orang Tua');
        const alamatIdx = headers.indexOf('Alamat');
        const telpIdx = headers.indexOf('Telepon');

        if (nameIdx === -1 || emailIdx === -1 || nisnIdx === -1) {
          alert('Format CSV salah. Kolom Nama, Email, dan NISN wajib ada.');
          return;
        }

        const parsedStudents = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length < 3 || !row[nameIdx]) continue;

          parsedStudents.push({
            name: row[nameIdx]?.trim(),
            email: row[emailIdx]?.trim(),
            nisn: row[nisnIdx]?.trim(),
            className: classIdx !== -1 ? row[classIdx]?.trim() : '',
            parentEmail: parentEmailIdx !== -1 ? row[parentEmailIdx]?.trim() : '',
            parentName: parentNameIdx !== -1 ? row[parentNameIdx]?.trim() : '',
            parentPhone: parentPhoneIdx !== -1 ? row[parentPhoneIdx]?.trim() : '',
            alamat: alamatIdx !== -1 ? row[alamatIdx]?.trim() : '',
            telepon: telpIdx !== -1 ? row[telpIdx]?.trim() : '',
          });
        }

        setImportData(parsedStudents);
        setImportStatus(`Berhasil memuat ${parsedStudents.length} baris data siswa. Siap diimpor!`);
      } catch (err: any) {
        alert('Gagal membaca file CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (importData.length === 0) return;

    setImporting(true);
    setImportStatus('Sedang mengimpor data ke database...');
    try {
      const res = await fetch('/api/admin/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: importData })
      });
      const json = await res.json();
      if (json.success) {
        showSuccess(`Sukses mengimpor: ${json.importedStudents} siswa, ${json.createdParents} wali, dan ${json.createdClasses} kelas baru! 🎉`);
        await fetchData();
        setShowImportModal(false);
        setImportData([]);
        setImportStatus(null);
      } else {
        setImportStatus(`Gagal: ${json.error}`);
      }
    } catch (err: any) {
      setImportStatus(`Error: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  // Filter & Search Logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.nisn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass === 'all' || s.classId === filterClass;
    const matchesParentStatus = filterParentStatus === 'all' || 
                               (filterParentStatus === 'connected' && s.parentId !== '') ||
                               (filterParentStatus === 'disconnected' && s.parentId === '');
    return matchesSearch && matchesClass && matchesParentStatus;
  });

  const displayedStudents = filteredStudents.slice(0, visibleCount);
  const hasMoreStudents = visibleCount < filteredStudents.length;

  // Calculate Metrics
  const totalStudents = students.length;
  const studentsWithGuardians = students.filter(s => s.parentId !== '').length;
  const totalClasses = classes.length;
  const avgStudentsPerClass = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;

  return (
    <DashboardLayout activeMenu="students" pageTitle="Direktori Murid & Wali" pageSubtitle="Pengelolaan profil siswa, wali murid, dan rombongan kelas belajar sekolah.">
      
      {/* Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scaleIn { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-slide-in-right { animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .card-premium-hover { transition: all 0.3s ease; }
        .card-premium-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -10px rgba(99, 102, 241, 0.12); }
        .tr-hover:hover { background-color: #f8fafc !important; cursor: pointer; }
      ` }} />

      {/* Success Notification Banner */}
      {successBanner && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
          color: '#ffffff', padding: '14px 24px', borderRadius: '14px',
          fontWeight: 700, fontSize: '0.88rem',
          boxShadow: '0 12px 32px -4px rgba(99, 102, 241, 0.4)',
          animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '1.2rem' }}>📝</span>
          {successBanner}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* ════════════════════════════════════════════════════════════════
             SECTION 1: METRIC SUMMARY CARDS
           ════════════════════════════════════════════════════════════════ */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {/* Card 1: Total Murid */}
          <div className="card-premium card-premium-hover" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '1.4rem' }}>🎓</span>
            </div>
            <div>
              <p style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Total Murid</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 850, color: '#0f172a', margin: 0 }}>{loading ? '...' : `${totalStudents} Siswa`}</h3>
            </div>
          </div>

          {/* Card 2: Wali Terhubung */}
          <div className="card-premium card-premium-hover" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '1.4rem' }}>🤝</span>
            </div>
            <div>
              <p style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Wali Terhubung</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 850, color: '#059669', margin: 0 }}>{loading ? '...' : `${studentsWithGuardians} Orang`}</h3>
            </div>
          </div>

          {/* Card 3: Rombel Kelas */}
          <div className="card-premium card-premium-hover" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '1.4rem' }}>🏫</span>
            </div>
            <div>
              <p style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Kelas Aktif</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 850, color: '#d97706', margin: 0 }}>{loading ? '...' : `${totalClasses} Rombel`}</h3>
            </div>
          </div>

          {/* Card 4: Rata-rata/Kelas */}
          <div className="card-premium card-premium-hover" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '1.4rem' }}>📊</span>
            </div>
            <div>
              <p style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Rasio Murid/Kelas</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 850, color: '#dc2626', margin: 0 }}>{loading ? '...' : `~${avgStudentsPerClass} Siswa`}</h3>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
             SECTION 2: SMART FILTER & SEARCH BAR
           ════════════════════════════════════════════════════════════════ */}
        <section style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {/* Search bar */}
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pencarian Murid</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Cari nama, email, atau NISN murid..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '10px 16px 10px 38px', borderRadius: '12px', border: '1px solid #e2e8f0',
                  fontSize: '0.88rem', color: '#0f172a', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box'
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
              />
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '12px' }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          {/* Class Filter */}
          <div style={{ flex: '0 0 auto' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kelas Rombel</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              style={{
                padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0',
                fontSize: '0.88rem', fontWeight: 600, color: '#0f172a',
                backgroundColor: '#ffffff', cursor: 'pointer', outline: 'none',
                minWidth: '160px', transition: 'all 0.2s'
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <option value="all">🏫 Semua Kelas</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Guardian Status Filter */}
          <div style={{ flex: '0 0 auto' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status Wali</label>
            <select
              value={filterParentStatus}
              onChange={(e) => setFilterParentStatus(e.target.value)}
              style={{
                padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0',
                fontSize: '0.88rem', fontWeight: 600, color: '#0f172a',
                backgroundColor: '#ffffff', cursor: 'pointer', outline: 'none',
                minWidth: '180px', transition: 'all 0.2s'
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <option value="all">👥 Semua Status Wali</option>
              <option value="connected">✅ Terhubung Wali</option>
              <option value="disconnected">❌ Belum Terhubung Wali</option>
            </select>
          </div>

          {/* Add Student Button */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowImportModal(true)}
              style={{
                padding: '10px 20px', borderRadius: '12px', background: '#ffffff',
                color: '#4f46e5', fontWeight: 700, fontSize: '0.85rem', border: '1px solid #cbd5e1', cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; }}
            >
              📥 Impor Massal (CSV)
            </button>
            <button
              onClick={handleOpenAdd}
              style={{
                padding: '10px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.3)', transition: 'all 0.2s'
              }}
            >
              🎓 Daftarkan Murid
            </button>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
             SECTION 3: DIRECTORY TABLE & LAYOUT
           ════════════════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', width: '100%' }}>
          
          {/* Main Roster List */}
          <section className="card-premium" style={{ flex: 1, padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '20px', background: '#ffffff' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Daftar Roster Direktori Siswa</h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Menampilkan {filteredStudents.length} murid</span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '24px' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ height: '52px', borderRadius: '10px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                ))}
              </div>
            ) : filteredStudents.length === 0 ? (
              <div style={{ padding: '64px 24px', textAlign: 'center', color: '#94a3b8' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>🔍</span>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>Tidak ada murid yang sesuai dengan filter pencarian.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '14px 24px' }}>Nama Murid</th>
                      <th style={{ padding: '14px 24px' }}>NISN</th>
                      <th style={{ padding: '14px 24px' }}>Kelas</th>
                      <th style={{ padding: '14px 24px' }}>Nama Wali (Ortu)</th>
                      <th style={{ padding: '14px 24px', textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedStudents.map((s, idx) => {
                      const initials = s.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                      const hue = (idx * 43) % 360;
                      const isSelected = selectedStudent?.id === s.id;

                      return (
                        <tr
                          key={s.id}
                          onClick={() => setSelectedStudent(s)}
                          className="tr-hover"
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: isSelected ? '#f5f3ff' : 'transparent',
                            transition: 'all 0.2s'
                          }}
                        >
                          {/* Student identity with custom color avatar */}
                          <td style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '34px', height: '34px', borderRadius: '10px',
                              background: `linear-gradient(135deg, hsl(${hue}, 70%, 60%) 0%, hsl(${(hue + 40) % 360}, 70%, 45%) 100%)`,
                              color: '#ffffff', fontWeight: 800, fontSize: '0.82rem',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                              {initials}
                            </div>
                            <div>
                              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', display: 'block' }}>{s.name}</span>
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{s.email}</span>
                            </div>
                          </td>

                          {/* NISN */}
                          <td style={{ padding: '12px 24px', fontSize: '0.85rem', fontFamily: 'monospace', color: '#475569', fontWeight: 600 }}>{s.nisn}</td>

                          {/* Class Name */}
                          <td style={{ padding: '12px 24px' }}>
                            <span style={{
                              fontSize: '0.78rem', fontWeight: 700, color: '#4f46e5',
                              backgroundColor: '#e0e7ff', padding: '4px 10px', borderRadius: '8px'
                            }}>
                              {s.className}
                            </span>
                          </td>

                          {/* Parent Name */}
                          <td style={{ padding: '12px 24px', fontSize: '0.85rem', color: s.parentId ? '#1e293b' : '#94a3b8', fontWeight: 600 }}>
                            {s.parentId ? `👨‍👩‍👦 ${s.parentName}` : 'Belum Terhubung'}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '12px 24px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button
                                onClick={(e) => handleOpenEdit(s, e)}
                                title="Edit Murid"
                                style={{
                                  background: 'none', border: '1px solid #cbd5e1', padding: '6px 8px', borderRadius: '8px', cursor: 'pointer',
                                  fontSize: '0.8rem', color: '#475569', transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}
                              >
                                ✏️
                              </button>
                              <button
                                onClick={(e) => handleDelete(s, e)}
                                title="Hapus Murid"
                                style={{
                                  background: 'none', border: '1px solid #fecaca', padding: '6px 8px', borderRadius: '8px', cursor: 'pointer',
                                  fontSize: '0.8rem', color: '#ef4444', transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          
          {/* Pagination Controls */}
          {filteredStudents.length > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Tampilkan:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value);
                    setItemsPerPage(newValue);
                    setVisibleCount(newValue);
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  dari {filteredStudents.length} murid
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                  Menampilkan {displayedStudents.length} dari {filteredStudents.length}
                </span>
                {hasMoreStudents && (
                  <button
                    onClick={() => setVisibleCount(prev => prev + itemsPerPage)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(79, 70, 229, 0.2)'
                    }}
                  >
                    Tampilkan Lebih Banyak ({Math.min(itemsPerPage, filteredStudents.length - visibleCount)} lagi)
                  </button>
                )}
                {visibleCount > itemsPerPage && (
                  <button
                    onClick={() => setVisibleCount(itemsPerPage)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: '#ffffff',
                      color: '#4f46e5',
                      border: '1px solid #4f46e5',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Tampilkan Lebih Sedikit
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

          {/* Detail Panel Sidebar */}
          {selectedStudent && (
            <aside className="card-premium animate-slide-in-right no-print" style={{
              width: '320px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px',
              padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '24px', flexShrink: 0
            }}>
              
              {/* Header Close */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Profil Murid Detail</h3>
                <button
                  onClick={() => setSelectedStudent(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.1rem', color: '#94a3b8', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {/* Identity Block */}
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '16px', margin: '0 auto 12px auto',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#ffffff', fontSize: '1.5rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {selectedStudent.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>{selectedStudent.name}</h4>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>{selectedStudent.email}</span>
              </div>

              {/* Student Properties */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
                <div style={{ borderBottom: '1px solid #f8fafc', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b', display: 'block', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nomor Induk NISN</span>
                  <span style={{ fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>{selectedStudent.nisn}</span>
                </div>
                <div style={{ borderBottom: '1px solid #f8fafc', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b', display: 'block', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kelas Rombel</span>
                  <span style={{ fontWeight: 700, color: '#4f46e5' }}>{selectedStudent.className}</span>
                </div>
                <div style={{ borderBottom: '1px solid #f8fafc', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b', display: 'block', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Telepon Murid</span>
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>{selectedStudent.telepon || '-'}</span>
                </div>
                <div style={{ borderBottom: '1px solid #f8fafc', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b', display: 'block', fontWeight: 600, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alamat Tempat Tinggal</span>
                  <span style={{ fontWeight: 600, color: '#475569', lineHeight: '1.4' }}>{selectedStudent.alamat || '-'}</span>
                </div>
              </div>

              {/* Guardian Info Box */}
              <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px',
                display: 'flex', flexDirection: 'column', gap: '8px'
              }}>
                <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>👨‍👩‍👦 Data Wali Murid</h4>
                
                {selectedStudent.parentId ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: '#64748b', fontWeight: 500 }}>Nama:</span>
                      <span style={{ fontWeight: 700, color: '#1e293b', marginLeft: '4px' }}>{selectedStudent.parentName}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontWeight: 500 }}>Email:</span>
                      <span style={{ fontWeight: 700, color: '#1e293b', marginLeft: '4px' }}>{selectedStudent.parentEmail}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontWeight: 500 }}>Telepon:</span>
                      <span style={{ fontWeight: 700, color: '#1e293b', marginLeft: '4px' }}>{selectedStudent.parentPhone || '-'}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Belum dikaitkan dengan akun Orang Tua murid.</p>
                  </div>
                )}
              </div>

            </aside>
          )}

        </div>

      </div>

      {/* ════════════════════════════════════════════════════════════════
           SECTION 4: FORM MODAL OVERLAY (ADD / EDIT STUDENT)
         ════════════════════════════════════════════════════════════════ */}
      {showForm && (
        <div className="animate-fade-in" style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backdropFilter: 'blur(8px)', backgroundColor: 'rgba(15, 23, 42, 0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999, padding: '20px', boxSizing: 'border-box'
        }}>
          <form onSubmit={handleSubmit} className="animate-scale-in" style={{
            background: '#ffffff', borderRadius: '24px', padding: '36px',
            maxWidth: '540px', width: '100%', display: 'flex', flexDirection: 'column', gap: '18px',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', border: '1px solid #e2e8f0'
          }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isEdit ? 'Ubah Profil Murid' : 'Daftarkan Murid Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#64748b', cursor: 'pointer', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            {/* Input Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="std-name" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px' }}>Nama Lengkap</label>
              <input 
                type="text" 
                id="std-name" 
                className="form-control" 
                placeholder="Contoh: Bilal Al-Mansoori"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem' }}
              />
            </div>

            {/* Input Email & NISN */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="std-email" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px' }}>Email</label>
                <input 
                  type="email" 
                  id="std-email" 
                  className="form-control" 
                  placeholder="bilal@siswa.sch.id"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="std-nisn" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px' }}>NISN</label>
                <input 
                  type="text" 
                  id="std-nisn" 
                  className="form-control" 
                  placeholder="Contoh: NISN001"
                  value={formNisn}
                  onChange={e => setFormNisn(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            {/* Class & Parent Select Dropdowns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="std-class" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px' }}>Pilih Kelas Rombel</label>
                <select 
                  id="std-class" 
                  className="form-control" 
                  value={formClassId} 
                  onChange={e => setFormClassId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem', fontWeight: 600, backgroundColor: '#ffffff' }}
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="std-parent" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px' }}>Hubungkan Wali Murid</label>
                <select 
                  id="std-parent" 
                  className="form-control" 
                  value={formParentId} 
                  onChange={e => setFormParentId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem', fontWeight: 600, backgroundColor: '#ffffff' }}
                >
                  <option value="">-- Tanpa Wali --</option>
                  {parents.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Input Phone */}
            <div className="form-group">
              <label className="form-label" htmlFor="std-phone" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px' }}>Nomor Telepon</label>
              <input 
                type="text" 
                id="std-phone" 
                className="form-control" 
                placeholder="Contoh: 08569988..."
                value={formTelepon}
                onChange={e => setFormTelepon(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem' }}
              />
            </div>

            {/* Input Address */}
            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label" htmlFor="std-address" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px' }}>Alamat Rumah</label>
              <textarea 
                id="std-address" 
                className="form-control" 
                rows={2}
                placeholder="Tulis alamat lengkap tinggal..."
                value={formAlamat}
                onChange={e => setFormAlamat(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem', resize: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
                style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem' }}
              >
                Batalkan
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
                style={{ padding: '10px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', border: 'none', color: '#ffffff' }}
              >
                {saving ? 'Menyimpan...' : 'Simpan Data'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="card-premium animate-scale-in" style={{
            maxWidth: '600px', width: '100%', padding: '32px',
            backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Impor Roster Murid Massal</h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 0' }}>Unggah file CSV sekolah untuk mendaftarkan murid secara instan.</p>
              </div>
              <button 
                onClick={() => { setShowImportModal(false); setImportData([]); setImportStatus(null); }}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.25rem', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Template Download Option */}
              <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', margin: '0 0 6px 0' }}>1. Unduh Template CSV</h4>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 12px 0', lineHeight: 1.4 }}>Gunakan file contoh di bawah ini sebagai acuan format kolom pengisian data agar tidak terjadi kesalahan impor.</p>
                <button 
                  onClick={handleDownloadTemplate}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1px solid #4f46e5',
                    background: 'rgba(79, 70, 229, 0.05)', color: '#4f46e5',
                    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(79, 70, 229, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(79, 70, 229, 0.05)'; }}
                >
                  📥 Download Template CSV
                </button>
              </div>

              {/* Uploader Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>2. Pilih Berkas CSV Sekolah</label>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={handleFileUpload}
                  style={{
                    width: '100%', padding: '12px', border: '1.5px dashed #cbd5e1',
                    borderRadius: '12px', background: '#f8fafc', fontSize: '0.82rem',
                    cursor: 'pointer', boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Status & Preview area */}
              {importStatus && (
                <div style={{
                  padding: '12px 16px', borderRadius: '10px',
                  backgroundColor: importStatus.includes('Gagal') || importStatus.includes('Error') ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                  border: importStatus.includes('Gagal') || importStatus.includes('Error') ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                  color: importStatus.includes('Gagal') || importStatus.includes('Error') ? '#dc2626' : '#15803d',
                  fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.4
                }}>
                  {importStatus}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button
                  onClick={() => { setShowImportModal(false); setImportData([]); setImportStatus(null); }}
                  className="btn-secondary"
                  style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem' }}
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={importData.length === 0 || importing}
                  className="btn-primary"
                  style={{
                    padding: '10px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem',
                    background: importData.length === 0 ? '#cbd5e1' : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                    color: '#ffffff', border: 'none', cursor: importData.length === 0 || importing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {importing ? 'Memproses Impor...' : `Konfirmasi Impor (${importData.length} Siswa)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
