import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch habit log for a specific student and date (or last 7 days if range=weekly)
// Query params:
// - studentId: (required)
// - date: 'YYYY-MM-DD' (optional, defaults to today)
// - range: 'weekly' (optional, returns logs for the last 7 days)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const dateParam = searchParams.get('date') || '';
    const range = searchParams.get('range') || '';

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID wajib diisi' },
        { status: 400 }
      );
    }

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    // 1. Weekly range view
    if (range === 'weekly') {
      const dates: string[] = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
      }

      // Fetch existing logs
      const logs = await prisma.habitLog.findMany({
        where: {
          student_id: studentId,
          date: { in: dates }
        }
      });

      // Map logs to guarantee every date has an entry
      const weeklyLogs = dates.map((d) => {
        const existing = logs.find((l) => l.date === d);
        if (existing) return existing;
        
        return {
          id: `stub-${d}`,
          student_id: studentId,
          date: d,
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
      });

      return NextResponse.json({ success: true, logs: weeklyLogs });
    }

    // 2. Specific date view
    const targetDate = dateParam || new Date().toISOString().split('T')[0];
    const log = await prisma.habitLog.findUnique({
      where: {
        student_id_date: {
          student_id: studentId,
          date: targetDate
        }
      }
    });

    if (log) {
      return NextResponse.json({ success: true, log });
    }

    // Return default stub
    return NextResponse.json({
      success: true,
      log: {
        id: `stub-${targetDate}`,
        student_id: studentId,
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
      }
    });
  } catch (error: any) {
    console.error('Error fetching parent-child habit logs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Verify a student's habit log (parent action)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, date, verified } = body;

    if (!studentId || !date) {
      return NextResponse.json(
        { success: false, error: 'Student ID dan Tanggal wajib diisi' },
        { status: 400 }
      );
    }

    // Upsert verification status
    const log = await prisma.habitLog.upsert({
      where: {
        student_id_date: {
          student_id: studentId,
          date
        }
      },
      update: {
        verified: !!verified
      },
      create: {
        student_id: studentId,
        date,
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
        verified: !!verified
      }
    });

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error('Error verifying child habit log:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
