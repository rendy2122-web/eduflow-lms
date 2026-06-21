import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, teacherId } = body;

    if (!classId || !teacherId) {
      return NextResponse.json(
        { success: false, error: 'classId dan teacherId harus diisi' },
        { status: 400 }
      );
    }

    // Verify teacher exists
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: { id: true, role: true }
    });

    if (!teacher || teacher.role !== 'guru') {
      return NextResponse.json(
        { success: false, error: 'Guru tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update Class model directly with homeroom_teacher_id
    await prisma.class.update({
      where: { id: classId },
      data: { homeroom_teacher_id: teacherId }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Wali kelas berhasil ditugaskan'
    });
  } catch (error) {
    console.error('Error assigning homeroom teacher:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menugaskan wali kelas' },
      { status: 500 }
    );
  }
}