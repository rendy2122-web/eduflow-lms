# EduFlow LMS - Testing & Review Guide

## 📋 Overview
Dokumen ini berisi panduan testing manual untuk semua fitur yang sudah diimplementasi di EduFlow LMS.

---

## 🚀 How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 3. Start Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

---

## 🔐 Authentication Testing

### Login API Endpoint
**Endpoint:** `POST /api/login`

**Test Cases:**
1. ✅ Login dengan email & password yang benar
2. ✅ Login dengan tenant ID yang valid
3. ❌ Login dengan email yang tidak terdaftar (should return 401)
4. ❌ Login dengan password salah (should return 401)
5. ❌ Login tanpa mengisi field yang required (should return 400)

**Cara Test Manual:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sekolah.sch.id",
    "password": "password123",
    "tenantId": "sdn01menteng"
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "admin@sekolah.sch.id",
    "role": "admin",
    "nama": "Admin Sarah"
  }
}
```

---

## 📊 Dashboard Testing by Role

### 1. Admin Dashboard (`/dashboard/admin`)

**Features to Test:**
- [ ] **Financial Metrics Cards**
  - Revenue (Pemasukan) display
  - Expenses (Pengeluaran) display
  - Net Income (Saldo) display
  - Cash on Hand display
  
- [ ] **Financial Performance Chart**
  - SVG line graph showing revenue vs expenses
  - Monthly data points (6 months)
  - Interactive hover on data points
  - Legend (Revenue = green, Expenses = red)
  
- [ ] **Income Breakdown Donut Chart**
  - Percentage calculation (Masuk vs Keluar)
  - Conic gradient rendering
  - Hover effect (scale 1.04)
  
- [ ] **Cashflow Trend Bar Chart**
  - Monthly bar visualization
  - Tooltip on hover showing saldo
  - Dynamic height based on data
  
- [ ] **Teachers Overview Table**
  - List of teachers with avatar, name, subject, status
  - Status badge (Active/Inactive)
  - Edit button (hover effect)

**API Dependencies:**
- `GET /api/admin/finance/summary` - Financial data
- `GET /api/admin/users` - Teachers list

**Test Data Required:**
- Minimum 6 months of financial transaction data
- At least 3-5 teacher records

---

### 2. Guru Dashboard (`/dashboard/guru`)

**Features to Test:**
- [ ] **Quick Metrics Grid (4 Cards)**
  - Kelas Diajar (Classes taught)
  - Total Murid (Total students)
  - Total Tugas (Total assignments)
  - Pengumuman (Announcements)
  
- [ ] **Attendance Chart**
  - Line graph showing daily attendance trend
  - Interactive tooltip on hover
  - 6-day data points
  - Double-ring nodes on data points
  
- [ ] **Student Attendance Matrix**
  - Grid showing student attendance per date
  - Click to toggle Hadir/Alpa
  - "Hadirkan Semua Hari Ini" button
  - Class filter dropdown
  - Search by student name
  
- [ ] **AI Warnings System**
  - Attendance warnings
  - Academic performance warnings
  - Info notifications
  
- [ ] **Buku Penghubung (Chat)**
  - Open chat with student
  - Send message as guru
  - View message history
  - Real-time refresh
  
- [ ] **Kuis Interaktif**
  - Quiz question display
  - Option selection
  - Answer validation
  - Explanation shown after answer
  
- [ ] **Tahfidz Records**
  - List of hafalan records
  - Progress indicators
  - Date and surah info
  
- [ ] **Print Rapor Feature**
  - Click print button on student row
  - Opens new window with formatted report
  - Auto-trigger print dialog
  - Includes: attendance, grades, tahfidz

**API Dependencies:**
- `GET /api/guru/attendance/student` - Attendance matrix
- `POST /api/guru/attendance/student` - Update attendance
- `GET /api/guru/tahfidz` - Tahfidz records
- `GET /api/guru/consultation` - Chat messages
- `POST /api/guru/consultation` - Send message
- `GET /api/guru/rapor?studentId=` - Student report data
- `GET /api/exams?role=guru` - Exams list
- `GET /api/guru/lms` - Tasks/assignments

**Test Data Required:**
- 10-20 students per class
- 5-6 target dates for attendance
- 3-5 tahfidz records
- 2-3 chat conversations
- 1-2 exam records

---

### 3. Siswa Dashboard (`/dashboard/siswa`)

**Features to Test:**
- [ ] **Tab Switcher**
  - "Dasbor Utama & Ujian" tab
  - "Ruang Belajar Homeschooling" tab
  - Smooth transition between tabs
  
- [ ] **Main Dashboard Tab**
  - **Stats Cards:**
    - Persentase Kehadiran (Attendance %)
    - Rata-rata Nilai Tugas (Average grade)
    - Tugas Belum Dikirim (Pending tasks)
  
  - **Online Classes Widget**
    - Display today's online classes
    - Platform badge (Google Meet/Zoom)
    - "Gabung" button with correct link
    - "Lihat Semua" link
  
  - **AI Murajaah Assistant**
    - Display hafalan recommendation
    - Warning/success styling
    - Tips section
  
  - **AI Study Advisor**
    - Detect lowest grade
    - Show remedial recommendation if score < 75
    - Show success message if all grades >= 75
    - Subject-specific tips (Math, PAI, etc.)
  
  - **Jurnal Mutaba'ah Yaumiyah**
    - 7-day calendar selector
    - Click to select date
    - Status dot (verified/filled/empty)
    - Shalat 5 Waktu tracker (Subuh, Dzuhur, Ashar, Maghrib, Isya)
    - Sunnah & Karakter tracker (Duha, Tahajjud, Tadarrus, Birrul Walidain, Belajar)
    - Save button with loading state
    - Success/error message toast
  
  - **Grade Chart**
    - Line chart showing task scores
    - Dynamic data from graded tasks
    - Fallback mock data if no grades

- [ ] **Homeschooling Tab**
  - **Milestone Path**
    - List of learning milestones
    - Click to toggle complete/incomplete
    - Progress percentage
    - Optimistic UI update
  
  - **Portfolio Submission**
    - Form with title, subject, date, type, duration
    - Notes and reflection textareas
    - File upload button
    - Submit with FormData
    - Success/error feedback
  
  - **Consultation Chat**
    - Send message to teacher
    - View chat history
    - Real-time refresh after send

- [ ] **Exam System**
  - **Exam List:**
    - Display available exams
    - Show title, subject, duration, deadline
    - Status (belum_kirim/sudah_kirim)
    - Score display if completed
  
  - **Exam Session:**
    - Confirmation dialog before starting
    - Timer countdown (MM:SS format)
    - Question display with options
    - Option selection (radio button style)
    - Auto-submit when timer reaches 0
    - Manual submit button
    - Warning if incomplete (< 100% answered)
    - Score display after submission
    - Correct/wrong answer feedback

**API Dependencies:**
- `GET /api/siswa/dashboard` - Main dashboard data
- `GET /api/siswa/online-class` - Online classes
- `GET /api/siswa/habit?range=weekly` - Habit logs
- `POST /api/siswa/habit` - Save habit log
- `GET /api/siswa/progress-tracker` - Milestones
- `POST /api/siswa/progress-tracker` - Update milestone
- `GET /api/orang-tua/co-teacher` - Portfolios
- `POST /api/orang-tua/co-teacher` - Submit portfolio
- `GET /api/guru/consultation` - Chat messages
- `POST /api/guru/consultation` - Send chat
- `GET /api/exams?role=siswa` - Exam list
- `GET /api/exams?role=siswa&examId=` - Exam detail
- `POST /api/exams/submit` - Submit exam
- `POST /api/siswa/submit-task` - Upload assignment

**Test Data Required:**
- 5-10 tasks with varying status
- 3-5 graded tasks with scores
- 7-day habit log data
- 3-5 milestones
- 2-3 online classes
- 1-2 active exams with 5-10 questions each
- Chat history with teacher

---

### 4. Orang Tua Dashboard (`/dashboard/orang-tua`)

**Features to Test:**
- [ ] **Child Selector**
  - Dropdown to select child
  - Display "Tidak ada profil anak terhubung" if no children
  - Auto-select first child if available
  
- [ ] **Tab Switcher**
  - "Dasbor Utama" tab
  - "Mitra Pengajar (Co-Teacher Console)" tab

- [ ] **Dashboard Tab**
  - **Child Info Badge**
    - Student name, class, NISN
  
  - **AI Parenting Guidance**
    - Warning/success alert based on child performance
    - Tips for parents
  
  - **Quick Stats Grid**
    - Tingkat Kehadiran Anak (Attendance rate)
    - Rata-rata Nilai Tugas (Average grade)
    - Tugas Belum Dikumpul (Pending tasks count)
  
  - **Badges & Achievements**
    - Horizontal scrollable badge list
    - Badge icon, title, description
    - Earned date tooltip
  
  - **Mutaba'ah Yaumiyah (Habit Tracker)**
    - 7-day calendar selector
    - Status dot (verified/filled/empty)
    - Shalat 5 Waktu display
    - Sunnah & Karakter display
    - "Verifikasi Jurnal Anak" button
    - "Batalkan Verifikasi" button
    - Verification status message
  
  - **Grades Table**
    - List of academic grades
    - Subject, teacher, score
    - Color coding (green if >= 85)
  
  - **Grade Comparison Chart**
    - Bar chart comparing subjects
    - Dynamic data from child grades
  
  - **Tahfidz Journal**
    - List of hafalan records
    - Date, surah, range, status
    - Teacher notes

- [ ] **Co-Teacher Console Tab**
  - **Portfolio Submission Form**
    - Title, subject, date, type, duration
    - Notes and reflection textareas
    - File upload
    - Submit button with loading state
    - Success/error feedback
  
  - **Adab & Character Assessment**
    - Score slider (0-100)
    - Real-time score display
    - Notes textarea
    - Submit button
  
  - **Portfolio List**
    - Display submitted portfolios
    - Title, subject, date, type
    - File attachment indicator

**API Dependencies:**
- `GET /api/orang-tua/dashboard` - Parent dashboard data
- `GET /api/orang-tua/habit?range=weekly&studentId=` - Child habits
- `POST /api/orang-tua/habit` - Verify habit
- `GET /api/orang-tua/co-teacher` - Portfolios list
- `POST /api/orang-tua/co-teacher` - Submit portfolio/adab
- `GET /api/guru/consultation?studentId=` - Chat messages
- `POST /api/guru/consultation` - Send message

**Test Data Required:**
- 1-2 children linked to parent account
- Each child with grades, attendance, tahfidz data
- 7-day habit logs for each child
- 2-3 portfolio submissions
- Chat history with teacher

---

## 🗄️ Database Schema Review

### Models Implemented (16 models)
1. ✅ **User** - Akun login & profil utama
2. ✅ **Profile** - Data tambahan berdasarkan role
3. ✅ **Class** - Kelas belajar
4. ✅ **Subject** - Mata pelajaran
5. ✅ **Material** - Materi pembelajaran
6. ✅ **Task** - Tugas
7. ✅ **Submission** - Pengumpulan tugas
8. ✅ **StudentAttendance** - Kehadiran murid
9. ✅ **StaffAttendance** - Kehadiran guru/staf
10. ✅ **TahfidzRecord** - Jurnal hafalan Qur'an
11. ✅ **Finance** - Pembukuan keuangan
12. ✅ **CommunicationLog** - Buku penghubung
13. ✅ **Announcement** - Pengumuman
14. ✅ **Exam** - Kuis dan ujian
15. ✅ **ExamQuestion** - Soal ujian
16. ✅ **ExamAttempt** - Hasil ujian
17. ✅ **HabitLog** - Mutaba'ah yaumiyah
18. ✅ **Tenant** - SaaS multi-tenant
19. ✅ **Subscription** - Langganan
20. ✅ **BillingLog** - Log pembayaran
21. ✅ **OnlineClass** - Kelas online

### Relationships Verified
- ✅ User ↔ Profile (1:1)
- ✅ User ↔ StudentAttendance (1:N)
- ✅ User ↔ StaffAttendance (1:N)
- ✅ User ↔ Submission (1:N)
- ✅ User ↔ TahfidzRecord (1:N as student, 1:N as teacher)
- ✅ Class ↔ Profile (1:N)
- ✅ Class ↔ Subject (1:N)
- ✅ Subject ↔ Material (1:N)
- ✅ Subject ↔ Task (1:N)
- ✅ Subject ↔ Exam (1:N)
- ✅ Task ↔ Submission (1:N)
- ✅ Exam ↔ ExamQuestion (1:N)
- ✅ Exam ↔ ExamAttempt (1:N)
- ✅ Tenant ↔ Subscription (1:1)
- ✅ Tenant ↔ BillingLog (1:N)

---

## 🎨 UI/UX Testing Checklist

### Premium UI Elements
- [ ] **Animations**
  - Fade in up on scroll
  - Card hover effects (translateY, shadow)
  - Button hover states
  - Loading shimmer effect
  
- [ ] **Charts**
  - SVG line charts render correctly
  - Bar charts display properly
  - Donut chart with conic gradient
  - Interactive tooltips on hover
  - Smooth transitions
  
- [ ] **Responsive Design**
  - Desktop (1400px+) - Side panel visible
  - Tablet (768px - 1399px) - Side panel hidden
  - Mobile (< 768px) - Stack layout
  
- [ ] **Color System**
  - Primary: #4f46e5 (Indigo)
  - Success: #10b981 (Green)
  - Warning: #f59e0b (Amber)
  - Danger: #ef4444 (Red)
  - Info: #06b6d4 (Cyan)
  
- [ ] **Typography**
  - Consistent font sizing
  - Proper font weights (400, 500, 600, 700, 800)
  - Line height readability

---

## 🔌 API Endpoints Inventory

### Authentication
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/auth/session` - Get current session

