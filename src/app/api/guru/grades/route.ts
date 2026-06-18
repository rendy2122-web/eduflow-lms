import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch grades with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId') || '';
    const studentId = searchParams.get('studentId') || '';
    const type = searchParams.get('type') || ''; // 'assignment' | 'exam' | 'all'

    // Fetch assignments with submissions (grades)
    const assignments = await prisma.task.findMany({
      where: subjectId ? { subject_id: subjectId } : undefined,
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
          where: studentId ? { student_id: studentId } : undefined,
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
        }
      },
      orderBy: {
        deadline: 'desc'
      }
    });

    // Fetch exams with attempts (grades)
    const exams = await prisma.exam.findMany({
      where: subjectId ? { subject_id: subjectId } : undefined,
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
        attempts: {
          where: studentId ? { student_id: studentId } : undefined,
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
            submitted_at: 'desc'
          }
        }
      },
      orderBy: {
        deadline: 'desc'
      }
    });

    // Fetch subjects for dropdown
    const subjects = await prisma.subject.findMany({
      include: {
        class: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Fetch students for dropdown
    const students = await prisma.user.findMany({
      where: {
        profile: {
          isNot: null
        }
      },
      include: {
        profile: {
          select: {
            id: true,
            nisn_or_nip: true
          }
        }
      },
      orderBy: {
        nama: 'asc'
      }
    });

    // Transform assignments to grades format
    const assignmentGrades = assignments.flatMap(task => 
      task.submissions
        .filter(sub => sub.score !== null)
        .map(sub => ({
          id: sub.id,
          type: 'assignment',
          title: task.title,
          subject: task.subject,
          student: sub.student,
          score: sub.score,
          maxScore: 100,
          date: sub.created_at,
          gradedAt: sub.graded_at
        }))
    );

    // Transform exams to grades format
    const examGrades = exams.flatMap(exam => 
      exam.attempts
        .filter(attempt => attempt.score !== null)
        .map(attempt => ({
          id: attempt.id,
          type: 'exam',
          title: exam.title,
          subject: exam.subject,
          student: attempt.student,
          score: attempt.score,
          maxScore: 100,
          date: attempt.submitted_at || attempt.started_at,
          gradedAt: attempt.submitted_at
        }))
    );

    // Combine and sort by date
    const allGrades = [...assignmentGrades, ...examGrades].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Filter by type if specified
    const filteredGrades = type ? allGrades.filter(g => g.type === type) : allGrades;

    return NextResponse.json({ 
      success: true, 
      grades: filteredGrades,
      subjects,
      students
    });
  } catch (error: any) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Grade assignment submission
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { submissionId, score } = body;

    if (!submissionId || score === undefined) {
      return NextResponse.json(
        { success: false, error: 'Submission ID dan nilai wajib diisi' },
        { status: 400 }
      );
    }

    if (score < 0 || score > 100) {
      return NextResponse.json(
        { success: false, error: 'Nilai harus antara 0-100' },
        { status: 400 }
      );
    }

    // Update submission score
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        score: score,
        graded_at: new Date()
      },
      include: {
        student: {
          select: {
            id: true,
            nama: true
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            subject: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      submission: updatedSubmission 
    });
  } catch (error: any) {
    console.error('Error grading submission:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}