import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Ambil semua jadwal mengajar guru
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teacherId = searchParams.get('teacherId');
    const dayOfWeek = searchParams.get('dayOfWeek');

    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: 'teacherId harus diisi' },
        { status: 400 }
      );
    }

    const where: any = { teacher_id: teacherId };
    if (dayOfWeek) {
      where.day_of_week = dayOfWeek;
    }

    const schedules = await prisma.teachingSchedule.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: [
        { day_of_week: 'asc' },
        { start_time: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      schedules
    });
  } catch (error) {
    console.error('Error fetching teaching schedules:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data jadwal' },
      { status: 500 }
    );
  }
}

// POST - Tambah jadwal baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teacher_id, class_id, subject_id, day_of_week, start_time, end_time, room } = body;

    if (!teacher_id || !class_id || !subject_id || !day_of_week || !start_time || !end_time) {
      return NextResponse.json(
        { success: false, error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    // Validasi waktu
    if (start_time >= end_time) {
      return NextResponse.json(
        { success: false, error: 'Waktu mulai harus sebelum waktu selesai' },
        { status: 400 }
      );
    }

    const schedule = await prisma.teachingSchedule.create({
      data: {
        teacher_id,
        class_id,
        subject_id,
        day_of_week: day_of_week.toUpperCase(),
        start_time,
        end_time,
        room
      },
      include: {
        class: {
          select: {
            id: true,
            name: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: schedule
    });
  } catch (error: any) {
    console.error('Error creating teaching schedule:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Jadwal ini sudah ada' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan jadwal' },
      { status: 500 }
    );
  }
}

// PUT - Edit jadwal
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, class_id, subject_id, day_of_week, start_time, end_time, room } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID jadwal harus diisi' },
        { status: 400 }
      );
    }

    // Validasi waktu
    if (start_time >= end_time) {
      return NextResponse.json(
        { success: false, error: 'Waktu mulai harus sebelum waktu selesai' },
        { status: 400 }
      );
    }

    const schedule = await prisma.teachingSchedule.update({
      where: { id },
      data: {
        class_id,
        subject_id,
        day_of_week: day_of_week.toUpperCase(),
        start_time,
        end_time,
        room
      },
      include: {
        class: {
          select: {
            id: true,
            name: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: schedule
    });
  } catch (error: any) {
    console.error('Error updating teaching schedule:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Jadwal tidak ditemukan' },
        { status: 404 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Jadwal ini sudah ada' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate jadwal' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus jadwal
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID jadwal harus diisi' },
        { status: 400 }
      );
    }

    await prisma.teachingSchedule.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Jadwal berhasil dihapus'
    });
  } catch (error: any) {
    console.error('Error deleting teaching schedule:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Jadwal tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Gagal menghapus jadwal' },
      { status: 500 }
    );
  }
}