### Admin
- `GET /api/admin/finance/summary` - Financial summary
- `GET /api/admin/users` - Users/teachers list

### Guru (Teacher)
- `GET /api/guru/attendance/student` - Student attendance matrix
- `POST /api/guru/attendance/student` - Update attendance
- `GET /api/guru/tahfidz` - Tahfidz records
- `GET /api/guru/consultation` - Chat messages
- `POST /api/guru/consultation` - Send message
- `GET /api/guru/rapor?studentId=` - Student report
- `GET /api/guru/lms` - Tasks/assignments

### Siswa (Student)
- `GET /api/siswa/dashboard` - Dashboard data
- `GET /api/siswa/online-class` - Online classes
- `GET /api/siswa/habit` - Habit logs
- `POST /api/siswa/habit` - Save habit
- `GET /api/siswa/progress-tracker` - Milestones
- `POST /api/siswa/progress-tracker` - Update milestone
- `POST /api/siswa/submit-task` - Upload assignment

### Orang Tua (Parent)
- `GET /api/orang-tua/dashboard` - Dashboard data
- `GET /api/orang-tua/habit` - Child habits
- `POST /api/orang-tua/habit` - Verify habit
- `GET /api/orang-tua/co-teacher` - Portfolios
- `POST /api/orang-tua/co-teacher` - Submit portfolio

