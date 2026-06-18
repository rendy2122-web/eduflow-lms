'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface TeacherItem {
  id: string;
  name: string;
  subject: string;
  status: string;
  image: string;
}

interface MonthlyDataItem {
  month: string;
  masuk: number;
  keluar: number;
}

export default function AdminDashboardPage() {
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataItem[]>([]);
  const [metrics, setMetrics] = useState({ masuk: 0, keluar: 0, saldo: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch financial summary
        const summaryRes = await fetch('/api/admin/finance/summary');
        const summaryJson = await summaryRes.json();

        // Fetch teachers list
        const teachersRes = await fetch('/api/admin/users');
        const teachersJson = await teachersRes.json();

        if (summaryJson.success) {
          setMetrics({
            masuk: summaryJson.totalMasuk,
            keluar: summaryJson.totalKeluar,
            saldo: summaryJson.saldoBersih
          });
          setMonthlyData(summaryJson.monthlyData);
        }

        if (teachersJson.success) {
          setTeachers(teachersJson.teachers);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
  };

  // Kalkulasi data SVG dinamis berdasarkan monthlyData
  const maxVal = monthlyData.length > 0 
    ? Math.max(...monthlyData.map(d => Math.max(d.masuk, d.keluar)), 1000) 
    : 10000;

  // X coordinates map: [50, 150, 250, 350, 450, 550]
  // Y coordinates formula: 150 - (value / maxVal) * 110 (menjaga margin atas 30px dan bawah 150px)
  const getX = (index: number) => index * 100 + 50;
  const getY = (value: number) => 150 - (value / maxVal) * 110;

  // Membuat SVG Path secara dinamis
  const revenuePath = monthlyData.length > 0
    ? monthlyData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.masuk)}`).join(' ')
    : '';

  const revenueArea = monthlyData.length > 0
    ? `${revenuePath} L ${getX(monthlyData.length - 1)} 150 L ${getX(0)} 150 Z`
    : '';

  const expensesPath = monthlyData.length > 0
    ? monthlyData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.keluar)}`).join(' ')
    : '';

  const expensesArea = monthlyData.length > 0
    ? `${expensesPath} L ${getX(monthlyData.length - 1)} 150 L ${getX(0)} 150 Z`
    : '';

  // Hitung persentase donut chart kas masuk vs kas keluar
  const totalFlow = metrics.masuk + metrics.keluar;
  const masukPercent = totalFlow > 0 ? Math.round((metrics.masuk / totalFlow) * 100) : 60;
  const keluarPercent = 100 - masukPercent;

  return (
    <DashboardLayout 
      activeMenu="dashboard" 
      pageTitle="Finance Dashboard" 
      pageSubtitle="Welcome, Admin Sarah!"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Top Metrics Grid (4 Cards) */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px'
        }}>
          {/* Card 1: Revenue */}
          <div className="card-premium" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', margin: 0 }}>Revenue</h3>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>Pemasukan</span>
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#e8fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
            </div>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              {loading ? '...' : formatRupiah(metrics.masuk)}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '10px', height: '10px' }}>
                <polyline points="18 15 12 9 6 15" />
              </svg>
              <span>+12.5% increase</span>
            </div>
          </div>

          {/* Card 2: Expenses */}
          <div className="card-premium" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', margin: 0 }}>Expenses</h3>
                <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 600 }}>Pengeluaran</span>
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fdf2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                  <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
            </div>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              {loading ? '...' : formatRupiah(metrics.keluar)}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#ef4444', fontWeight: 600 }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '10px', height: '10px' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span>-4.1% increase</span>
            </div>
          </div>

          {/* Card 3: Net Income */}
          <div className="card-premium" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', margin: 0 }}>Net Income</h3>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>Sisa Saldo</span>
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#e8fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
            </div>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              {loading ? '...' : formatRupiah(metrics.saldo)}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '10px', height: '10px' }}>
                <polyline points="18 15 12 9 6 15" />
              </svg>
              <span>+18.2% increase</span>
            </div>
          </div>

          {/* Card 4: Cash on Hand */}
          <div className="card-premium" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', margin: 0 }}>Cash on Hand</h3>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Kas Tunai</span>
              </div>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
              </div>
            </div>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
              {loading ? '...' : formatRupiah(metrics.saldo > 0 ? metrics.saldo * 0.65 : 245750)}
            </p>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
              <span>Current Balance</span>
            </div>
          </div>
        </section>

        {/* Charts Section (Two Column Layout) */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Left Block: Financial Performance SVG Line Graph */}
          <div className="card-premium col-span-2-desktop" style={{ 
            background: '#ffffff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '16px', 
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Financial Performance</h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>Revenue vs. Expenses (YTD)</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Legend */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span>Revenue</span>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', marginLeft: '6px' }} />
                  <span>Expenses</span>
                </div>
                {/* Select Dropdown */}
                <select style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  outline: 'none'
                }}>
                  <option>Academic Year (Jan - Dec)</option>
                </select>
              </div>
            </div>

            {/* High-Fidelity SVG Area Graph */}
            <div style={{ position: 'relative', width: '100%', height: '220px', display: 'flex', flexDirection: 'column' }}>
              {loading || monthlyData.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                  Memuat grafik performa...
                </div>
              ) : (
                <>
                  <svg width="100%" height="100%" viewBox="0 0 600 180" preserveAspectRatio="none" style={{ display: 'block' }}>
                    <defs>
                      <linearGradient id="revenue-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                        <stop offset="60%" stopColor="#10b981" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="expenses-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                        <stop offset="60%" stopColor="#ef4444" stopOpacity="0.05" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                      </linearGradient>
                      <filter id="glow-revenue" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#10b981" floodOpacity="0.2" />
                      </filter>
                      <filter id="glow-expenses" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#ef4444" floodOpacity="0.15" />
                      </filter>
                    </defs>

                    {/* Grid Lines */}
                    <line x1="0" y1="30" x2="600" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="75" x2="600" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1="150" x2="600" y2="150" stroke="#cbd5e1" strokeWidth="1.5" />

                    {/* Y-Axis Labels inside */}
                    <text x="5" y="25" fill="#94a3b8" fontSize="8" fontWeight="600">Max</text>
                    <text x="5" y="70" fill="#94a3b8" fontSize="8" fontWeight="600">Mid</text>
                    <text x="5" y="145" fill="#94a3b8" fontSize="8" fontWeight="600">0</text>

                    {/* Revenue Area (Dinamis) */}
                    <path d={`${revenueArea}`} fill="url(#revenue-grad)" />
                    <path d={`${revenuePath}`} fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" filter="url(#glow-revenue)" />

                    {/* Expenses Area (Dinamis) */}
                    <path d={`${expensesArea}`} fill="url(#expenses-grad)" />
                    <path d={`${expensesPath}`} fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" filter="url(#glow-expenses)" />

                    {/* Dots on nodes with double rings for premium look */}
                    {monthlyData.map((d, i) => (
                      <g key={i} style={{ transition: 'all 0.2s' }}>
                        {/* Revenue node */}
                        <circle cx={getX(i)} cy={getY(d.masuk)} r="7" fill="#10b981" fillOpacity="0.15" />
                        <circle cx={getX(i)} cy={getY(d.masuk)} r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                        {/* Expenses node */}
                        <circle cx={getX(i)} cy={getY(d.keluar)} r="7" fill="#ef4444" fillOpacity="0.15" />
                        <circle cx={getX(i)} cy={getY(d.keluar)} r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                      </g>
                    ))}
                  </svg>

                  {/* X-Axis Labels */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px 0 12px', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                    {monthlyData.map((d, i) => (
                      <span key={i}>{d.month}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Donut & Bar Charts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
            
            {/* Box 1: Income Breakdown (Donut Chart) */}
            <div className="card-premium" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
                Income Breakdown <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b', marginLeft: '4px' }}>Donut Chart</span>
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '16px' }}>
                {/* Conic Gradient Circle Donut (Menggunakan persentase dari database) */}
                <div 
                  style={{
                    position: 'relative',
                    width: '110px',
                    height: '110px',
                    borderRadius: '50%',
                    background: `conic-gradient(#10b981 0% ${masukPercent}%, #ef4444 ${masukPercent}% 90%, #3b82f6 90% 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 12px 24px -6px rgba(15, 23, 42, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.4)',
                    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.0)'}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
                  }}>
                    <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '2px' }}>Masuk</span>
                    {loading ? '...' : `${masukPercent}%`}
                  </div>
                </div>

                {/* Donut Legend */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                    <span>Revenue ({loading ? '..' : `${masukPercent}%`})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                    <span>Expenses ({loading ? '..' : `${keluarPercent - 10}%`})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                    <span>Donut (10%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Cashflow Trend (Bar Chart) */}
            <div className="card-premium" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
                Cashflow Trend <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b', marginLeft: '4px' }}>Bar Chart</span>
              </h3>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                height: '80px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '4px',
                gap: '6px'
              }}>
                {loading || monthlyData.length === 0 ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }} />
                ) : (
                  monthlyData.map((d, i) => {
                    const hPercent = Math.max(10, Math.round(((d.masuk - d.keluar) / maxVal) * 100));
                    return (
                      <div key={i} style={{
                        flex: 1,
                        height: `${hPercent}%`,
                        backgroundColor: '#10b981',
                        borderRadius: '3px 3px 0 0',
                        transition: 'all 0.3s'
                      }} title={`Saldo: ${formatRupiah(d.masuk - d.keluar)}`} />
                    );
                  })
                )}
              </div>
              
              {/* Bar X-Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8', paddingTop: '4px' }}>
                {monthlyData.map((d, i) => (
                  <span key={i}>{d.month}</span>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Bottom Section: Teachers Overview Table */}
        <section className="card-premium" style={{ 
          background: '#ffffff', 
          border: '1px solid #e2e8f0', 
          borderRadius: '16px', 
          padding: '24px',
          boxShadow: 'none'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Teachers Overview</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>Overview of current teachers activity status</p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Table
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Teacher</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Subject</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                      Memuat daftar guru...
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher) => (
                    <tr key={teacher.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                          src={teacher.image} 
                          alt={teacher.name} 
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                          {teacher.name}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
                        {teacher.subject}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge ${teacher.status === 'Active' ? 'badge-success' : 'badge-error'}`} style={{
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: teacher.status === 'Active' ? '#e8fdf4' : '#fdf2f2',
                          color: teacher.status === 'Active' ? '#10b981' : '#ef4444'
                        }}>
                          {teacher.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          color: '#4f46e5',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '13px', height: '13px' }}>
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
}
