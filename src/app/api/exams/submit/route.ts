import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { examId, email, answers } = body; // answers is a JSON object like {"questionId": "A", "questionId2": "D"}

    if (!examId || !answers) {
      return NextResponse.json(
        { success: false, error: 'Data pengerjaan tidak lengkap' },
        { status: 400 }
      );
    }

    // Find the student user
    const studentEmail = email || 'siswa@sekolah.sch.id';
    const student = await prisma.user.findUnique({
      where: { email: studentEmail }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Data siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    // Fetch questions to grade
    const questions = await prisma.examQuestion.findMany({
      where: { exam_id: examId }
    });

    if (questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Soal ujian tidak ditemukan' },
        { status: 404 }
      );
    }

    // Grade the attempt
    let correctCount = 0;
    questions.forEach((q) => {
      const studentSelected = answers[q.id];
      if (studentSelected && studentSelected.trim().toUpperCase() === q.correct_option.trim().toUpperCase()) {
        correctCount++;
      }
    });

    const totalQuestions = questions.length;
    const calculatedScore = Math.round((correctCount / totalQuestions) * 100);

    // Record the attempt (upsert)
    const attempt = await prisma.examAttempt.findFirst({
      where: { exam_id: examId, student_id: student.id }
    });

    if (attempt) {
      await prisma.examAttempt.update({
        where: { id: attempt.id },
        data: {
          score: calculatedScore,
          answers: JSON.stringify(answers),
          submitted_at: new Date()
        }
      });
    } else {
      await prisma.examAttempt.create({
        data: {
          exam_id: examId,
          student_id: student.id,
          score: calculatedScore,
          answers: JSON.stringify(answers),
          submitted_at: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      score: calculatedScore,
      correctCount,
      totalQuestions
    });
  } catch (error: any) {
    console.error('Error submitting exam:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
