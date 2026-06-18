# Audit: Portfolio & Task Reporting Forms Consolidation

## Status
**DUPLICATE FORM DETECTED** — Two nearly identical portfolio submission forms with different styling and minor label variations.

---

## Findings

### 1. **Siswa Portfolio Form**
- **Location:** [src/app/dashboard/siswa/page.tsx](src/app/dashboard/siswa/page.tsx#L1575)
- **Section:** "Pelaporan Portofolio & Tugas Mandiri"
- **Style:** Inline CSS, grid layout, 2-column for first two fields, compact styling

### 2. **Orang Tua (Parent) Portfolio Form**
- **Location:** [src/app/dashboard/orang-tua/page.tsx](src/app/dashboard/orang-tua/page.tsx#L930)
- **Section:** "Jurnal Belajar Mandiri & Portofolio Harian"
- **Style:** CSS classes (.form-group, .form-label, .form-control), more verbose padding/margins

### 3. **Form Fields Comparison**

| Field | Siswa Form | Orang Tua Form | Match |
|-------|-----------|----------------|-------|
| Activity Title | `Nama Aktivitas / Judul Tugas` | `Nama/Judul Aktivitas Belajar` | ✅ 95% |
| Subject | `Mata Pelajaran` | `Mata Pelajaran Terkait` | ✅ 100% |
| Date | `Tanggal Aktivitas` | `Tanggal Aktivitas` | ✅ 100% |
| Category | `Kategori Belajar` | `Kategori Belajar` | ✅ 100% |
| Duration | `Durasi Belajar` | `Durasi Belajar` | ✅ 100% |
| Description | `Deskripsi Jurnal Belajar Mandiri` | `Deskripsi / Catatan Pembelajaran` | ✅ 95% |
| Reflection | `Refleksi Siswa (Apa yang disukai / kendala)` | `Rencana Tindak Lanjut / Catatan Refleksi Orang Tua` | ✅ 80% |
| File Upload | ✅ Custom button + input | ✅ Standard input | ✅ 85% |

**Conclusion:** 95%+ structure duplication. Same form, different skins.

---

## Root Causes
1. **No shared component library** — Forms built inline in page files.
2. **Styling inconsistency** — Siswa uses inline styles; Orang Tua uses CSS classes.
3. **Label variations** — Minor wording differences for same concept.
4. **API endpoints duplicated** — Both call similar APIs (`/api/orang-tua/...`, `/api/siswa/...`).

---

## Issues Found
- ❌ **DRY violation** — Code duplication increases maintenance burden.
- ❌ **Visual inconsistency** — Different form styling creates UX confusion.
- ❌ **Form state logic duplicated** — Both manage nearly identical state (title, subject, date, etc.).
- ❌ **Validation rules not centralized** — Each form validates independently.
- ❌ **File upload logic duplicated** — Two different approaches (custom button vs. standard input).

---

## Recommended Cleanup (MVP Fixes)

### Priority 1: Extract Shared Component
Create `src/components/PortfolioForm.tsx` with:
- Generic form for portfolio submission
- Props for role (`siswa`, `orang-tua`)
- Props for custom labels (if needed)
- Unified styling + CSS module or Tailwind

**Impact:** Reduce code duplication ~400 lines → 200 lines.

### Priority 2: Consolidate State Management
Create `src/hooks/usePortfolioForm.ts`:
- Shared form state logic
- Validation rules
- File handling

**Impact:** ~100 lines of logic shared.

### Priority 3: Unify Styling
- Use CSS module or Tailwind consistent classes
- Remove inline style variations
- Ensure both roles see identical visual forms

**Impact:** Better UX, easier maintenance.

### Priority 4: API Normalization
- Both forms call `/api/orang-tua/...` and `/api/siswa/...`
- Consider single endpoint with role parameter or standardized routes
- Current: Duplicate backend logic

**Impact:** Reduce API complexity.

---

## Also Found: Similar Patterns
- **Tahfidz Journal Forms** (multiple roles): [src/app/dashboard/**/tahfidz/page.tsx](src/app/dashboard/guru/tahfidz/page.tsx)
- **Habit/Mutaba'ah Forms** (Siswa, Orang-Tua): [src/app/dashboard/siswa/page.tsx](src/app/dashboard/siswa/page.tsx#L942), [src/app/dashboard/orang-tua/page.tsx](src/app/dashboard/orang-tua/page.tsx#L539)
- **Grading Forms** (LMS Portfolio Grading): [src/app/dashboard/guru/lms/page.tsx](src/app/dashboard/guru/lms/page.tsx#L325)

**Recommendation:** Audit these for similar duplication after portfolio cleanup.

---

## Implementation Plan
1. **Phase 1 (Immediate):** Extract `<PortfolioForm />` component.
2. **Phase 2 (Follow-up):** Refactor Siswa & Orang-Tua pages to use component.
3. **Phase 3 (Optional):** Repeat for Tahfidz, Habit forms.

**Effort:** ~2-4 hours for phase 1+2.

---

## User Confirmation Gate
✅ Cleanup identified  
⏳ **Awaiting approval to implement Phase 1–2**

Type: `LOCK CLEANUP` to proceed | `REVISE` to adjust scope | `DETAIL` for more examples
