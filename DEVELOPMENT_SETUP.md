# SPRINT 0 — DEVELOPMENT SETUP & BOILERPLATE SPECIFICATION

Dokumen ini menjelaskan struktur repositori, konfigurasi proyek, dan kesiapan lingkungan pengembangan lokal (Local Environment Setup) untuk **EduFlow**.

---

## 1. Struktur Folder Repositori (Workspace Directory Tree)

Struktur repositori dirancang modular agar kode frontend dan backend API (Next.js) terorganisasi dengan rapi dan mudah dirawat:

```text
Aplikasi LMS/
├── .gitignore
├── .env.example
├── package.json
├── README.md
├── DEVELOPMENT_SETUP.md
├── src/
│   ├── app/                    # Next.js App Router (Pages & API Routes)
│   │   ├── layout.tsx          # Wrapper layout utama (Font Google & CSS Global)
│   │   ├── page.tsx            # Landing Page / Halaman Utama
│   │   ├── login/              # Halaman Login Multi-role
│   │   │   └── page.tsx
│   │   ├── dashboard/          # Halaman Dashboard Berdasarkan Role
│   │   │   ├── admin/
│   │   │   ├── guru/
│   │   │   ├── siswa/
│   │   │   └── orang-tua/
│   │   └── api/                # Backend API Endpoints (Next.js Routes)
│   │       ├── auth/           # API Autentikasi Sesi JWT
│   │       ├── admin/          # API CRUD User & Keuangan
│   │       ├── guru/           # API Nilai, Absensi Siswa & Tahfidz
│   │       └── staff/          # API Absensi Staf (Clock-in/out)
│   ├── components/             # Reusable UI Components
│   │   ├── ui/                 # Komponen kecil (Button, Input, Card, Modal)
│   │   └── layouts/            # Komponen tata letak (Sidebar, Header, Footer)
│   ├── hooks/                  # Custom React Hooks
│   ├── utils/                  # Helper Functions (Format Mata Uang, Tanggal, dll.)
│   └── styles/                 # Styling global
│       └── globals.css         # Berisi implementasi Desain System Token
└── prisma/                     # Database ORM (Prisma Schema & Migrations)
    ├── schema.prisma           # Skema Tabel Relasional
    └── seed.js                 # Data Awal Demo (Siswa, Guru, Admin, Keuangan, Tahfidz)
```

---

## 2. Rencana Kalender Kegiatan & Estimasi Sprint

Kita akan membagi pengerjaan dalam siklus mingguan (Sprint) yang diawali dengan detail perencanaan fitur (Sprint Planning) dan diakhiri dengan evaluasi manual oleh User (Sprint Review & Retro):

| Siklus | Nama Kegiatan | Fokus Utama Fitur |
| :--- | :--- | :--- |
| **Sprint 0** | Setup Proyek | Konfigurasi boilerplates, skema ORM Database, file `.env` & data seeder awal. |
| **Sprint 1** | Auth & Admin Portal | Halaman Login, Dashboard Admin, CRUD Pengguna, dan Laporan Absensi Staf. |
| **Sprint 2** | Guru & LMS Portal | Kelas Digital, Upload Materi/Tugas, Input Kehadiran & Nilai Siswa. |
| **Sprint 3** | Keuangan & Tahfidz | Input Uang Masuk/Keluar, Grafik Cashflow, dan Setoran Progres Hafalan Qur'an. |
| **Sprint 4** | Portal Monitoring | Portal Dashboard khusus Siswa & Orang Tua untuk melihat rekapitulasi data. |

---

## 3. Rencana Keamanan & Proteksi Kode

* **Kunci Variabel Lingkungan (.env):** File `.env` yang berisi kredensial database dan sandi rahasia (`NEXTAUTH_SECRET`) telah didaftarkan pada `.gitignore` agar tidak pernah terunggah secara tidak sengaja.
* **Prosedur Uji Coba Keamanan:** Sebelum deploy, verifikasi hak akses API (RBAC) dilakukan dengan mencoba mengakses endpoint admin menggunakan token milik siswa. Sektor API wajib mengembalikan kode galat `403 Forbidden`.
