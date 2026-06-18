import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch assignments with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId') || '';
    const search = searchParams.get('search') || '';

    const whereClause: any = {};
    
    if (subjectId) {
      whereClause.subject_id = subjectId;
    }

    if (search.trim()) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const assignments = await prisma.task.findMany({
      where: whereClause,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            class: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        submissions: {
          include: {
            student: {
              select: {
                id: true,
                nama: true,
                email: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        },
        _count: {
          select: {
            submissions: true
          }
        }
      },
      orderBy: {
        deadline: 'desc'
      }
    });

    // Also fetch subjects for dropdown
    const subjects = await prisma.subject.findMany({
      include: {
        class: {
          select: {
            id: true,
            name: true
          }
        },
        teacher: {
          select: {
            id: true,
            nama: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ 
      success: true, 
      assignments,
      subjects
    });
  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create new assignment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subjectId, title, description, deadline } = body;

    if (!subjectId || !title || !deadline) {
      return NextResponse.json(
        { success: false, error: 'Mata Pelajaran, Judul, dan Deadline wajib diisi' },
        { status: 400 }
      );
    }

    // Verify subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId }
    });

    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Mata pelajaran tidak ditemukan' },
        { status: 404 }
      );
    }

    // Create assignment
    const newAssignment = await prisma.task.create({
      data: {
        subject_id: subjectId,
        title,
        description: description || '',
        deadline: new Date(deadline)
      },
      include: {
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
      assignment: newAssignment 
    });
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update assignment
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, subjectId, title, description, deadline } = body;

    if (!id || !title || !deadline) {
      return NextResponse.json(
        { success: false, error: 'ID, Judul, dan Deadline wajib diisi' },
        { status: 400 }
      );
    }

    // Verify assignment exists
    const existingAssignment = await prisma.task.findUnique({
      where: { id }
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Tugas tidak ditemukan' },
        { status: 404 }
      );
    }

    const updatedAssignment = await prisma.task.update({
      where: { id },
      data: {
        subject_id: subjectId || existingAssignment.subject_id,
        title,
        description: description || '',
        deadline: new Date(deadline)
      },
      include: {
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
      assignment: updatedAssignment 
    });
  } catch (error: any) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove assignment
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID tugas wajib diisi' },
        { status: 400 }
      );
    }

    // Check if assignment has submissions
    const assignmentWithSubmissions = await prisma.task.findUnique({
      where: { id },
      include: {
        submissions: {
          select: { id: true }
        }
      }
    });

    if (assignmentWithSubmissions && assignmentWithSubmissions.submissions.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Tugas ini memiliki ${assignmentWithSubmissions.submissions.length} pengumpulan. Hapus pengumpulan terlebih dahulu.` 
        },
        { status: 400 }
      );
    }

    await prisma.task.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}