'use client';

import React, { useState, useCallback } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

type UploadType = 'students' | 'teachers' | 'classes';

export default function BulkUploadPage() {
  const [uploadType, setUploadType] = useState<UploadType>('students');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = useCallback(async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', uploadType);

      const res = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();
      
      if (json.success) {
        setResult(json.result);
      } else {
        alert('Gagal upload: ' + json.error);
      }
    } catch (err: any) {
      alert('Gagal menghubungi server: ' + err.message);
    } finally {
      setUploading(false);
    }
  }, [file, uploadType]);

  const downloadTemplate = (type: UploadType) => {
    let csvContent = '';
    
    if (type === 'students') {
      csvContent = 'nama,email,nisn,kelas,orangTuaEmail,telepon,alamat\n';
      csvContent += 'Ahmad Fauzi,ahmad@example.com,12345,Kelas 4A,ortu@example.com,08123456789,Jakarta\n';
    } else if (type === 'teachers') {
      csvContent = 'nama,email,nip,mapel1,mapel2,mapel3\n';
      csvContent += 'Sarah Jenkins,sarah@example.com,198501012001012001,Matematika,IPA,IPS\n';
    } else if (type === 'classes') {
      csvContent = 'nama,deskripsi\n';
      csvContent += 'Kelas 4A,Kelas 4A SDN Menteng\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `template_${type}.csv`;
    link.click();
  };

  return (
    <DashboardLayout 
      activeMenu="bulk-upload" 
      pageTitle="Upload Data Massal" 
      pageSubtitle="Import data siswa, guru, dan kelas secara bulk menggunakan CSV"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Upload Type Selector */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
            Pilih Jenis Data yang Akan Diupload
          </h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { type: 'students', label: 'Siswa', icon: '👨‍🎓', desc: 'Import data siswa beserta orang tua' },
              { type: 'teachers', label: 'Guru', icon: '👩‍🏫', desc: 'Import data guru dan mapel yang diampu' },
              { type: 'classes', label: 'Kelas', icon: '🏫', desc: 'Import data kelas baru' }
            ].map((option) => (
              <button
                key={option.type}
                onClick={() => {
                  setUploadType(option.type as UploadType);
                  setFile(null);
                  setResult(null);
                }}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '20px',
                  border: uploadType === option.type ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  background: uploadType === option.type ? '#f5f7ff' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{option.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                  {option.label}
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                  {option.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Template Download */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
              📥 Download Template CSV
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
              Download template terlebih dahulu, isi dengan data, lalu upload
            </p>
          </div>
          <button
            onClick={() => downloadTemplate(uploadType)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #4f46e5',
              color: '#4f46e5',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Download Template
          </button>
        </div>

        {/* Upload Area */}
        <div style={{
          background: '#ffffff',
          border: '2px dashed #cbd5e1',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          transition: 'all 0.2s'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📤</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
            Upload File CSV
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 20px 0' }}>
            Seret dan lepas file di sini, atau klik untuk memilih file
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
            }}
          >
            Pilih File CSV
          </label>
          {file && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px', display: 'inline-block' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                📄 {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}
        </div>

        {/* Upload Button */}
        {file && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              padding: '14px 28px',
              borderRadius: '10px',
              background: uploading ? '#e2e8f0' : 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: uploading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              alignSelf: 'flex-start'
            }}
          >
            {uploading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Mengupload...
              </>
            ) : (
              <>🚀 Upload Sekarang</>
            )}
          </button>
        )}

        {/* Result */}
        {result && (
          <div style={{
            background: result.failed === 0 ? '#dcfce7' : '#fef3c7',
            border: `1px solid ${result.failed === 0 ? '#10b981' : '#f59e0b'}`,
            borderRadius: '12px',
            padding: '20px',
            color: result.failed === 0 ? '#166534' : '#92400e'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 12px 0' }}>
              {result.failed === 0 ? '✅ Upload Berhasil!' : '⚠️ Upload Selesai dengan Error'}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 4px 0' }}>Berhasil:</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{result.success}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 4px 0' }}>Gagal:</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{result.failed}</p>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 8px 0' }}>Detail Error:</p>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.8rem' }}>
                  {result.errors.slice(0, 10).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                  {result.errors.length > 10 && (
                    <li>... dan {result.errors.length - 10} error lainnya</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
            📋 Petunjuk Penggunaan
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: '#475569' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.2rem' }}>1️⃣</span>
              <p style={{ margin: 0, lineHeight: '1.6' }}>
                <strong>Download template</strong> CSV sesuai jenis data yang ingin diupload
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.2rem' }}>2️⃣</span>
              <p style={{ margin: 0, lineHeight: '1.6' }}>
                <strong>Isi data</strong> sesuai format yang ada di template. Jangan ubah header kolom!
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.2rem' }}>3️⃣</span>
              <p style={{ margin: 0, lineHeight: '1.6' }}>
                <strong>Upload file</strong> CSV yang sudah diisi dengan mengklik tombol upload
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.2rem' }}>4️⃣</span>
              <p style={{ margin: 0, lineHeight: '1.6' }}>
                <strong>Cek hasil</strong> upload. Data yang berhasil akan masuk ke database
              </p>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </DashboardLayout>
  );
}