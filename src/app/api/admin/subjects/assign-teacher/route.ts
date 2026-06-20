import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subjectId, teacherId } = body;

    if (!subjectId || !teacherId) {
      return NextResponse.json(
        { success: false, error: 'subjectId dan teacherId harus diisi' },
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

    // Update subject with new teacher
    await prisma.subject.update({
      where: { id: subjectId },
      data: { teacher_id: teacherId }
    });

    return NextResponse.json({
      success: true,
      message: 'Guru berhasil ditugaskan'
    });
  } catch (error) {
    console.error('Error assigning teacher:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menugaskan guru' },
      { status: 500 }
    );
  }
}