### Exams
- `GET /api/exams?role=` - Exam list
- `GET /api/exams?role=&examId=` - Exam detail
- `POST /api/exams/submit` - Submit exam

### SaaS Admin
- `POST /api/saas/register` - Register new tenant
- `GET /api/saas/` - SaaS admin dashboard

### Announcements
- `GET /api/announcements` - Get announcements
- `POST /api/announcements` - Create announcement

---

## 🧪 Manual Testing Steps

### Scenario 1: Complete Admin Flow
1. Login as admin (`admin@sekolah.sch.id`)
2. Verify financial metrics display correctly
3. Check charts render with data
4. View teachers table
5. Click "Edit" button on teacher row (verify hover effect)

### Scenario 2: Complete Guru Flow
1. Login as teacher (`guru@sekolah.sch.id`)
2. Check attendance matrix loads
3. Toggle student attendance (Hadir ↔ Alpa)
4. Click "Hadirkan Semua Hari Ini"
5. Open chat with a student
6. Send a message
7. Answer interactive quiz
8. View tahfidz records
9. Click print button on student row
10. Verify rapor prints correctly

### Scenario 3: Complete Siswa Flow
1. Login as student (`siswa@sekolah.sch.id`)
2. Switch between "Dasbor Utama" and "Homeschooling" tabs
3. View online classes widget
4. Read AI recommendations
5. Fill in habit tracker for a date
6. Save habit log
7. Toggle a milestone as complete
8. Submit a portfolio (with file upload)
9. Start an exam
10. Answer questions
11. Submit exam before timer ends
12. Verify score display

