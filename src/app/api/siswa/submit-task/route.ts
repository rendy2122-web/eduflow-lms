import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let task_id = '';
    let finalFileUrl = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      task_id = formData.get('task_id') as string;
      const file = formData.get('file') as File;

      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), 'public', 'submissions');
        await fs.mkdir(uploadDir, { recursive: true });

        const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const filepath = path.join(uploadDir, filename);
        await fs.writeFile(filepath, buffer);
        finalFileUrl = `/submissions/${filename}`;
      } else {
        finalFileUrl = `/submissions/bilal_task_${task_id}_submitted.pdf`;
      }
    } else {
      const body = await req.json();
      task_id = body.task_id;
      finalFileUrl = body.file_url || `/submissions/bilal_task_${task_id}_submitted.pdf`;
    }

    if (!task_id) {
      return NextResponse.json(
        { success: false, error: 'Kolom task_id wajib diisi' },
        { status: 400 }
      );
    }

    // Cari siswa Bilal Al-Mansoori default
    const student = await prisma.user.findFirst({
      where: { email: 'siswa@sekolah.sch.id' },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Siswa Bilal tidak ditemukan di database' },
        { status: 500 }
      );
    }

    // Cek apakah sudah ada submission untuk tugas ini
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        task_id,
        student_id: student.id,
      },
    });

    let submission;

    if (existingSubmission) {
      // Update submission yang ada
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          file_url: finalFileUrl,
          created_at: new Date(),
        },
      });
    } else {
      // Buat submission baru
      submission = await prisma.submission.create({
        data: {
          task_id,
          student_id: student.id,
          file_url: finalFileUrl,
          score: null, // Belum dinilai guru
        },
      });
    }

    return NextResponse.json({ success: true, submission });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
