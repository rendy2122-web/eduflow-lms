'use client';

import React from 'react';

interface PortfolioFormProps {
  role: 'siswa' | 'orang_tua'; // determines label variations
  title: string; // form title (e.g., "Pelaporan Portofolio & Tugas Mandiri")
  description: string;
  formState: {
    title: string;
    subject: string;
    date: string;
    type: string;
    duration: string;
    notes: string;
    reflection: string;
  };
  fileName?: string;
  onFieldChange: (field: keyof PortfolioFormProps['formState'], value: string) => void;
  onFileClick: () => void;
  onFileChange: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitStatus?: string | null;
  isSubmitting: boolean;
  fileInputRef?: React.RefObject<HTMLInputElement>;
}

const subjectOptions = [
  { value: 'IPAS', label: 'IPAS (Sains & Sosial)' },
  { value: 'Matematika', label: 'Matematika' },
  { value: 'Bahasa Indonesia', label: 'Bahasa Indonesia' },
  { value: 'Pendidikan Agama Islam', label: 'Pendidikan Agama Islam' },
  { value: 'Seni & Prakarya', label: 'Seni & Prakarya' },
];

const categoryOptions = [
  'Akademik',
  'Eksplorasi Alam / Lapangan',
  'Kreativitas & Seni',
  'Olahraga & Fisik',
  'Karakter & Keagamaan',
];

const durationOptions = [
  '30 Menit',
  '1 Jam',
  '2 Jam',
  '3 Jam',
  'Lebih dari 3 Jam',
];

export default function PortfolioForm({
  role,
  title,
  description,
  formState,
  fileName,
  onFieldChange,
  onFileClick,
  onFileChange,
  onSubmit,
  submitStatus,
  isSubmitting,
  fileInputRef,
}: PortfolioFormProps) {
  // Determine labels based on role
  const labels = {
    activityTitle:
      role === 'siswa'
        ? 'Nama Aktivitas / Judul Tugas'
        : 'Nama/Judul Aktivitas Belajar',
    description:
      role === 'siswa'
        ? 'Deskripsi Jurnal Belajar Mandiri'
        : 'Deskripsi / Catatan Pembelajaran',
    reflection:
      role === 'siswa'
        ? 'Refleksi Siswa (Apa yang disukai / kendala)'
        : 'Rencana Tindak Lanjut / Catatan Refleksi Orang Tua',
    fileLabel:
      role === 'siswa'
        ? 'Unggah Berkas Bukti Karya (Real File)'
        : 'Lampiran Foto / Bukti Karya (Real File)',
    descPlaceholder:
      role === 'siswa'
        ? 'Jelaskan secara rinci ringkasan materi yang dipelajari dan langkah pengerjaannya...'
        : 'Tulis ringkasan aktivitas, apa saja yang dipelajari anak, dan bagaimana hasilnya...',
    reflectionPlaceholder:
      role === 'siswa'
        ? 'Contoh: Saya paling suka merakit roket kertasnya, tapi agak sulit saat menyeimbangkan sayap agar terbang lurus...'
        : 'Tulis saran pendampingan atau rencana pembelajaran selanjutnya berdasarkan perkembangan belajar mandiri anak hari ini...',
    submitButton: role === 'siswa' ? 'Kirim Laporan 📤' : 'Kirim Portofolio 📤',
  };

  return (
    <div className="card-premium" style={{ border: '1px solid #e2e8f0', borderRadius: '20px', background: '#ffffff', padding: '24px' }}>
      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '18px' }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          {title}
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
          {description}
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Title + Subject Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{labels.activityTitle}</label>
            <input
              type="text"
              className="form-control"
              placeholder="Contoh: Peta Konsep Tata Surya"
              value={formState.title}
              onChange={(e) => onFieldChange('title', e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Mata Pelajaran</label>
            <select
              className="form-control"
              value={formState.subject}
              onChange={(e) => onFieldChange('subject', e.target.value)}
              required
            >
              {subjectOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date + Category + Duration Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Tanggal Aktivitas</label>
            <input
              type="date"
              className="form-control"
              value={formState.date}
              onChange={(e) => onFieldChange('date', e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Kategori Belajar</label>
            <select
              className="form-control"
              value={formState.type}
              onChange={(e) => onFieldChange('type', e.target.value)}
              required
            >
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Durasi Belajar</label>
            <select
              className="form-control"
              value={formState.duration}
              onChange={(e) => onFieldChange('duration', e.target.value)}
              required
            >
              {durationOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">{labels.description}</label>
          <textarea
            className="form-control"
            placeholder={labels.descPlaceholder}
            value={formState.notes}
            onChange={(e) => onFieldChange('notes', e.target.value)}
            rows={3}
            style={{ resize: 'vertical' }}
            required
          />
        </div>

        {/* Reflection */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">{labels.reflection}</label>
          <textarea
            className="form-control"
            placeholder={labels.reflectionPlaceholder}
            value={formState.reflection}
            onChange={(e) => onFieldChange('reflection', e.target.value)}
            rows={2}
            style={{ resize: 'vertical' }}
          />
        </div>

        {/* File Upload */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">{labels.fileLabel}</label>
          {role === 'siswa' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={onFileClick}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #3b82f6',
                  color: '#3b82f6',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                📂 Pilih Berkas
              </button>
              <span
                style={{
                  fontSize: '0.8rem',
                  color: '#475569',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '200px',
                }}
              >
                {fileName ? fileName : 'Belum ada berkas terpilih'}
              </span>
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                className="form-control"
                onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                style={{ padding: '8px' }}
              />
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                Mendukung berkas gambar/PDF maks. 5MB
              </span>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
            style={{ display: role === 'siswa' ? 'none' : 'block' }}
          />
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          {submitStatus && (
            <span style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 700 }}>
              {submitStatus}
            </span>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              marginLeft: 'auto',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)',
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Mengirim...' : labels.submitButton}
          </button>
        </div>
      </form>
    </div>
  );
}
