# PROJECT_CONTEXT

## 1. Informasi Umum Proyek
* **Nama Proyek:** EduFlow / LMS & Sistem Operasional Sekolah Terintegrasi
* **Tipe Aplikasi:** SaaS Web Application (Dashboard Multi-role)
* **Tech Stack:** Opsi A (Next.js / React + Node.js + PostgreSQL)
* **Metodologi:** Agile Scrum (Sprint 1 Minggu untuk Fast-Track)
* **Komposisi Tim:**
  * **Product Owner (PO):** User
  * **Full-Stack Dev Team:** Antigravity AI (PM, Designer, Developer, QA)
* **Target Timeline:** Secepatnya (Fast Track / Launch MVP Sesegera Mungkin)

## 2. Masalah yang Dipecahkan (Problem Statement)
* **Tidak Ada Sistem Terintegrasi & Terfragmentasi:** Operasional sekolah, pembelajaran, administrasi, dan komunikasi berjalan terpisah secara manual.
* **Tidak Ada Data Terpusat:** Sulit mengakses data akademik, keuangan, hafalan, atau administratif secara real-time.
* **Kurangnya Transparansi & Monitoring:** Orang tua kesulitan memantau perkembangan anak secara langsung, dan manajemen sekolah kesulitan memantau kinerja harian serta arus keuangan.

## 3. Solusi & Value Proposition (UVP)
* **Bukan Sekadar LMS:** Ini adalah sistem operasional sekolah terintegrasi yang menyatukan semua pihak.
* **Guru & Staf Lebih Efisien:** Memangkas waktu pengerjaan tugas administratif, pencatatan absensi staf, dan input hafalan Quran.
* **Orang Tua Lebih Terlibat:** Akses langsung ke nilai, kehadiran, setoran Tahfidz, dan pengumuman sekolah.
* **Sekolah Lebih Profesional:** Data keuangan terpusat (uang masuk & keluar), laporan otomatis, dan transparansi arus kas.

## 4. Target Pengguna (Roles & Users)
1. **Administrator Sekolah (Admin):** Mengelola master data, akun pengguna, kelas, mata pelajaran, pencatatan keuangan (uang masuk/keluar), dan laporan kehadiran staf.
2. **Guru/Pengajar & Staf:** Mengelola materi belajar, tugas, absensi siswa/staf, input nilai, serta catatan Tahfidz.
3. **Siswa (Murid):** Mengakses materi, mengumpulkan tugas, melihat jadwal, memantau nilai/kehadiran, dan melihat progres hafalan Tahfidz pribadi.
4. **Orang Tua:** Memantau kehadiran anak, nilai akademis, tugas tertunda, rekap hafalan Tahfidz, dan status pembayaran/iuran.

---

# DECISION LOG

| Tanggal | Keputusan | Alasan | Status |
| :--- | :--- | :--- | :--- |
| 2026-06-11 | Memilih Tech Stack Opsi A | Memaksimalkan kecepatan pengembangan MVP (Next.js + Node.js + PostgreSQL) | **LOCKED** |
| 2026-06-11 | Memilih Metodologi Agile Scrum | Sprint 1 minggu cocok untuk feedback cepat dalam fast-track development | **LOCKED** |
| 2026-06-11 | Penambahan Halaman Keuangan, Absensi Staf, & Tahfidz | Menjawab kebutuhan spesifik operasional sekolah dan pembelajaran keagamaan | **LOCKED** |

---

# ASSUMPTIONS

| Asumsi | Risiko | Perlu Konfirmasi? | Status |
| :--- | :--- | :--- | :--- |
| Pengembangan awal difokuskan pada versi Web Responsive terlebih dahulu sebelum Mobile App. | Jika pengguna menuntut aplikasi mobile native di awal, rilis akan melambat. | Ya (Akan divalidasi di MVP Scope) | **DRAFT** |
| Halaman keuangan pada versi awal (MVP) bersifat pencatatan manual (input manual admin) sebelum diintegrasikan dengan Payment Gateway otomatis. | Admin perlu meluangkan waktu untuk meng-input data transaksi manual. | Ya | **DRAFT** |
| Database lokal PostgreSQL akan digunakan selama fase pengembangan. | Perlu migrasi saat production. | Tidak | **LOCKED** |
