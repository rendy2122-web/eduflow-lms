'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { exportToCSV, exportToExcel } from '@/utils/export';

interface TransactionItem {
  id: string;
  type: 'masuk' | 'keluar';
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface MonthlyDataItem {
  month: string;
  masuk: number;
  keluar: number;
}

export default function AdminFinancePage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataItem[]>([]);
  const [totalMasuk, setTotalMasuk] = useState(0);
  const [totalKeluar, setTotalKeluar] = useState(0);
  const [saldoBersih, setSaldoBersih] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [schoolName, setSchoolName] = useState('Sekolah Global EduFlow');

  // States form input baru (Modal)
  const [showAddForm, setShowAddForm] = useState(false);
  const [type, setType] = useState<'masuk' | 'keluar'>('masuk');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('SPP Siswa');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // States filter mutasi
  const [filterType, setFilterType] = useState<'semua' | 'masuk' | 'keluar'>('semua');
  const [filterCategory, setFilterCategory] = useState<string>('semua');

  // Chart Tooltip state
  const [hoveredBar, setHoveredBar] = useState<{
    month: string;
    type: 'masuk' | 'keluar';
    amount: number;
    x: number;
    y: number;
  } | null>(null);

  // Notification Banner State
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Fetch data keuangan
  async function fetchFinanceData() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/finance/summary');
      const json = await res.json();
      if (json.success) {
        setTransactions(json.transactions);
        setMonthlyData(json.monthlyData);
        setTotalMasuk(json.totalMasuk);
        setTotalKeluar(json.totalKeluar);
        setSaldoBersih(json.saldoBersih);
        if (json.schoolName) {
          setSchoolName(json.schoolName);
        }
      }
    } catch (err) {
      console.error('Error fetching finance summary:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/finance/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          amount: parsedAmount,
          category,
          description,
          date
        })
      });
      const json = await res.json();
      if (json.success) {
        showSuccess('Catatan transaksi berhasil disimpan! 💳');
        await fetchFinanceData();
        // Reset Form
        setAmount('');
        setDescription('');
        setShowAddForm(false);
      } else {
        alert('Gagal menyimpan transaksi: ' + json.error);
      }
    } catch (err) {
      console.error('Error posting transaction:', err);
    } finally {
      setSaving(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessBanner(message);
    setTimeout(() => setSuccessBanner(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = (format: 'excel' | 'csv') => {
    const filename = `Buku_Besar_Kas_${filterType}_${filterCategory}_${new Date().toISOString().split('T')[0]}`;
    
    // Sort chronologically to compute running balance correctly
    const chronologicalTx = [...filteredTransactions].sort((a, b) => a.date.localeCompare(b.date));
    
    const headers = ['No', 'Tanggal', 'Kategori', 'Keterangan', 'Pemasukan (Debit)', 'Pengeluaran (Kredit)', 'Saldo Berjalan'];
    let runningBalance = 0;

    const rows = chronologicalTx.map((tx, idx) => {
      const masuk = tx.type === 'masuk' ? tx.amount : 0;
      const keluar = tx.type === 'keluar' ? tx.amount : 0;
      runningBalance += masuk - keluar;

      return [
        idx + 1,
        formatDateDisplay(tx.date),
        tx.category,
        tx.description || '-',
        masuk > 0 ? masuk : 0,
        keluar > 0 ? keluar : 0,
        runningBalance
      ];
    });

    // Append summary rows
    rows.push(['', '', '', '', '', '', '']);
    rows.push(['Ringkasan', 'Total Pemasukan', '', '', '', '', totalMasuk]);
    rows.push(['Ringkasan', 'Total Pengeluaran', '', '', '', '', totalKeluar]);
    rows.push(['Ringkasan', 'Saldo Akhir', '', '', '', '', saldoBersih]);

    if (format === 'csv') {
      exportToCSV(`${filename}.csv`, headers, rows);
    } else {
      exportToExcel(`${filename}.xls`, 'Buku Kas Ledger', headers, rows);
    }
  };

  // Filter logika
  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'semua' || t.type === filterType;
    const matchesCategory = filterCategory === 'semua' || t.category === filterCategory;
    return matchesType && matchesCategory;
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const formatRupiahShort = (val: number) => {
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}jt`;
    if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}rb`;
    return `Rp ${val}`;
  };

  const maxVal = monthlyData.length > 0
    ? Math.max(...monthlyData.map(d => Math.max(d.masuk, d.keluar)), 1000000)
    : 10000000;

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <DashboardLayout activeMenu="finance" pageTitle="Keuangan Sekolah" pageSubtitle="Laporan Kas Masuk, Kas Keluar, dan Saldo Bersih Terintegrasi Database.">
      
      {/* Visual Animation & Glow Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scaleIn {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease-out forwards;
        }
        .card-glow-green {
          box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.05), 0 0 1px 1px rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.15) !important;
          transition: all 0.3s ease;
        }
        .card-glow-green:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -5px rgba(16, 185, 129, 0.12), 0 0 1px 1px rgba(16, 185, 129, 0.25);
        }
        .card-glow-red {
          box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.05), 0 0 1px 1px rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.15) !important;
          transition: all 0.3s ease;
        }
        .card-glow-red:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -5px rgba(239, 68, 68, 0.12), 0 0 1px 1px rgba(239, 68, 68, 0.25);
        }
        .card-glow-blue {
          box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.05), 0 0 1px 1px rgba(79, 70, 229, 0.1);
          border: 1px solid rgba(79, 70, 229, 0.15) !important;
          transition: all 0.3s ease;
        }
        .card-glow-blue:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -5px rgba(79, 70, 229, 0.12), 0 0 1px 1px rgba(79, 70, 229, 0.25);
        }
        .tr-hover:hover {
          background-color: #f8fafc !important;
        }
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
          <span style={{ fontSize: '1.2rem' }}>💰</span>
          {successBanner}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* ════════════════════════════════════════════════════════════════
             SECTION 1: TITLE & ACTION HEADER
           ════════════════════════════════════════════════════════════════ */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 850, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Kas & Arus Keuangan</h1>
            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '4px 0 0 0' }}>Kelola pencatatan masuk/keluar untuk memantau neraca kas operasional sekolah.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              id="btn-print-report"
              className="btn-secondary" 
              onClick={handlePrint}
              style={{ padding: '10px 18px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}
            >
              🖨️ Cetak Laporan PDF
            </button>

            {/* Export Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                id="btn-export-dropdown"
                onClick={() => setShowExportMenu(!showExportMenu)}
                style={{
                  padding: '10px 18px', borderRadius: '12px', border: '1px solid #e2e8f0',
                  background: '#ffffff', color: '#0f172a',
                  fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                📥 Ekspor <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showExportMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              {showExportMenu && (
                <>
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} onClick={() => setShowExportMenu(false)} />
                  <div style={{
                    position: 'absolute', right: 0, marginTop: '8px', width: '180px',
                    background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                    zIndex: 1000, padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px',
                    animation: 'slideDown 0.2s ease-out'
                  }}>
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
                  </div>
                </>
              )}
            </div>

            <button 
              id="btn-add-tx-toggle"
              className="btn-primary" 
              onClick={() => {
                setType('masuk');
                setCategory('SPP Siswa');
                setShowAddForm(true);
              }}
              style={{ padding: '10px 18px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', border: 'none', color: '#ffffff', boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.3)' }}
            >
              ➕ Catat Transaksi Baru
            </button>
          </div>
        </div>

        {/* PRINT ONLY HEADER */}
        <div className="print-only" style={{ display: 'none', marginBottom: '24px', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px double #0f172a', paddingBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>YAYASAN PENDIDIKAN {schoolName.toUpperCase()}</h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#475569' }}>Jl. Pembelajaran No. 42, Wilayah {schoolName} | Telp: (021) 555-0199</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ margin: 0, color: '#4f46e5', fontWeight: 800 }}>LAPORAN ARUS KAS</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
             SECTION 2: CASHFLOW STATS (3 CARDS)
           ════════════════════════════════════════════════════════════════ */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Card 1: Pemasukan */}
          <div className="card-premium card-glow-green" style={{ background: '#ffffff', borderRadius: '18px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Total Pemasukan</p>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 850, color: '#0f172a', margin: 0 }}>
                {loading ? 'Memuat...' : formatRupiah(totalMasuk)}
              </h3>
            </div>
          </div>

          {/* Card 2: Pengeluaran */}
          <div className="card-premium card-glow-red" style={{ background: '#ffffff', borderRadius: '18px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Total Pengeluaran</p>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 850, color: '#0f172a', margin: 0 }}>
                {loading ? 'Memuat...' : formatRupiah(totalKeluar)}
              </h3>
            </div>
          </div>

          {/* Card 3: Saldo Bersih */}
          <div className="card-premium card-glow-blue" style={{ background: '#ffffff', borderRadius: '18px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Saldo Bersih Kas</p>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 850, color: '#4f46e5', margin: 0 }}>
                {loading ? 'Memuat...' : formatRupiah(saldoBersih)}
              </h3>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
             SECTION 3: INTERACTIVE SVG BAR CHART
           ════════════════════════════════════════════════════════════════ */}
        <section className="card-premium no-print" style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Grafik Perbandingan Arus Kas Bulanan</h2>
            <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '4px 0 24px 0' }}>Visualisasi data masuk (hijau) vs keluar (merah) dalam 6 bulan terakhir.</p>
          </div>

          <div style={{ position: 'relative' }}>
            {loading || monthlyData.length === 0 ? (
              <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
                Memuat bagan kas bulanan...
              </div>
            ) : (
              <div style={{ position: 'relative', width: '100%' }}>
                {/* SVG Chart */}
                <svg viewBox="0 0 600 240" style={{ width: '100%', height: 'auto', display: 'block' }}>
                  {/* Grid Lines */}
                  {[0, 1, 2, 3, 4].map((i) => {
                    const yVal = 20 + i * 45;
                    return (
                      <g key={i}>
                        <line x1="60" y1={yVal} x2="580" y2={yVal} stroke="#f1f5f9" strokeWidth="1.5" />
                        {/* Y-Axis Label */}
                        <text x="50" y={yVal + 4} fill="#94a3b8" fontSize="10" fontWeight="600" textAnchor="end">
                          {formatRupiahShort(maxVal - (maxVal / 4) * i)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Base Bottom line */}
                  <line x1="60" y1="200" x2="580" y2="200" stroke="#cbd5e1" strokeWidth="2" />
                  <text x="50" y="204" fill="#94a3b8" fontSize="10" fontWeight="600" textAnchor="end">Rp 0</text>

                  {/* Bars Mapping */}
                  {monthlyData.map((d, index) => {
                    const xCenter = 60 + (520 / 6) * index + (520 / 6) / 2;
                    
                    const heightMasuk = (d.masuk / maxVal) * 180;
                    const heightKeluar = (d.keluar / maxVal) * 180;

                    const yMasuk = 200 - heightMasuk;
                    const yKeluar = 200 - heightKeluar;

                    const barWidth = 14;
                    const xMasuk = xCenter - 16;
                    const xKeluar = xCenter + 2;

                    return (
                      <g key={index}>
                        {/* Batang Masuk (Green) */}
                        <rect
                          x={xMasuk}
                          y={yMasuk}
                          width={barWidth}
                          height={Math.max(3, heightMasuk)}
                          rx="3"
                          ry="3"
                          fill="url(#gradMasuk)"
                          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.setAttribute('fill', '#059669');
                            setHoveredBar({
                              month: d.month,
                              type: 'masuk',
                              amount: d.masuk,
                              x: xMasuk + barWidth / 2,
                              y: yMasuk
                            });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.setAttribute('fill', 'url(#gradMasuk)');
                            setHoveredBar(null);
                          }}
                        />

                        {/* Batang Keluar (Red) */}
                        <rect
                          x={xKeluar}
                          y={yKeluar}
                          width={barWidth}
                          height={Math.max(3, heightKeluar)}
                          rx="3"
                          ry="3"
                          fill="url(#gradKeluar)"
                          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.setAttribute('fill', '#dc2626');
                            setHoveredBar({
                              month: d.month,
                              type: 'keluar',
                              amount: d.keluar,
                              x: xKeluar + barWidth / 2,
                              y: yKeluar
                            });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.setAttribute('fill', 'url(#gradKeluar)');
                            setHoveredBar(null);
                          }}
                        />

                        {/* Month Label */}
                        <text x={xCenter} y="222" fill="#64748b" fontSize="11" fontWeight="700" textAnchor="middle">
                          {d.month}
                        </text>
                      </g>
                    );
                  })}

                  {/* Definitions of Gradients */}
                  <defs>
                    <linearGradient id="gradMasuk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                    <linearGradient id="gradKeluar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f87171" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Mathematically Positioned Tooltip */}
                {hoveredBar && (
                  <div style={{
                    position: 'absolute',
                    left: `${(hoveredBar.x / 600) * 100}%`,
                    top: `${(hoveredBar.y / 240) * 100}%`,
                    transform: 'translate(-50%, -115%)',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    pointerEvents: 'none',
                    boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.3)',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    animation: 'scaleIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                  }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {hoveredBar.month} • {hoveredBar.type === 'masuk' ? 'Uang Masuk' : 'Uang Keluar'}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: hoveredBar.type === 'masuk' ? '#34d399' : '#f87171' }}>
                      {formatRupiah(hoveredBar.amount)}
                    </span>
                    <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #0f172a', position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)' }} />
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
             SECTION 4: MODAL FORM TRANSACTION (GLASSMORPHIC BACKDROP)
           ════════════════════════════════════════════════════════════════ */}
        {showAddForm && (
          <div className="animate-fade-in" style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backdropFilter: 'blur(8px)', backgroundColor: 'rgba(15, 23, 42, 0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 999, padding: '20px', boxSizing: 'border-box'
          }}>
            <form onSubmit={handleAddTransaction} className="animate-scale-in" style={{
              background: '#ffffff', borderRadius: '24px', padding: '36px',
              maxWidth: '520px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', border: '1px solid #e2e8f0'
            }}>
              
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Catat Mutasi Kas Baru</h2>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#64748b', cursor: 'pointer', fontWeight: 700 }}
                >
                  ✕
                </button>
              </div>

              {/* Transaction Type Radio Selector */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '8px' }}>Jenis Transaksi</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => { setType('masuk'); setCategory('SPP Siswa'); }}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', border: 'none',
                      backgroundColor: type === 'masuk' ? '#dcfce7' : '#f8fafc',
                      color: type === 'masuk' ? '#15803d' : '#64748b',
                      transition: 'all 0.2s'
                    }}
                  >
                    📥 Kas Masuk (Pemasukan)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setType('keluar'); setCategory('Operasional'); }}
                    style={{
                      flex: 1, padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', border: 'none',
                      backgroundColor: type === 'keluar' ? '#fee2e2' : '#f8fafc',
                      color: type === 'keluar' ? '#b91c1c' : '#64748b',
                      transition: 'all 0.2s'
                    }}
                  >
                    📤 Kas Keluar (Pengeluaran)
                  </button>
                </div>
              </div>

              {/* Amount and Date Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="tx-amount" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '8px' }}>Nominal (Rp)</label>
                  <input 
                    type="number" 
                    id="tx-amount" 
                    className="form-control" 
                    placeholder="Contoh: 750000"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="tx-date" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '8px' }}>Tanggal Transaksi</label>
                  <input 
                    type="date" 
                    id="tx-date" 
                    className="form-control"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem', fontWeight: 600 }}
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="form-group">
                <label className="form-label" htmlFor="tx-category" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '8px' }}>Kategori Transaksi</label>
                {type === 'masuk' ? (
                  <select 
                    id="tx-category" 
                    className="form-control" 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem', fontWeight: 600 }}
                  >
                    <option value="SPP Siswa">🎓 SPP Siswa</option>
                    <option value="Uang Pangkal">🏫 Uang Pangkal</option>
                    <option value="Donasi">🤝 Donasi & Sponsor</option>
                    <option value="Buku">📚 Buku & Seragam</option>
                    <option value="Lain-lain">💼 Lain-lain</option>
                  </select>
                ) : (
                  <select 
                    id="tx-category" 
                    className="form-control" 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem', fontWeight: 600 }}
                  >
                    <option value="Operasional">🧹 Operasional Harian</option>
                    <option value="Gaji Guru">👨‍🏫 Gaji Guru & Staf</option>
                    <option value="Listrik">⚡ Listrik & Internet</option>
                    <option value="Pemeliharaan">🧱 Pemeliharaan Gedung</option>
                    <option value="Lain-lain">💼 Lain-lain</option>
                  </select>
                )}
              </div>

              {/* Description TextArea */}
              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label className="form-label" htmlFor="tx-desc" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '8px' }}>Keterangan Tambahan</label>
                <textarea 
                  id="tx-desc" 
                  className="form-control" 
                  rows={2}
                  placeholder="Detail keterangan mutasi..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem', resize: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary"
                  style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem' }}
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  id="btn-save-tx"
                  className="btn-primary"
                  disabled={saving}
                  style={{ padding: '10px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', border: 'none', color: '#ffffff' }}
                >
                  {saving ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
             SECTION 5: FILTERS & MUTASI TABLE LOGS
           ════════════════════════════════════════════════════════════════ */}
        <div className="card-premium no-print" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', padding: '16px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          {/* Cashflow Type Switcher */}
          <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            {(['semua', 'masuk', 'keluar'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: filterType === t ? '#4f46e5' : 'transparent',
                  color: filterType === t ? 'white' : '#64748b',
                  transition: 'all 0.2s'
                }}
              >
                {t === 'semua' ? '💼 Semua Kas' : t === 'masuk' ? '📥 Kas Masuk' : '📤 Kas Keluar'}
              </button>
            ))}
          </div>

          {/* Category Filter Selector */}
          <div>
            <select 
              className="form-control"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              style={{
                width: '200px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: 600,
                borderRadius: '10px', border: '1px solid #e2e8f0', color: '#0f172a',
                backgroundColor: '#ffffff', cursor: 'pointer', outline: 'none'
              }}
            >
              <option value="semua">👥 Semua Kategori</option>
              <option value="SPP Siswa">🎓 SPP Siswa</option>
              <option value="Uang Pangkal">🏫 Uang Pangkal</option>
              <option value="Donasi">🤝 Donasi & Sponsor</option>
              <option value="Buku">📚 Buku & Seragam</option>
              <option value="Gaji Guru">👨‍🏫 Gaji Guru</option>
              <option value="Operasional">🧹 Operasional</option>
              <option value="Pemeliharaan">🧱 Pemeliharaan</option>
            </select>
          </div>
        </div>

        {/* Transaction History Log Table */}
        <section className="card-premium" style={{ padding: 0, background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Riwayat Jurnal Mutasi Kas Sekolah</h2>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Menampilkan {filteredTransactions.length} transaksi</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 24px' }}>Tanggal</th>
                  <th style={{ padding: '14px 24px' }}>Kategori</th>
                  <th style={{ padding: '14px 24px' }}>Jenis</th>
                  <th style={{ padding: '14px 24px' }}>Keterangan</th>
                  <th style={{ padding: '14px 24px', textAlign: 'right' }}>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
                      Memuat jurnal mutasi...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
                      <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>🔍</span>
                      Tidak ada catatan transaksi untuk kriteria filter ini.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="tr-hover" style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '12px 24px', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>{formatDateDisplay(tx.date)}</td>
                      <td style={{ padding: '12px 24px', fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>{tx.category}</td>
                      <td style={{ padding: '12px 24px' }}>
                        <span style={{
                          borderRadius: '8px', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700,
                          backgroundColor: tx.type === 'masuk' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: tx.type === 'masuk' ? '#10b981' : '#ef4444',
                          border: tx.type === 'masuk' ? '1.5px solid rgba(16, 185, 129, 0.2)' : '1.5px solid rgba(239, 68, 68, 0.2)',
                          display: 'inline-flex', alignItems: 'center', gap: '3px'
                        }}>
                          {tx.type === 'masuk' ? '📥 Masuk' : '📤 Keluar'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 24px', fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>{tx.description || '-'}</td>
                      <td style={{ 
                        padding: '12px 24px', 
                        textAlign: 'right', 
                        fontSize: '0.88rem',
                        fontWeight: 800, 
                        fontFamily: 'monospace',
                        color: tx.type === 'masuk' ? '#059669' : '#dc2626' 
                      }}>
                        {tx.type === 'masuk' ? '+' : '-'} {formatRupiah(tx.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
      
      {/* Print-specific style rules */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            font-family: system-ui, sans-serif !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          aside {
            display: none !important;
          }
          header {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .card-premium {
            box-shadow: none !important;
            border: none !important;
            background: none !important;
            padding: 0 !important;
          }
          table {
            width: 100% !important;
            border: 1px solid #cbd5e1 !important;
            border-collapse: collapse !important;
          }
          th {
            background-color: #f1f5f9 !important;
            color: black !important;
            border-bottom: 2px solid #cbd5e1 !important;
            padding: 10px 16px !important;
            font-size: 0.75rem !important;
          }
          td {
            border-bottom: 1px solid #e2e8f0 !important;
            padding: 10px 16px !important;
            font-size: 0.75rem !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
