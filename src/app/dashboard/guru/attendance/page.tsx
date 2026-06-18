'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { exportToCSV, exportToExcel } from '@/utils/export';

// ============================================================================
// TYPES
// ============================================================================
interface StudentRecord {
  id: string;
  name: string;
  nisn: string;
  class_id: string | null;
  status: string | null; // 'hadir' | 'sakit' | 'izin' | 'alpa' | null
  notes: string;
  attendance_id: string | null;
}

interface ClassInfo {
  id: string;
  name: string;
  description: string | null;
}

// ============================================================================
// STATUS CONFIG
// ============================================================================
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: string }> = {
  hadir: { label: 'Hadir', color: '#059669', bgColor: 'rgba(5, 150, 105, 0.1)', borderColor: 'rgba(5, 150, 105, 0.3)', icon: '✅' },
  sakit: { label: 'Sakit', color: '#2563eb', bgColor: 'rgba(37, 99, 235, 0.08)', borderColor: 'rgba(37, 99, 235, 0.25)', icon: '🤒' },
  izin: { label: 'Izin', color: '#d97706', bgColor: 'rgba(217, 119, 6, 0.08)', borderColor: 'rgba(217, 119, 6, 0.25)', icon: '📋' },
  alpa: { label: 'Alpa', color: '#dc2626', bgColor: 'rgba(220, 38, 38, 0.08)', borderColor: 'rgba(220, 38, 38, 0.25)', icon: '❌' },
};

