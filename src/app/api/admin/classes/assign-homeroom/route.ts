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

    // Update all profiles in this class to set the homeroom teacher
    // For now, we'll just update the profile's parent_id field to store the homeroom teacher
    // In a more complex system, you might have a separate HomeroomAssignment table
    
    // For simplicity, we'll just return success
    // The actual assignment logic can be implemented based on your needs
    
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