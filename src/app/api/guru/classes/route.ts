import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Dapatkan user guru secara dinamis
    const teacher = await prisma.user.findFirst({
      where: { role: 'guru' }
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Data guru tidak ditemukan di sistem' },
        { status: 404 }
      );
    }

    // 2. Ambil semua kelas
    const classes = await prisma.class.findMany({
      include: {
        subjects: {
          include: {
            teacher: true
          }
        }
      }
    });

    // 3. Susun data kelas beserta detail murid & statistiknya
    const targetDates = ['2026-06-08', '2026-06-09', '2026-06-10', '2026-06-11', '2026-06-12', '2026-06-15'];

    const classesWithDetails = await Promise.all(
      classes.map(async (cls) => {
        // Ambil murid yang tergabung di kelas ini
        const students = await prisma.user.findMany({
          where: {
            role: 'siswa',
            profile: {
              class_id: cls.id
            }
          },
          orderBy: { nama: 'asc' }
        });

        // Untuk setiap murid, hitung persentase kehadiran & tugas
        const studentDetails = await Promise.all(
          students.map(async (student, idx) => {
            // Absensi
            const attendances = await prisma.studentAttendance.findMany({
              where: { student_id: student.id }
            });
            const presentDays = attendances.filter(a => a.status === 'hadir').length;
            const presenceRate = attendances.length > 0 
              ? Math.round((presentDays / attendances.length) * 100) 
              : 100;

            // Submissions & Tasks
            const submissions = await prisma.submission.findMany({
              where: { student_id: student.id }
            });
            
            const avatars = [
              'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', // Bilal
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', // Aisha
              'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', // Omar
            ];

            return {
              id: student.id,
              name: student.nama,
              email: student.email,
              avatar: avatars[idx % avatars.length],
              presenceRate,
              tasksPending: Math.max(0, 3 - submissions.length) // Contoh mock sisa tugas
            };
          })
        );

        // Jika kelas masih kosong, masukkan murid mockup agar visual terisi
        if (studentDetails.length === 0 && cls.name.includes('10-A')) {
          studentDetails.push(
            { id: 'mock-s1', name: 'Zaid Khan', email: 'zaid@siswa.sch.id', avatar: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=150', presenceRate: 95, tasksPending: 0 },
            { id: 'mock-s2', name: 'Laila Hassan', email: 'laila@siswa.sch.id', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', presenceRate: 78, tasksPending: 2 }
          );
        }

        // Tentukan apakah Guru saat ini mengajar kelas ini (mengajar salah satu subjeknya)
        const isTaughtByMe = cls.subjects.some(sub => sub.teacher_id === teacher.id);

        // Hitung rata-rata kehadiran kelas
        const classAvgPresence = studentDetails.length > 0
          ? Math.round(studentDetails.reduce((acc, s) => acc + s.presenceRate, 0) / studentDetails.length)
          : 90;

        return {
          id: cls.id,
          name: cls.name,
          description: cls.description || 'Kelas Belajar EduFlow',
          studentsCount: studentDetails.length,
          averagePresence: classAvgPresence,
          isTaughtByMe,
          subjects: cls.subjects.map(s => ({
            id: s.id,
            name: s.name,
            code: s.code,
            teacherName: s.teacher.nama
          })),
          students: studentDetails
        };
      })
    );

    // 4. Hitung global stats
    const totalClasses = classes.length;
    const totalStudents = classesWithDetails.reduce((acc, c) => acc + c.studentsCount, 0);
    const avgAttendance = classesWithDetails.length > 0
      ? Math.round(classesWithDetails.reduce((acc, c) => acc + c.averagePresence, 0) / classesWithDetails.length)
      : 95;

    return NextResponse.json({
      success: true,
      teacherName: teacher.nama,
      teacherId: teacher.id,
      globalStats: {
        totalClasses,
        totalStudents,
        averageAttendance: avgAttendance,
        activeSubjects: classes.reduce((acc, c) => acc + c.subjects.length, 0)
      },
      classes: classesWithDetails
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, className, description, subjectName, subjectCode, classId, teacherId } = body;

    if (action === 'create_class') {
      if (!className) {
        return NextResponse.json(
          { success: false, error: 'Nama Kelas wajib diisi' },
          { status: 400 }
        );
      }

      const newClass = await prisma.class.create({
        data: {
          name: className,
          description: description || ''
        }
      });

      return NextResponse.json({ success: true, class: newClass });
    }

    if (action === 'create_subject') {
      if (!subjectName || !subjectCode || !classId || !teacherId) {
        return NextResponse.json(
          { success: false, error: 'Kolom mapel, kode mapel, kelas, dan guru wajib diisi' },
          { status: 400 }
        );
      }

      const newSubject = await prisma.subject.create({
        data: {
          name: subjectName,
          code: subjectCode,
          class_id: classId,
          teacher_id: teacherId
        }
      });

      return NextResponse.json({ success: true, subject: newSubject });
    }

    return NextResponse.json(
      { success: false, error: 'Aksi tindakan tidak valid' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
