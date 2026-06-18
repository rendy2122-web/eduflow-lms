import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const parent = await prisma.user.findFirst({
      where: { email: 'ortu@sekolah.sch.id' },
    });

    if (!parent) {
      return NextResponse.json(
        { success: false, error: 'User orang tua tidak ditemukan' },
        { status: 404 }
      );
    }

    const childProfiles = await prisma.profile.findMany({
      where: { parent_id: parent.id },
      include: {
        user: true,
        class: true,
      },
    });

    const childrenData = await Promise.all(
      childProfiles.map(async (profile) => {
        const student = profile.user;

        // 1. Hitung tingkat absensi harian anak
        const attendances = await prisma.studentAttendance.findMany({
          where: { student_id: student.id },
        });
        const totalDays = attendances.length;
        const presentDays = attendances.filter((a) => a.status === 'hadir').length;
        const attendanceRate = totalDays > 0 ? `${Math.round((presentDays / totalDays) * 100)}%` : '100%';

        // 2. Ambil nilai akademis dan hitung rata-rata
        const submissions = await prisma.submission.findMany({
          where: { student_id: student.id },
          include: {
            task: {
              include: {
                subject: {
                  include: {
                    teacher: true,
                  },
                },
              },
            },
          },
        });

        const graded = submissions.filter((s) => s.score !== null);
        const averageGradeVal = graded.length > 0
          ? graded.reduce((sum, s) => sum + (s.score || 0), 0) / graded.length
          : 85; // Default fallback to 85 if empty

        const averageGrade = averageGradeVal.toFixed(1);

        const grades = graded.map((s) => ({
          subject: s.task.subject.name,
          score: s.score || 0,
          teacher: s.task.subject.teacher.nama,
        }));

        // 3. Cari tugas yang belum dikerjakan (pending tasks)
        let pendingTasks: any[] = [];
        if (profile.class_id) {
          const classSubjects = await prisma.subject.findMany({
            where: { class_id: profile.class_id },
          });
          const subjectIds = classSubjects.map((sub) => sub.id);

          const dbTasks = await prisma.task.findMany({
            where: { subject_id: { in: subjectIds } },
            include: {
              subject: true,
            },
          });

          pendingTasks = dbTasks
            .filter((task) => !submissions.some((s) => s.task_id === task.id))
            .map((task) => ({
              title: task.title,
              subject: task.subject.name,
              deadline: new Date(task.deadline).toISOString().split('T')[0],
            }));
        }

        // 4. Catatan hafalan Tahfidz anak
        const tahfidzRecords = await prisma.tahfidzRecord.findMany({
          where: { student_id: student.id },
          orderBy: { date: 'desc' },
        });

        const tahfidz = tahfidzRecords.map((t) => ({
          date: t.date,
          surah: t.surah_name,
          range: `Ayat ${t.start_ayat} - ${t.end_ayat}`,
          status: t.status,
          note: t.notes || 'Hafalan disimak dengan baik',
        }));

        // 5. Kalkulasi Rekomendasi AI Parenting Khusus Anak
        const attendanceRateNum = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;
        const lowGradeTask = graded.find(g => (g.score || 0) < 75);
        const needsQuranReview = tahfidzRecords.find(t => t.status === 'kurang_lancar' || t.status === 'perlu_diulang');
        
        let aiRecommendation = {};
        if (attendanceRateNum < 90) {
          aiRecommendation = {
            type: 'warning',
            title: `Perhatian Kehadiran: ${student.nama}`,
            message: `Tingkat kehadiran ${student.nama} saat ini adalah ${attendanceRate} (di bawah batas ideal 90%).`,
            tips: `Orang tua disarankan menanyakan kondisi kesehatan/motivasi belajar anak dan berkonsultasi dengan Wali Kelas via Buku Penghubung.`
          };
        } else if (lowGradeTask) {
          aiRecommendation = {
            type: 'warning',
            title: `Pendampingan Akademik: ${student.nama}`,
            message: `Nilai tugas "${lowGradeTask.task.title}" pada pelajaran ${lowGradeTask.task.subject.name} adalah ${lowGradeTask.score}, berada di bawah KKM (75).`,
            tips: `Orang tua disarankan meluangkan waktu 15 menit malam ini untuk membantu anak mengulang materi tersebut.`
          };
        } else if (needsQuranReview) {
          aiRecommendation = {
            type: 'warning',
            title: `Bimbingan Hafalan Quran: ${student.nama}`,
            message: `Setoran hafalan ${needsQuranReview.surah_name} (${needsQuranReview.start_ayat}-${needsReviewQuran(needsQuranReview)}) berstatus ${needsQuranReview.status.toUpperCase()}.`,
            tips: `Bantu anak Anda mendengarkan murottal surah tersebut secara berulang (tikrar) sebelum disetorkan ulang esok hari.`
          };
        } else {
          aiRecommendation = {
            type: 'success',
            title: `Progres Luar Biasa: ${student.nama}`,
            message: `Seluruh nilai tugas akademik di atas standar (KKM) dan setoran Tahfidz terakhir anak Anda berjalan sangat lancar.`,
            tips: `Berikan apresiasi verbal yang memotivasi kepada anak agar ia tetap bersemangat belajar dan menghafal.`
          };
        }

        function needsReviewQuran(t: any) {
          return t.end_ayat || 0;
        }

        // Calculate Badges dynamically for each child
        const childBadges: any[] = [];
        const totalChildSetoran = tahfidzRecords.length;
        const lancarChildSetoran = tahfidzRecords.filter((r) => r.status === 'lancar').length;

        if (totalChildSetoran > 0) {
          childBadges.push({
            id: 'badge-1',
            title: 'Penghafal Pemula',
            description: 'Memulai setoran hafalan pertama di EduFlow.',
            icon: '🌱',
            color: '#10b981',
            bgColor: '#ecfdf5',
            earnedAt: tahfidzRecords[tahfidzRecords.length - 1].date
          });
        }

        if (totalChildSetoran >= 3) {
          childBadges.push({
            id: 'badge-2',
            title: 'Pejuang Tikrar',
            description: 'Konsisten menyetor hafalan sebanyak 3x atau lebih.',
            icon: '🔥',
            color: '#f97316',
            bgColor: '#fff7ed',
            earnedAt: tahfidzRecords[0].date
          });
        }

        if (lancarChildSetoran >= 2) {
          childBadges.push({
            id: 'badge-3',
            title: 'Mahkota Tajwid',
            description: 'Mencapai status hafalan LANCAR sebanyak 2x berturut-turut.',
            icon: '👑',
            color: '#8b5cf6',
            bgColor: '#f5f3ff',
            earnedAt: tahfidzRecords.find((r) => r.status === 'lancar')?.date || '-'
          });
        }

        const childFinishedAnNaba = tahfidzRecords.some(r => r.surah_name.includes('An-Naba') && r.end_ayat >= 40);
        const childFinishedAlMulk = tahfidzRecords.some(r => r.surah_name.includes('Al-Mulk') && r.end_ayat >= 30);
        if (childFinishedAnNaba || childFinishedAlMulk) {
          childBadges.push({
            id: 'badge-4',
            title: 'Penjaga Surah',
            description: 'Menyelesaikan target hafalan satu surah penuh.',
            icon: '🛡️',
            color: '#3b82f6',
            bgColor: '#eff6ff',
            earnedAt: new Date().toISOString().split('T')[0]
          });
        }

        return {
          id: student.id,
          name: student.nama,
          class: profile.class?.name || 'Belum Ada Kelas',
          nisn: profile.nisn_or_nip || '-',
          attendanceRate,
          averageGrade,
          pendingTasks,
          grades,
          tahfidz,
          aiRecommendation,
          badges: childBadges
        };
      })
    );

    const childrenMap: Record<string, typeof childrenData[number]> = {};
    childrenData.forEach((child) => {
      childrenMap[child.name] = child;
    });

    return NextResponse.json({
      success: true,
      children: childrenMap,
      childrenNames: childrenData.map((c) => c.name),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