### Scenario 4: Complete Orang Tua Flow
1. Login as parent (`ortu@sekolah.sch.id`)
2. Select child from dropdown
3. View child's stats and grades
4. Check habit tracker
5. Verify child's habit log
6. Submit adab score
7. Submit portfolio with file
8. Send consultation message to teacher

### Scenario 5: SaaS Registration
1. Go to landing page (`/`)
2. Scroll to onboarding form
3. Fill in school details
4. Select plan
5. Fill admin account
6. Submit registration
7. Verify success message
8. Check new tenant database created

---

## 🐛 Known Issues & Areas to Verify

### Potential Issues
1. **Password Hashing Fallback**
   - Code has fallback to plaintext comparison for legacy seeded DBs
   - ⚠️ Security risk - should be removed after migration
   
2. **Hardcoded Dates**
   - Some components use hardcoded dates (e.g., `todayDate = '2026-06-11'`)
   - Should use `new Date().toISOString().split('T')[0]`
   
3. **Mock Data**
   - Some dashboards have fallback mock data
   - Ensure real data populates in production
   
4. **Error Handling**
   - Most API calls have try-catch
   - Verify error messages are user-friendly
   
5. **Loading States**
   - Shimmer effects implemented
   - Verify all data fetches show loading state

### Performance Checks
- [ ] Initial page load < 3 seconds
- [ ] Chart rendering < 500ms
- [ ] API response time < 200ms
- [ ] No console errors in browser
- [ ] No memory leaks (check React DevTools)

