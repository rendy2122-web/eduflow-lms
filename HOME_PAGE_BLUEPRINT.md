# PAGE BLUEPRINT: EDUFLOW HOME PAGE

Dokumen ini mendefinisikan cetak biru (blueprint) halaman utama (Landing Page) **EduFlow** untuk memastikan konversi tinggi, pesan yang jelas, dan estetika visual premium.

---

## 1. Page Goal
Meyakinkan pengambil keputusan sekolah (Kepala Sekolah, Yayasan, Administrator) bahwa EduFlow adalah solusi terbaik untuk menyatukan LMS, absensi staf, dan keuangan sekolah dalam satu platform terpadu.

## 2. Target User Intent
* **Informational Intent:** Ingin tahu bagaimana EduFlow dapat memotong proses manual pengisian absensi dan pencatatan kas sekolah.
* **Commercial Intent:** Membandingkan fitur LMS & Keuangan EduFlow dengan platform lain (seperti Google Classroom).

## 3. Conversion Goal
Mendorong pengunjung untuk menekan tombol tombol utama (CTA) untuk masuk dan mencoba portal simulasi interaktif (simulated interactive sandbox).

## 4. Above the Fold Strategy
* **Hero Headline:** Headline tebal dengan kontras tinggi yang langsung fokus pada pemecahan masalah fragmentasi data sekolah.
* **Supporting Tagline:** Penjelasan singkat 2 baris yang merinci bahwa sistem ini mencakup LMS, Absensi Staf, Keuangan, dan Tahfidz.
* **Primary CTA:** Tombol kontras tinggi "Coba Demo Interaktif" yang mengarahkan langsung ke portal login simulasi.
* **Visual Anchor:** Mockup antarmuka dashboard admin premium dengan efek bayangan melayang (floating UI mockups).

---

## 5. Section-by-Section Blueprint

### Section 1: Hero Section (Utama)
* **Tujuan:** Menangkap perhatian dalam 3 detik pertama.
* **Konten:** Headline, Tagline, Tombol CTA, Mockup Dashboard.

### Section 2: Core Problem vs EduFlow Solution
* **Tujuan:** Membangkitkan rasa butuh dengan memaparkan masalah operasional sekolah manual saat ini.
* **Konten:** 3 Kolom kartu komparasi (Fragmentasi Data, Laporan Manual, Kurangnya Transparansi) dan bagaimana EduFlow menyelesaikannya.

### Section 3: Feature Highlights Showcase
* **Tujuan:** Mendemonstrasikan fitur unggulan P0 & P1.
* **Konten:** Grid interaktif (LMS Kelas Digital, Absensi Guru/Staf, Jurnal Keuangan Kas, Setoran Tahfidz).

### Section 4: Portal Role Selector (Simulasi)
* **Tujuan:** Mengajak interaksi langsung.
* **Konten:** 4 Kartu role (Admin, Guru, Siswa, Orang Tua) yang masing-masing memiliki deskripsi manfaat spesifik.

### Section 5: Call to Action (Bottom Banner)
* **Tujuan:** Penutup konversi sebelum user menutup halaman.
* **Konten:** Headline penutup, Tombol CTA besar.

---

## 6. Copywriting Draft per Section

* **Hero Section:**
  * *Headline:* "Satu Sistem untuk Seluruh Operasional Sekolah Anda."
  * *Tagline:* "EduFlow menyatukan Pembelajaran Digital (LMS), Absensi Staf, Pencatatan Keuangan Kas, dan Progres Tahfidz dalam satu dasbor premium yang transparan."
* **Problem Section:**
  * *Headline:* "Ucapkan Selamat Tinggal pada Proses Manual yang Melelahkan."
* **Role Portal Section:**
  * *Headline:* "Masuk Sebagai Siapa Saja untuk Mencoba."
  * *Description:* "Coba langsung pengalaman menggunakan dashboard sesuai kebutuhan Anda tanpa perlu setup server yang rumit."

---

## 7. CTA per Section
* **Hero Section:** `[Masuk ke Dashboard]` (Primary) & `[Pelajari Fitur]` (Secondary)
* **Features Section:** `[Lihat Simulasi Guru]`
* **Role Portal Section:** `[Simulasikan Akun Admin]`, `[Simulasikan Akun Guru]`
* **Bottom Banner:** `[Mulai Coba Demo Sekarang]`

---

## 8. Style Direction Options (Pilih Salah Satu)

### Opsi A: Corporate Premium (Direkomendasikan)
* **Mood:** Tepercaya, bersih, profesional, aman.
* **Warna:** Navy Blue (`#0f172a`), Royal Indigo (`#4f46e5`), dan White Matte.
* **Tipografi:** Serif premium untuk Heading (seperti *Playfair Display* atau *Merriweather*), Sans-serif bersih untuk body teks (*Inter*).

### Opsi B: Modern Startup
* **Mood:** Inovatif, dinamis, segar, energetik.
* **Warna:** Vibrant Indigo, Emerald Green (`#10b981`), dan Slate Gray.
* **Tipografi:** Geometris Sans-serif tebal untuk seluruh teks (*Outfit* atau *Plus Jakarta Sans*).
* **Visual:** Background Glassmorphism transparan dengan lingkaran gradien warna-warni yang blur di belakang card.

### Opsi C: Luxury Editorial
* **Mood:** Eksklusif, minimalis, elegan, berwibawa.
* **Warna:** Monokromatik (Hitam, Putih, Abu-abu Platinum) dengan aksen Gold/Teal tipis.
* **Tipografi:** Serif modern tipis berjarak lebar (*Cormorant Garamond*).

---

## 9. Animation Direction
* **Hero Fade-In:** Elemen teks judul memudar naik (fade-in-up) secara perlahan saat halaman dimuat (durasi 0.6 detik).
* **Mockup Float:** Mockup dashboard melayang naik-turun secara mikro secara terus-menerus (`animation: float 6s ease-in-out infinite`).
* **Card Hover Pop:** Kartu fitur membesar secara halus (`transform: scale(1.02)`) dan bayangan memanjang ketika kursor diarahkan ke atasnya.

## 10. Responsive Behavior
* **Desktop:** Layout 3-4 kolom mendatar.
* **Tablet:** Penyesuaian menjadi 2 kolom.
* **Mobile:** Seluruh kolom menumpuk vertikal secara otomatis (1 kolom), teks judul mengecil dari `2.25rem` menjadi `1.75rem` agar pas di layar HP.

## 11. SEO Title & Meta Description
* **SEO Title:** EduFlow | LMS & Sistem Operasional Sekolah Terintegrasi
* **Meta Description:** Solusi all-in-one digitalisasi sekolah. Mengelola kelas digital, absensi staf harian, setoran Tahfidz Qur'an, dan pembukuan kas masuk/keluar sekolah secara praktis dan transparan.

## 12. Page Completion Gate
* Halaman HTML ditulis secara semantik.
* Tombol navigasi tidak ada yang mengarah ke link rusak (#).
* Kontras rasio warna teks lolos standar WCAG AA.
