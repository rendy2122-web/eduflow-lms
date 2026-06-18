# UI/UX DESIGN SYSTEM & SPECIFICATION (EduFlow)

Dokumen ini mendefinisikan panduan desain visual premium, token CSS, daftar komponen, inventaris layar (screen inventory), dan standar kepatuhan web modern untuk aplikasi **EduFlow**.

---

## 1. Design System Foundation (CSS Design Tokens)

Berikut adalah variabel CSS kustom yang akan diimplementasikan pada file CSS utama (`index.css` atau global CSS) untuk menjamin estetika premium, modern, dan konsisten (mendukung tema Glassmorphism dan Dark Mode).

```css
:root {
  /* Harmonious Color Palette (Modern Indigo & Emerald Accent) */
  --color-primary: #4f46e5;         /* Indigo (Utama) */
  --color-primary-hover: #4338ca;   
  --color-primary-light: #e0e7ff;   

  --color-secondary: #0d9488;       /* Teal (Aksen Keuangan/Tahfidz) */
  --color-secondary-hover: #0f766e;
  --color-secondary-light: #ccfbf1;

  --color-neutral-dark: #0f172a;    /* Charcoal Slate (Teks Utama) */
  --color-neutral-gray: #475569;    /* Muted Slate (Teks Pembantu) */
  --color-neutral-light: #f8fafc;   /* Gray Background */
  --color-white: #ffffff;

  /* Semantic Colors */
  --color-success: #10b981;         /* Emerald Green (Hadir / Uang Masuk / Lancar) */
  --color-warning: #f59e0b;         /* Amber Orange (Izin / Kurang Lancar) */
  --color-error: #ef4444;           /* Rose Red (Alpa / Uang Keluar / Perlu Diulang) */
  --color-info: #3b82f6;            /* Blue Info (Sakit / Netral) */

  /* Typography Scale (Outfit / Inter Google Fonts) */
  --font-family: 'Outfit', 'Inter', system-ui, sans-serif;
  --font-h1: 700 2.25rem/2.5rem var(--font-family);     /* 36px */
  --font-h2: 700 1.875rem/2.25rem var(--font-family);   /* 30px */
  --font-h3: 600 1.5rem/2rem var(--font-family);        /* 24px */
  --font-h4: 600 1.25rem/1.75rem var(--font-family);      /* 20px */
  --font-body: 400 1rem/1.5rem var(--font-family);       /* 16px */
  --font-caption: 400 0.875rem/1.25rem var(--font-family);/* 14px */
  --font-label: 500 0.75rem/1rem var(--font-family);     /* 12px */

  /* Spacing Grid (4px Base Grid) */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-12: 48px;
  --spacing-16: 64px;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 12px;                  /* Standar Card Premium */
  --radius-lg: 20px;                  /* Modal / Dashboard Container */
  --radius-full: 9999px;

  /* Premium Shadows & Depth Levels (Glassmorphism Effect) */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(79, 70, 229, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  --shadow-lg: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.03);
  --shadow-glass: inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 8px 32px 0 rgba(31, 38, 135, 0.05);

  /* Transitions */
  --transition-smooth: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 2. Component Library Specification (Premium States)

Setiap komponen yang akan kita bangun wajib mengadopsi interaksi visual (states) yang premium:

1. **Button (Tombol)**
   * *Default:* Background solid/gradient, teks putih, border-radius md, bayangan lembut.
   * *Hover:* Skala naik mikro (`transform: scale(1.02)`), warna bergeser lebih gelap secara halus, bayangan membesar.
   * *Disabled:* Opacity 50%, kursor dilarang (`cursor: not-allowed`).
2. **Card Container**
   * Desain Glassmorphism (background putih transparan dengan efek `backdrop-filter: blur(8px)`), border tipis warna terang, sudut melengkung `var(--radius-md)`.
3. **Form Input & Dropdown**
   * *Default:* Border abu-abu tipis, teks abu-abu tua, latar belakang putih bersih.
   * *Focused:* Border berubah menjadi `var(--color-primary)` dengan efek ring luar halus (`box-shadow: 0 0 0 4px var(--color-primary-light)`).
   * *Error State:* Border merah menyala (`var(--color-error)`), label pesan error kecil di bawah input.
4. **Toast / Notification Banner**
   * Sudut melengkung, mengambang di pojok kanan atas, transisi slide-in lembut dari samping.

---

## 3. Screen Inventory (Daftar Halaman Dashboard)

Berikut adalah peta halaman yang akan kita buat selama masa pengembangan:

### A. Portal Bersama (Auth)
1. **Halaman Login:** Input email, sandi, visual minimalis yang memukau dengan ilustrasi modern.

### B. Portal Admin (Manajemen Sekolah & Keuangan)
2. **Dashboard Utama:** Ringkasan jumlah siswa/guru, widget kehadiran staf hari ini, dan widget cashflow bulanan.
3. **Manajemen Pengguna (CRUD):** Tabel data Guru, Siswa, Orang Tua lengkap dengan form tambah/edit.
4. **Halaman Absensi Staf:** Monitoring absensi harian seluruh staf sekolah (jam masuk/pulang).
5. **Halaman Keuangan:** Grafik tren kas, pencatatan transaksi masuk (SPP, iuran) & kas keluar (gaji, operasional), beserta riwayat tabel mutasi uang.

### C. Portal Guru (LMS & Tahfidz)
6. **Dashboard Guru:** Pintasan mata pelajaran yang diampu, status absensi pribadi hari ini.
7. **Pencatatan Kelas & Absensi Siswa:** Daftar nama siswa untuk di-absen per tanggal hari ini.
8. **Manajemen Materi & Tugas:** Unggah file belajar (PDF/Link) dan form pemberian tugas.
9. **Halaman Setoran Tahfidz:** Daftar siswa kelas tahfidz, tombol tambah setoran (Pilih Surah, Ayat, Status kelancaran).

### D. Portal Siswa & Orang Tua (Monitoring & Kelas)
10. **Dashboard Siswa:** Ringkasan tugas mendekati deadline, akses kelas mata pelajaran, dan riwayat setoran Tahfidz.
11. **Portal Orang Tua (Monitoring):** Akses terpadu rekap absensi anak, grafik nilai, sisa tugas anak, dan catatan perkembangan hafalan Tahfidz anak.

---

## 4. Modern Web Design Review & Accessibility (A11y)

* **Contrast Check:** Seluruh kombinasi warna (misalnya teks putih di atas tombol indigo) diverifikasi memiliki kontras tinggi yang mudah dibaca oleh pengguna dengan gangguan penglihatan ringan.
* **Semantic HTML:** Dashboard dirancang dengan tata letak penulisan judul yang logis:
  * Tag `<h1>` hanya digunakan satu kali per halaman (untuk judul dashboard utama).
  * Tag `<h2>` digunakan untuk nama seksi widget utama (seperti "Ringkasan Keuangan", "Grafik Tahfidz").
  * Tag `<h3>` untuk judul sub-komponen/card.
* **Responsivitas:** Struktur grid menggunakan CSS Grid yang fleksibel (`grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))`) sehingga otomatis menyesuaikan dari ukuran monitor PC hingga layar HP secara natural tanpa patah.