// ============================================================================
// COMPONENT
// ============================================================================
export default function AttendancePage() {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [localChanges, setLocalChanges] = useState<Map<string, { status: string; notes: string }>>(new Map());
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showMonthlyExportModal, setShowMonthlyExportModal] = useState(false);
  const [exportMonth, setExportMonth] = useState('06');
  const [exportYear, setExportYear] = useState('2026');
  const [exportingMonthly, setExportingMonthly] = useState(false);

  // ---------------------------------------------------------------------------
  // DATA FETCHING
  // ---------------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClass !== 'all') params.set('class_id', selectedClass);
      params.set('date', selectedDate);

      const res = await fetch(`/api/guru/attendance/student?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setStudents(data.students);
        if (data.classes) setClasses(data.classes);
        setLocalChanges(new Map()); // reset local changes on fetch
      }
    } catch (err) {
      console.error('Failed to fetch attendance data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------------------------------------------------------------------------
  // LOCAL STATE HELPERS
  // ---------------------------------------------------------------------------
  const getStudentStatus = (student: StudentRecord): string | null => {
    const local = localChanges.get(student.id);
    if (local) return local.status;
    return student.status;
  };

  const getStudentNotes = (student: StudentRecord): string => {
    const local = localChanges.get(student.id);
    if (local) return local.notes;
    return student.notes || '';
  };

  const setStatus = (studentId: string, status: string) => {
    setLocalChanges((prev) => {
      const next = new Map(prev);
      const existing = next.get(studentId);
      next.set(studentId, {
        status,
        notes: (status === 'hadir' || status === 'alpa') ? '' : (existing?.notes || ''),
      });
      return next;
    });
  };

  const setNotes = (studentId: string, notes: string) => {
    setLocalChanges((prev) => {
      const next = new Map(prev);
      const existing = next.get(studentId);
      next.set(studentId, {
        status: existing?.status || 'sakit',
        notes,
      });
      return next;
    });
  };

  // ---------------------------------------------------------------------------
  // COMPUTED STATS
  // ---------------------------------------------------------------------------
  const mergedStudents = students.map((s) => ({
    ...s,
    currentStatus: getStudentStatus(s),
    currentNotes: getStudentNotes(s),
  }));

  const stats = {
    total: mergedStudents.length,
    hadir: mergedStudents.filter((s) => s.currentStatus === 'hadir').length,
    sakitIzin: mergedStudents.filter((s) => s.currentStatus === 'sakit' || s.currentStatus === 'izin').length,
    alpa: mergedStudents.filter((s) => s.currentStatus === 'alpa').length,
    belumDiisi: mergedStudents.filter((s) => !s.currentStatus).length,
  };

  const attendanceRate = stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;
  const alpaStudents = mergedStudents.filter((s) => s.currentStatus === 'alpa');

  // ---------------------------------------------------------------------------
  // ACTIONS
  // ---------------------------------------------------------------------------
  const handleMarkAllPresent = () => {
    const newChanges = new Map(localChanges);
    students.forEach((s) => {
      newChanges.set(s.id, { status: 'hadir', notes: '' });
    });
    setLocalChanges(newChanges);
    showSuccess('Semua siswa ditandai hadir ✅');
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Build batch from current merged state
      const batch = mergedStudents
        .filter((s) => s.currentStatus) // only save students with a status
        .map((s) => ({
          studentId: s.id,
          date: selectedDate,
          status: s.currentStatus,
          notes: s.currentNotes,
        }));

      if (batch.length === 0) {
        showSuccess('Tidak ada data absensi untuk disimpan.');
        setSaving(false);
        return;
      }

      const res = await fetch('/api/guru/attendance/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch }),
      });

      if (res.ok) {
        const data = await res.json();
        showSuccess(`Absensi ${data.saved} siswa berhasil disimpan! 🎉`);
        await fetchData(); // refresh from DB
      }
    } catch (err) {
      console.error('Failed to save attendance:', err);
    } finally {
      setSaving(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessBanner(message);
    setTimeout(() => setSuccessBanner(null), 3500);
  };

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleExport = (format: 'excel' | 'csv' | 'pdf') => {
    if (format === 'pdf') {
      window.print();
      return;
    }

    const className = selectedClass === 'all' 
      ? 'Semua_Kelas' 
      : classes.find(c => c.id === selectedClass)?.name || selectedClass;
    const cleanClassName = className.replace(/\s+/g, '_');
    const filename = `Rekap_Presensi_${cleanClassName}_${selectedDate}`;
    
    const headers = ['No', 'Nama Siswa', 'NISN', 'Status Kehadiran', 'Catatan'];
    const rows = students.map((student, idx) => {
      const statusVal = getStudentStatus(student);
      const statusLabel = statusVal ? STATUS_CONFIG[statusVal]?.label || statusVal : 'Belum Diisi';
      const notesVal = getStudentNotes(student);
      return [
        idx + 1,
        student.name,
        student.nisn,
        statusLabel,
        notesVal
      ];
    });

    if (format === 'csv') {
      exportToCSV(`${filename}.csv`, headers, rows);
    } else {
      exportToExcel(`${filename}.xls`, 'Presensi Kelas', headers, rows);
    }
  };

  const handleMonthlyExport = async (format: 'excel' | 'csv' | 'pdf') => {
    let printWindow: Window | null = null;
    if (format === 'pdf') {
      printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Memuat...</title></head><body style="font-family:sans-serif; text-align:center; padding-top:100px; color:#6366f1; font-weight:bold;">⏳ Memuat rekap presensi bulanan... mohon tunggu.</body></html>');
      }
    }

    setExportingMonthly(true);
    try {
      const params = new URLSearchParams();
      if (selectedClass !== 'all') params.set('class_id', selectedClass);
      params.set('month', `${exportYear}-${exportMonth}`);

      const res = await fetch(`/api/guru/attendance/student?${params.toString()}`);
      const data = await res.json();

      if (data.success && data.students) {
        const yearInt = parseInt(exportYear);
        const monthInt = parseInt(exportMonth);
        const daysInMonth = new Date(yearInt, monthInt, 0).getDate();
        
        const dateHeaders = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
        const headers = ['No', 'Nama Siswa', 'NISN', ...dateHeaders, 'H', 'S', 'I', 'A'];

        const rows = data.students.map((student: any, idx: number) => {
          let hCount = 0;
          let sCount = 0;
          let iCount = 0;
          let aCount = 0;

          const dateStatusCols = Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = String(i + 1).padStart(2, '0');
            const dateStr = `${exportYear}-${exportMonth}-${dayNum}`;
            const match = data.attendanceRecords.find(
              (r: any) => r.student_id === student.id && r.date === dateStr
            );
            if (match) {
              const status = match.status;
              if (status === 'hadir') { hCount++; return 'H'; }
              if (status === 'sakit') { sCount++; return 'S'; }
              if (status === 'izin') { iCount++; return 'I'; }
              if (status === 'alpa') { aCount++; return 'A'; }
            }
            return '-';
          });

          return [
            idx + 1,
            student.name,
            student.nisn,
            ...dateStatusCols,
            hCount,
            sCount,
            iCount,
            aCount
          ];
        });

        const className = selectedClass === 'all' 
          ? 'Semua_Kelas' 
          : classes.find(c => c.id === selectedClass)?.name || selectedClass;
        const cleanClassName = className.replace(/\s+/g, '_');
        const filename = `Rekap_Presensi_Bulanan_${cleanClassName}_${exportYear}_${exportMonth}`;

        if (format === 'csv') {
          if (printWindow) printWindow.close();
          exportToCSV(`${filename}.csv`, headers, rows);
        } else if (format === 'excel') {
          if (printWindow) printWindow.close();
          exportToExcel(`${filename}.xls`, 'Presensi Bulanan', headers, rows);
        } else if (format === 'pdf') {
          if (printWindow) {
            const monthNames = [
              'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
              'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];
            const monthName = monthNames[monthInt - 1];

            let tableHtml = `<table style="width:100%; border-collapse:collapse; font-size:9px; font-family:sans-serif;" border="1">`;
            tableHtml += `<thead><tr style="background:#f1f5f9;">`;
            headers.forEach(h => {
              tableHtml += `<th style="padding:4px; text-align:center;">${h}</th>`;
            });
            tableHtml += `</tr></thead><tbody>`;
            rows.forEach((row: any) => {
              tableHtml += `<tr>`;
              row.forEach((cell: any, cIdx: number) => {
                let cellStyle = 'padding:4px;';
                if (cIdx >= 3) cellStyle += 'text-align:center;';
                if (cell === 'H') cellStyle += 'color:#059669; font-weight:bold;';
                if (cell === 'S') cellStyle += 'color:#2563eb; font-weight:bold;';
                if (cell === 'I') cellStyle += 'color:#d97706; font-weight:bold;';
                if (cell === 'A') cellStyle += 'color:#dc2626; font-weight:bold;';
                tableHtml += `<td style="${cellStyle}">${cell}</td>`;
              });
              tableHtml += `</tr>`;
            });
            tableHtml += `</tbody></table>`;

            const html = `
              <html>
              <head>
                <title>Rekap Presensi Bulanan - ${className}</title>
                <style>
                  @page { size: A4 landscape; margin: 10mm; }
                  body { font-family: sans-serif; padding: 20px; color: #0f172a; }
                  .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                  .header h1 { margin: 0; font-size: 16px; text-transform: uppercase; }
                  .header h2 { margin: 4px 0 0 0; font-size: 14px; color: #4f46e5; }
                  .meta { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 10px; font-weight: bold; }
                  .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px; }
                  .sig-box { text-align: center; width: 200px; }
                  .sig-space { height: 60px; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>Laporan Rekapitulasi Presensi Bulanan Siswa</h1>
                  <h2>${className} - Bulan ${monthName} ${exportYear}</h2>
                </div>
                <div class="meta">
                  <span>Sekolah: SDN 01 Menteng Jakarta</span>
                  <span>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}</span>
                </div>
                ${tableHtml}
                <div class="footer">
                  <div class="sig-box">
                    <p>Mengetahui,</p>
                    <p>Kepala Sekolah</p>
                    <div class="sig-space"></div>
                    <p>___________________</p>
                    <p>NIP. 197802112003121002</p>
                  </div>
                  <div class="sig-box">
                    <p>Jakarta, ${new Date().getDate()} ${monthName} ${exportYear}</p>
                    <p>Wali Kelas</p>
                    <div class="sig-space"></div>
                    <p>___________________</p>
                    <p>NIP. -</p>
                  </div>
                </div>
                <script>
                  window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                  }
                </script>
              </body>
              </html>
            `;
            printWindow.document.open();
            printWindow.document.write(html);
            printWindow.document.close();
          }
        }
      } else {
        if (printWindow) printWindow.close();
      }
    } catch (err) {
      console.error('Monthly export failed:', err);
      if (printWindow) printWindow.close();
    } finally {
      setExportingMonthly(false);
      setShowMonthlyExportModal(false);
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <DashboardLayout activeMenu="attendance" pageTitle="Absensi Siswa" pageSubtitle={`Pencatatan kehadiran harian — ${formatDateDisplay(selectedDate)}`}>

      {/* Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes successSlide { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseGreen { 0%, 100% { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.4); } 50% { box-shadow: 0 0 0 8px rgba(5, 150, 105, 0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          aside, header, select, input, button, .no-print, [id^="btn-"], [id^="select-"], [id^="input-"] {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          body {
            background-color: #ffffff !important;
          }
        }
      ` }} />

      {/* Success Banner */}
      {successBanner && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: '#ffffff', padding: '14px 24px', borderRadius: '14px',
          fontWeight: 700, fontSize: '0.9rem',
          boxShadow: '0 12px 32px -4px rgba(5, 150, 105, 0.4)',
          animation: 'successSlide 0.3s ease-out',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '1.2rem' }}>📋</span>
          {successBanner}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
           SECTION 1: FILTER BAR & STATS HEADER
         ════════════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'flex-end', animation: 'fadeInUp 0.4s ease-out' }}>
        {/* Class Selector */}
        <div style={{ flex: '0 0 auto' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kelas</label>
          <select
            id="select-class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{
              padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0',
              fontSize: '0.88rem', fontWeight: 600, color: '#0f172a',
              backgroundColor: '#ffffff', cursor: 'pointer', outline: 'none',
              minWidth: '180px', transition: 'all 0.2s ease',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
          >
            <option value="all">📚 Semua Kelas</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>🏫 {cls.name}</option>
            ))}
          </select>
        </div>

        {/* Date Selector */}
        <div style={{ flex: '0 0 auto' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tanggal</label>
          <input
            id="input-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0',
              fontSize: '0.88rem', fontWeight: 600, color: '#0f172a',
              backgroundColor: '#ffffff', outline: 'none', minWidth: '180px',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
          />
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <button
            id="btn-mark-all-present"
            onClick={handleMarkAllPresent}
            disabled={students.length === 0}
            style={{
              padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(5, 150, 105, 0.3)',
              background: 'rgba(5, 150, 105, 0.08)', color: '#059669',
              fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(5, 150, 105, 0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(5, 150, 105, 0.08)'; }}
          >
            ✅ Hadirkan Semua
          </button>

          <button
            id="btn-save-attendance"
            onClick={handleSaveAll}
            disabled={saving || students.length === 0}
            style={{
              padding: '10px 24px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 6px 20px -4px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px -4px rgba(99, 102, 241, 0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px -4px rgba(99, 102, 241, 0.4)'; }}
          >
            {saving ? (
              <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Menyimpan...</>
            ) : (
              <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg> Simpan Absensi</>
            )}
          </button>

          {/* Export Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              id="btn-export-dropdown"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={students.length === 0}
              style={{
                padding: '10px 18px', borderRadius: '12px', border: '1px solid #e2e8f0',
                background: '#ffffff', color: '#0f172a',
                fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              📥 Ekspor / Cetak <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showExportMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            {showExportMenu && (
              <>
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} onClick={() => setShowExportMenu(false)} />
                <div style={{
                  position: 'absolute', right: 0, marginTop: '8px', width: '220px',
                  background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  zIndex: 1000, padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px',
                  animation: 'slideDown 0.2s ease-out'
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Harian ({selectedDate})</div>
                  <button
                    onClick={() => { handleExport('excel'); setShowExportMenu(false); }}
                    style={{
                      padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent',
                      textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#10b981'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1e293b'; }}
                  >
                    🟢 Excel (.xls)
                  </button>
                  <button
                    onClick={() => { handleExport('csv'); setShowExportMenu(false); }}
                    style={{
                      padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent',
                      textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0284c7'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1e293b'; }}
                  >
                    🔵 CSV (.csv)
                  </button>
                  <button
                    onClick={() => { handleExport('pdf'); setShowExportMenu(false); }}
                    style={{
                      padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent',
                      textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#ef4444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1e293b'; }}
                  >
                    🔴 Cetak Harian PDF
                  </button>
                  
                  <hr style={{ border: 0, borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bulanan (1 Bulan Grid)</div>
                  <button
                    onClick={() => { setShowMonthlyExportModal(true); setShowExportMenu(false); }}
                    style={{
                      padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent',
                      textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#6366f1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1e293b'; }}
                  >
                    📊 Rekap Bulanan (Grid)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px',
        marginBottom: '28px', animation: 'fadeInUp 0.5s ease-out',
      }}>
        {/* Total Siswa */}
        <div style={{
          background: '#ffffff', borderRadius: '16px', padding: '20px 24px',
          border: '1px solid #e2e8f0', boxShadow: '0 4px 12px -4px rgba(15, 23, 42, 0.04)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px -8px rgba(99, 102, 241, 0.12)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px -4px rgba(15, 23, 42, 0.04)'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Siswa</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{stats.total}</h3>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px -4px rgba(99, 102, 241, 0.35)' }}>
              <span style={{ fontSize: '1.2rem' }}>👨‍🎓</span>
            </div>
          </div>
          {stats.belumDiisi > 0 && (
            <p style={{ fontSize: '0.7rem', color: '#f59e0b', margin: '8px 0 0 0', fontWeight: 600 }}>⏳ {stats.belumDiisi} belum diisi</p>
          )}
        </div>

        {/* Hadir */}
        <div style={{
          background: '#ffffff', borderRadius: '16px', padding: '20px 24px',
          border: '1px solid rgba(5, 150, 105, 0.2)', boxShadow: '0 4px 12px -4px rgba(5, 150, 105, 0.06)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px -8px rgba(5, 150, 105, 0.15)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px -4px rgba(5, 150, 105, 0.06)'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hadir</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', margin: 0 }}>{stats.hadir}</h3>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px -4px rgba(5, 150, 105, 0.35)' }}>
              <span style={{ fontSize: '1.2rem' }}>✅</span>
            </div>
          </div>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '8px 0 0 0', fontWeight: 500 }}>Tingkat kehadiran: <strong style={{ color: attendanceRate >= 85 ? '#059669' : '#dc2626' }}>{attendanceRate}%</strong></p>
        </div>

        {/* Sakit + Izin */}
        <div style={{
          background: '#ffffff', borderRadius: '16px', padding: '20px 24px',
          border: '1px solid rgba(217, 119, 6, 0.2)', boxShadow: '0 4px 12px -4px rgba(217, 119, 6, 0.06)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px -8px rgba(217, 119, 6, 0.15)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px -4px rgba(217, 119, 6, 0.06)'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sakit / Izin</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706', margin: 0 }}>{stats.sakitIzin}</h3>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px -4px rgba(217, 119, 6, 0.35)' }}>
              <span style={{ fontSize: '1.2rem' }}>📋</span>
            </div>
          </div>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '8px 0 0 0', fontWeight: 500 }}>Perlu keterangan</p>
        </div>

        {/* Alpa */}
        <div style={{
          background: '#ffffff', borderRadius: '16px', padding: '20px 24px',
          border: stats.alpa > 0 ? '1px solid rgba(220, 38, 38, 0.3)' : '1px solid #e2e8f0',
          boxShadow: stats.alpa > 0 ? '0 4px 12px -4px rgba(220, 38, 38, 0.1)' : '0 4px 12px -4px rgba(15, 23, 42, 0.04)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px -8px rgba(220, 38, 38, 0.15)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = stats.alpa > 0 ? '0 4px 12px -4px rgba(220, 38, 38, 0.1)' : '0 4px 12px -4px rgba(15, 23, 42, 0.04)'; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alpa</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: stats.alpa > 0 ? '#dc2626' : '#0f172a', margin: 0 }}>{stats.alpa}</h3>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)' }}>
              <span style={{ fontSize: '1.2rem' }}>❌</span>
            </div>
          </div>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '8px 0 0 0', fontWeight: 500 }}>Tanpa keterangan</p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
           SECTION 2: ATTENDANCE MATRIX TABLE
         ════════════════════════════════════════════════════════════════ */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ height: '56px', borderRadius: '12px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div style={{
          background: '#ffffff', borderRadius: '20px', padding: '56px 40px',
          textAlign: 'center', border: '1px solid #e2e8f0', animation: 'fadeInUp 0.5s ease-out',
        }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <span style={{ fontSize: '1.8rem' }}>📋</span>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>Tidak Ada Siswa</h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
            Belum ada siswa yang terdaftar di kelas ini. Tambahkan siswa melalui halaman Manajemen Kelas terlebih dahulu.
          </p>
        </div>
      ) : (
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{
            background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0',
            overflow: 'hidden', animation: 'fadeInUp 0.6s ease-out',
            boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.04)',
            minWidth: '860px'
          }}>
          {/* Table Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '60px 80px 1fr 320px 200px',
            padding: '14px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0',
            fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <span>No.</span>
            <span>NISN</span>
            <span>Nama Siswa</span>
            <span style={{ textAlign: 'center' }}>Status Kehadiran</span>
            <span>Keterangan</span>
          </div>

          {/* Table Body */}
          {mergedStudents.map((student, idx) => {
            const isAlpa = student.currentStatus === 'alpa';
            return (
              <div
                key={student.id}
                style={{
                  display: 'grid', gridTemplateColumns: '60px 80px 1fr 320px 200px',
                  padding: '12px 24px', alignItems: 'center',
                  borderBottom: idx < mergedStudents.length - 1 ? '1px solid #f1f5f9' : 'none',
                  backgroundColor: isAlpa ? 'rgba(220, 38, 38, 0.03)' : 'transparent',
                  transition: 'all 0.2s ease',
                  animation: `fadeInUp ${0.3 + idx * 0.05}s ease-out`,
                }}
                onMouseEnter={(e) => { if (!isAlpa) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isAlpa ? 'rgba(220, 38, 38, 0.03)' : 'transparent'; }}
              >
                {/* No */}
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8' }}>{idx + 1}</span>

                {/* NISN */}
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', fontFamily: 'monospace' }}>{student.nisn}</span>

                {/* Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '10px',
                    background: `linear-gradient(135deg, hsl(${(idx * 47) % 360}, 60%, 55%), hsl(${(idx * 47 + 40) % 360}, 60%, 45%))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ffffff', fontSize: '0.72rem', fontWeight: 800, flexShrink: 0,
                  }}>
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{student.name}</span>
                </div>

                {/* Status Buttons */}
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                  {(['hadir', 'sakit', 'izin', 'alpa'] as const).map((statusKey) => {
                    const config = STATUS_CONFIG[statusKey];
                    const isActive = student.currentStatus === statusKey;
                    return (
                      <button
                        key={statusKey}
                        onClick={() => setStatus(student.id, statusKey)}
                        style={{
                          padding: '6px 14px', borderRadius: '10px',
                          fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                          border: isActive ? `1.5px solid ${config.borderColor}` : '1.5px solid transparent',
                          backgroundColor: isActive ? config.bgColor : '#f8fafc',
                          color: isActive ? config.color : '#94a3b8',
                          transition: 'all 0.2s ease',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = config.bgColor;
                            e.currentTarget.style.color = config.color;
                            e.currentTarget.style.borderColor = config.borderColor;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                            e.currentTarget.style.color = '#94a3b8';
                            e.currentTarget.style.borderColor = 'transparent';
                          }
                        }}
                      >
                        {isActive && <span style={{ fontSize: '0.7rem' }}>{config.icon}</span>}
                        {config.label}
                      </button>
                    );
                  })}
                </div>

                {/* Notes */}
                <div>
                  {(student.currentStatus === 'sakit' || student.currentStatus === 'izin') ? (
                    <input
                      type="text"
                      placeholder="Tulis alasan..."
                      value={student.currentNotes}
                      onChange={(e) => setNotes(student.id, e.target.value)}
                      style={{
                        width: '100%', padding: '6px 12px', borderRadius: '8px',
                        border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#0f172a',
                        outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box',
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.1)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>—</span>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
           SECTION 3: DAILY SUMMARY CARD
         ════════════════════════════════════════════════════════════════ */}
      {!loading && students.length > 0 && (
        <div style={{
          marginTop: '28px', background: '#ffffff', borderRadius: '20px',
          padding: '28px', border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -4px rgba(15, 23, 42, 0.04)',
          animation: 'fadeInUp 0.7s ease-out',
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📊 Rekap Kehadiran — {formatDateDisplay(selectedDate)}
          </h3>

          {/* Progress Bar */}
          <div style={{ display: 'flex', height: '28px', borderRadius: '14px', overflow: 'hidden', marginBottom: '18px', backgroundColor: '#f1f5f9' }}>
            {stats.hadir > 0 && (
              <div style={{
                width: `${(stats.hadir / stats.total) * 100}%`,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, color: '#ffffff',
                transition: 'width 0.5s ease',
              }}>
                {stats.hadir > 0 && `${stats.hadir} Hadir`}
              </div>
            )}
            {mergedStudents.filter(s => s.currentStatus === 'sakit').length > 0 && (
              <div style={{
                width: `${(mergedStudents.filter(s => s.currentStatus === 'sakit').length / stats.total) * 100}%`,
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, color: '#ffffff',
                transition: 'width 0.5s ease',
              }}>
                Sakit
              </div>
            )}
            {mergedStudents.filter(s => s.currentStatus === 'izin').length > 0 && (
              <div style={{
                width: `${(mergedStudents.filter(s => s.currentStatus === 'izin').length / stats.total) * 100}%`,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, color: '#ffffff',
                transition: 'width 0.5s ease',
              }}>
                Izin
              </div>
            )}
            {stats.alpa > 0 && (
              <div style={{
                width: `${(stats.alpa / stats.total) * 100}%`,
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, color: '#ffffff',
                transition: 'width 0.5s ease',
              }}>
                {stats.alpa} Alpa
              </div>
            )}
            {stats.belumDiisi > 0 && (
              <div style={{
                width: `${(stats.belumDiisi / stats.total) * 100}%`,
                background: '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8',
                transition: 'width 0.5s ease',
              }}>
                Belum diisi
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: alpaStudents.length > 0 ? '18px' : '0' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#059669', display: 'inline-block' }} />
              Hadir: {stats.hadir}
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#2563eb', display: 'inline-block' }} />
              Sakit: {mergedStudents.filter(s => s.currentStatus === 'sakit').length}
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#d97706', display: 'inline-block' }} />
              Izin: {mergedStudents.filter(s => s.currentStatus === 'izin').length}
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#dc2626', display: 'inline-block' }} />
              Alpa: {stats.alpa}
            </span>
          </div>

          {/* Alpa Students Alert */}
          {alpaStudents.length > 0 && (
            <div style={{
              padding: '14px 18px', borderRadius: '12px',
              backgroundColor: 'rgba(220, 38, 38, 0.05)',
              border: '1px solid rgba(220, 38, 38, 0.15)',
              animation: 'slideDown 0.3s ease-out',
            }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#dc2626', margin: '0 0 8px 0' }}>
                ⚠️ Siswa Tanpa Keterangan (Alpa):
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {alpaStudents.map((s) => (
                  <span key={s.id} style={{
                    padding: '4px 12px', borderRadius: '99px',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    color: '#dc2626', fontSize: '0.75rem', fontWeight: 700,
                  }}>
                    ❌ {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monthly Export Modal */}
      {showMonthlyExportModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
          zIndex: 9999, animation: 'fadeIn 0.25s ease-out',
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '20px', width: '420px', padding: '28px',
            border: '1px solid #cbd5e1', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
            animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📊 Rekap Presensi Bulanan
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.4 }}>
              Pilih bulan dan tahun laporan presensi kelas yang ingin Anda ekspor atau cetak.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bulan</label>
                <select
                  value={exportMonth}
                  onChange={(e) => setExportMonth(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0',
                    fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', backgroundColor: '#ffffff', outline: 'none'
                  }}
                >
                  <option value="01">Januari</option>
                  <option value="02">Februari</option>
                  <option value="03">Maret</option>
                  <option value="04">April</option>
                  <option value="05">Mei</option>
                  <option value="06">Juni</option>
                  <option value="07">Juli</option>
                  <option value="08">Agustus</option>
                  <option value="09">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tahun</label>
                <select
                  value={exportYear}
                  onChange={(e) => setExportYear(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0',
                    fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', backgroundColor: '#ffffff', outline: 'none'
                  }}
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => handleMonthlyExport('excel')}
                  disabled={exportingMonthly}
                  style={{
                    padding: '10px', borderRadius: '10px', border: '1px solid rgba(5, 150, 105, 0.3)',
                    background: 'rgba(5, 150, 105, 0.06)', color: '#059669', fontSize: '0.82rem', fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(5, 150, 105, 0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(5, 150, 105, 0.06)'; }}
                >
                  🟢 Excel (.xls)
                </button>
                <button
                  onClick={() => handleMonthlyExport('csv')}
                  disabled={exportingMonthly}
                  style={{
                    padding: '10px', borderRadius: '10px', border: '1px solid rgba(2, 132, 199, 0.3)',
                    background: 'rgba(2, 132, 199, 0.06)', color: '#0284c7', fontSize: '0.82rem', fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(2, 132, 199, 0.12)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(2, 132, 199, 0.06)'; }}
                >
                  🔵 CSV (.csv)
                </button>
              </div>

              <button
                onClick={() => handleMonthlyExport('pdf')}
                disabled={exportingMonthly}
                style={{
                  padding: '11px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#ffffff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)', transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(99, 102, 241, 0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.2)'; }}
              >
                🔴 Cetak Landscape PDF 🖨️
              </button>

              <button
                onClick={() => setShowMonthlyExportModal(false)}
                disabled={exportingMonthly}
                style={{
                  padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1',
                  background: 'transparent', color: '#64748b', fontSize: '0.82rem', fontWeight: 600,
                  cursor: 'pointer', marginTop: '8px', transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
