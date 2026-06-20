import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teacherId = searchParams.get('teacherId');
    const classId = searchParams.get('classId');

    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: 'teacherId harus diisi' },
        { status: 400 }
      );
    }

    const where: any = { teacher_id: teacherId };
    if (classId) {
      where.class_id = classId;
    }

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const formattedSubjects = subjects.map(s => ({
      id: s.id,
      name: s.name,
      code: s.code,
      classId: s.class_id,
      className: s.class.name
    }));

    return NextResponse.json({
      success: true,
      subjects: formattedSubjects
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data mata pelajaran' },
      { status: 500 }
    );
  }
}