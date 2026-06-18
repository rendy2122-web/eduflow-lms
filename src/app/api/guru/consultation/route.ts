import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'studentId wajib disertakan' },
        { status: 400 }
      );
    }

    const logs = await prisma.communicationLog.findMany({
      where: { student_id: studentId },
      orderBy: { created_at: 'asc' }
    });

    // Seeding default mock messages if log is empty for premium display
    if (logs.length === 0) {
      const mockLogs = [
        {
          id: 'mock-c1',
          student_id: studentId,
          sender_role: 'guru',
          sender_name: 'Sarah Jenkins, S.Pd',
          message: 'Assalamu alaikum wr. wb. Bapak/Ibu, hari ini Bilal menyetorkan hafalan Surah Al-Mulk dengan sangat lancar. Tajwidnya mumtaz, mohon dibantu diulang di rumah agar tetap terjaga.',
          date: '2026-06-10',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'mock-c2',
          student_id: studentId,
          sender_role: 'orang_tua',
          sender_name: 'Pak Andi (Wali Bilal)',
          message: 'Wa alaikumussalam wr. wb. Alhamdulillah, terima kasih banyak Ibu Sarah atas bimbingannya. Insya Allah malam ini kami dampingi untuk murajaah kembali di rumah.',
          date: '2026-06-11',
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        }
      ];
      return NextResponse.json({ success: true, logs: mockLogs });
    }

    return NextResponse.json({ success: true, logs });
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
    const { studentId, senderRole, senderName, message } = body;

    if (!studentId || !senderRole || !senderName || !message) {
      return NextResponse.json(
        { success: false, error: 'Kolom studentId, senderRole, senderName, dan message wajib diisi' },
        { status: 400 }
      );
    }

    const newLog = await prisma.communicationLog.create({
      data: {
        student_id: studentId,
        sender_role: senderRole,
        sender_name: senderName,
        message,
        date: new Date().toISOString().split('T')[0]
      }
    });

    return NextResponse.json({ success: true, log: newLog });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
