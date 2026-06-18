import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch exams
// Query params:
// - role: 'guru' | 'siswa'
// - email: (optional, to identify which guru/siswa if dynamic, defaults to mock if not found)
// - examId: (optional, to fetch specific exam details with questions)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || 'guru';
    const email = searchParams.get('email') || '';
    const examId = searchParams.get('examId') || '';

    // 1. Fetch details of a specific exam (with questions)
    if (examId) {
      const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: {
          questions: true,
          subject: {
            include: {
              class: true
            }
          }
        }
      });

      if (!exam) {
        return NextResponse.json(
          { success: false, error: 'Ujian tidak ditemukan' },
          { status: 404 }
        );
      }

      // Check if student has already completed this exam
      let hasCompleted = false;
      let score = null;
      if (role === 'siswa' && email) {
        const student = await prisma.user.findUnique({ where: { email } });
        if (student) {
          const attempt = await prisma.examAttempt.findFirst({
            where: { exam_id: examId, student_id: student.id }
          });
          if (attempt && attempt.submitted_at) {
            hasCompleted = true;
            score = attempt.score;
          }
        }
      }

      const formattedQuestions = exam.questions.map((q) => {
        let optionsArray = [];
        try {
          optionsArray = JSON.parse(q.options);
        } catch (e) {
          optionsArray = [q.options];
        }
        return {
          id: q.id,
          question_text: q.question_text,
          options: optionsArray,
          correct_option: q.correct_option
        };
      });

      return NextResponse.json({
        success: true,
        exam: {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          duration: exam.duration,
          deadline: exam.deadline,
          subjectName: exam.subject.name,
          className: exam.subject.class.name,
          questions: role === 'siswa' && hasCompleted ? [] : formattedQuestions, // Hide questions if already finished
          hasCompleted,
          score
        }
      });
    }

    // 2. Fetch exams list for GURU
    if (role === 'guru') {
      // Find the teacher user
      const teacherEmail = email || 'guru@sekolah.sch.id';
      const teacher = await prisma.user.findUnique({
        where: { email: teacherEmail }
      });

      if (!teacher) {
        return NextResponse.json(
          { success: false, error: 'Data guru tidak ditemukan' },
          { status: 404 }
        );
      }

      // Fetch exams under subjects taught by this teacher
      const exams = await prisma.exam.findMany({
        where: {
          subject: {
            teacher_id: teacher.id
          }
        },
        include: {
          questions: true,
          attempts: {
            include: {
              student: true
            }
          },
          subject: {
            include: {
              class: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      const formattedExams = exams.map((exam) => {
        // Rekap pengerjaan siswa
        const completedAttempts = exam.attempts.filter(a => a.submitted_at !== null);
        const studentScores = completedAttempts.map((a) => ({
          studentName: a.student.nama,
          studentEmail: a.student.email,
          score: a.score,
          submittedAt: a.submitted_at
        }));

        return {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          duration: exam.duration,
          deadline: exam.deadline,
          subjectId: exam.subject_id,
          subjectName: exam.subject.name,
          className: exam.subject.class.name,
          totalQuestions: exam.questions.length,
          totalSubmitted: completedAttempts.length,
          attempts: studentScores
        };
      });

      // Fetch teacher's subjects for the dropdown in form creation
      const subjects = await prisma.subject.findMany({
        where: { teacher_id: teacher.id },
        include: { class: true }
      });

      return NextResponse.json({
        success: true,
        exams: formattedExams,
        subjects: subjects.map(s => ({
          id: s.id,
          name: `${s.name} - ${s.class.name}`
        }))
      });
    }

    // 3. Fetch exams list for SISWA
    if (role === 'siswa') {
      const studentEmail = email || 'siswa@sekolah.sch.id';
      const student = await prisma.user.findUnique({
        where: { email: studentEmail },
        include: {
          profile: true
        }
      });

      if (!student || !student.profile || !student.profile.class_id) {
        return NextResponse.json(
          { success: false, error: 'Data siswa atau kelas belum terdaftar' },
          { status: 404 }
        );
      }

      const classId = student.profile.class_id;

      // Get subjects for this class
      const classSubjects = await prisma.subject.findMany({
        where: { class_id: classId }
      });
      const subjectIds = classSubjects.map(s => s.id);

      // Get all exams for these subjects
      const exams = await prisma.exam.findMany({
        where: {
          subject_id: { in: subjectIds }
        },
        include: {
          questions: true,
          attempts: {
            where: { student_id: student.id }
          },
          subject: true
        },
        orderBy: { deadline: 'asc' }
      });

      const formattedExams = exams.map((exam) => {
        const studentAttempt = exam.attempts[0];
        
        return {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          duration: exam.duration,
          deadline: exam.deadline,
          subjectName: exam.subject.name,
          totalQuestions: exam.questions.length,
          status: studentAttempt && studentAttempt.submitted_at ? 'sudah_kirim' : 'belum_kirim',
          score: studentAttempt ? studentAttempt.score : null
        };
      });

      return NextResponse.json({
        success: true,
        exams: formattedExams
      });
    }

    return NextResponse.json({ success: false, error: 'Role tidak didukung' }, { status: 400 });
  } catch (error: any) {
    console.error('Error fetching exams:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create a new exam
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subjectId, title, description, duration, deadline, questions } = body;

    if (!subjectId || !title || !duration || !deadline || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { success: false, error: 'Data ujian dan pertanyaan wajib diisi lengkap' },
        { status: 400 }
      );
    }

    // Create Exam and its Questions in a transaction
    const newExam = await prisma.$transaction(async (tx) => {
      const exam = await tx.exam.create({
        data: {
          subject_id: subjectId,
          title,
          description: description || '',
          duration: parseInt(duration),
          deadline: new Date(deadline)
        }
      });

      for (const q of questions) {
        await tx.examQuestion.create({
          data: {
            exam_id: exam.id,
            question_text: q.question_text,
            options: JSON.stringify(q.options),
            correct_option: q.correct_option
          }
        });
      }

      return exam;
    });

    return NextResponse.json({ success: true, exam: newExam });
  } catch (error: any) {
    console.error('Error creating exam:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove an exam
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID ujian wajib disertakan' }, { status: 400 });
    }

    await prisma.exam.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting exam:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
