'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';

interface StudentItem {
  id: string;
  name: string;
  avatar: string;
  status: boolean[]; // 6 elements representing the target dates
  classId?: string;
  className?: string;
}

interface TahfidzRecordItem {
  id: string;
  name: string;
  avatar: string;
  juz: string;
  surah: string;
  progress: number;
  date: string;
}

interface ClassWarningItem {
  type: 'attendance' | 'academic' | 'info';
  title: string;
  message: string;
  recommendation: string;
}

export default function GuruDashboardPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [tahfidzRecords, setTahfidzRecords] = useState<TahfidzRecordItem[]>([]);
  const [targetDates, setTargetDates] = useState<string[]>(['2026-06-08', '2026-06-09', '2026-06-10', '2026-06-11', '2026-06-12', '2026-06-15']);
  const [classWarnings, setClassWarnings] = useState<ClassWarningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('all');

  // States untuk Buku Penghubung
  const [activeChatStudent, setActiveChatStudent] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newReply, setNewReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // States untuk Kuis Interaktif
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);

  // States baru untuk Interaktivitas & Desain Premium
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredChartIdx, setHoveredChartIdx] = useState<number | null>(null);
  const [isTypingSim, setIsTypingSim] = useState(false);
  const [actionDispatched, setActionDispatched] = useState<Record<number, boolean>>({});

  const quizQuestion = {
    question: "Manakah di bawah ini yang merupakan rukun Islam kedua?",
    options: ["Mengucapkan syahadat", "Mendirikan shalat", "Menunaikan zakat", "Melaksanakan ibadah haji"],
    correctIdx: 1, // Mendirikan shalat
    explanation: "Betul! Rukun Islam kedua adalah mendirikan shalat lima waktu."
  };

  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);

  const isTimeInRange = (timeRange: string) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [start, end] = timeRange.split(' - ');
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  const getTodaySchedule = () => {
    const today = new Date().toISOString().split('T')[0];
    return todaySchedule
      .filter((item: any) => item.date === today)
      .sort((a: any, b: any) => a.time.localeCompare(b.time));
  };

  const agendaJadwal = getTodaySchedule().length > 0 ? getTodaySchedule() : [
    {
      time: '17:30 - 18:00',
      subject: 'Matematika Aljabar',
      class: 'Grade 4A',
      room: 'R. Belajar 1',
      isLive: false
    },
    {
      time: '19:00 - 20:30',
      subject: 'Pendidikan Agama Islam',
      class: 'Grade 4B',
      room: 'R. Belajar 2',
      isLive: true
    },
    {
      time: '21:00 - 22:30',
      subject: 'Tahfidz Al-Qur\'an',
      class: 'Grade 4A',
      room: 'Musholla',
      isLive: false
    }
  ];

  const pengumumanList = [
    { title: 'Persiapan Ujian Akhir Semester', date: 'Ditulis 1 hari yang lalu', category: 'Akademik', color: '#3b82f6', bgColor: '#eff6ff' },
    { title: 'Pembagian Rapor Digital Siswa', date: 'Ditulis 3 jam yang lalu', category: 'Pengumuman', color: '#10b981', bgColor: '#ecfdf5' },
    { title: 'Rapat Wali Murid & Komite Sekolah', date: 'Batas waktu: Besok', category: 'Agenda', color: '#f59e0b', bgColor: '#fef3c7' }
  ];

  const [assignments, setAssignments] = useState<any[]>([
    { title: 'Grade 4 Math Quiz', date: 'Due: Oct 29, 3:00 PM', type: 'quiz', color: '#3b82f6', bgColor: '#eff6ff', link: '/dashboard/guru/exams' },
    { title: 'Science Project: Ecosystems', date: 'Due: Nov 1, 11:59 PM', type: 'project', color: '#10b981', bgColor: '#ecfdf5', link: '/dashboard/guru/lms' },
    { title: 'Islamic Studies Essay', date: 'Due: Nov 3', type: 'essay', color: '#6366f1', bgColor: '#e0e7ff', link: '/dashboard/guru/lms' },
    { title: 'Arabic Reading Practice', date: 'Due: Oct 30', type: 'reading', color: '#0d9488', bgColor: '#f0fdfa', link: '/dashboard/guru/lms' },
    { title: 'History Report', date: 'Submitted 2h ago', type: 'report', color: '#8b5cf6', bgColor: '#f5f3ff', link: '/dashboard/guru/lms' }
  ]);

  async function fetchGuruDashboardData() {
    try {
      setLoading(true);
      
      // Fetch attendance matrix
      const attendanceRes = await fetch('/api/guru/attendance/student');
      const attendanceJson = await attendanceRes.json();
      
      // Fetch tahfidz records
      const tahfidzRes = await fetch('/api/guru/tahfidz');
      const tahfidzJson = await tahfidzRes.json();

      // Fetch today's schedule
      const scheduleRes = await fetch('/api/guru/online-class');
      const scheduleJson = await scheduleRes.json();
      if (scheduleJson.success) {
        setTodaySchedule(scheduleJson.classes);
      }

      if (attendanceJson.success) {
        setStudents(attendanceJson.students);
        setTargetDates(attendanceJson.dates);
        setClassWarnings(attendanceJson.classWarnings || []);
        if (attendanceJson.classes) {
          setClasses(attendanceJson.classes);
        }
      }

      if (tahfidzJson.success) {
        setTahfidzRecords(tahfidzJson.records);
      }

      // Fetch dynamic exams & tasks
      try {
        const examsRes = await fetch('/api/exams?role=guru');
        const examsJson = await examsRes.json();

        const lmsRes = await fetch('/api/guru/lms');
        const lmsJson = await lmsRes.json();

        const newAssignments: any[] = [];

        if (examsJson.success && examsJson.exams && examsJson.exams.length > 0) {
          examsJson.exams.slice(0, 3).forEach((ex: any) => {
            newAssignments.push({
              title: ex.title,
              date: `Due: ${ex.deadline.split('T')[0]} ${ex.deadline.includes('T') ? ex.deadline.split('T')[1].substring(0, 5) : ''}`,
              type: 'quiz',
              color: '#3b82f6',
              bgColor: '#eff6ff',
              link: `/dashboard/guru/exams`
            });
          });
        }

        if (lmsJson.success && lmsJson.tasks && lmsJson.tasks.length > 0) {
          lmsJson.tasks.slice(0, 3).forEach((tk: any) => {
            newAssignments.push({
              title: tk.title,
              date: `Due: ${tk.deadline.split('T')[0]} ${tk.deadline.includes('T') ? tk.deadline.split('T')[1].substring(0, 5) : ''}`,
              type: 'task',
              color: '#10b981',
              bgColor: '#ecfdf5',
              link: `/dashboard/guru/lms`
            });
          });
        }

        if (newAssignments.length > 0) {
          setAssignments(newAssignments);
        }
      } catch (err) {
        console.error('Error fetching dynamic assignments:', err);
      }
    } catch (err) {
      console.error('Error fetching guru dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGuruDashboardData();
  }, []);

  const handleToggleAttendance = async (studentId: string, date: string, currentStatus: boolean) => {
    const isPresent = !currentStatus;

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const newStatus = [...s.status];
        const dateIdx = targetDates.indexOf(date);
        if (dateIdx !== -1) {
          newStatus[dateIdx] = isPresent;
        }
        return { ...s, status: newStatus };
      }
      return s;
    }));

    try {
      const res = await fetch('/api/guru/attendance/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, date, isPresent })
      });
      const json = await res.json();
      if (!json.success) {
        alert('Gagal mengupdate absensi: ' + json.error);
        fetchGuruDashboardData();
      } else {
        // Refresh data to keep AI Warnings and statistics synchronized
        fetchGuruDashboardData();
      }
    } catch (err) {
      console.error('Error toggling student attendance:', err);
      fetchGuruDashboardData();
    }
  };

  const handleOpenChat = async (student: any) => {
    setActiveChatStudent(student);
    setChatMessages([]);
    setIsTypingSim(true);
    try {
      const res = await fetch(`/api/guru/consultation?studentId=${student.id}`);
      const json = await res.json();
      setTimeout(() => {
        if (json.success) {
          setChatMessages(json.logs || []);
        }
        setIsTypingSim(false);
      }, 700); // 700ms simulated dynamic typing/loading
    } catch (err) {
      console.error('Error fetching chat messages:', err);
      setIsTypingSim(false);
    }
  };

  const handleMarkAllPresent = async () => {
    const todayDate = '2026-06-11';
    const dateIdx = targetDates.indexOf(todayDate);
    if (dateIdx === -1) return;

    // Optimistic UI update
    setStudents(prev => prev.map(s => {
      const newStatus = [...s.status];
      newStatus[dateIdx] = true;
      return { ...s, status: newStatus };
    }));

    try {
      const promises = students.map(s => 
        fetch('/api/guru/attendance/student', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: s.id, date: todayDate, isPresent: true })
        })
      );
      await Promise.all(promises);
      fetchGuruDashboardData();
    } catch (err) {
      console.error('Error marking all present:', err);
    }
  };

  const handleTakeEwsAction = (idx: number) => {
    setActionDispatched(prev => ({ ...prev, [idx]: true }));
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !activeChatStudent) return;

    try {
      setSendingReply(true);
      const res = await fetch('/api/guru/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: activeChatStudent.id,
          senderRole: 'guru',
          senderName: 'Sarah Jenkins, S.Pd (Wali Kelas)',
          message: newReply.trim()
        })
      });
      const json = await res.json();
      if (json.success) {
        setNewReply('');
        const res2 = await fetch(`/api/guru/consultation?studentId=${activeChatStudent.id}`);
        const json2 = await res2.json();
        if (json2.success) {
          setChatMessages(json2.logs || []);
        }
      } else {
        alert('Gagal mengirim balasan: ' + json.error);
      }
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const handlePrintReport = async (studentId: string) => {
    const isMock = studentId.startsWith('mock-');
    
    try {
      let data;
      if (isMock) {
        data = {
          studentInfo: {
            nama: studentId === 'mock-s1' ? 'Zaid Khan' : 'Laila Hassan',
            email: studentId === 'mock-s1' ? 'zaid@siswa.sch.id' : 'laila@siswa.sch.id',
            class: 'Grade 4A',
            nisn: studentId === 'mock-s1' ? '00892212' : '00892213',
          },
          attendance: { rate: 95, total: 6, hadir: 5, sakit: 0, izin: 1, alpa: 0 },
          averageGrade: 88,
          grades: [
            { taskTitle: 'Kuis Matematika Aritmatika', subjectName: 'Matematika', score: 90, date: '2026-06-09' },
            { taskTitle: 'Tugas Al-Quran Ke-3', subjectName: 'Pendidikan Agama Islam', score: 86, date: '2026-06-11' }
          ],
          tahfidz: [
            { date: '2026-06-11', surahName: 'Al-Mulk', range: 'Ayat 1 - 10', status: 'lancar', notes: 'Bacaan baik dan fasih.' }
          ]
        };
      } else {
        const res = await fetch(`/api/guru/rapor?studentId=${studentId}`);
        const json = await res.json();
        if (!json.success) {
          alert('Gagal mengambil data rapor: ' + json.error);
          return;
        }
        data = json;
      }

      let gradesHtml = '';
      data.grades.forEach((g: any, idx: number) => {
        gradesHtml += `
          <tr>
            <td>${idx + 1}</td>
            <td>${g.subjectName}</td>
            <td>${g.taskTitle}</td>
            <td>${g.date}</td>
            <td style="text-align: right; font-weight: bold; color: ${g.score >= 75 ? '#15803d' : '#b91c1c'};">${g.score}</td>
          </tr>
        `;
      });

      let tahfidzHtml = '';
      data.tahfidz.forEach((t: any) => {
        tahfidzHtml += `
          <tr>
            <td>${t.date}</td>
            <td><strong>${t.surahName}</strong></td>
            <td>${t.range}</td>
            <td>
              <span class="badge ${t.status === 'lancar' ? 'badge-success' : t.status === 'kurang_lancar' ? 'badge-warning' : 'badge-error'}">
                ${t.status === 'lancar' ? 'Lancar' : t.status === 'kurang_lancar' ? 'Kurang Lancar' : 'Perlu Diulang'}
              </span>
            </td>
            <td>${t.notes}</td>
          </tr>
        `;
      });

      const printWindow = window.open('', '_blank', 'width=800,height=900');
      if (!printWindow) {
        alert('Mohon izinkan pop-up untuk mencetak rapor.');
        return;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Rapor Digital Tahfidz & Akademik - ${data.studentInfo.nama}</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                color: #1e293b;
                margin: 40px;
                line-height: 1.5;
              }
              .header {
                text-align: center;
                border-bottom: 3px double #e2e8f0;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .school-name {
                font-size: 1.8rem;
                font-weight: 800;
                color: #0f172a;
                text-transform: uppercase;
                margin: 0;
              }
              .school-subtitle {
                font-size: 0.9rem;
                color: #64748b;
                margin: 4px 0 0 0;
              }
              .title {
                text-align: center;
                font-size: 1.3rem;
                font-weight: 700;
                text-transform: uppercase;
                margin-bottom: 25px;
                color: #8b5cf6;
                letter-spacing: 0.5px;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 30px;
                font-size: 0.95rem;
                background-color: #f8fafc;
                padding: 16px;
                border-radius: 8px;
                border: 1px solid #f1f5f9;
              }
              .info-item strong {
                color: #475569;
              }
              .section-title {
                font-size: 1.1rem;
                font-weight: 700;
                border-bottom: 2px solid #8b5cf6;
                padding-bottom: 6px;
                margin-top: 30px;
                margin-bottom: 15px;
                color: #0f172a;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                font-size: 0.9rem;
              }
              th, td {
                border: 1px solid #cbd5e1;
                padding: 10px 12px;
                text-align: left;
              }
              th {
                background-color: #f1f5f9;
                font-weight: 700;
                color: #334155;
              }
              .badge {
                display: inline-block;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
              }
              .badge-success { background-color: #dcfce7; color: #15803d; }
              .badge-warning { background-color: #fef3c7; color: #b45309; }
              .badge-error { background-color: #fee2e2; color: #b91c1c; }
              .stats-container {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
              }
              .stat-card {
                flex: 1;
                background-color: #f8fafc;
                border: 1px solid #f1f5f9;
                border-radius: 8px;
                padding: 12px;
                text-align: center;
              }
              .stat-value {
                font-size: 1.5rem;
                font-weight: 800;
                color: #8b5cf6;
                margin-top: 5px;
              }
              .footer-signature {
                margin-top: 60px;
                display: flex;
                justify-content: space-between;
                font-size: 0.95rem;
              }
              .signature-space {
                margin-top: 60px;
                border-top: 1px solid #94a3b8;
                width: 200px;
                text-align: center;
                padding-top: 5px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="school-name">EDUTREE ISLAMIC PRIMARY SCHOOL</div>
              <div class="school-subtitle">Jl. Raya Pendidikan No. 45, Jakarta Selatan | Telp: (021) 778899</div>
            </div>
            
            <div class="title">RAPOR DIGITAL TAHFIDZ & AKADEMIK</div>

            <div class="info-grid">
              <div class="info-item"><strong>Nama Siswa:</strong> ${data.studentInfo.nama}</div>
              <div class="info-item"><strong>Kelas:</strong> ${data.studentInfo.class}</div>
              <div class="info-item"><strong>NISN:</strong> ${data.studentInfo.nisn}</div>
              <div class="info-item"><strong>Email:</strong> ${data.studentInfo.email}</div>
            </div>

            <div class="section-title">I. Ringkasan Performa & Absensi</div>
            <div class="stats-container">
              <div class="stat-card">
                <div>Persentase Kehadiran</div>
                <div class="stat-value">${data.attendance.rate}%</div>
              </div>
              <div class="stat-card">
                <div>Rata-rata Nilai Tugas</div>
                <div class="stat-value">${data.averageGrade}</div>
              </div>
              <div class="stat-card">
                <div>Total Hari Efektif</div>
                <div class="stat-value">${data.attendance.total} Hari</div>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Hadir</th>
                  <th>Sakit</th>
                  <th>Izin</th>
                  <th>Alpa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${data.attendance.hadir} Hari</td>
                  <td>${data.attendance.sakit} Hari</td>
                  <td>${data.attendance.izin} Hari</td>
                  <td>${data.attendance.alpa} Hari</td>
                </tr>
              </tbody>
            </table>

            <div class="section-title">II. Capaian Nilai Tugas Akademik</div>
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Mata Pelajaran</th>
                  <th>Nama Tugas</th>
                  <th>Tanggal Penilaian</th>
                  <th style="text-align: right;">Nilai</th>
                </tr>
              </thead>
              <tbody>
                ${gradesHtml}
              </tbody>
            </table>

            <div class="section-title">III. Jurnal Setoran Hafalan Al-Qur'an (Tahfidz)</div>
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Surah Hafalan</th>
                  <th>Jangkauan Ayat</th>
                  <th>Kelancaran</th>
                  <th>Catatan Pembimbing</th>
                </tr>
              </thead>
              <tbody>
                ${tahfidzHtml}
              </tbody>
            </table>

            <div class="footer-signature">
              <div>
                <p>Mengetahui,</p>
                <p style="margin-top: 10px;">Orang Tua / Wali Murid</p>
                <div class="signature-space">............................................</div>
              </div>
              <div>
                <p>Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p style="margin-top: 10px;">Guru Kelas IV-A</p>
                <div class="signature-space">Sarah Jenkins, S.Pd</div>
              </div>
            </div>

            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error('Error printing report card:', err);
      alert('Gagal memproses cetak rapor.');
    }
  };

  const renderStatusIcon = (studentId: string, date: string, isPresent: boolean) => {
    return (
      <button 
        onClick={() => handleToggleAttendance(studentId, date, isPresent)}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          display: 'block',
          margin: 'auto',
          transition: 'transform 0.15s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title={isPresent ? 'Klik untuk tandai Alpa' : 'Klik untuk tandai Hadir'}
      >
        {isPresent ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" style={{ width: '20px', height: '20px' }}>
            <circle cx="12" cy="12" r="10" fill="#e8fdf4" stroke="#10b981" strokeWidth="2" />
            <polyline points="9 11 11 13 15 9" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" style={{ width: '20px', height: '20px' }}>
            <circle cx="12" cy="12" r="10" fill="#fdf2f2" stroke="#ef4444" strokeWidth="2" />
            <line x1="15" y1="9" x2="9" y2="15" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="9" y1="9" x2="15" y2="15" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        )}
      </button>
    );
  };

  const formatHeaderDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return { label: 'Day', num: '0' };
    const dateObj = new Date(dateStr);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      label: dayNames[dateObj.getDay()],
      num: parts[2]
    };
  };

  // Hitung jumlah kehadiran kelas per tanggal target untuk chart
  const attendanceStats = targetDates.map((date, idx) => {
    let presentCount = 0;
    students.forEach((s) => {
      if (s.status && s.status[idx] === true) {
        presentCount++;
      }
    });
    const formatted = formatHeaderDate(date);
    return { 
      label: `${formatted.label} ${formatted.num}`, 
      value: presentCount 
    };
  });

  const classMax = Math.max(5, ...attendanceStats.map(s => s.value));
  const chartHeight = 150;
  const chartWidth = 500;
  const padding = 30;
  const barWidth = 40;
  const barGap = 25;

  const filteredStudents = students.filter(s => {
    const matchesName = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'all' || s.classId === selectedClass;
    return matchesName && matchesClass;
  });

  // Pagination states
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [visibleCount, setVisibleCount] = useState(5);

  const displayedStudents = filteredStudents.slice(0, visibleCount);

  const theme = {
    primary: '#6366f1',
    primaryLight: '#e0e7ff',
    primaryDark: '#4f46e5',
    success: '#10b981',
    successLight: '#ecfdf5',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    danger: '#ef4444',
    dangerLight: '#fdf2f2',
    info: '#06b6d4',
    infoLight: '#ecfeff',
    cardBg: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(226, 232, 240, 0.7)'
  };

  return (
    <DashboardLayout 
      activeMenu="dashboard" 
      pageTitle="Selamat Datang, Ustadzah Sarah!" 
      pageSubtitle="Dasbor EduFlow - Grade 4 Teacher"
    >
      {/* Dynamic Keyframes Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes typing {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .typing-dot {
          width: 5px;
          height: 5px;
          background-color: #6366f1;
          border-radius: 50%;
          display: inline-block;
          animation: typing 1.2s infinite ease-in-out;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .typing-dot:nth-child(3) { animation-delay: 0.3s; }
        .btn-action-active {
          transition: all 0.2s ease;
        }
        .btn-action-active:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
      ` }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.25fr 0.75fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Left Workspace Column: Metrics, Graphic + Quiz, Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Metrics Grid (4 Cards) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px'
          }}>
            {[
              { title: 'Kelas Diajar', val: '4 Kelas', color: theme.primary, bg: theme.primaryLight, path: 'M3 9H21M3 15H21M12 3V21' },
              { title: 'Total Murid', val: '120 Murid', color: theme.info, bg: theme.infoLight, path: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
              { title: 'Total Tugas', val: '12 Tugas', color: theme.warning, bg: theme.warningLight, path: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6' },
              { title: 'Pengumuman', val: '5 Berita', color: theme.success, bg: theme.successLight, path: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0' }
            ].map((metric, idx) => {
              const isHovered = hoveredCard === idx;
              return (
                <div 
                  key={idx}
                  className="card-premium" 
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ 
                    background: theme.cardBg, 
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: theme.border, 
                    borderRadius: '16px', 
                    padding: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: isHovered 
                      ? '0 12px 20px -8px rgba(99, 102, 241, 0.15), 0 4px 6px -2px rgba(99, 102, 241, 0.05)'
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.03)'
                  }}
                >
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '12px', 
                    backgroundColor: metric.bg, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flexShrink: 0,
                    transition: 'transform 0.3s ease',
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={metric.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                      <path d={metric.path} />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0, fontWeight: 600 }}>{metric.title}</p>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{metric.val}</h3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Row 2: Attendance Chart */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '24px'
          }}>
            {/* Chart: Tren Kehadiran */}
            <div 
              className="card-premium" 
              style={{ 
                background: theme.cardBg, 
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: theme.border, 
                borderRadius: '16px', 
                padding: '20px',
                position: 'relative',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Tren Kehadiran Harian Murid
                </h3>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, backgroundColor: '#eff6ff', color: '#3b82f6', padding: '2px 8px', borderRadius: '99px' }}>
                  Live Data
                </span>
              </div>

              {/* Chart Tooltip Overlay */}
              {hoveredChartIdx !== null && (
                <div style={{
                  position: 'absolute',
                  top: '48px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  zIndex: 20,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  {attendanceStats[hoveredChartIdx].label}: {attendanceStats[hoveredChartIdx].value} / {students.length || 120} Hadir ({Math.round(((attendanceStats[hoveredChartIdx].value) / (students.length || 120)) * 100)}%)
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <svg width="100%" height="120" viewBox="0 0 240 100" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                      <stop offset="60%" stopColor="#10b981" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="glow-attendance" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#10b981" floodOpacity="0.25" />
                    </filter>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="10" y1="15" x2="230" y2="15" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="10" y1="45" x2="230" y2="45" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="10" y1="75" x2="230" y2="75" stroke="#cbd5e1" strokeWidth="1" />

                  {/* Area fill */}
                  <path d={`M 20 ${75 - ((attendanceStats[0]?.value || 0) / (classMax || 1)) * 50} 
                            L 60 ${75 - ((attendanceStats[1]?.value || 0) / (classMax || 1)) * 50} 
                            L 100 ${75 - ((attendanceStats[2]?.value || 0) / (classMax || 1)) * 50} 
                            L 140 ${75 - ((attendanceStats[3]?.value || 0) / (classMax || 1)) * 50} 
                            L 180 ${75 - ((attendanceStats[4]?.value || 0) / (classMax || 1)) * 50} 
                            L 220 ${75 - ((attendanceStats[5]?.value || 0) / (classMax || 1)) * 50} L 220 75 L 20 75 Z`} 
                        fill="url(#chartGrad)" />

                  {/* Main Line path */}
                  <path d={`M 20 ${75 - ((attendanceStats[0]?.value || 0) / (classMax || 1)) * 50} 
                            L 60 ${75 - ((attendanceStats[1]?.value || 0) / (classMax || 1)) * 50} 
                            L 100 ${75 - ((attendanceStats[2]?.value || 0) / (classMax || 1)) * 50} 
                            L 140 ${75 - ((attendanceStats[3]?.value || 0) / (classMax || 1)) * 50} 
                            L 180 ${75 - ((attendanceStats[4]?.value || 0) / (classMax || 1)) * 50} 
                            L 220 ${75 - ((attendanceStats[5]?.value || 0) / (classMax || 1)) * 50}`} 
                        fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow-attendance)" />
                  
                  {/* Hover Rect triggers for interactive tooltip */}
                  {attendanceStats.map((stat, i) => {
                    const cx = 20 + i * 40;
                    const cy = 75 - (stat.value / (classMax || 1)) * 50;
                    const isHovered = hoveredChartIdx === i;
                    return (
                      <g key={i}>
                        <rect 
                          x={cx - 18} 
                          y="5" 
                          width="36" 
                          height="80" 
                          fill="transparent" 
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredChartIdx(i)}
                          onMouseLeave={() => setHoveredChartIdx(null)}
                        />
                        {/* Double Ring Node */}
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={isHovered ? 8 : 6} 
                          fill="#10b981" 
                          fillOpacity="0.15"
                          style={{ transition: 'all 0.15s ease' }}
                        />
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={isHovered ? 5 : 3.5} 
                          fill="#10b981" 
                          stroke="#ffffff" 
                          strokeWidth={isHovered ? 2.5 : 1.5} 
                          style={{ transition: 'all 0.15s ease' }}
                        />
                        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#047857" style={{ pointerEvents: 'none' }}>{stat.value}</text>
                        <text x={cx} y="88" textAnchor="middle" fontSize="6" fill="#64748b" fontWeight="700" style={{ pointerEvents: 'none' }}>{stat.label.substring(4)}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Card: Matrix Kehadiran Siswa */}
          <section 
            className="card-premium" 
            style={{
              background: theme.cardBg, 
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: theme.border, 
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Matriks Kehadiran Siswa - {selectedClass === 'all' ? 'Semua Kelas' : (classes.find(c => c.id === selectedClass)?.name || 'Kelas')}
                </h2>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>Ubah kehadiran murid dan pantau perubahannya secara real-time</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={handleMarkAllPresent}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#10b981';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Hadirkan Semua Hari Ini
                </button>

                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    color: '#1f2937',
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="all">📚 Semua Kelas</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>🏫 {cls.name}</option>
                  ))}
                </select>
                
                <input 
                  type="text"
                  placeholder="🔍 Cari nama murid..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    width: '160px',
                    backgroundColor: '#ffffff',
                    color: '#1f2937'
                  }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>
                    <th style={{ padding: '10px 8px', fontWeight: 600 }}>Nama Murid</th>
                    {targetDates.map((dateStr, idx) => {
                      const formatted = formatHeaderDate(dateStr);
                      return (
                        <th key={idx} style={{ padding: '10px 6px', fontWeight: 600, textAlign: 'center' }}>
                          {formatted.label}<br />
                          <span style={{ color: '#94a3b8', fontSize: '0.68rem' }}>{formatted.num}</span>
                        </th>
                      );
                    })}
                    <th style={{ padding: '10px 8px', fontWeight: 600, textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={targetDates.length + 2} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                        Memuat data absensi...
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={targetDates.length + 2} style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                        Siswa dengan nama &quot;{searchQuery}&quot; tidak ditemukan.
                      </td>
                    </tr>
                  ) : (
                    displayedStudents.map((student) => (
                      <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} className="btn-action-active">
                        <td style={{ padding: '10px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img 
                            src={student.avatar} 
                            alt={student.name} 
                            style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e2e8f0' }} 
                          />
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>{student.name}</span>
                        </td>
                        {student.status.map((isPresent, idx) => (
                          <td key={idx} style={{ padding: '10px 6px' }}>
                            {renderStatusIcon(student.id, targetDates[idx], isPresent)}
                          </td>
                        ))}
                        <td style={{ padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => handleOpenChat(student)}
                            style={{
                              backgroundColor: '#f5f3ff',
                              border: '1px solid #ddd6fe',
                              color: '#7c3aed',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ddd6fe'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f3ff'}
                          >
                            Chat
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!loading && filteredStudents.length > 0 && (
              <div style={{
                padding: '12px 0px 0px 0px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginTop: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Tampilkan</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setItemsPerPage(val);
                      setVisibleCount(val);
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      background: '#ffffff',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    murid dari total {filteredStudents.length} murid
                  </span>
                </div>

                {visibleCount < filteredStudents.length && (
                  <button
                    onClick={() => setVisibleCount(prev => prev + itemsPerPage)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      color: '#4f46e5',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#4f46e5';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = '#4f46e5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.color = '#4f46e5';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    Tampilkan Lebih Banyak
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Jurnal Tahfidz Murid */}
          <section 
            className="card-premium" 
            style={{
              background: theme.cardBg, 
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: theme.border, 
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)'
            }}
          >
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
              Jurnal Perkembangan Tahfidz Al-Qur&apos;an Siswa
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.7rem', fontWeight: 600 }}>
                    <th style={{ padding: '8px 4px', fontWeight: 600 }}>Siswa</th>
                    <th style={{ padding: '8px 4px', fontWeight: 600 }}>Surah / Juz</th>
                    <th style={{ padding: '8px 4px', fontWeight: 600 }}>Progres Kelancaran</th>
                    <th style={{ padding: '8px 4px', fontWeight: 600, textAlign: 'right' }}>Tanggal Setoran</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>
                        Memuat data setoran Tahfidz...
                      </td>
                    </tr>
                  ) : (
                    tahfidzRecords.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img 
                            src={item.avatar} 
                            alt={item.name} 
                            style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }} 
                          />
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b' }}>
                            {item.name}
                          </span>
                        </td>
                        <td style={{ padding: '8px 4px' }}>
                          <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', margin: 0 }}>{item.juz}</h5>
                          <p style={{ fontSize: '0.62rem', color: '#64748b', margin: 0 }}>{item.surah}</p>
                        </td>
                        <td style={{ padding: '8px 4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a', minWidth: '24px' }}>{item.progress}%</span>
                            <div style={{ width: '60px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                              <div style={{ width: `${item.progress}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '99px' }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '8px 4px', fontSize: '0.7rem', color: '#94a3b8', textAlign: 'right', fontWeight: 500 }}>
                          {item.date}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* Right Sidebar Widget Column: Schedule, Messages, Announcements, EWS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Widget 1: Jadwal Hari Ini */}
          <section 
            className="card-premium" 
            style={{ 
              background: theme.cardBg, 
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: theme.border, 
              borderRadius: '16px', 
              padding: '20px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Jadwal Mengajar Hari Ini</h3>
                  <span style={{ fontSize: '0.68rem', color: '#4f46e5', fontWeight: 700 }}>{agendaJadwal.length} Sesi Aktif</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', paddingLeft: '12px', borderLeft: '2px dashed #cbd5e1' }}>
              {agendaJadwal.map((agenda, idx) => {
                const isLive = isTimeInRange(agenda.time);
                return (
                  <div 
                    key={idx} 
                    style={{
                      position: 'relative',
                      padding: '12px',
                      backgroundColor: isLive ? '#eff6ff' : '#f8fafc',
                      border: isLive ? '1.5px solid #bfdbfe' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: isLive ? '0 4px 6px -1px rgba(59, 130, 246, 0.05)' : 'none'
                    }}
                  >
                    {/* Timeline Node Bullet */}
                    <div style={{
                      position: 'absolute',
                      left: '-19px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: isLive ? '#3b82f6' : '#cbd5e1',
                      border: '3px solid #ffffff',
                      boxShadow: isLive ? '0 0 0 3px rgba(59, 130, 246, 0.2)' : 'none',
                      animation: isLive ? 'pulse 2s infinite' : 'none'
                    }} />

                    <div>
                      {isLive && (
                        <span style={{ 
                          fontSize: '0.55rem', 
                          fontWeight: 800, 
                          color: '#ffffff', 
                          backgroundColor: '#ef4444', 
                          padding: '1px 5px', 
                          borderRadius: '4px', 
                          display: 'inline-block',
                          marginBottom: '4px'
                        }}>
                          🔴 SEDANG BERLANGSUNG
                        </span>
                      )}
                      <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{agenda.subject}</h4>
                      <p style={{ fontSize: '0.68rem', color: '#64748b', margin: '2px 0 0 0' }}>Kelas: <strong>{agenda.class}</strong> | Ruang: {agenda.room}</p>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isLive ? '#2563eb' : '#475569', backgroundColor: isLive ? '#dbeafe' : '#f1f5f9', padding: '4px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                      {agenda.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Widget 2: Pesan Masuk (Inbox Chat) */}
          <section 
            className="card-premium" 
            style={{ 
              background: theme.cardBg, 
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: theme.border, 
              borderRadius: '16px', 
              padding: '20px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)'
            }}
          >
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0' }}>
              Pesan Masuk Terbaru (Wali Murid)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div 
                onClick={() => {
                  const student = students.find(s => s.name.includes('Bilal')) || { id: 'siswa-bilal', name: 'Bilal Al-Mansoori' };
                  handleOpenChat(student);
                }}
                style={{
                  padding: '12px',
                  border: '1px solid #f1f5f9',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  backgroundColor: '#fef7f5',
                  borderLeft: '4px solid #f97316'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff7ed';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef7f5';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" 
                  alt="Pak Andi" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Pak Andi (Wali Bilal)</h4>
                    <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 }}>15 Menit Lalu</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#475569', margin: '2px 0 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    Ustadzah, mohon izin menginfokan bahwa Bilal hari ini...
                  </p>
                </div>
              </div>

              <div 
                onClick={() => {
                  const student = students.find(s => s.name.includes('Laila')) || { id: 'siswa-laila', name: 'Laila Hassan' };
                  handleOpenChat(student);
                }}
                style={{
                  padding: '12px',
                  border: '1px solid #f1f5f9',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  backgroundColor: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150" 
                  alt="Ibu Fatimah" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Ibu Fatimah (Wali Laila)</h4>
                    <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>2 Jam Lalu</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#475569', margin: '2px 0 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    Terima kasih atas kiriman Rapor digitalnya. Alhamdulillah Bilal...
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Widget 3: AI Early Warning System (EWS) */}
          <section 
            className="card-premium" 
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(250,245,255,0.9) 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: theme.border, 
              borderLeft: '4px solid #8b5cf6',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#f3e8ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8b5cf6',
                animation: 'pulse 3s infinite'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  AI Early Warning System
                </h2>
                <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '2px 0 0 0' }}>Deteksi tingkat kehadiran & performa kelas otomatis</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {classWarnings.length === 0 ? (
                <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem' }}>
                  Memuat data analisis performa kelas...
                </div>
              ) : (
                classWarnings.map((warning, idx) => {
                  const isAttendance = warning.type === 'attendance';
                  const isAcademic = warning.type === 'academic';
                  const isDone = actionDispatched[idx];
                  
                  let iconColor = '#d97706';
                  let cardBg = '#fffbeb';
                  let borderColor = '#fde68a';

                  if (isAttendance) {
                    iconColor = '#ef4444';
                    cardBg = '#fef2f2';
                    borderColor = '#fca5a5';
                  } else if (isAcademic) {
                    iconColor = '#f97316';
                    cardBg = '#fff7ed';
                    borderColor = '#fed7aa';
                  } else {
                    iconColor = '#10b981';
                    cardBg = '#f0fdf4';
                    borderColor = '#a7f3d0';
                  }

                  return (
                    <div 
                      key={idx} 
                      style={{
                        padding: '12px',
                        backgroundColor: isDone ? '#f0fdf4' : cardBg,
                        border: `1px solid ${isDone ? '#a7f3d0' : borderColor}`,
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isDone ? '#10b981' : iconColor }} />
                          <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                            {warning.title}
                          </h4>
                        </div>
                        
                        <button
                          onClick={() => handleTakeEwsAction(idx)}
                          disabled={isDone}
                          style={{
                            backgroundColor: isDone ? '#d1fae5' : '#4f46e5',
                            color: isDone ? '#065f46' : '#ffffff',
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            cursor: isDone ? 'default' : 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          className={isDone ? '' : 'btn-action-active'}
                        >
                          {isDone ? 'Terkirim ✓' : 'Tindak Lanjut'}
                        </button>
                      </div>
                      
                      <p style={{ fontSize: '0.72rem', color: '#475569', margin: 0, lineHeight: '1.4' }}>
                        {warning.message}
                      </p>
                      
                      <div style={{ 
                        fontSize: '0.68rem', 
                        color: '#0f172a', 
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        borderLeft: `3px solid ${isDone ? '#10b981' : iconColor}`,
                        fontWeight: 500
                      }}>
                        <strong style={{ fontWeight: 700 }}>Rekomendasi AI:</strong> {warning.recommendation}
                      </div>

                      {isDone && (
                        <p style={{ fontSize: '0.62rem', color: '#047857', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>🟢</span> Notifikasi WhatsApp telah berhasil dikirimkan ke orang tua murid.
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Widget 4: List Pengumuman */}
          <section 
            className="card-premium" 
            style={{ 
              background: theme.cardBg, 
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: theme.border, 
              borderRadius: '16px', 
              padding: '20px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)'
            }}
          >
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0' }}>
              Pengumuman & Agenda Terkini
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pengumumanList.map((item, idx) => (
                <div key={idx} style={{
                  padding: '12px',
                  border: '1px solid #f1f5f9',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      backgroundColor: item.bgColor,
                      color: item.color,
                      padding: '2px 6px',
                      borderRadius: '6px'
                    }}>{item.category}</span>
                    <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 600 }}>{item.date}</span>
                  </div>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    {item.title}
                  </h4>
                </div>
              ))}
            </div>
          </section>

          {/* Widget 5: Assignments List */}
          <section 
            className="card-premium" 
            style={{
              background: theme.cardBg, 
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: theme.border, 
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)'
            }}
          >
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
              Tugas & Penilaian Kelas Terbaru
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {assignments.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => {
                    if (item.link) {
                      window.location.href = item.link;
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #f1f5f9',
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(3px)';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.borderColor = '#f1f5f9';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: item.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0, marginTop: '2px', fontWeight: 600 }}>
                        {item.date}
                      </p>
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              ))}
            </div>
          </section>

        </div>

      </div>

      {/* Modal Konsultasi Chat (Buku Penghubung) */}
      {activeChatStudent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            width: '90%',
            maxWidth: '460px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  💬 Wali Murid: {activeChatStudent.name}
                </h3>
                <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0 0' }}>Buku Penghubung Guru & Wali Murid</p>
              </div>
              <button
                onClick={() => setActiveChatStudent(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  fontSize: '1.2rem',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                &times;
              </button>
            </div>

            <div style={{
              height: '280px',
              overflowY: 'auto',
              border: '1px solid #f1f5f9',
              borderRadius: '16px',
              padding: '16px',
              backgroundColor: '#f8fafc',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {isTypingSim ? (
                <div style={{
                  alignSelf: 'flex-start',
                  maxWidth: '85%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px 12px 12px 0',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Memuat chat</span>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              ) : chatMessages.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', margin: 'auto' }}>Belum ada histori konsultasi.</p>
              ) : (
                chatMessages.map((log) => {
                  const isGuru = log.sender_role === 'guru';
                  return (
                    <div key={log.id} style={{
                      alignSelf: isGuru ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      backgroundColor: isGuru ? '#e0e7ff' : '#ffffff',
                      border: isGuru ? '1px solid #c7d2fe' : '1px solid #e2e8f0',
                      borderRadius: isGuru ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '10px 14px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: isGuru ? '#4f46e5' : '#475569' }}>
                          {log.sender_name}
                        </span>
                        <span style={{ fontSize: '0.58rem', color: '#94a3b8', fontWeight: 600 }}>
                          {log.date}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#1e293b', margin: 0, lineHeight: '1.45' }}>
                        {log.message}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Ketik pesan balasan Anda..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  color: '#1f2937'
                }}
                required
              />
              <button
                type="submit"
                disabled={sendingReply}
                style={{
                  padding: '0 20px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
              >
                {sendingReply ? 'Mengirim...' : 'Balas'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
