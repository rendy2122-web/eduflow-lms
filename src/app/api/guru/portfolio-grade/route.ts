import { NextRequest, NextResponse } from 'next/server';
import { gradePortfolio } from '@/lib/homeschoolDb';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { portfolioId, academicScore, teacherFeedback } = await req.json();

    if (!portfolioId || academicScore === undefined) {
      return NextResponse.json({ success: false, error: 'portfolioId and academicScore are required' }, { status: 400 });
    }

    const scoreNum = parseInt(academicScore, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      return NextResponse.json({ success: false, error: 'Nilai harus berupa angka antara 0 hingga 100' }, { status: 400 });
    }

    const success = await gradePortfolio(portfolioId, scoreNum, teacherFeedback || '');
    if (success) {
      // Find default student Bilal
      const student = await prisma.user.findFirst({
        where: { email: 'siswa@sekolah.sch.id' }
      });

      if (student) {
        // Increment Student's RPG XP as reward for successfully evaluated homeschooling work!
        await prisma.profile.update({
          where: { user_id: student.id },
          data: {
            rpg_xp: { increment: 25 }
          }
        });
      }

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Portofolio tidak ditemukan' }, { status: 404 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
