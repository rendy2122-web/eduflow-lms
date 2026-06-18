import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const student = await prisma.user.findFirst({
      where: { email: 'siswa@sekolah.sch.id' },
      include: {
        profile: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!student || !student.profile) {
      return NextResponse.json(
        { success: false, error: 'Siswa Bilal tidak ditemukan' },
        { status: 404 }
      );
    }

    // 1. Ambil absensi siswa & hitung persentase kehadiran
    const attendances = await prisma.studentAttendance.findMany({
      where: { student_id: student.id },
    });
    const totalDays = attendances.length;
    const presentDays = attendances.filter((a) => a.status === 'hadir').length;
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    // 2. Ambil pengumpulan tugas (submissions) & hitung rata-rata nilai
    const submissions = await prisma.submission.findMany({
      where: { student_id: student.id },
    });
    const gradedSubmissions = submissions.filter((s) => s.score !== null);
    const averageGrade =
      gradedSubmissions.length > 0
        ? parseFloat((gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length).toFixed(1))
        : 0;

    // 3. Ambil daftar tugas kelas (dari mapel di kelas siswa)
    const classId = student.profile.class_id;
    let tasks: any[] = [];
    if (classId) {
      const classSubjects = await prisma.subject.findMany({
        where: { class_id: classId },
      });
      const subjectIds = classSubjects.map((s) => s.id);

      const dbTasks = await prisma.task.findMany({
        where: { subject_id: { in: subjectIds } },
        include: {
          subject: true,
        },
      });

      tasks = dbTasks.map((task) => {
        const submission = submissions.find((s) => s.task_id === task.id);
        const deadlineDate = new Date(task.deadline);
        
        return {
          id: task.id,
          title: task.title,
          subject: task.subject.name,
          deadline: deadlineDate.toISOString().split('T')[0],
          status: submission ? 'sudah_kirim' : 'belum_kirim',
          score: submission ? submission.score : null,
        };
      });
    }

    // 4. Ambil catatan Tahfidz
    const tahfidzRecords = await prisma.tahfidzRecord.findMany({
      where: { student_id: student.id },
      orderBy: { date: 'desc' },
    });

    const formattedTahfidz = tahfidzRecords.map((t) => {
      const totalAyats: Record<string, number> = {
        'Surah An-Naba': 40,
        'Surah Al-Mulk': 30,
        'Surah Al-Baqarah': 286,
        'Surah An-Nazi\'at': 46,
      };
      
      const maxAyah = totalAyats[t.surah_name] || 50;
      const progressPercent = Math.min(100, Math.round((t.end_ayat / maxAyah) * 100));

      return {
        id: t.id,
        surah_name: t.surah_name,
        range: `Ayat ${t.start_ayat} - ${t.end_ayat}`,
        status: t.status,
        date: t.date,
        progress: progressPercent,
        notes: t.notes,
      };
    });

    // 5. Kalkulasi Rekomendasi Murajaah AI
    const needsReview = tahfidzRecords.find(
      (t) => t.status === 'kurang_lancar' || t.status === 'perlu_diulang'
    );
    
    let aiRecommendation = {};
    if (needsReview) {
      aiRecommendation = {
        type: 'warning',
        message: `Fokus Murajaah: Hafalan ${needsReview.surah_name} (${needsReview.start_ayat}-${needsReview.end_ayat}) perlu diulang kembali karena berstatus ${needsReview.status.toUpperCase()}.`,
        notes: `Catatan Ustadz: "${needsReview.notes || 'Perhatikan dengung/tajwid.'}"`,
        tips: 'Cobalah mendengarkan murottal surah ini sebanyak 3x sebelum disetorkan ulang harian.',
      };
    } else if (tahfidzRecords.length > 0) {
      const lastRecord = tahfidzRecords[0];
      const nextStart = lastRecord.end_ayat + 1;
      
      aiRecommendation = {
        type: 'success',
        message: `Hafalan Anda berjalan lancar! Rekomendasi target setoran berikutnya adalah melanjutkan hafalan ${lastRecord.surah_name} mulai Ayat ${nextStart}.`,
        notes: 'Pertahankan makhraj dan ketukan tempo membaca hafalan Anda.',
        tips: 'Mulai hafalkan ayat-ayat tersebut setelah shalat Subuh untuk daya ingat yang optimal.',
      };
    } else {
      aiRecommendation = {
        type: 'info',
        message: 'Belum ada catatan setoran terdaftar. Kami menyarankan untuk memulai setoran dari Surah An-Naba Ayat 1.',
        notes: 'Gunakan metode membaca berulang (tikrar) sebelum mulai menghafal.',
        tips: 'Targetkan minimal setoran 5 ayat baru setiap harinya.',
      };
    }

    // 6. Kalkulasi Badge Gamifikasi Tahfidz
    const badges: any[] = [];
    const totalSetoran = tahfidzRecords.length;
    const lancarSetoran = tahfidzRecords.filter(r => r.status === 'lancar').length;
    
    // Badge 1: Pekanth Tahfidz Pemula
    if (totalSetoran > 0) {
      badges.push({
        id: 'badge-1',
        title: 'Penghafal Pemula',
        description: 'Telah memulai setoran hafalan pertama di EduFlow.',
        icon: '🌱',
        color: '#10b981',
        bgColor: '#ecfdf5',
        earnedAt: tahfidzRecords[tahfidzRecords.length - 1].date
      });
    }

    // Badge 2: Pejuang Tikrar (Setoran Konsisten)
    if (totalSetoran >= 3) {
      badges.push({
        id: 'badge-2',
        title: 'Pejuang Tikrar',
        description: 'Konsisten melakukan setoran hafalan sebanyak 3x atau lebih.',
        icon: '🔥',
        color: '#f97316',
        bgColor: '#fff7ed',
        earnedAt: tahfidzRecords[0].date
      });
    }

    // Badge 3: Mahkota Tajwid (Hafalan Lancar)
    if (lancarSetoran >= 2) {
      badges.push({
        id: 'badge-3',
        title: 'Mahkota Tajwid',
        description: 'Mencapai status hafalan LANCAR sebanyak 2x berturut-turut.',
        icon: '👑',
        color: '#8b5cf6',
        bgColor: '#f5f3ff',
        earnedAt: tahfidzRecords.find(r => r.status === 'lancar')?.date || '-'
      });
    }

    // Badge 4: Penjaga Surah (Surah Finisher)
    const finishedAnNaba = tahfidzRecords.some(r => r.surah_name.includes('An-Naba') && r.end_ayat >= 40);
    const finishedAlMulk = tahfidzRecords.some(r => r.surah_name.includes('Al-Mulk') && r.end_ayat >= 30);
    if (finishedAnNaba || finishedAlMulk) {
      badges.push({
        id: 'badge-4',
        title: 'Penjaga Surah',
        description: 'Telah menyelesaikan target hafalan satu surah penuh.',
        icon: '🛡️',
        color: '#3b82f6',
        bgColor: '#eff6ff',
        earnedAt: new Date().toISOString().split('T')[0]
      });
    }

    return NextResponse.json({
      success: true,
      studentInfo: {
        id: student.id,
        nama: student.nama,
        email: student.email,
        class: student.profile.class?.name || 'Belum Ada Kelas',
        nisn: student.profile.nisn_or_nip || '-',
      },
      attendanceRate,
      averageGrade,
      tasks,
      tahfidz: formattedTahfidz,
      aiRecommendation,
      badges,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
