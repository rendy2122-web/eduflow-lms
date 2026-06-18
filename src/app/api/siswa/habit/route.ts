import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch habit logs for the student
// Query params:
// - date: 'YYYY-MM-DD' (optional)
// - email: (optional, defaults to mock student email)
// - range: 'weekly' (optional, returns logs for the last 7 days)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date') || '';
    const email = searchParams.get('email') || 'siswa@sekolah.sch.id';
    const range = searchParams.get('range') || '';

    // Find student
    const student = await prisma.user.findUnique({
      where: { email }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    // 1. Weekly range view
    if (range === 'weekly') {
      // Generate last 7 dates (today and 6 days before)
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
          student_id: student.id,
          date: { in: dates }
        }
      });

      // Map logs to guarantee every date has an entry
      const weeklyLogs = dates.map((d) => {
        const existing = logs.find((l) => l.date === d);
        if (existing) return existing;
        
        // Return default stub
        return {
          id: `stub-${d}`,
          student_id: student.id,
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
          student_id: student.id,
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
      }
    });
  } catch (error: any) {
    console.error('Error fetching habit logs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Save/update student habit log
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, date, subuh, dzuhur, ashar, maghrib, isya, duha, tahajjud, tadarrus, birrul_walidain, belajar } = body;

    if (!date) {
      return NextResponse.json({ success: false, error: 'Tanggal wajib diisi' }, { status: 400 });
    }

    const studentEmail = email || 'siswa@sekolah.sch.id';
    const student = await prisma.user.findUnique({
      where: { email: studentEmail }
    });

    if (!student) {
      return NextResponse.json({ success: false, error: 'Siswa tidak ditemukan' }, { status: 404 });
    }

    // If student updates their log, we reset verified status to false so the parent has to verify again.
    const log = await prisma.habitLog.upsert({
      where: {
        student_id_date: {
          student_id: student.id,
          date
        }
      },
      update: {
        subuh: subuh || 'lewat',
        dzuhur: dzuhur || 'lewat',
        ashar: ashar || 'lewat',
        maghrib: maghrib || 'lewat',
        isya: isya || 'lewat',
        duha: !!duha,
        tahajjud: !!tahajjud,
        tadarrus: !!tadarrus,
        birrul_walidain: !!birrul_walidain,
        belajar: !!belajar,
        verified: false // Reset parent verification on change!
      },
      create: {
        student_id: student.id,
        date,
        subuh: subuh || 'lewat',
        dzuhur: dzuhur || 'lewat',
        ashar: ashar || 'lewat',
        maghrib: maghrib || 'lewat',
        isya: isya || 'lewat',
        duha: !!duha,
        tahajjud: !!tahajjud,
        tadarrus: !!tadarrus,
        birrul_walidain: !!birrul_walidain,
        belajar: !!belajar,
        verified: false
      }
    });

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error('Error saving habit log:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
