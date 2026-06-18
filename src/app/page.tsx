'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Users, 
  Wallet, 
  Calendar, 
  Award, 
  MessageSquare, 
  Check, 
  ChevronDown, 
  ChevronRight,
  School, 
  Activity, 
  FileText, 
  CheckCircle,
  TrendingUp,
  ShieldCheck,
  FileCheck2,
  Heart,
  X,
  Send,
  Info
} from 'lucide-react';

const formatMessageText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} style={{ backgroundColor: '#f1f5f9', padding: '2px 4px', borderRadius: '4px', fontSize: '0.8rem' }}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

export default function LandingPage() {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Animation States
  const [animatedSections, setAnimatedSections] = useState<Set<string>>(new Set());

  // AI Chatbot Widget states
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    { sender: 'bot', text: 'Halo! Saya EduBot, asisten virtual EduFlow. Ada yang bisa saya bantu hari ini? Silakan tanyakan hal-hal seputar harga, fitur LMS, homeschooling, atau cara pendaftaran sekolah!' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const getBotResponse = (text: string): string => {
    const q = text.toLowerCase();
    
    if (q.includes('harga') || q.includes('biaya') || q.includes('paket') || q.includes('bayar') || q.includes('spp') || q.includes('murah') || q.includes('starter') || q.includes('pro')) {
      return 'EduFlow memiliki 3 paket langganan bulanan SaaS yang dirancang transparan:\n\n' +
             '• **Starter (Rp 499.000 / bln / sekolah)**:\n' +
             '  Sempurna untuk sekolah kecil atau yayasan baru. Fitur mencakup: Manajemen s.d. 150 siswa, presensi digital staf & murid, jurnal kas keuangan dasar, rekap bulanan otomatis, dan dukungan chat.\n\n' +
             '• **Professional (Rp 999.000 / bln / sekolah)**:\n' +
             '  Solusi lengkap untuk sekolah reguler. Fitur mencakup: Siswa & kelas tanpa batas, sistem LMS full, pengumpulan tugas, modul Tahfidz Al-Qur\'an, grafik keuangan lanjutan, dan dukungan prioritas 24/7.\n\n' +
             '• **Hybrid & Homeschool (Rp 1.499.000 / bln / sekolah)**:\n' +
             '  Paket terbaik untuk sekolah homeschooling/hybrid. Fitur mencakup: Semua fitur Pro, ditambah Portal Co-Teacher Orang Tua, penilaian adab & karakter anak, milestone path belajar mandiri, chat konsultasi, dan kustom sub-domain sekolah (sch.id).\n\n' +
             'Semua paket dilengkapi dengan **Uji Coba Gratis selama 14 Hari**!';
    }
    
    if (q.includes('daftar') || q.includes('registrasi') || q.includes('buat') || q.includes('akun') || q.includes('coba') || q.includes('onboard') || q.includes('wizard') || q.includes('sekolah baru')) {
      return 'Mendaftarkan sekolah baru Anda di EduFlow sangat praktis dan instan:\n\n' +
             '1. Gulir ke bawah landing page ini ke bagian **"Daftarkan Sekolah Baru Anda Instan"**.\n' +
             '2. **Langkah 1 (Identitas)**: Masukkan nama sekolah, tipe sekolah (SD/SMP/SMA/Pondok/Homeschool), dan alamat lengkap.\n' +
             '3. **Langkah 2 (Rute & Paket)**: Tentukan folder path URL (Tenant ID) kustom Anda (misal: `sdn01menteng` sehingga tautan sekolah Anda menjadi `eduflow.com/sdn01menteng/login`) dan pilih paket langganan.\n' +
             '4. **Langkah 3 (Akun Admin)**: Isi nama, email, dan sandi untuk administrator utama Anda.\n' +
             '5. Klik **"Aktifkan Sekolah Saya"**. Sistem SaaS kami akan otomatis menduplikasi template database SQLite khusus untuk sekolah Anda. Dalam waktu kurang dari 2 menit, sekolah Anda siap digunakan!';
    }
    
    if (q.includes('homeschool') || q.includes('hybrid') || q.includes('milestone') || q.includes('mandiri') || q.includes('belajar') || q.includes('jalur belajar')) {
      return 'EduFlow dirancang khusus untuk mendukung kurikulum mandiri dan homeschooling:\n\n' +
             '• **Jalur Belajar Mandiri (Milestones Path)**:\n' +
             '  Guru dapat menyusun rencana belajar terstruktur (milestones) yang harus diselesaikan siswa secara mandiri dan berurutan (*self-paced*).\n\n' +
             '• **Pelacakan Interaktif**:\n' +
             '  Di portal siswa, terdapat tab khusus "Homeschooling" di mana siswa dapat melihat jalur belajar mereka dan mencentang langsung setiap milestone yang telah mereka selesaikan untuk memperbarui grafik progresnya.\n\n' +
             '• **Konsultasi Dua Arah**:\n' +
             '  Siswa homeschooling dapat mengirim pesan chat konsultasi langsung ke guru pendamping jika mengalami kesulitan belajar dari rumah.';
    }
    
    if (q.includes('orang tua') || q.includes('ortu') || q.includes('co-teacher') || q.includes('wali') || q.includes('adab') || q.includes('karakter') || q.includes('jurnal harian')) {
      return 'Portal Orang Tua (Co-Teacher Console) adalah fitur unggulan EduFlow untuk kemitraan pendidikan:\n\n' +
             '• **Jurnal Aktivitas Harian**:\n' +
             '  Orang tua dapat mencatat laporan kegiatan harian anak selama belajar di rumah (terutama untuk homeschooling) lengkap dengan melampirkan berkas bukti (foto/dokumen) secara langsung.\n\n' +
             '• **Penilaian Karakter & Adab**:\n' +
             '  Orang tua diberikan wewenang menilai kualitas akhlak harian anak (seperti kejujuran, adab sopan santun, kemandirian, ibadah shalat) yang akan langsung terekap ke sistem sekolah.\n\n' +
             '• **Konsol Pantauan**:\n' +
             '  Orang tua memiliki akses transparan untuk melihat rekap nilai tugas anak, kehadiran, progres hafalan Quran anak, serta rapor akhir dari guru.';
    }
    
    if (q.includes('tahfidz') || q.includes('quran') || q.includes('hafalan') || q.includes('surah') || q.includes('juz') || q.includes('tajwid') || q.includes('makhraj')) {
      return 'Modul Tahfidz Al-Qur\'an EduFlow menyediakan pencatatan progres hafalan yang komprehensif:\n\n' +
             '• **Pencatatan Detail**:\n' +
             '  Guru pembimbing dapat memasukkan laporan hafalan harian per siswa yang meliputi: nama Surah, ayat yang disetor, kelancaran makhraj/tajwid (A/B/C/D), serta nama guru penyimak.\n\n' +
             '• **Kelulusan Juz**:\n' +
             '  Mencatat pencapaian kelulusan Juz siswa (mulai Juz Amma hingga Juz 30) dengan sistem tanggal kelulusan.\n\n' +
             '• **Grafik Progres**:\n' +
             '  Dasbor siswa & wali murid menampilkan grafik progres batang kumulatif hafalan surah serta daftar riwayat setoran lengkap untuk peninjauan.';
    }
    
    if (q.includes('keamanan') || q.includes('aman') || q.includes('database') || q.includes('bocor') || q.includes('isolasi') || q.includes('sqlite') || q.includes('tenant') || q.includes('hacker') || q.includes('saas')) {
      return 'EduFlow menggunakan arsitektur keamanan multi-tenancy tingkat tinggi:\n\n' +
             '• **Isolasi Database Fisik (Database-per-Tenant)**:\n' +
             '  Kami tidak mencampur data antar sekolah di satu database raksasa. Sebaliknya, setiap sekolah memiliki berkas SQLite terisolasi secara fisik di direktori server `/prisma/tenants/[kode-sekolah].db`.\n\n' +
             '• **Manfaat Utama**:\n' +
             '  - **Keamanan Data Mutlak**: Data keuangan, SPP, absensi, adab, dan nilai antar sekolah terisolasi secara fisik, sehingga mustahil terjadi kebocoran data silang.\n' +
             '  - **Kemudahan Backup**: Database sekolah Anda dapat diunduh dan di-backup secara mandiri kapan saja tanpa memengaruhi penyewa (tenant) lain.';
    }
    
    if (q.includes('lms') || q.includes('tugas') || q.includes('materi') || q.includes('modul') || q.includes('pdf') || q.includes('video') || q.includes('grading') || q.includes('koreksi')) {
      return 'Modul LMS (Learning Management System) EduFlow memfasilitasi kelas digital yang kaya fitur:\n\n' +
             '• **Modul Belajar**:\n' +
             '  Guru dapat mempublikasikan materi dalam bentuk dokumen (PDF), media interaktif (video YouTube/Drive), atau referensi eksternal (link).\n\n' +
             '• **Penugasan & Pengumpulan File Riil**:\n' +
             '  Siswa mengunduh materi dan mengumpulkan tugas mereka melalui upload file asli (seperti PDF atau gambar pekerjaan tangan) langsung dari portal siswa.\n\n' +
             '• **Koreksi & Rekap Nilai**:\n' +
             '  Guru dapat memeriksa berkas tugas siswa, memberikan nilai (0-100) beserta feedback teks koreksi. Seluruh nilai tugas terakumulasi otomatis ke rekap Rapor akademik.';
    }

    if (q.includes('absensi') || q.includes('absen') || q.includes('hadir') || q.includes('presensi') || q.includes('karyawan') || q.includes('staf') || q.includes('curang')) {
      return 'Sistem Absensi EduFlow dirancang transparan untuk siswa maupun staf sekolah:\n\n' +
             '• **Absensi Staf & Guru**:\n' +
             '  Pencatatan kehadiran staf sekolah menggunakan validasi server-side timestamp secara real-time yang anti-manipulatif untuk mencatat jam masuk dan jam pulang.\n\n' +
             '• **Absensi Siswa**:\n' +
             '  Guru dapat mencatat kehadiran harian murid di kelas. Rekap absensi siswa (Sakit, Izin, Alpa, Hadir) dihitung otomatis dan disajikan dalam grafik persentase visual bulanan di dasbor siswa & orang tua.';
    }

    if (q.includes('keuangan') || q.includes('kas') || q.includes('transaksi') || q.includes('spp') || q.includes('donasi') || q.includes('pengeluaran') || q.includes('rugi laba') || q.includes('finansial')) {
      return 'Modul Kas & Keuangan EduFlow mendukung transparansi manajemen kas sekolah:\n\n' +
             '• **Buku Kas Umum**:\n' +
             '  Mencatat semua transaksi dana masuk (SPP siswa, donasi, bantuan operasional) dan dana keluar (operasional sekolah, gaji guru, pembelian fasilitas).\n\n' +
             '• **Manajemen Pembayaran SPP**:\n' +
             '  Menyediakan pencatatan status tagihan SPP bulanan siswa yang terstruktur per kelas (Lunas vs Tunggakan).\n\n' +
             '• **Laporan Rugi Laba Bulanan**:\n' +
             '  Menghitung arus kas bersih secara otomatis dan menampilkannya dalam bentuk grafik garis tren kas masuk vs kas keluar di dasbor kepala sekolah.';
    }

    if (q.includes('owner') || q.includes('saas-admin') || q.includes('monitor') || q.includes('storage') || q.includes('disk') || q.includes('suspend') || q.includes('tangguhkan') || q.includes('blokir') || q.includes('aktifkan')) {
      return 'EduFlow menyediakan Panel Monitoring SaaS Owner khusus pada rute `/saas-admin`:\n\n' +
             '• **Metrik Pemantauan Penuh**:\n' +
             '  Pemilik platform (SaaS Owner) dapat memantau kapasitas disk storage (ukuran berkas database SQLite fisik) masing-masing sekolah, jumlah akun terdaftar, status masa aktif paket, dan grafik MRR.\n\n' +
             '• **Fitur Suspend (Ditangguhkan)**:\n' +
             '  SaaS Owner dapat menonaktifkan sekolah yang menunggak tagihan dengan satu klik. Akun sekolah tersebut akan langsung terkunci, dan seluruh penggunanya akan dialihkan secara otomatis ke halaman pemberitahuan `/suspended`.';
    }

    if (q.includes('stack') || q.includes('teknologi') || q.includes('framework') || q.includes('coding') || q.includes('bahasa') || q.includes('db') || q.includes('react') || q.includes('prisma')) {
      return 'EduFlow dibangun di atas teknologi modern standar industri:\n\n' +
             '• **Framework Utama**: Next.js (React) versi 14 dengan App Router.\n' +
             '• **Bahasa Pemrograman**: TypeScript (dengan pengetikan ketat bebas error).\n' +
             '• **ORM & Database**: Prisma ORM terkoneksi ke multi-database SQLite terisolasi.\n' +
             '• **Antarmuka (UI/UX)**: Vanilla CSS kustom premium, layout grid responsif, typography Outfit & Inter, serta ikon visual dari Lucide React.';
    }

    if (q.includes('halo') || q.includes('hi') || q.includes('p') || q.includes('siang') || q.includes('pagi') || q.includes('sore') || q.includes('malam') || q.includes('bot') || q.includes('tanya')) {
      return 'Halo! Saya EduBot, asisten virtual EduFlow. Saya dapat menerangkan detail fitur aplikasi kami. Silakan tanyakan hal spesifik seperti:\n\n' +
             '• Rincian harga paket langganan\n' +
             '• Kurikulum homeschooling & Co-Teacher\n' +
             '• Cara pendaftaran sekolah baru\n' +
             '• Sistem pencatatan hafalan Tahfidz\n' +
             '• Keamanan database terisolasi SaaS\n' +
             '• Laporan kas & keuangan sekolah\n' +
             '• Fitur LMS & upload file tugas siswa';
    }
    
    return 'Pertanyaan menarik! EduFlow adalah solusi lengkap digitalisasi sekolah. Untuk info lebih detail atau jika Anda ingin menjadwalkan demo langsung dengan tim sales kami, Anda bisa langsung klik tombol **"Tanya Admin Manusia"** atau hubungi WhatsApp Admin kami di nomor +62 812-3456-7890.';
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputText('');
    setIsTyping(true);
    
    setTimeout(() => {
      const response = getBotResponse(text);
      setMessages(prev => [...prev, { sender: 'bot', text: response }]);
      setIsTyping(false);
    }, 600);
  };

  // Form Onboarding Sekolah Baru (Interactive SaaS Onboarding Wizard)
  const [obStep, setObStep] = useState(1);
  const [obSchoolName, setObSchoolName] = useState('');
  const [obSchoolType, setObSchoolType] = useState('SD');
  const [obSchoolAddress, setObSchoolAddress] = useState('');
  const [obPathSegment, setObPathSegment] = useState('');
  const [obPlan, setObPlan] = useState('PREMIUM');
  const [obAdminName, setObAdminName] = useState('');
  const [obAdminEmail, setObAdminEmail] = useState('');
  const [obAdminPassword, setObAdminPassword] = useState('');
  
  const [obStatus, setObStatus] = useState<string | null>(null);
  const [obError, setObError] = useState<string | null>(null);
  const [obLoading, setObLoading] = useState(false);
  const [obCreatedTenant, setObCreatedTenant] = useState<any>(null);

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setObError(null);
    setObStatus('Menginisialisasi server & database sekolah terisolasi...');
    setObLoading(true);

    try {
      const res = await fetch('/api/saas/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: obSchoolName,
          pathSegment: obPathSegment.trim().toLowerCase(),
          adminName: obAdminName,
          adminEmail: obAdminEmail,
          adminPassword: obAdminPassword,
          plan: obPlan
        })
      });

      const json = await res.json();
      if (json.success) {
        setObCreatedTenant(json.tenant);
        setObStatus('Selamat! Database sekolah Anda telah aktif & siap digunakan.');
        setObStep(4);
      } else {
        setObError(json.error || 'Terjadi kesalahan saat mendaftarkan sekolah.');
        setObStatus(null);
      }
    } catch (err: any) {
      setObError(err.message || 'Gagal menghubungi server.');
      setObStatus(null);
    } finally {
      setObLoading(false);
    }
  };

  const stats = [
    { value: '500+', label: 'Sekolah Aktif', target: 500 },
    { value: '75,000+', label: 'Siswa & Wali Murid', target: 75000 },
    { value: '12,000+', label: 'Guru & Pendidik', target: 12000 },
    { value: '99.4%', label: 'Kepuasan Pengguna', target: 994 }
  ];

  const roleBenefits = {
    admin: {
      title: 'Solusi Manajemen Sekolah Terpusat',
      subtitle: 'Ambil kendali operasional sekolah dalam satu dasbor administratif modern.',
      features: [
        'Manajemen Data Akademik, Kelas, dan Staf secara real-time.',
        'Jurnal Kas Keuangan terpadu untuk pencatatan SPP, operasional, dan donasi.',
        'Absensi Guru & Karyawan anti-manipulatif dengan pelacakan server.',
        'Laporan analitik otomatis untuk pengambilan keputusan kepala sekolah.'
      ]
    },
    guru: {
      title: 'Kurangi Beban Kerja, Fokus Mengajar',
      subtitle: 'Digitalisasi administrasi kelas agar proses belajar mengajar lebih efisien.',
      features: [
        'LMS Mandiri untuk distribusi modul ajar (PDF, video, dan link).',
        'Pembuat tugas digital dengan deadline otomatis dan grading praktis.',
        'Pencatatan setoran hafalan Al-Qur\'an (Tahfidz) per murid terintegrasi.',
        'Rekap kehadiran siswa digital yang langsung tersinkronisasi.'
      ]
    },
    siswa: {
      title: 'Ruang Belajar Mandiri & Homeschooling',
      subtitle: 'Wadah belajar modern bagi murid reguler maupun homeschooling penuh.',
      features: [
        'Akses rencana belajar terstruktur (Milestones Path) yang self-paced.',
        'Fitur pengumpulan tugas/portofolio riil dengan drag-and-drop upload.',
        'Ruang chat konsultasi langsung dengan guru kelas & co-teacher.',
        'Laporan grafik progres akademik dan hafalan harian yang memotivasi.'
      ]
    },
    'orang-tua': {
      title: 'Kemitraan Pendidik yang Transparan',
      subtitle: 'Konsol Co-Teacher untuk memantau dan membimbing tumbuh kembang anak.',
      features: [
        'Jurnal Aktivitas Harian untuk homeschooling terpantau langsung oleh guru.',
        'Penilaian adab dan karakter harian anak dari rumah secara objektif.',
        'Akses instan ke nilai tugas, riwayat absensi, dan laporan akhir.',
        'Komunikasi interaktif dua arah tanpa hambatan dengan sekolah.'
      ]
    }
  };

  const featureCards = [
    {
      icon: <BookOpen className="w-6 h-6 text-indigo-400" />,
      title: 'LMS & Modul Digital',
      desc: 'Kelola kelas online, bagikan modul materi ajar (PDF/Video), dan beri penugasan interaktif dalam hitungan detik.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop',
      color: '#6366f1'
    },
    {
      icon: <Users className="w-6 h-6 text-teal-400" />,
      title: 'Absensi Anti-Manipulatif',
      desc: 'Pencatatan kehadiran guru dan siswa terintegrasi langsung dengan timestamp server untuk validitas data.',
      image: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=600&h=400&fit=crop',
      color: '#0d9488'
    },
    {
      icon: <Wallet className="w-6 h-6 text-emerald-400" />,
      title: 'Jurnal Kas Keuangan',
      desc: 'Sistem keuangan transparan untuk pembukuan SPP masuk, donasi, pengeluaran operasional, dan laporan rugi laba.',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop',
      color: '#10b981'
    },
    {
      icon: <Award className="w-6 h-6 text-blue-400" />,
      title: 'Tahfidz & Hafalan Qur\'an',
      desc: 'Catat progres hafalan surah, ayat, kelancaran tajwid, dan status kelulusan juz secara terstruktur.',
      image: 'https://images.unsplash.com/photo-1609599006353-e629f1dca0a9?w=600&h=400&fit=crop',
      color: '#3b82f6'
    },
    {
      icon: <Calendar className="w-6 h-6 text-purple-400" />,
      title: 'Jalur Belajar Homeschooling',
      desc: 'Dukungan penuh kurikulum mandiri dengan milestone dinamis yang memandu kemajuan siswa secara fleksibel.',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop',
      color: '#8b5cf6'
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-rose-400" />,
      title: 'Konsol Orang Tua (Co-Teacher)',
      desc: 'Wadah bagi wali murid untuk melaporkan adab harian anak dan berkolaborasi langsung dengan guru sekolah.',
      image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&h=400&fit=crop',
      color: '#f43f5e'
    }
  ];

  const testimonials = [
    {
      quote: "EduFlow mengubah total cara kami mengelola administrasi. Guru-guru menghemat waktu 3-4 jam setiap minggu untuk rekap absen dan nilai.",
      author: "Dr. Ahmad Ridwan, M.Pd",
      role: "Kepala Sekolah SMA Al-Fatih"
    },
    {
      quote: "Sangat membantu untuk kelas homeschooling anak saya. Laporan portofolio harian dan penilaian adab mudah diisi langsung dari HP.",
      author: "Bunda Sarah Amelia",
      role: "Wali Murid & Co-Teacher Homeschool"
    },
    {
      quote: "Fitur Tahfidz dan upload modul belajarnya sangat praktis. Murid-murid bisa mengumpulkan tugas riil dan melihat feedback saya secara instan.",
      author: "Ustadz Hanafi, S.Th.I",
      role: "Guru & Pembimbing Tahfidz Qur\'an"
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Rp 499.000',
      yearlyPrice: 'Rp 4.790.000',
      period: 'per bulan / sekolah',
      yearlyPeriod: 'per tahun / sekolah (hemat 20%)',
      desc: 'Sempurna untuk sekolah kecil atau yayasan baru yang ingin mendigitalisasi kas & presensi.',
      features: [
        'Manajemen s.d. 150 Siswa',
        'Presensi Digital Staf & Murid',
        'Jurnal Kas Keuangan Dasar',
        'Laporan Bulanan Otomatis',
        'Support via Email & Chat'
      ],
      popular: false,
      cta: 'Coba Gratis 7 Hari'
    },
    {
      name: 'Professional',
      price: 'Rp 999.000',
      yearlyPrice: 'Rp 9.590.000',
      period: 'per bulan / sekolah',
      yearlyPeriod: 'per tahun / sekolah (hemat 20%)',
      desc: 'Solusi lengkap terintegrasi untuk sekolah reguler yang membutuhkan LMS & tracking Tahfidz.',
      features: [
        'Siswa & Kelas Tanpa Batas',
        'Sistem LMS & Pengumpulan Tugas',
        'Modul Catatan Hafalan Tahfidz',
        'Grafik Kas & Keuangan Lanjutan',
        'Akses Akun Guru & Staf Tanpa Batas',
        'Support Prioritas WA 24/7'
      ],
      popular: true,
      cta: 'Mulai Uji Coba Pro'
    },
    {
      name: 'Hybrid & Homeschool',
      price: 'Rp 1.499.000',
      yearlyPrice: 'Rp 14.390.000',
      period: 'per bulan / sekolah',
      yearlyPeriod: 'per tahun / sekolah (hemat 20%)',
      desc: 'Paket terlengkap khusus sekolah modern dengan kurikulum hybrid dan homeschooling terpandu.',
      features: [
        'Semua Fitur Paket Professional',
        'Portal Co-Teacher Orang Tua',
        'Form Jurnal & Penilaian Adab Murid',
        'Milestone Path Belajar Mandiri',
        'Konsultasi Chat Guru & Parent',
        'Domain Kustom Sekolah (sch.id)',
        'Pelatihan Staf Pendampingan Penuh'
      ],
      popular: false,
      cta: 'Hubungi Tim Penjualan'
    }
  ];

  const faqs = [
    {
      q: "Bagaimana proses migrasi data dari Excel atau sistem lama?",
      a: "Sangat mudah! Tim onboarding kami siap membantu memindahkan seluruh data siswa, guru, dan inventaris sekolah Anda dari file Excel secara gratis. Proses ini biasanya selesai dalam waktu kurang dari 48 jam."
    },
    {
      q: "Apakah wali murid harus membayar akun Orang Tua?",
      a: "Tidak. Akun Orang Tua (Wali Murid / Co-Teacher) disediakan secara gratis dan terintegrasi penuh dalam paket langganan bulanan sekolah Anda."
    },
    {
      q: "Bagaimana EduFlow mendukung kurikulum homeschooling?",
      a: "EduFlow menyediakan modul khusus rencana belajar terbimbing (Self-Paced Milestones). Orang tua dapat bertindak sebagai mitra pengajar (Co-Teacher) yang mengirimkan laporan portofolio harian dan memberikan penilaian karakter anak yang tersambung langsung dengan guru pengawas dari sekolah."
    },
    {
      q: "Apakah data keuangan dan akademik sekolah kami aman?",
      a: "Keamanan data adalah prioritas utama kami. Seluruh database EduFlow dienkripsi menggunakan protokol SSL/TLS standar industri dan dicadangkan secara harian di server cloud terpercaya untuk mencegah kehilangan data."
    },
    {
      q: "Dapatkah kami membatalkan langganan kapan saja?",
      a: "Tentu. Layanan EduFlow bersifat bulanan tanpa kontrak yang mengikat. Anda dapat melakukan downgrade, upgrade, atau membatalkan langganan kapan saja tanpa dikenakan biaya penalti."
    }
  ];

  const toggleFaq = (index: number) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };


  // ========== ANIMATION HOOKS ==========

  const [scrolled, setScrolled] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isYearly, setIsYearly] = useState(false);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const sectionRefs = useRef<Map<string, HTMLElement | null>>(new Map());

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 60);

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      setReadingProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12 }
    );

    const elements = document.querySelectorAll('.section-reveal, .section-reveal-left, .section-reveal-right');
    elements.forEach((el) => observer.observe(el));

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
      const statsObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setStatsAnimated(true);
            statsObserver.unobserve(entry.target);
          }
        },
        { threshold: 0.3 }
      );
      statsObserver.observe(statsSection);
    }

    return () => observer.disconnect();
  }, []);

  // Animated counter effect
  const [displayStats, setDisplayStats] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    if (!statsAnimated) return;

    const targets = [500, 75000, 12000, 994];
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayStats(targets.map(t => Math.round(t * eased)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [statsAnimated]);

  // Typewriter effect
  const [typewriterText, setTypewriterText] = useState('');
  const fullHeadline = 'Masa Depan Manajemen Sekolah & Pembelajaran Hybrid';

  useEffect(() => {
    let index = 0;
    setTypewriterText('');

    const interval = setInterval(() => {
      index++;
      setTypewriterText(fullHeadline.slice(0, index));
      if (index >= fullHeadline.length) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // 3D Tilt handlers
  const handleTilt = useCallback((e: React.MouseEvent<HTMLDivElement>, cardId: string) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;
  }, []);

  const handleTiltReset = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
  }, []);

  // Role card 3D tilt
  const roleCardRef = useRef<HTMLDivElement>(null);
  const [roleTilt, setRoleTilt] = useState({ x: 0, y: 0 });

  const handleRoleTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRoleTilt({ x: y * -10, y: x * 10 });
  };

  const resetRoleTilt = () => {
    setRoleTilt({ x: 0, y: 0 });
  };

  return (
    <main style={{ fontFamily: 'var(--font-family)', minHeight: '100vh', backgroundColor: '#ffffff', color: '#0f172a', position: 'relative' }}>
      {/* CSS Animations Styles */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .section-reveal {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        
        .section-reveal.active {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .card-animate {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .card-animate:hover {
          transform: translateY(-8px) scale(1.02);
        }
        
        @media (min-width: 1024px) {
          .lg\:grid-cols-2 {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>

      {/* 🧭 Sticky Navigation */}
      <header className={scrolled ? 'navbar-scrolled' : ''} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(15, 23, 42, 0.06)' : '1px solid transparent',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <div className="container" style={{
          height: '76px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #0d9488 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 8px rgba(79, 70, 229, 0.2)'
            }}>
              <School className="w-5 h-5 text-white" />
            </div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: scrolled ? '#0f172a' : '#ffffff' }}>
              EduFlow
            </span>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '36px' }} className="hidden lg:flex">
            <a href="#fitur" className="nav-link" style={{ fontSize: '0.9rem', fontWeight: 500, color: scrolled ? '#475569' : '#e2e8f0', transition: 'color 0.2s' }}>Fitur</a>
            <a href="#solusi" className="nav-link" style={{ fontSize: '0.9rem', fontWeight: 500, color: scrolled ? '#475569' : '#e2e8f0', transition: 'color 0.2s' }}>Solusi Peran</a>
            <a href="#pricing" className="nav-link" style={{ fontSize: '0.9rem', fontWeight: 500, color: scrolled ? '#475569' : '#e2e8f0', transition: 'color 0.2s' }}>Harga</a>
            <a href="#faq" className="nav-link" style={{ fontSize: '0.9rem', fontWeight: 500, color: scrolled ? '#475569' : '#e2e8f0', transition: 'color 0.2s' }}>FAQ</a>
          </nav>

          <Link href="/login" style={{
            backgroundColor: scrolled ? '#4f46e5' : 'rgba(255,255,255,0.12)',
            color: '#ffffff',
            padding: '9px 22px',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontWeight: 600,
            backdropFilter: scrolled ? 'none' : 'blur(8px)',
            border: scrolled ? 'none' : '1px solid rgba(255,255,255,0.15)',
            transition: 'all 0.3s ease'
          }}>
            Portal Login
          </Link>
        </div>
      </header>

      {/* 🎬 Hero Section */}
      <section className="hero-mesh-premium" style={{ padding: '140px 0 120px 0', color: '#ffffff', minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Floating geometric shapes */}
        <div className="geo-orbit" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)', top: '10%', left: '-5%', animation: 'pulse-glow-soft 6s ease-in-out infinite' }} />
        <div className="geo-orbit" style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 70%)', bottom: '10%', right: '10%', animation: 'pulse-glow-soft 8s ease-in-out infinite 2s' }} />

        {/* Animated 3D Shapes */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div className="geo-shape" style={{ top: '20%', left: '10%', width: '60px', height: '60px', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '16px', background: 'rgba(99,102,241,0.05)', animation: 'float-3d-1 7s ease-in-out infinite', transformStyle: 'preserve-3d', backdropFilter: 'blur(4px)' }} />
          <div className="geo-shape" style={{ top: '60%', right: '15%', width: '80px', height: '80px', border: '1px solid rgba(13,148,136,0.15)', borderRadius: '50%', background: 'rgba(13,148,136,0.03)', animation: 'float-3d-2 9s ease-in-out infinite 1s', backdropFilter: 'blur(4px)' }} />
          <div className="geo-shape" style={{ bottom: '30%', left: '20%', width: '40px', height: '40px', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', background: 'rgba(16,185,129,0.04)', animation: 'float-3d-3 8s ease-in-out infinite 2s', transform: 'rotate(45deg)', backdropFilter: 'blur(4px)' }} />
          <div className="geo-shape" style={{ top: '15%', right: '30%', width: '20px', height: '20px', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', animation: 'float-3d-1 6s ease-in-out infinite 0.5s' }} />
        </div>

        <div className="container lg:grid-cols-2" style={{ display: 'grid', gap: '48px', alignItems: 'center', position: 'relative', zIndex: 10 }}>
          {/* Left Hero Content */}
          <div className="section-reveal visible" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
              <span style={{ padding: '2px 8px', fontSize: '0.65rem', background: 'linear-gradient(135deg, #818cf8, #34d399)', borderRadius: '100px', color: '#fff', fontWeight: 700 }}>UPDATE 2.5</span>
              <span style={{ fontSize: '0.75rem', color: '#e2e8f0', fontWeight: 500 }}>Fitur Kurikulum Homeschooling Aktif</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 800, lineHeight: '1.08', letterSpacing: '-0.04em', minHeight: '1.2em' }}>
              {typewriterText}<span className="typewriter-cursor" />
            </h1>

            <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#94a3b8', maxWidth: '520px', fontWeight: 400 }}>
              Satu ekosistem SaaS terintegrasi untuk menyederhanakan administrasi sekolah reguler, memantau keuangan, mencatat setoran Qur&apos;an, hingga memfasilitasi kemitraan belajar homeschooling.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '8px' }}>
              <Link href="/login" className="magnetic-btn" style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                padding: '16px 32px',
                borderRadius: '12px',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)'
              }}>
                Coba Demo Sekarang
              </Link>
              <a href="#solusi" style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '16px 32px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '1rem',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.3s ease'
              }}>
                Pelajari Fitur
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px' }}>
              <div style={{ display: 'flex' }}>
                {[1, 2, 3].map((n) => (
                  <div key={n} style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: n === 1 ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : n === 2 ? 'linear-gradient(135deg, #0d9488, #14b8a6)' : 'linear-gradient(135deg, #10b981, #34d399)',
                    border: '2px solid #0b0f19',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#fff',
                    marginLeft: n > 1 ? '-10px' : 0
                  }}>
                    {n === 1 ? 'AD' : n === 2 ? 'GR' : 'SW'}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Dipercaya oleh sekolah & yayasan pendidikan progresif.</span>
            </div>
          </div>

          {/* Right Hero - 3D Glass Stack */}
          <div className="section-reveal-right stagger-2 hidden lg:block" style={{ position: 'relative', height: '500px' }}>
            <div className="glass-abstract-stack" style={{ height: '500px' }}>
              <div className="glass-shape glass-shape-1" style={{ width: '300px', height: '200px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px' }}>
                <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%', justifyContent: 'space-between', color: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399' }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#a1a1aa', letterSpacing: '0.05em' }}>LMS PORTAL</span>
                    </div>
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '2px' }}>Fisika Kelas XI</h4>
                    <p style={{ fontSize: '0.68rem', color: '#a1a1aa' }}>Materi Ajar: Termodinamika.pdf</p>
                  </div>
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '75%', background: 'linear-gradient(90deg, #6366f1, #818cf8)', borderRadius: '10px' }} />
                  </div>
                </div>
              </div>

              <div className="glass-shape glass-shape-2" style={{ width: '280px', height: '240px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '28px' }}>
                <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', height: '100%', justifyContent: 'space-between', color: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fbbf24' }} />
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#a1a1aa', letterSpacing: '0.05em' }}>FINANCE JOURNAL</span>
                    </div>
                    <Wallet className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: '#a1a1aa' }}>Total Saldo Kas</span>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>Rp 148.250.000</h3>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#a1a1aa' }}>
                    <span>SPP Terkumpul: 92%</span>
                    <span style={{ color: '#34d399' }}>+4.2% Bln Ini</span>
                  </div>
                </div>
              </div>

              <div className="glass-shape glass-shape-3" style={{ width: '320px', height: '140px', background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.2)', borderRadius: '28px' }}>
                <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: '14px', color: '#ffffff' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(79,70,229,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a5b4fc' }}>
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>Setoran Tahfidz</h4>
                    <p style={{ fontSize: '0.68rem', color: '#a1a1aa' }}>Siswa: Yusuf A. - Surah An-Naba ✅ Lancar</p>
                  </div>
                </div>
              </div>

              <div className="floating-item" style={{ top: '12%', left: '5%', animation: 'float-slow-1 7s ease-in-out infinite', background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(12px)' }}>
                <Activity className="w-4 h-4 text-teal-400" />
                <span>Absensi Real-Time</span>
              </div>

              <div className="floating-item" style={{ bottom: '8%', right: '8%', animation: 'float-slow-2 8s ease-in-out infinite', background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(12px)' }}>
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Penilaian Adab</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 Stats Section */}
      <section className="stats-section" style={{ padding: '70px 0', backgroundColor: '#ffffff', position: 'relative' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '32px'
          }}>
            {stats.map((st, i) => (
              <div key={i} className={`stat-card ${statsAnimated ? 'visible' : ''}`} style={{
                textAlign: 'center',
                padding: '24px 16px',
                borderRadius: '16px',
                background: statsAnimated ? 'linear-gradient(180deg, rgba(79,70,229,0.02) 0%, transparent 100%)' : 'transparent',
                transition: 'all 0.5s ease',
                transitionDelay: `${i * 0.15}s`
              }}>
                <span style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, color: '#4f46e5', letterSpacing: '-0.02em', display: 'block', marginBottom: '8px' }}>
                  {statsAnimated ? (
                    <>
                      {st.label.includes('%') ? (
                        <>{displayStats[i] / 10}.{(displayStats[i] % 10).toFixed(0)}%</>
                      ) : st.label.includes('Siswa') || st.label.includes('Guru') ? (
                        <>{displayStats[i].toLocaleString('id-ID')}+</>
                      ) : (
                        <>{displayStats[i]}+</>
                      )}
                    </>
                  ) : (
                    '0'
                  )}
                </span>
                <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: 500 }}>{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="wave-divider">
        <svg viewBox="0 0 1200 80" preserveAspectRatio="none" style={{ width: '100%', height: '80px' }}>
          <path d="M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,80 L0,80 Z" fill="#f8fafc" />
        </svg>
      </div>



      {/* 🎯 Interactive Role Switcher */}
      <section id="solusi" style={{ padding: '100px 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="section-reveal" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '0.7rem', color: '#4f46e5', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.12em', background: 'rgba(79,70,229,0.08)', padding: '4px 12px', borderRadius: '100px' }}>SOLUSI PERAN</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#0f172a', marginTop: '20px', marginBottom: '16px', letterSpacing: '-0.03em' }}>
              Platform Terintegrasi untuk Setiap Peran
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#475569', maxWidth: '600px', margin: '0 auto' }}>
              EduFlow menjembatani kebutuhan administratif sekolah, proses mengajar guru, kemandirian siswa, dan pengawasan orang tua.
            </p>
          </div>

          <div className="section-reveal stagger-1 lg:grid-cols-12" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="lg:col-span-4">
              {[
                { id: 'admin', label: 'Administrator Sekolah', desc: 'Kelola kas, staf, & perizinan', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop' },
                { id: 'guru', label: 'Guru & Pendidik', desc: 'LMS kelas & rekap Tahfidz', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
                { id: 'siswa', label: 'Siswa & Pendidik Mandiri', desc: 'Milestones & kumpul tugas', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop' },
                { id: 'orang-tua', label: 'Orang Tua / Co-Teacher', desc: 'Pantau harian & nilai adab', avatar: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=100&h=100&fit=crop' }
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '16px',
                    border: '1.5px solid',
                    borderColor: selectedRole === role.id ? '#4f46e5' : 'rgba(15, 23, 42, 0.06)',
                    backgroundColor: selectedRole === role.id ? '#ffffff' : 'transparent',
                    boxShadow: selectedRole === role.id ? '0 10px 25px -5px rgba(79, 70, 229, 0.08)' : 'none',
                    textAlign: 'left',
                    width: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '2px solid',
                    borderColor: selectedRole === role.id ? '#4f46e5' : '#cbd5e1',
                    flexShrink: 0,
                    transition: 'all 0.3s ease',
                    boxShadow: selectedRole === role.id ? '0 0 0 4px rgba(79, 70, 229, 0.12)' : 'none'
                  }}>
                    <img src={role.avatar} alt={role.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: selectedRole === role.id ? '#4f46e5' : '#1f2937' }}>{role.label}</span>
                    <span style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: '1.3' }}>{role.desc}</span>
                  </div>
                </button>
              ))}
            </div>

            <div
              ref={roleCardRef}
              onMouseMove={handleRoleTilt}
              onMouseLeave={resetRoleTilt}
              className="lg:col-span-8"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(15, 23, 42, 0.06)',
                borderRadius: '24px',
                padding: '40px',
                boxShadow: selectedRole ? '0 20px 40px -10px rgba(15, 23, 42, 0.04)' : 'none',
                minHeight: '450px',
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '32px',
                transform: `perspective(800px) rotateX(${roleTilt.x}deg) rotateY(${roleTilt.y}deg)`,
                transition: 'transform 0.15s ease',
                transformStyle: 'preserve-3d',
                position: 'relative'
              }}
            >
              <div className="lg:col-span-6" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                  {roleBenefits[selectedRole as keyof typeof roleBenefits].title}
                </h3>
                <p style={{ fontSize: '0.98rem', color: '#475569', marginBottom: '28px' }}>
                  {roleBenefits[selectedRole as keyof typeof roleBenefits].subtitle}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {roleBenefits[selectedRole as keyof typeof roleBenefits].features.map((feat, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(79,70,229,0.08)', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', flexShrink: 0 }}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span style={{ fontSize: '0.92rem', color: '#334155', lineHeight: '1.5' }}>{feat}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '36px' }}>
                  <Link href="/login" style={{ fontSize: '0.875rem', padding: '12px 24px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#fff', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    Akses Portal Masuk <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(15,23,42,0.12)', background: '#ffffff', boxShadow: '0 25px 50px -12px rgba(15,23,42,0.15)', minHeight: '320px', transform: 'translateZ(20px)' }}>
                <div style={{ height: '36px', backgroundColor: '#f1f5f9', borderBottom: '1px solid rgba(15,23,42,0.08)', display: 'flex', alignItems: 'center', padding: '0 16px', position: 'relative', flexShrink: 0 }}>
                  <div style={{ display: 'flex', gap: '6px', position: 'absolute', left: '16px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
                  </div>
                  <div style={{ margin: '0 auto', width: '65%', backgroundColor: '#ffffff', border: '1px solid rgba(15,23,42,0.08)', borderRadius: '6px', fontSize: '0.72rem', color: '#64748b', padding: '2px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 500 }}>
                    🔒 <span style={{ color: '#0d9488' }}>https://</span>eduflow.com/dashboard/{selectedRole === 'orang-tua' ? 'orang-tua' : selectedRole}
                  </div>
                </div>
                <div style={{ overflow: 'hidden', background: '#f8fafc', flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                  <img
                    src={selectedRole === 'admin' ? '/eduflow_admin_dashboard.png' : selectedRole === 'guru' ? '/eduflow_guru_dashboard.png' : selectedRole === 'siswa' ? '/eduflow_siswa_dashboard.png' : '/eduflow_orang_tua_dashboard.png'}
                    alt={`Mockup ${selectedRole}`}
                    style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ⭐ Testimonials Section */}
      <section style={{ padding: '100px 0', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
        <div className="container">
          <div className="section-reveal" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '0.7rem', color: '#4f46e5', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.12em', background: 'rgba(79,70,229,0.08)', padding: '4px 12px', borderRadius: '100px' }}>TESTIMONIAL</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#0f172a', marginTop: '20px', marginBottom: '16px', letterSpacing: '-0.03em' }}>
              Dipercaya oleh Komunitas Pendidik
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#475569', maxWidth: '600px', margin: '0 auto' }}>
              Dengarkan langsung cerita sukses dari institusi dan wali murid yang telah bertransformasi bersama kami.
            </p>
          </div>

          <div className="marquee-container section-reveal stagger-1">
            <div className="marquee-track">
              {[...testimonials, ...testimonials, ...testimonials].map((test, i) => (
                <div key={i} style={{
                  width: '380px',
                  flexShrink: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(15,23,42,0.05)',
                  borderRadius: '20px',
                  padding: '32px',
                  boxShadow: '0 10px 30px -10px rgba(15,23,42,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ marginBottom: '24px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#4f46e5" opacity="0.15" style={{ marginBottom: '12px' }}>
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.7', fontStyle: 'italic' }}>
                      &ldquo;{test.quote}&rdquo;
                    </p>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>{test.author}</h4>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>{test.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 💰 Pricing Section */}
      <section id="pricing" style={{ padding: '100px 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="section-reveal" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '0.7rem', color: '#4f46e5', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.12em', background: 'rgba(79,70,229,0.08)', padding: '4px 12px', borderRadius: '100px' }}>HARGA</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#0f172a', marginTop: '20px', marginBottom: '16px', letterSpacing: '-0.03em' }}>
              Investasi Transparan untuk Sekolah Anda
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#475569', maxWidth: '600px', margin: '0 auto' }}>
              Pilih paket langganan yang sesuai dengan skala operasional dan metode pembelajaran sekolah Anda.
            </p>

            {/* Toggle Monthly/Yearly */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '32px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: !isYearly ? '#0f172a' : '#94a3b8', transition: 'color 0.3s' }}>Bulanan</span>
              <div
                className={`pricing-toggle-track ${isYearly ? 'active' : ''}`}
                onClick={() => setIsYearly(!isYearly)}
              >
                <div className="pricing-toggle-thumb" />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isYearly ? '#0f172a' : '#94a3b8', transition: 'color 0.3s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Tahunan
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '100px' }}>HEMAT 20%</span>
              </span>
            </div>
          </div>

          <div className="section-reveal stagger-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
            {pricingPlans.map((plan, i) => (
              <div key={i} className={`card-saas-pricing ${plan.popular ? 'popular' : ''}`} style={{
                padding: '40px 32px',
                position: 'relative',
                borderRadius: '24px'
              }}>
                {plan.popular && (
                  <>
                    <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#ffffff', padding: '5px 20px', fontSize: '0.7rem', fontWeight: 800, borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.05em', zIndex: 2 }}>
                      REKOMENDASI
                    </div>
                    <div className="pulse-ring-active" style={{ position: 'absolute', inset: 0, borderRadius: '24px', pointerEvents: 'none' }} />
                  </>
                )}
                
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>{plan.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px', minHeight: '48px' }}>{plan.desc}</p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px', minHeight: '52px' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    {isYearly ? plan.yearlyPrice : plan.price}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '32px' }}>
                  {isYearly ? plan.yearlyPeriod : plan.period}
                </span>

                <Link href="/login" style={{
                  width: '100%',
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  marginBottom: '32px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  background: plan.popular ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : '#f1f5f9',
                  color: plan.popular ? '#ffffff' : '#1f2937',
                  boxShadow: plan.popular ? '0 10px 20px -8px rgba(79,70,229,0.4)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {plan.cta}
                </Link>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase' }}>FITUR UTAMA:</span>
                  {plan.features.map((feat, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span style={{ fontSize: '0.85rem', color: '#334155' }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 Onboarding Wizard Section */}
      <section id="daftar" style={{ padding: '100px 0', background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)', borderTop: '1px solid rgba(15,23,42,0.05)' }}>
        <div className="container" style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="section-reveal" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '0.7rem', color: '#4f46e5', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.12em', background: 'rgba(79,70,229,0.08)', padding: '4px 12px', borderRadius: '100px' }}>REGISTRASI MANDIRI</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#0f172a', marginTop: '20px', marginBottom: '16px', letterSpacing: '-0.03em' }}>
              Daftarkan Sekolah Baru Anda Instan
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#475569', maxWidth: '600px', margin: '0 auto' }}>
              Inisialisasi sistem manajemen dan database SQLite terisolasi sekolah Anda hanya dalam waktu kurang dari 2 menit.
            </p>
          </div>

          <div className="section-reveal stagger-1" style={{
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(15,23,42,0.08)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 20px 40px -15px rgba(15,23,42,0.05)'
          }}>
            
            {/* Step Indicators */}
            {obStep < 4 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '20px', left: '10%', right: '10%', height: '2px', background: '#e2e8f0', zIndex: 0 }} />
                <div style={{ position: 'absolute', top: '20px', left: '10%', width: obStep === 1 ? '0%' : obStep === 2 ? '40%' : '80%', height: '2px', background: 'linear-gradient(90deg, #4f46e5, #0d9488)', transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)', zIndex: 0 }} />

                {[1, 2, 3].map((stepNum) => {
                  const isActive = obStep >= stepNum;
                  const isCurrent = obStep === stepNum;
                  const labels = ['Identitas Sekolah', 'Rute & Paket', 'Akun Admin'];
                  return (
                    <div key={stepNum} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, width: '30%' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: isActive ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : '#ffffff',
                        border: `2px solid ${isActive ? '#4f46e5' : '#cbd5e1'}`,
                        color: isActive ? '#ffffff' : '#64748b',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px',
                        transition: 'all 0.3s ease',
                        boxShadow: isCurrent ? '0 0 0 6px rgba(79,70,229,0.12)' : 'none'
                      }}>
                        {isActive ? <Check className="w-4 h-4" /> : stepNum}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 600 : 500, color: isActive ? '#0f172a' : '#64748b', textAlign: 'center' }}>{labels[stepNum - 1]}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {obError && (
              <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', color: '#ef4444', padding: '16px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ <span>{obError}</span>
              </div>
            )}

            {obStatus && !obError && obStep < 4 && (
              <div style={{ background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.15)', color: '#4f46e5', padding: '16px', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #e2e8f0', borderTopColor: '#4f46e5', animation: 'spin 1s linear infinite' }} />
                <span>{obStatus}</span>
                <style dangerouslySetInnerHTML={{__html: `@keyframes spin { to { transform: rotate(360deg); } }`}} />
              </div>
            )}

            {/* Step 1 */}
            {obStep === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); if (obSchoolName.trim() && obSchoolAddress.trim()) setObStep(2); else alert('Harap isi nama dan alamat sekolah'); }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Nama Sekolah / Lembaga</label>
                    <input type="text" className="form-control" placeholder="Contoh: SD Negeri 01 Menteng" required value={obSchoolName} onChange={(e) => setObSchoolName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Tingkat Pendidikan</label>
                    <select className="form-control" value={obSchoolType} onChange={(e) => setObSchoolType(e.target.value)}>
                      <option value="SD">Sekolah Dasar (SD / MI)</option>
                      <option value="SMP">Sekolah Menengah Pertama (SMP / MTs)</option>
                      <option value="SMA">Sekolah Menengah Atas (SMA / MA)</option>
                      <option value="PONDOK">Pondok Pesantren</option>
                      <option value="HOMESCHOOL">Komunitas Homeschooling / Hybrid</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Alamat Lengkap</label>
                    <textarea className="form-control" placeholder="Masukkan alamat fisik sekolah..." rows={3} required value={obSchoolAddress} onChange={(e) => setObSchoolAddress(e.target.value)} style={{ resize: 'none' }} />
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.95rem' }}>
                    Lanjut ke Rencana & Rute URL ➔
                  </button>
                </div>
              </form>
            )}

            {/* Step 2 */}
            {obStep === 2 && (
              <form onSubmit={(e) => { e.preventDefault(); if (obPathSegment.trim().length >= 3) setObStep(3); else alert('Path segment minimal 3 karakter'); }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Folder Path URL Segment (Tenant ID)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>eduflow.com/</span>
                      <input type="text" className="form-control" placeholder="Contoh: sdnmenteng01" required value={obPathSegment} onChange={(e) => setObPathSegment(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())} />
                    </div>
                    {obPathSegment && (
                      <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.8rem', border: '1px dashed #cbd5e1' }}>
                        🔗 Preview URL: <strong style={{ color: '#4f46e5' }}>http://localhost:3000/{obPathSegment}/login</strong>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Pilih Paket Langganan</label>
                    <select className="form-control" value={obPlan} onChange={(e) => setObPlan(e.target.value)}>
                      <option value="FREE">Starter Plan (Rp 499.000 / bln)</option>
                      <option value="BASIC">Professional Plan (Rp 999.000 / bln)</option>
                      <option value="PREMIUM">Hybrid & Homeschool (Rp 1.499.000 / bln)</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={() => setObStep(1)} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>⬅ Kembali</button>
                    <button type="submit" style={{ flex: 2, padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Lanjut ke Akun Admin ➔</button>
                  </div>
                </div>
              </form>
            )}

            {/* Step 3 */}
            {obStep === 3 && (
              <form onSubmit={handleOnboardSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Nama Lengkap Administrator</label>
                    <input type="text" className="form-control" placeholder="Nama penanggung jawab sistem" required value={obAdminName} onChange={(e) => setObAdminName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Email Administrator</label>
                    <input type="email" className="form-control" placeholder="admin@sekolahanda.sch.id" required value={obAdminEmail} onChange={(e) => setObAdminEmail(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Kata Sandi</label>
                    <input type="password" className="form-control" placeholder="Minimal 6 karakter" required minLength={6} value={obAdminPassword} onChange={(e) => setObAdminPassword(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" disabled={obLoading} onClick={() => setObStep(2)} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: 600, cursor: obLoading ? 'not-allowed' : 'pointer', opacity: obLoading ? 0.6 : 1 }}>⬅ Kembali</button>
                    <button type="submit" disabled={obLoading} style={{ flex: 2, padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#fff', fontWeight: 600, border: 'none', cursor: obLoading ? 'not-allowed' : 'pointer', opacity: obLoading ? 0.7 : 1, fontSize: '0.95rem' }}>
                      {obLoading ? 'Menginisialisasi...' : 'Aktifkan Sekolah Saya 🚀'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Step 4: Success */}
            {obStep === 4 && obCreatedTenant && (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(16,185,129,0.3)' }}>
                  ✓
                </div>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Sekolah Berhasil Diaktifkan!</h3>
                  <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.5', maxWidth: '500px', margin: '0 auto' }}>
                    Sistem SaaS dan database SQLite terisolasi untuk <strong style={{ color: '#4f46e5' }}>{obCreatedTenant.name}</strong> telah sukses dibangun.
                  </p>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>ID Sekolah (Tenant ID):</span>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{obCreatedTenant.pathSegment}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Paket Aktif:</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: '100px' }}>{obCreatedTenant.subscription?.plan || obPlan}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Email Super Admin:</span>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>{obAdminEmail || 'admin@sekolah.sch.id'}</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Tautan Portal:</span>
                    <a href={`/${obCreatedTenant.pathSegment}/login`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4f46e5', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      http://localhost:3000/{obCreatedTenant.pathSegment}/login ➔
                    </a>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  <button onClick={() => { setObStep(1); setObSchoolName(''); setObSchoolAddress(''); setObPathSegment(''); setObAdminName(''); setObAdminEmail(''); setObAdminPassword(''); setObCreatedTenant(null); setObStatus(null); }} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#e2e8f0', border: 'none', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>
                    Daftar Sekolah Lain
                  </button>
                  <Link href={`/${obCreatedTenant.pathSegment}/login`} style={{ flex: 2, padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#fff', fontWeight: 600, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Masuk Portal Sekolah Baru ➔
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ❓ FAQ Section */}
      <section id="faq" style={{ padding: '100px 0', backgroundColor: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="section-reveal" style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '0.7rem', color: '#4f46e5', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.12em', background: 'rgba(79,70,229,0.08)', padding: '4px 12px', borderRadius: '100px' }}>FAQ</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#0f172a', marginTop: '20px', marginBottom: '16px', letterSpacing: '-0.03em' }}>
              Pertanyaan yang Sering Diajukan
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#475569' }}>
              Semua yang perlu Anda ketahui tentang sistem berlangganan, fitur, dan onboarding EduFlow.
            </p>
          </div>

          <div className="section-reveal stagger-1" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {faqs.map((faq, index) => (
              <div key={index} style={{
                background: '#ffffff',
                border: '1px solid rgba(15,23,42,0.06)',
                borderRadius: '16px',
                padding: '20px 24px',
                transition: 'all 0.3s ease'
              }}>
                <button onClick={() => toggleFaq(index)} style={{
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  color: '#0f172a',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  gap: '16px'
                }}>
                  <span>{faq.q}</span>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: openFaq === index ? 'rgba(79,70,229,0.08)' : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.3s ease',
                    transform: openFaq === index ? 'rotate(45deg)' : 'rotate(0deg)'
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={openFaq === index ? '#4f46e5' : '#64748b'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                </button>
                <div style={{
                  maxHeight: openFaq === index ? '300px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), margin-top 0.4s ease',
                  marginTop: openFaq === index ? '16px' : '0',
                  color: '#475569',
                  fontSize: '0.95rem',
                  lineHeight: '1.7'
                }}>
                  <p style={{ margin: 0 }}>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 📢 Bottom CTA */}
      <section style={{ padding: '120px 0', background: '#0f172a', color: '#ffffff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(79,70,229,0.15)', top: '-100px', left: '-100px', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(13,148,136,0.1)', bottom: '-50px', right: '-50px', filter: 'blur(80px)' }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 800, marginBottom: '20px', letterSpacing: '-0.03em' }}>
            Mulai Transformasi Digital Sekolah Anda Hari Ini
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
            Uji coba gratis seluruh fitur selama 14 hari tanpa ikatan kartu kredit. Lihat bagaimana EduFlow menertibkan administrasi sekolah Anda dalam hitungan hari.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/login" className="magnetic-btn" style={{
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
              padding: '16px 36px',
              borderRadius: '12px',
              fontSize: '1rem',
              color: '#ffffff',
              fontWeight: 700,
              boxShadow: '0 10px 25px -5px rgba(79,70,229,0.4)'
            }}>
              Coba Uji Coba Gratis
            </Link>
            <a href="#pricing" style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              padding: '16px 36px',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
              transition: 'all 0.3s ease'
            }}>
              Lihat Paket Harga
            </a>
          </div>
        </div>
      </section>

      {/* 🦶 Footer */}
      <footer style={{ background: '#0b0f19', color: '#64748b', padding: '80px 0 40px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '40px', marginBottom: '60px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, #4f46e5, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <School className="w-4.5 h-4.5 text-white" />
                </div>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>EduFlow</span>
              </div>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: '#94a3b8' }}>
                Platform SaaS terintegrasi untuk mengelola sekolah reguler, kurikulum hybrid, dan pembelajaran homeschooling terpadu.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 700 }}>FITUR</h4>
              <a href="#fitur" style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>LMS Kelas</a>
              <a href="#fitur" style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Keuangan Kas</a>
              <a href="#fitur" style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Presensi Karyawan</a>
              <a href="#fitur" style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Jurnal Tahfidz</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 700 }}>SOLUSI</h4>
              <a href="#solusi" style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Sekolah Reguler</a>
              <a href="#solusi" style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Homeschooling</a>
              <a href="#solusi" style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Mitra Pengajar</a>
              <a href="#solusi" style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}>Yayasan Pendidikan</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 700 }}>KONTAK</h4>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>support@eduflow.sch.id</span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>+62 812-3456-7890</span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Jakarta, Indonesia</span>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.8rem' }}>
            <span>&copy; {new Date().getFullYear()} EduFlow LMS. Hak Cipta Dilindungi Undang-Undang.</span>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="mailto:support@eduflow.sch.id?subject=Kebijakan%20Privasi" style={{ color: '#64748b', textDecoration: 'none' }}>Kebijakan Privasi</a>
              <a href="mailto:support@eduflow.sch.id?subject=Syarat%20%26%20Ketentuan" style={{ color: '#64748b', textDecoration: 'none' }}>Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Widgets */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px', fontFamily: 'var(--font-family)' }}>
        
        {chatOpen && (
          <div style={{
            width: '380px',
            maxWidth: 'calc(100vw - 48px)',
            height: '480px',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(79,70,229,0.15)',
            boxShadow: '0 20px 40px rgba(15,23,42,0.15)',
            borderRadius: '20px',
            animation: 'fadeInUp 0.3s ease'
          }}>
            <div style={{ background: 'linear-gradient(135deg, #4f46e5, #0d9488)', padding: '16px 20px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🤖</div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>EduBot Asisten AI</h4>
                  <span style={{ fontSize: '0.72rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} /> Online
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <a href="https://wa.me/6281234567890?text=Halo%20Admin%20EduFlow" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: '#25d366', color: '#fff', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, textDecoration: 'none' }}>
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.394 9.806-9.799.002-2.618-1.016-5.08-2.868-6.936-1.851-1.855-4.312-2.873-6.932-2.875-5.405 0-9.804 4.395-9.808 9.802-.001 1.503.41 2.973 1.192 4.267l.178.293-.997 3.639 3.731-.977.291.173zm9.053-6.113c-.269-.134-1.597-.788-1.846-.879-.249-.091-.43-.136-.61.135-.18.271-.699.88-.857 1.06-.157.18-.314.204-.583.069-.269-.134-1.137-.419-2.166-1.338-.802-.714-1.343-1.597-1.5-1.868-.157-.271-.017-.417.118-.552.121-.121.269-.314.404-.471.135-.157.18-.271.27-.452.09-.18.045-.339-.022-.474-.068-.135-.61-1.472-.836-2.014-.22-.53-.442-.457-.61-.466-.157-.008-.339-.009-.521-.009-.18 0-.474.068-.722.339-.249.271-.95.928-.95 2.264 0 1.336.972 2.625 1.107 2.805.135.18 1.913 2.921 4.633 4.099.647.28 1.153.447 1.547.572.651.207 1.243.178 1.711.108.522-.078 1.597-.653 1.822-1.284.225-.632.225-1.175.157-1.284-.068-.11-.249-.2-.517-.334z"/></svg>
                  WA Admin
                </a>
                <button onClick={() => setChatOpen(false)} style={{ color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'none', border: 'none' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div style={{ flexGrow: 1, padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f8fafc' }}>
              {messages.map((msg, index) => (
                <div key={index} style={{
                  alignSelf: msg.sender === 'bot' ? 'flex-start' : 'flex-end',
                  maxWidth: '85%',
                  backgroundColor: msg.sender === 'bot' ? '#ffffff' : '#4f46e5',
                  color: msg.sender === 'bot' ? '#334155' : '#ffffff',
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'bot' ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                  whiteSpace: 'pre-line',
                  border: msg.sender === 'bot' ? '1px solid rgba(15,23,42,0.05)' : 'none'
                }}>
                  {formatMessageText(msg.text)}
                </div>
              ))}
              {isTyping && (
                <div style={{ alignSelf: 'flex-start', background: '#ffffff', padding: '10px 18px', borderRadius: '12px 12px 12px 2px', fontSize: '0.85rem', border: '1px solid rgba(15,23,42,0.05)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>EduBot sedang mengetik</span>
                  <div style={{ display: 'flex', gap: '3px', marginLeft: '4px' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#64748b', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#64748b', animation: 'bounce 1.4s infinite ease-in-out both 0.2s' }} />
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#64748b', animation: 'bounce 1.4s infinite ease-in-out both 0.4s' }} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '10px 16px', background: '#ffffff', borderTop: '1px solid rgba(15,23,42,0.05)', display: 'flex', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {['Berapa harganya?', 'Bagaimana cara mendaftar?', 'Apakah data kami aman?', 'Ada kurikulum homeschool?'].map((rec, i) => (
                <button key={i} type="button" onClick={() => handleSendMessage(rec)} style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '100px', fontSize: '0.75rem', color: '#4f46e5', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                  {rec}
                </button>
              ))}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }} style={{ padding: '12px 16px', background: '#ffffff', borderTop: '1px solid rgba(15,23,42,0.05)', display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
              <input type="text" placeholder="Ketik pertanyaan Anda..." value={inputText} onChange={(e) => setInputText(e.target.value)} style={{ flexGrow: 1, padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.825rem', outline: 'none', color: '#334155' }} />
              <button type="submit" style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #4f46e5, #0d9488)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}>
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="https://wa.me/6281234567890?text=Halo%20Admin%20EduFlow" target="_blank" rel="noopener noreferrer" style={{
            width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#25d366',
            boxShadow: '0 8px 20px rgba(37,211,102,0.3)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff', cursor: 'pointer', transition: 'all 0.3s ease'
          }}>
            <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24z"/>
            </svg>
          </a>
          <button onClick={() => setChatOpen(!chatOpen)} style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5, #0d9488)',
            boxShadow: '0 10px 25px rgba(79,70,229,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', cursor: 'pointer', transition: 'all 0.3s ease',
            border: 'none', position: 'relative'
          }}>
            {chatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          </button>
        </div>
      </div>

    </main>
  );
}
