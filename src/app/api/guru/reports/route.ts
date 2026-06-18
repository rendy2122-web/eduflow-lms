import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch student reports with grades summary
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId') || '';
    const studentId = searchParams.get('studentId') || '';

    // Fetch students with their profiles
    const studentsQuery: any = {
      include: {
        profile: {
          select: {
            id: true,
            nisn_or_nip: true
          }
        },
        submissions: {
          include: {
            task: {
              include: {
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
        },
        examAttempts: {
          include: {
            exam: {
              include: {
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
        }
      }
    };

    if (studentId) {
      studentsQuery.where = { id: studentId };
    } else if (classId) {
      // Filter by class through profiles
      studentsQuery.where = {
        profile: {
          class_id: classId
        }
      };
    }

    const students = await prisma.user.findMany(studentsQuery) as any[];

    // Fetch classes for dropdown
    const classes = await prisma.class.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform data to report format
    const reports = students.map(student => {
      // Calculate assignment grades
      const assignmentGrades = student.submissions
        .filter(sub => sub.score !== null)
        .map(sub => ({
          type: 'Tugas',
          subject: sub.task.subject.name,
          subjectCode: sub.task.subject.code,
          title: sub.task.title,
          score: sub.score,
          maxScore: 100,
          date: sub.created_at
        }));

      // Calculate exam grades
      const examGrades = student.examAttempts
        .filter((attempt: any) => attempt.score !== null)
        .map((attempt: any) => ({
          type: 'Ujian',
          subject: attempt.exam.subject.name,
          subjectCode: attempt.exam.subject.code,
          title: attempt.exam.title,
          score: attempt.score,
          maxScore: 100,
          date: attempt.submitted_at || attempt.started_at
        }));

      // Combine all grades
      const allGrades = [...assignmentGrades, ...examGrades];

      // Calculate statistics
      const totalScore = allGrades.reduce((sum, g) => sum + g.score, 0);
      const averageScore = allGrades.length > 0 ? Math.round(totalScore / allGrades.length) : 0;
      const highestScore = allGrades.length > 0 ? Math.max(...allGrades.map(g => g.score)) : 0;
      const lowestScore = allGrades.length > 0 ? Math.min(...allGrades.map(g => g.score)) : 0;

      // Group by subject
      const subjectGrades = allGrades.reduce((acc, grade) => {
        if (!acc[grade.subjectCode]) {
          acc[grade.subjectCode] = {
            subjectName: grade.subject,
            grades: []
          };
        }
        acc[grade.subjectCode].grades.push(grade);
        return acc;
      }, {} as any);

      return {
        student: {
          id: student.id,
          nama: student.nama,
          email: student.email,
          nisn_or_nip: student.profile?.nisn_or_nip || '-'
        },
        statistics: {
          totalGrades: allGrades.length,
          averageScore,
          highestScore,
          lowestScore,
          totalScore
        },
        subjectGrades,
        allGrades: allGrades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      };
    });

    return NextResponse.json({ 
      success: true, 
      reports,
      classes
    });
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}