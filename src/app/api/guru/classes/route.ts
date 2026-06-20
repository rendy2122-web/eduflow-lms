import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teacherId = searchParams.get('teacherId');

    let where: any = {};
    
    if (teacherId) {
      // Get classes where this teacher teaches at least one subject
      const teacherSubjects = await prisma.subject.findMany({
        where: { teacher_id: teacherId },
        select: { class_id: true }
      });
      
      const classIds = Array.from(new Set(teacherSubjects.map(s => s.class_id)));
      where.id = { in: classIds };
    }

    const classes = await prisma.class.findMany({
      where,
      include: {
        subjects: {
          select: {
            id: true,
            name: true,
            code: true,
            teacher_id: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

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
              email: true,
              avatar_url: true
            }
          }
        }
      });

      const studentItems = students.map(s => ({
        id: s.user.id,
        name: s.user.nama,
        email: s.user.email,
        avatar: s.user.avatar_url || '',
        presenceRate: 0,
        tasksPending: 0
      }));

      return {
        id: cls.id,
        name: cls.name,
        description: cls.description,
        studentsCount: studentItems.length,
        averagePresence: 0,
        isTaughtByMe: true,
        subjects: cls.subjects.map(s => ({
          id: s.id,
          name: s.name,
          code: s.code,
          teacherName: ''
        })),
        students: studentItems
      };
    }));

    return NextResponse.json({
      success: true,
      classes: formattedClasses
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data kelas' },
      { status: 500 }
    );
  }
}