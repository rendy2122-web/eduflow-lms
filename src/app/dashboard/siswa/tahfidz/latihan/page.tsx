'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LatihanTahfidzPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/siswa/tahfidz');
  }, [router]);

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#64748b' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Mengalihkan ke Jurnal Hafalan...</p>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f1f5f9', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '16px auto' }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
