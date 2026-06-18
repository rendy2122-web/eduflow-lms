import { NextRequest, NextResponse } from 'next/server';
import { getMilestones, toggleMilestone } from '@/lib/homeschoolDb';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Find default student Bilal Al-Mansoori
    const student = await prisma.user.findFirst({
      where: { email: 'siswa@sekolah.sch.id' }
    });

    if (!student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 });
    }

    const milestones = await getMilestones(student.id);
    return NextResponse.json({ success: true, milestones });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { milestoneId, completed } = await req.json();

    if (!milestoneId) {
      return NextResponse.json({ success: false, error: 'milestoneId is required' }, { status: 400 });
    }

    const success = await toggleMilestone(milestoneId, completed);
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Milestone not found' }, { status: 404 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
