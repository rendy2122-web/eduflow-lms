import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth(['guru', 'admin']);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const currentTeacherId = auth.user.id;
    const currentTeacherName = auth.user.nama;

    // 1. Get subjects taught by this teacher to find classes taught
    const teacherSubjects = await prisma.subject.findMany({
      where: { teacher_id: currentTeacherId },
      select: { class_id: true }
    });
    
    const taughtClassIds = teacherSubjects.map(s => s.class_id);

    // 2. Also check if the teacher is a homeroom teacher (wali kelas) of any class
    const homeroomClasses = await prisma.class.findMany({
      where: { homeroom_teacher_id: currentTeacherId },
      select: { id: true }
    });
    
    const homeroomClassIds = homeroomClasses.map(c => c.id);

    // Union of all class IDs this teacher interacts with
    const allClassIds = Array.from(new Set([...taughtClassIds, ...homeroomClassIds]));

    // Query classes
    const classes = await prisma.class.findMany({
      where: {
        id: { in: allClassIds }
      },
      include: {
        subjects: {
          select: {
            id: true,
            name: true,
            code: true,
            teacher_id: true,
            teacher: {
              select: {
                nama: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    let totalStudentsCount = 0;

    const formattedClasses = await Promise.all(classes.map(async (cls) => {
      // Get students in this class
      const students = await prisma.profile.findMany({
        where: {
          class_id: cls.id,
          user: {
            role: 'siswa'
          }
        },
        include: {
          user: {
            select: {
              id: true,
              nama: true,
              email: true
            }
          }
        }
      });

      totalStudentsCount += students.length;

      const studentItems = students.map(s => ({
        id: s.user.id,
        name: s.user.nama,
        email: s.user.email,
        avatar: s.avatar_url || '',
        presenceRate: 100 - (s.rpg_level % 3) * 5, // Mock dynamic presence rate based on student profile data
        tasksPending: s.rpg_level % 2 === 0 ? 1 : 0 // Mock dynamic task stats
      }));

      const isHomeroom = cls.homeroom_teacher_id === currentTeacherId;

      return {
        id: cls.id,
        name: cls.name,
        description: cls.description || '',
        studentsCount: studentItems.length,
        averagePresence: studentItems.length > 0 ? Math.round(studentItems.reduce((acc, curr) => acc + curr.presenceRate, 0) / studentItems.length) : 100,
        isTaughtByMe: taughtClassIds.includes(cls.id),
        isHomeroom,
        subjects: cls.subjects.map(s => ({
          id: s.id,
          name: s.name,
          code: s.code,
          teacherName: s.teacher?.nama || 'Guru Mata Pelajaran'
        })),
        students: studentItems
      };
    }));

    // Calculate global stats
    const globalStats = {
      totalClasses: formattedClasses.length,
      totalStudents: totalStudentsCount,
      averageAttendance: formattedClasses.length > 0 
        ? Math.round(formattedClasses.reduce((acc, curr) => acc + curr.averagePresence, 0) / formattedClasses.length)
        : 100,
      activeSubjects: teacherSubjects.length
    };

    return NextResponse.json({
      success: true,
      classes: formattedClasses,
      globalStats,
      teacherName: currentTeacherName,
      teacherId: currentTeacherId
    });
  } catch (error: any) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data kelas: ' + error.message },
      { status: 500 }
    );
  }
}