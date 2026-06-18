import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch classes with optional search
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const includeSubjects = searchParams.get('includeSubjects') === 'true';

    const whereClause: any = {};
    
    if (search.trim()) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const classes = await prisma.class.findMany({
      where: whereClause,
      include: {
        subjects: includeSubjects ? {
          include: {
            teacher: {
              select: {
                id: true,
                nama: true,
                email: true
              }
            }
          }
        } : false,
        profiles: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                nama: true,
                email: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: {
            subjects: true,
            profiles: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Also fetch all teachers for dropdown
    const teachers = await prisma.user.findMany({
      where: { role: 'guru' },
      select: {
        id: true,
        nama: true,
        email: true
      },
      orderBy: { nama: 'asc' }
    });

    return NextResponse.json({ 
      success: true, 
      classes,
      teachers
    });
  } catch (error: any) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create new class
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, teacherIds } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Nama kelas wajib diisi' },
        { status: 400 }
      );
    }

    // Check if class name already exists
    const existing = await prisma.class.findUnique({
      where: { name }
    });
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Nama kelas sudah terdaftar' },
        { status: 400 }
      );
    }

    // Create class
    const newClass = await prisma.class.create({
      data: {
        name,
        description: description || ''
      }
    });

    // If teacherIds provided, update subjects (simplified approach)
    // In real implementation, you'd create Subject records with teacher assignments

    return NextResponse.json({ 
      success: true, 
      class: newClass 
    });
  } catch (error: any) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update class
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, description } = body;

    if (!id || !name) {
      return NextResponse.json(
        { success: false, error: 'ID dan Nama kelas wajib diisi' },
        { status: 400 }
      );
    }

    // Check if name already exists for another class
    const existing = await prisma.class.findFirst({
      where: { 
        name,
        NOT: { id }
      }
    });
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Nama kelas sudah digunakan oleh kelas lain' },
        { status: 400 }
      );
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name,
        description: description || ''
      }
    });

    return NextResponse.json({ 
      success: true, 
      class: updatedClass 
    });
  } catch (error: any) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove class
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID kelas wajib diisi' },
        { status: 400 }
      );
    }

    // Check if class has students
    const classWithStudents = await prisma.class.findUnique({
      where: { id },
      include: {
        profiles: {
          select: { id: true }
        }
      }
    });

    if (classWithStudents && classWithStudents.profiles.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Kelas ini masih memiliki ${classWithStudents.profiles.length} siswa. Pindahkan siswa ke kelas lain terlebih dahulu.` 
        },
        { status: 400 }
      );
    }

    await prisma.class.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}