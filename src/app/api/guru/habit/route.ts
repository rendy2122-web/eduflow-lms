import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch student list for a class and their habit log for a target date
// Query params:
// - classId: 'all' or specific class UUID (optional, defaults to first class if not specified)
// - date: 'YYYY-MM-DD' (optional, defaults to today)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId') || '';
    const dateParam = searchParams.get('date') || '';
    const targetDate = dateParam || new Date().toISOString().split('T')[0];

    // 1. Fetch all classes for filter dropdown
    const classes = await prisma.class.findMany({
      orderBy: { name: 'asc' }
    });

    // Determine target class
    let activeClassId = classId;
    if (!activeClassId && classes.length > 0) {
      activeClassId = classes[0].id;
    }

    // 2. Fetch students based on class selection
    let students = [];
    if (activeClassId && activeClassId !== 'all') {
      students = await prisma.user.findMany({
        where: {
          role: 'siswa',
          profile: {
            class_id: activeClassId
          }
        },
        include: {
          profile: true
        },
        orderBy: { nama: 'asc' }
      });
    } else {
      students = await prisma.user.findMany({
        where: { role: 'siswa' },
        include: {
          profile: true
        },
        orderBy: { nama: 'asc' }
      });
    }

    // 3. Fetch habit logs for these students on target date
    const studentIds = students.map((s) => s.id);
    const logs = await prisma.habitLog.findMany({
      where: {
        student_id: { in: studentIds },
        date: targetDate
      }
    });

    // 4. Merge logs with student list, returning default stubs for empty entries
    const formattedRoster = students.map((student) => {
      const existingLog = logs.find((l) => l.student_id === student.id);
      
      const log = existingLog || {
        id: `stub-${student.id}-${targetDate}`,
        student_id: student.id,
        date: targetDate,
        subuh: 'lewat',
        dzuhur: 'lewat',
        ashar: 'lewat',
        maghrib: 'lewat',
        isya: 'lewat',
        duha: false,
        tahajjud: false,
        tadarrus: false,
        birrul_walidain: false,
        belajar: false,
        verified: false
      };

      return {
        id: student.id,
        name: student.nama,
        email: student.email,
        nisn: student.profile?.nisn_or_nip || '-',
        className: student.profile?.class_id 
          ? classes.find((c) => c.id === student.profile?.class_id)?.name || '-' 
          : '-',
        log
      };
    });

    return NextResponse.json({
      success: true,
      classes,
      activeClassId,
      date: targetDate,
      roster: formattedRoster
    });
  } catch (error: any) {
    console.error('Error fetching teacher habit roster:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
