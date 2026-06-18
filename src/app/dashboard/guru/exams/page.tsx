'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface ExamItem {
  id: string;
  title: string;
  description: string;
  duration: number;
  deadline: string;
  subjectId: string;
  subjectName: string;
  className: string;
  totalQuestions: number;
  totalSubmitted: number;
  attempts: Array<{
    studentName: string;
    studentEmail: string;
    score: number;
    submittedAt: string;
  }>;
}

interface SubjectItem {
  id: string;
  name: string;
}

interface QuestionInput {
  question_text: string;
  options: string[];
  correct_option: string;
}

export default function GuruExamsPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');

  // Selected Exam for Submissions Detail Sidebar
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);

  // Form Modal States
  const [showForm, setShowForm] = useState(false);
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDuration, setFormDuration] = useState('30');
  const [formDeadline, setFormDeadline] = useState('');
  const [formQuestions, setFormQuestions] = useState<QuestionInput[]>([
    { question_text: '', options: ['', '', '', ''], correct_option: 'A' }
  ]);

  // Notification Banners
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Bulk upload states
  const [inputMethod, setInputMethod] = useState<'manual' | 'csv' | 'text' | 'ai'>('manual');
  const [rawPasteText, setRawPasteText] = useState('');

  // Download template CSV file
  const downloadCSVTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + "Pertanyaan,Pilihan A,Pilihan B,Pilihan C,Pilihan D,Kunci Jawaban (A/B/C/D)\n"
      + "Siapakah pendiri Daulah Bani Umayyah?,Muawiyah bin Abi Sufyan,Yazid bin Muawiyah,Marwan bin Hakam,Abdul Malik bin Marwan,A\n"
      + "Berapakah hasil dari 25 x 4?,80,90,100,120,C\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_soal_ujian.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV file reader & parser
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const parsedQuestions: QuestionInput[] = [];

      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns = line.split(',');
        if (columns.length >= 6) {
          parsedQuestions.push({
            question_text: columns[0].replace(/^"|"$/g, '').trim(),
            options: [
              columns[1].replace(/^"|"$/g, '').trim(),
              columns[2].replace(/^"|"$/g, '').trim(),
              columns[3].replace(/^"|"$/g, '').trim(),
              columns[4].replace(/^"|"$/g, '').trim()
            ],
            correct_option: columns[5].replace(/^"|"$/g, '').trim().toUpperCase()
          });
        }
      }

      if (parsedQuestions.length > 0) {
        setFormQuestions(parsedQuestions);
        showSuccess(`Berhasil mengimpor ${parsedQuestions.length} soal dari CSV! 👍`);
        setInputMethod('manual');
      } else {
        alert('Gagal mengimpor: Pastikan format kolom sesuai dengan template CSV.');
      }
    };
    reader.readAsText(file);
  };

  // Smart Regex copy-paste text parser
  const handleParseTextQuestions = () => {
    if (!rawPasteText.trim()) {
      alert('Silakan tempel teks pertanyaan terlebih dahulu.');
      return;
    }

    const lines = rawPasteText.split('\n');
    const questionsList: QuestionInput[] = [];
    let currentQuestion: QuestionInput | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const questionMatch = line.match(/^(\d+)[\.\)]?\s+(.+)$/i) || line.match(/^Pertanyaan\s+\d+:\s*(.+)$/i);
      
      if (questionMatch) {
        if (currentQuestion && currentQuestion.question_text) {
          questionsList.push(currentQuestion);
        }
        currentQuestion = {
          question_text: questionMatch[2].trim(),
          options: ['', '', '', ''],
          correct_option: 'A'
        };
      } else if (currentQuestion) {
        const optionMatch = line.match(/^([A-D])[\.\)]?\s+(.+)$/i);
        if (optionMatch) {
          const optionLetter = optionMatch[1].toUpperCase();
          const optionText = optionMatch[2].trim();
          const index = optionLetter.charCodeAt(0) - 65; // A=0, B=1, etc.
          currentQuestion.options[index] = optionText;
        } else {
          const keyMatch = line.match(/(?:Kunci|Jawaban|Correct|Key)[\s:]*([A-D])/i);
          if (keyMatch) {
            currentQuestion.correct_option = keyMatch[1].toUpperCase();
          } else {
            if (!currentQuestion.options.some(o => o !== '')) {
              currentQuestion.question_text += '\n' + line;
            }
          }
        }
      }
    }

    if (currentQuestion && currentQuestion.question_text) {
      questionsList.push(currentQuestion);
    }

    if (questionsList.length > 0) {
      setFormQuestions(questionsList);
      showSuccess(`Berhasil memproses & mengimpor ${questionsList.length} soal! 👍`);
      setRawPasteText('');
      setInputMethod('manual');
    } else {
      alert('Format teks tidak dikenali. Pastikan menggunakan penomoran (1, 2, dst), opsi (A, B, C, D), dan Kunci jawaban.');
    }
  };

  // AI Mock Questions Generator
  const handleAIGenerateQuestions = () => {
    const subjectObj = subjects.find(s => s.id === formSubjectId);
    const subjectName = subjectObj ? subjectObj.name.toLowerCase() : '';

    let generated: QuestionInput[] = [];

    if (subjectName.includes('matematika')) {
      generated = [
        {
          question_text: "Hasil perkalian dari 12 x 8 adalah...",
          options: ["86", "96", "106", "116"],
          correct_option: "B"
        },
        {
          question_text: "Berapakah nilai dari X jika 3X + 5 = 20?",
          options: ["3", "5", "6", "7"],
          correct_option: "B"
        },
        {
          question_text: "Bilangan prima antara 10 dan 20 adalah...",
          options: ["11, 13, 17, 19", "11, 13, 15, 17", "11, 15, 17, 19", "13, 15, 17, 19"],
          correct_option: "A"
        }
      ];
    } else if (subjectName.includes('agama') || subjectName.includes('islam') || subjectName.includes('al-qur')) {
      generated = [
        {
          question_text: "Surah Al-Mulk terletak pada juz ke...",
          options: ["Juz 28", "Juz 29", "Juz 30", "Juz 27"],
          correct_option: "B"
        },
        {
          question_text: "Hukum bacaan mim mati bertemu huruf ba (ب) adalah...",
          options: ["Ikhfa Syafawi", "Idzhar Halqi", "Idghom Mutamatsilain", "Ikhfa Haqiqi"],
          correct_option: "A"
        },
        {
          question_text: "Siapakah khalifah pertama dari Khulafaur Rasyidin?",
          options: ["Umar bin Khattab", "Utsman bin Affan", "Abu Bakar Ash-Shiddiq", "Ali bin Abi Thalib"],
          correct_option: "C"
        }
      ];
    } else {
      generated = [
        {
          question_text: "Gaya tarik bumi yang menyebabkan benda jatuh ke bawah disebut gaya...",
          options: ["Magnet", "Gesek", "Pegas", "Gravitasi"],
          correct_option: "D"
        },
        {
          question_text: "Proses pembuatan makanan pada tumbuhan hijau dengan bantuan cahaya matahari disebut...",
          options: ["Fotosintesis", "Respirasi", "Evaporasi", "Transpirasi"],
          correct_option: "A"
        },
        {
          question_text: "Benda yang dapat menghantarkan panas dengan baik disebut...",
          options: ["Isolator", "Konduktor", "Radiator", "Reflektor"],
          correct_option: "B"
        }
      ];
    }

    setFormQuestions(generated);
    showSuccess(`AI berhasil menerbitkan ${generated.length} soal untuk ${subjectObj?.name || 'Mata Pelajaran ini'}! 🤖`);
    setInputMethod('manual');
  };

  // Fetch all exams & subjects taught by this teacher
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/exams?role=guru');
      const json = await res.json();
      if (json.success) {
        setExams(json.exams);
        setSubjects(json.subjects);
        if (json.subjects.length > 0) {
          setFormSubjectId(json.subjects[0].id);
        }
      }
    } catch (err) {
      console.error(err);
      showError('Gagal memuat data ujian sekolah.');
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

  const showError = (message: string) => {
    setErrorBanner(message);
    setTimeout(() => setErrorBanner(null), 4000);
  };

  // Open Form to Add Exam
  const handleOpenAdd = () => {
    setFormTitle('');
    setFormDescription('');
    setFormDuration('30');
    setInputMethod('manual');
    setRawPasteText('');
    
    // Set default deadline to tomorrow at 23:59
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 0, 0);
    // Convert to YYYY-MM-DDThh:mm format for datetime-local
    const tzoffset = tomorrow.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(tomorrow.getTime() - tzoffset)).toISOString().slice(0, 16);
    setFormDeadline(localISOTime);

    setFormQuestions([
      { question_text: '', options: ['', '', '', ''], correct_option: 'A' }
    ]);
    if (subjects.length > 0) {
      setFormSubjectId(subjects[0].id);
    }
    setShowForm(true);
  };

  // Form Questions manipulation
  const handleAddQuestion = () => {
    setFormQuestions([
      ...formQuestions,
      { question_text: '', options: ['', '', '', ''], correct_option: 'A' }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (formQuestions.length <= 1) {
      alert('Ujian minimal memiliki 1 soal pertanyaan.');
      return;
    }
    setFormQuestions(formQuestions.filter((_, idx) => idx !== index));
  };

  const handleQuestionTextChange = (index: number, val: string) => {
    const updated = [...formQuestions];
    updated[index].question_text = val;
    setFormQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...formQuestions];
    updated[qIdx].options[optIdx] = val;
    setFormQuestions(updated);
  };

  const handleCorrectOptionChange = (index: number, val: string) => {
    const updated = [...formQuestions];
    updated[index].correct_option = val;
    setFormQuestions(updated);
  };

  // Save Exam (POST)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubjectId || !formTitle || !formDuration || !formDeadline) return;

    // Validate that questions have content
    const invalidQuestion = formQuestions.some(q => !q.question_text.trim() || q.options.some(opt => !opt.trim()));
    if (invalidQuestion) {
      alert('Semua pertanyaan dan opsi jawaban A, B, C, D wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: formSubjectId,
          title: formTitle,
          description: formDescription,
          duration: formDuration,
          deadline: formDeadline,
          questions: formQuestions
        })
      });
      const json = await res.json();
      if (json.success) {
        showSuccess('Ujian dan kuis baru berhasil diterbitkan! 📝');
        await fetchData();
        setShowForm(false);
      } else {
        showError(json.error || 'Gagal menyimpan ujian.');
      }
    } catch (err) {
      console.error(err);
      showError('Gagal menghubungkan ke server.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Exam (DELETE)
  const handleDelete = async (exam: ExamItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Apakah Anda yakin ingin menghapus ujian "${exam.title}"? Seluruh rekapitulasi nilai dan jawaban siswa juga akan terhapus secara permanen.`)) return;

    try {
      const res = await fetch(`/api/exams?id=${exam.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showSuccess('Ujian berhasil dihapus! 🗑️');
        if (selectedExam?.id === exam.id) {
          setSelectedExam(null);
        }
        await fetchData();
      } else {
        showError(json.error || 'Gagal menghapus ujian.');
      }
    } catch (err) {
      console.error(err);
      showError('Gagal menghubungkan ke server.');
    }
  };

  // Filter & Search Logic
  const filteredExams = exams.filter((ex) => {
    const matchesSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === 'all' || ex.subjectId === filterSubject;
    return matchesSearch && matchesSubject;
  });

  // Calculate stats
  const totalExams = exams.length;
  const totalQuestions = exams.reduce((sum, ex) => sum + ex.totalQuestions, 0);
  const totalSubmitted = exams.reduce((sum, ex) => sum + ex.totalSubmitted, 0);

  return (
    <DashboardLayout activeMenu="guru-exams" pageTitle="Kelola Ujian & Kuis" pageSubtitle="Buat kuis pilihan ganda interaktif, jadwalkan tenggat, dan pantau rekapitulasi nilai siswa secara real-time.">
      
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
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff', padding: '14px 24px', borderRadius: '14px',
          fontWeight: 700, fontSize: '0.88rem',
          boxShadow: '0 12px 32px -4px rgba(16, 185, 129, 0.4)',
          animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '1.2rem' }}>✅</span>
          {successBanner}
        </div>
      )}

      {/* Error Notification Banner */}
      {errorBanner && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#ffffff', padding: '14px 24px', borderRadius: '14px',
          fontWeight: 700, fontSize: '0.88rem',
          boxShadow: '0 12px 32px -4px rgba(239, 68, 68, 0.4)',
          animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          {errorBanner}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* ════════════════════════════════════════════════════════════════
             SECTION 1: STATS CARDS
           ════════════════════════════════════════════════════════════════ */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {/* Card 1 */}
          <div className="card-premium card-premium-hover" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '1.4rem' }}>📝</span>
            </div>
            <div>
              <p style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Total Ujian Terbit</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 850, color: '#0f172a', margin: 0 }}>{loading ? '...' : `${totalExams} Ujian`}</h3>
            </div>
          </div>

          {/* Card 2 */}
          <div className="card-premium card-premium-hover" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '1.4rem' }}>❓</span>
            </div>
            <div>
              <p style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Jumlah Butir Soal</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 850, color: '#059669', margin: 0 }}>{loading ? '...' : `${totalQuestions} Soal`}</h3>
            </div>
          </div>

          {/* Card 3 */}
          <div className="card-premium card-premium-hover" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '1.4rem' }}>🎓</span>
            </div>
            <div>
              <p style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>Siswa Mengerjakan</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 850, color: '#d97706', margin: 0 }}>{loading ? '...' : `${totalSubmitted} Kali`}</h3>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
             SECTION 2: FILTERS & ADD BUTTON
           ════════════════════════════════════════════════════════════════ */}
        <section style={{ display: 'flex', gap: '14px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pencarian Ujian</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Cari judul ujian atau nama mapel..." 
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

          {/* Subject Filter */}
          <div style={{ flex: '0 0 auto' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mata Pelajaran & Kelas</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              style={{
                padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0',
                fontSize: '0.88rem', fontWeight: 600, color: '#0f172a',
                backgroundColor: '#ffffff', cursor: 'pointer', outline: 'none',
                minWidth: '200px', transition: 'all 0.2s'
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#6366f1'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <option value="all">📚 Semua Mapel & Kelas</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Add Button */}
          <div style={{ marginLeft: 'auto' }}>
            <button
              id="btn-add-exam-toggle"
              onClick={handleOpenAdd}
              style={{
                padding: '10px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.3)', transition: 'all 0.2s'
              }}
            >
              ➕ Terbitkan Ujian Baru
            </button>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
             SECTION 3: LIST TABLE & DETAILS SIDEBAR
           ════════════════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', width: '100%' }}>
          
          {/* Main Exams Table */}
          <section className="card-premium" style={{ flex: 1, padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '20px', background: '#ffffff' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Daftar Ujian Terbit Anda</h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Menampilkan {filteredExams.length} ujian</span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '24px' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ height: '52px', borderRadius: '10px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                ))}
              </div>
            ) : filteredExams.length === 0 ? (
              <div style={{ padding: '64px 24px', textAlign: 'center', color: '#94a3b8' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>🔍</span>
                <p style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>Belum ada ujian yang diterbitkan sesuai filter.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '14px 24px' }}>Judul Ujian</th>
                      <th style={{ padding: '14px 24px' }}>Mata Pelajaran & Kelas</th>
                      <th style={{ padding: '14px 24px' }}>Durasi (Menit)</th>
                      <th style={{ padding: '14px 24px' }}>Tenggat Batas</th>
                      <th style={{ padding: '14px 24px' }}>Jumlah Soal</th>
                      <th style={{ padding: '14px 24px' }}>Siswa Submit</th>
                      <th style={{ padding: '14px 24px', textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExams.map((ex) => {
                      const isSelected = selectedExam?.id === ex.id;
                      const isDeadlinePassed = new Date(ex.deadline) < new Date();

                      return (
                        <tr
                          key={ex.id}
                          onClick={() => setSelectedExam(ex)}
                          className="tr-hover"
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: isSelected ? '#f5f3ff' : 'transparent',
                            transition: 'all 0.2s'
                          }}
                        >
                          {/* Title */}
                          <td style={{ padding: '12px 24px' }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', display: 'block' }}>{ex.title}</span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{ex.description ? ex.description.substring(0, 32) + '...' : 'Tidak ada deskripsi'}</span>
                          </td>

                          {/* Subject & Class */}
                          <td style={{ padding: '12px 24px' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', display: 'block' }}>{ex.subjectName}</span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>🏫 {ex.className}</span>
                          </td>

                          {/* Duration */}
                          <td style={{ padding: '12px 24px', fontSize: '0.85rem', color: '#1e293b', fontWeight: 700 }}>⏱️ {ex.duration} Mnt</td>

                          {/* Deadline */}
                          <td style={{ padding: '12px 24px', fontSize: '0.82rem' }}>
                            <span style={{
                              color: isDeadlinePassed ? '#ef4444' : '#475569',
                              fontWeight: 600
                            }}>
                              {ex.deadline.split('T')[0]} {ex.deadline.includes('T') ? ex.deadline.split('T')[1].substring(0, 5) : ''}
                            </span>
                            {isDeadlinePassed && <span style={{ fontSize: '0.68rem', display: 'block', color: '#ef4444', fontWeight: 700 }}>KADALUARSA ⚠️</span>}
                          </td>

                          {/* Questions Count */}
                          <td style={{ padding: '12px 24px', fontSize: '0.85rem', color: '#475569', fontWeight: 700 }}>{ex.totalQuestions} Butir</td>

                          {/* Submitted Count */}
                          <td style={{ padding: '12px 24px' }}>
                            <span style={{
                              fontSize: '0.78rem', fontWeight: 700,
                              color: ex.totalSubmitted > 0 ? '#059669' : '#94a3b8',
                              backgroundColor: ex.totalSubmitted > 0 ? '#d1fae5' : '#f1f5f9',
                              padding: '4px 10px', borderRadius: '8px'
                            }}>
                              👤 {ex.totalSubmitted} Siswa
                            </span>
                          </td>

                          {/* Action */}
                          <td style={{ padding: '12px 24px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedExam(ex); }}
                                title="Lihat Hasil Nilai"
                                style={{
                                  background: 'none', border: '1px solid #cbd5e1', padding: '6px 8px', borderRadius: '8px', cursor: 'pointer',
                                  fontSize: '0.8rem', color: '#475569', transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; }}
                              >
                                📊
                              </button>
                              <button
                                onClick={(e) => handleDelete(ex, e)}
                                title="Hapus Ujian"
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
          </section>

          {/* Sidebar Detail Drawer */}
          {selectedExam && (
            <aside className="card-premium animate-slide-in-right no-print" style={{
              width: '320px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px',
              padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '24px', flexShrink: 0
            }}>
              {/* Header Close */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Rekapitulasi Nilai Ujian</h3>
                <button
                  onClick={() => setSelectedExam(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.1rem', color: '#94a3b8', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              {/* Exam Metadata */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4f46e5', margin: '0 0 2px 0' }}>{selectedExam.title}</h4>
                <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Mapel: {selectedExam.subjectName} | Kelas: {selectedExam.className}</span>
              </div>

              {/* Roster Attempts list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h5 style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Hasil Siswa ({selectedExam.attempts.length})</h5>

                {selectedExam.attempts.length === 0 ? (
                  <div style={{ padding: '24px 0', textTransform: 'none', textAlign: 'center', color: '#cbd5e1' }}>
                    <span style={{ fontSize: '1.5rem', display: 'block' }}>⏳</span>
                    <p style={{ fontSize: '0.75rem', margin: '4px 0 0 0', color: '#94a3b8' }}>Belum ada siswa kelas yang mengumpulkan jawaban.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedExam.attempts.map((att, attIdx) => (
                      <div key={attIdx} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc'
                      }}>
                        <div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', display: 'block' }}>{att.studentName}</span>
                          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Kumpul: {att.submittedAt.split('T')[0]}</span>
                        </div>
                        <span style={{
                          fontSize: '0.85rem', fontWeight: 850,
                          color: att.score >= 75 ? '#059669' : '#ef4444',
                          backgroundColor: att.score >= 75 ? '#d1fae5' : '#fef2f2',
                          padding: '4px 10px', borderRadius: '8px'
                        }}>
                          {att.score}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          )}

        </div>

      </div>

      {/* ════════════════════════════════════════════════════════════════
           SECTION 4: CREATE EXAM POP-UP MODAL OVERLAY (DYNAMIC FORM)
         ════════════════════════════════════════════════════════════════ */}
      {showForm && (
        <div className="animate-fade-in" style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backdropFilter: 'blur(8px)', backgroundColor: 'rgba(15, 23, 42, 0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999, padding: '20px', boxSizing: 'border-box'
        }}>
          <form onSubmit={handleSubmit} className="animate-scale-in" style={{
            background: '#ffffff', borderRadius: '24px', padding: '32px',
            maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: '18px',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', border: '1px solid #e2e8f0',
            boxSizing: 'border-box'
          }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Pembuatan Ujian Pilihan Ganda Baru
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#64748b', cursor: 'pointer', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            {/* Step 1: Metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px' }}>Pilih Mata Pelajaran & Kelas</label>
                <select
                  value={formSubjectId}
                  onChange={(e) => setFormSubjectId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem', fontWeight: 600, backgroundColor: '#ffffff' }}
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px' }}>Judul Ujian</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Contoh: UTS Matematika Aljabar"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px' }}>Durasi (Menit)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Contoh: 45"
                  value={formDuration}
                  onChange={e => setFormDuration(e.target.value)}
                  required
                  min="5"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px' }}>Tenggat Batas Ujian</label>
                <input 
                  type="datetime-local" 
                  className="form-control" 
                  value={formDeadline}
                  onChange={e => setFormDeadline(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px' }}>Deskripsi & Petunjuk (Opsional)</label>
              <textarea 
                rows={2}
                className="form-control" 
                placeholder="Tulis instruksi pengerjaan di sini..."
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.88rem', resize: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Step 2: Dynamic Questions authoring */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Tab Selector for Question Input Method */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <button
                  type="button"
                  onClick={() => setInputMethod('manual')}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
                    backgroundColor: inputMethod === 'manual' ? '#4f46e5' : 'transparent',
                    color: inputMethod === 'manual' ? '#ffffff' : '#64748b',
                    transition: 'all 0.2s'
                  }}
                >
                  ✍️ Butir Manual
                </button>
                <button
                  type="button"
                  onClick={() => setInputMethod('csv')}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
                    backgroundColor: inputMethod === 'csv' ? '#4f46e5' : 'transparent',
                    color: inputMethod === 'csv' ? '#ffffff' : '#64748b',
                    transition: 'all 0.2s'
                  }}
                >
                  📥 Impor CSV
                </button>
                <button
                  type="button"
                  onClick={() => setInputMethod('text')}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
                    backgroundColor: inputMethod === 'text' ? '#4f46e5' : 'transparent',
                    color: inputMethod === 'text' ? '#ffffff' : '#64748b',
                    transition: 'all 0.2s'
                  }}
                >
                  📋 Salin Tempel Teks
                </button>
                <button
                  type="button"
                  onClick={() => setInputMethod('ai')}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
                    backgroundColor: inputMethod === 'ai' ? '#4f46e5' : 'transparent',
                    color: inputMethod === 'ai' ? '#ffffff' : '#64748b',
                    transition: 'all 0.2s'
                  }}
                >
                  🤖 AI Generate Soal
                </button>
              </div>

              {inputMethod === 'manual' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Daftar Pertanyaan Ujian ({formQuestions.length})
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      style={{
                        padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1',
                        fontSize: '0.78rem', fontWeight: 700, color: '#4f46e5', backgroundColor: '#f5f3ff',
                        cursor: 'pointer'
                      }}
                    >
                      ➕ Tambah Butir Soal
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '350px', overflowY: 'auto', paddingRight: '6px' }}>
                    {formQuestions.map((q, qIdx) => (
                      <div 
                        key={qIdx} 
                        style={{
                          border: '1px solid #cbd5e1', borderRadius: '16px', padding: '18px',
                          display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f8fafc',
                          position: 'relative'
                        }}
                      >
                        {/* Header Soal & Delete */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4f46e5' }}>Pertanyaan #{qIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            style={{
                              background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem',
                              fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            Hapus Soal ✕
                          </button>
                        </div>

                        {/* Teks Soal */}
                        <div className="form-group">
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Pertanyaan</label>
                          <input
                            type="text"
                            placeholder="Tulis soal pertanyaan di sini..."
                            value={q.question_text}
                            onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                            required={inputMethod === 'manual'}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                          />
                        </div>

                        {/* 4 Opsi Jawaban */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          {['A', 'B', 'C', 'D'].map((optName, optIdx) => (
                            <div key={optIdx} className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>{optName}:</span>
                              <input
                                type="text"
                                placeholder={`Opsi ${optName}`}
                                value={q.options[optIdx]}
                                onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                required={inputMethod === 'manual'}
                                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Kunci Jawaban */}
                        <div className="form-group" style={{ width: '200px' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>Pilih Kunci Jawaban Benar</label>
                          <select
                            value={q.correct_option}
                            onChange={(e) => handleCorrectOptionChange(qIdx, e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700, backgroundColor: '#ffffff' }}
                          >
                            <option value="A">Opsi A</option>
                            <option value="B">Opsi B</option>
                            <option value="C">Opsi C</option>
                            <option value="D">Opsi D</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {inputMethod === 'csv' && (
                <div style={{
                  padding: '24px', border: '2px dashed #cbd5e1', borderRadius: '16px',
                  backgroundColor: '#f8fafc', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'
                }}>
                  <span style={{ fontSize: '2.5rem' }}>📥</span>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>Impor Soal secara Massal lewat CSV</h4>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', maxWidth: '440px', margin: 0, lineHeight: '1.4' }}>
                      Unduh berkas template CSV kami, isi seluruh pertanyaan beserta opsi jawaban A-D dan kunci jawaban, lalu unggah kembali berkas tersebut ke bawah ini.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={downloadCSVTemplate}
                      style={{
                        padding: '8px 16px', borderRadius: '10px', border: '1px solid #4f46e5',
                        fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5', backgroundColor: '#ffffff', cursor: 'pointer'
                      }}
                    >
                      📄 Unduh Template CSV
                    </button>
                    
                    <label style={{
                      padding: '8px 16px', borderRadius: '10px', border: 'none',
                      fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', backgroundColor: '#4f46e5', cursor: 'pointer'
                    }}>
                      📁 Unggah Berkas CSV
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                </div>
              )}

              {inputMethod === 'text' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Salin & Tempel Butir Soal Ujian</h4>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>
                      Tempel teks soal dari dokumen Word/Notepad Anda dengan format standar penomoran (1, 2) diikuti opsi (A, B, C, D) dan baris kunci jawaban.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '16px' }}>
                    <textarea
                      rows={8}
                      placeholder={`Contoh:\n1. Siapakah presiden pertama Indonesia?\nA. Soeharto\nB. Soekarno\nC. Habibie\nD. Gusdur\nKunci: B\n\n2. Hasil dari 5 + 5 adalah...\nA. 8\nB. 10\nC. 12\nD. 15\nJawaban: B`}
                      value={rawPasteText}
                      onChange={e => setRawPasteText(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontFamily: 'monospace', resize: 'none', boxSizing: 'border-box' }}
                    />
                    
                    <div style={{ padding: '14px', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#f8fafc', fontSize: '0.72rem', color: '#475569', lineHeight: '1.5' }}>
                      <strong style={{ display: 'block', marginBottom: '6px', color: '#0f172a' }}>⚠️ Aturan Format Teks:</strong>
                      1. Gunakan nomor soal di awal baris (`1. ` atau `1) `).<br />
                      2. Tulis opsi A-D di baris baru (`A. `, `B. `, dst).<br />
                      3. Tulis kata kunci di akhir soal (`Kunci: A` atau `Jawaban: B`).<br />
                      4. Berikan jarak 1 baris kosong antar butir soal.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleParseTextQuestions}
                    style={{
                      width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                      fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', backgroundColor: '#4f46e5', cursor: 'pointer',
                      boxShadow: '0 4px 12px -2px rgba(79, 70, 229, 0.2)'
                    }}
                  >
                    ⚙️ Proses & Impor Teks Soal
                  </button>
                </div>
              )}

              {inputMethod === 'ai' && (
                <div style={{
                  padding: '24px', border: '1px solid rgba(79, 70, 229, 0.2)', borderRadius: '16px',
                  backgroundColor: '#f5f3ff', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'
                }}>
                  <span style={{ fontSize: '2.5rem' }}>🤖</span>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>AI Question Generator Cerdas</h4>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', maxWidth: '440px', margin: 0, lineHeight: '1.4' }}>
                      Gunakan AI untuk membuat draf set soal ujian pilihan ganda secara otomatis yang disesuaikan secara tematik dengan Mata Pelajaran terpilih.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAIGenerateQuestions}
                    style={{
                      padding: '10px 20px', borderRadius: '10px', border: 'none',
                      fontSize: '0.82rem', fontWeight: 700, color: '#ffffff',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', cursor: 'pointer',
                      boxShadow: '0 6px 16px -4px rgba(124, 58, 237, 0.3)'
                    }}
                  >
                    ✨ Generate Soal Cerdas
                  </button>
                </div>
              )}

            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
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
                id="btn-save-exam"
                className="btn-primary"
                disabled={saving}
                style={{ padding: '10px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', border: 'none', color: '#ffffff' }}
              >
                {saving ? 'Menerbitkan...' : 'Terbitkan Ujian'}
              </button>
            </div>

          </form>
        </div>
      )}

    </DashboardLayout>
  );
}
