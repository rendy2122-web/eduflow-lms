import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Find the logged-in student (using fallback for robustness)
    const student = await prisma.user.findFirst({
      where: { email: 'siswa@sekolah.sch.id' },
      include: {
        profile: {
          include: {
            class: true,
          },
        },
      },
    }) || await prisma.user.findFirst({
      where: { role: 'siswa' },
      include: {
        profile: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!student || !student.profile || !student.profile.class) {
      // Fallback if class info is missing
      const classes = await prisma.onlineClass.findMany({
        orderBy: {
          date: 'asc',
        },
      });
      return NextResponse.json({
        success: true,
        classes,
      });
    }

    const className = student.profile.class.name;

    // 2. Fetch classes scheduled for this student's class name
    const classes = await prisma.onlineClass.findMany({
      where: {
        class_name: className,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      classes,
    });
  } catch (error: any) {
    console.error('Error fetching student online classes:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