---

## 📱 Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

---

## ✅ Pre-Launch Checklist

### Security
- [ ] Password hashing uses scrypt (not plaintext)
- [ ] HTTP-only cookies enabled
- [ ] CSRF protection active
- [ ] Input validation on all forms
- [ ] SQL injection prevented (using Prisma ORM)

### Data Integrity
- [ ] All foreign keys have proper constraints
- [ ] Cascade delete works correctly
- [ ] Unique constraints enforced (email, NISN, etc.)
- [ ] Date formats consistent (YYYY-MM-DD)

### User Experience
- [ ] All buttons have hover states
- [ ] Loading states for all async operations
- [ ] Error messages are clear and helpful
- [ ] Success confirmations shown
- [ ] Empty states handled gracefully

### SEO & Accessibility
- [ ] Semantic HTML used
- [ ] Alt text for images
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Color contrast meets WCAG standards

---

## 🚀 Next Steps

After manual testing:
1. Fix any bugs discovered
2. Add automated tests (Jest + React Testing Library)
3. Perform load testing (k6 or Artillery)
4. Security audit (OWASP checklist)
5. Deploy to staging environment
6. UAT with stakeholders

---

## 📞 Support

Jika menemukan bug atau memiliki pertanyaan:
1. Cek console browser untuk error logs
2. Cek terminal untuk API errors
3. Dokumentasikan steps to reproduce
4. Screenshot jika UI issue

---

**Last Updated:** 2026-06-17  
**Version:** 1.0  
**Status:** Ready for Testing