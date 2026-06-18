import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') || searchParams.get('student_id');
    const category = searchParams.get('category');
    const dateFrom = searchParams.get('date_from') || searchParams.get('dateFrom');
    const dateTo = searchParams.get('date_to') || searchParams.get('dateTo');

    // Build filter where clause
    const where: any = {};

    if (studentId) {
      where.student_id = studentId;
    }

    if (category && ['ziyadah', 'sabqi', 'manzil', 'murajaah'].includes(category)) {
      where.category = category;
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    // Retrieve records
    const records = await prisma.tahfidzRecord.findMany({
      where,
      include: {
        student: {
          include: {
            profile: {
              include: {
                class: true
              }
            }
          }
        },
        teacher: true
      },
      orderBy: { date: 'desc' }
    });

    // Format output
    const formattedRecords = records.map((r) => {
      // Calculate progress percentage based on total surah ayats
      const totalAyats: Record<string, number> = {
        'Al-Baqarah': 286,
        'Yasin': 83,
        'Al-Kahfi': 110,
        'Al-Mulk': 30,
        'An-Naba': 40,
        'An-Nazi\'at': 46,
        'Al-Waqi\'ah': 96
      };
      
      const maxAyah = totalAyats[r.surah_name] || 50;
      const progressPercent = Math.min(100, Math.round((r.end_ayat / maxAyah) * 100));

      return {
        id: r.id,
        studentId: r.student_id,
        studentName: r.student.nama,
        className: r.student.profile?.class?.name || 'Belum Masuk Kelas',
        teacherName: r.teacher.nama,
        date: r.date,
        surahName: r.surah_name,
        startAyat: r.start_ayat,
        endAyat: r.end_ayat,
        category: r.category,
        status: r.status,
        notes: r.notes || '',
        progress: progressPercent
      };
    });

    // Calculate statistics
    const todayStr = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD
    const todayRecords = records.filter(r => r.date === todayStr);

    const totalToday = todayRecords.length;
    const ziyadahToday = todayRecords.filter(r => r.category === 'ziyadah').length;
    const lancarToday = todayRecords.filter(r => r.status === 'lancar').length;
    const lancarPercent = totalToday > 0 ? Math.round((lancarToday / totalToday) * 100) : 0;

    // Calculate students who have NOT deposited today
    const allStudents = await prisma.user.findMany({
      where: { role: 'siswa' }
    });
    const depositedStudentIds = new Set(todayRecords.map(r => r.student_id));
    const notDepositedCount = allStudents.filter(s => !depositedStudentIds.has(s.id)).length;

    const stats = {
      totalToday,
      ziyadahToday,
      lancarPercent,
      notDepositedCount
    };

    return NextResponse.json({ success: true, records: formattedRecords, stats });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Menambahkan catatan setoran Tahfidz baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, surahName, startAyat, endAyat, category, status, notes } = body;

    if (!studentId || !surahName || !startAyat || !endAyat || !status || !category) {
      return NextResponse.json(
        { success: false, error: 'studentId, surahName, startAyat, endAyat, category, dan status wajib diisi' },
        { status: 400 }
      );
    }

    if (!['ziyadah', 'sabqi', 'manzil', 'murajaah'].includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Kategori setoran tidak valid' },
        { status: 400 }
      );
    }

    // Cari guru pertama sebagai penyimak
    const teacher = await prisma.user.findFirst({
      where: { role: 'guru' }
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'User guru tidak ditemukan' },
        { status: 500 }
      );
    }

    const record = await prisma.tahfidzRecord.create({
      data: {
        student_id: studentId,
        teacher_id: teacher.id,
        date: new Date().toLocaleDateString('sv-SE'), // YYYY-MM-DD
        surah_name: surahName,
        start_ayat: parseInt(startAyat, 10),
        end_ayat: parseInt(endAyat, 10),
        category,
        status,
        notes: notes || ''
      }
    });

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Menghapus rekor setoran Tahfidz berdasarkan ID
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID setoran wajib diisi' },
        { status: 400 }
      );
    }

    await prisma.tahfidzRecord.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
