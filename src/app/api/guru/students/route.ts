import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readHomeschoolData } from '@/lib/homeschoolDb';
import { checkAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await checkAuth(['guru']);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    // 1. Fetch all students with their class details, attendance, submissions, and exam attempts
    const students = await prisma.user.findMany({
      where: { role: 'siswa' },
      include: {
        profile: {
          include: {
            class: true
          }
        },
        studentAttendances: true,
        submissions: {
          where: {
            score: { not: null }
          }
        },
        examAttempts: {
          where: {
            score: { not: null }
          }
        }
      },
      orderBy: { nama: 'asc' }
    });

    // 2. Fetch all parents with profiles to resolve details
    const parents = await prisma.user.findMany({
      where: { role: 'orang_tua' },
      include: { profile: true }
    });

    const parentMap = new Map(parents.map(p => [p.id, p]));

    // 3. Fetch homeschool data for progress calculation
    const homeschoolData = await readHomeschoolData();
    const milestones = homeschoolData.milestones || [];

    // 4. Map students with progress and academic calculations
    const formattedStudents = students.map((s) => {
      const parentUser = s.profile?.parent_id ? parentMap.get(s.profile.parent_id) : null;
      
      // Calculate milestones progress for this student
      const totalMilestones = milestones.length;
      const completedMilestones = milestones.filter((m: any) => m.completed).length;
      const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

      // Calculate attendance rate
      const totalAttendance = s.studentAttendances.length;
      const presentCount = s.studentAttendances.filter(a => a.status === 'hadir').length;
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

      // Calculate average grade
      const subScores = s.submissions.map(sub => sub.score || 0);
      const exScores = s.examAttempts.map(att => att.score || 0);
      const allScores = [...subScores, ...exScores];
      const averageGrade = allScores.length > 0 ? Math.round(allScores.reduce((acc, curr) => acc + curr, 0) / allScores.length) : 0;

      return {
        id: s.id,
        name: s.nama,
        email: s.email,
        nisn: s.profile?.nisn_or_nip || '',
        classId: s.profile?.class_id || '',
        className: s.profile?.class?.name || 'Belum Masuk Kelas',
        parentId: s.profile?.parent_id || '',
        parentName: parentUser ? parentUser.nama : 'Belum Terhubung',
        parentEmail: parentUser ? parentUser.email : '',
        parentPhone: parentUser ? parentUser.profile?.telepon || '' : '',
        alamat: s.profile?.alamat || '',
        telepon: s.profile?.telepon || '',
        progress: progressPercent, // Progres Homeschooling
        totalMilestones,
        completedMilestones,
        // Academic fields
        attendanceRate,
        averageGrade,
        catatanWali: s.profile?.catatan_wali || ''
      };
    });

    // 5. Fetch all classes for filtering
    const classes = await prisma.class.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      success: true,
      students: formattedStudents,
      classes
    });
  } catch (error: any) {
    console.error('Error fetching guru students list:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await checkAuth(['guru']);
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    const { studentId, catatanWali } = await req.json();
    if (!studentId) {
      return NextResponse.json({ success: false, error: 'Student ID is required' }, { status: 400 });
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: { profile: true }
    });

    if (!student || !student.profile) {
      return NextResponse.json({ success: false, error: 'Student profile not found' }, { status: 404 });
    }

    await prisma.profile.update({
      where: { id: student.profile.id },
      data: {
        catatan_wali: catatanWali
      }
    });

    return NextResponse.json({ success: true, message: 'Catatan wali berhasil disimpan' });
  } catch (error: any) {
    console.error('Error saving student academic note:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
