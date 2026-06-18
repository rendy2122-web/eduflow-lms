import { NextRequest, NextResponse } from 'next/server';
import { getPortfolios, addPortfolio } from '@/lib/homeschoolDb';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const portfolios = await getPortfolios();
    return NextResponse.json({ success: true, portfolios });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Check if this is an adab submit or portfolio submit
    const isAdab = formData.get('isAdab') === 'true';
    
    // Find default student Bilal
    const student = await prisma.user.findFirst({
      where: { email: 'siswa@sekolah.sch.id' }
    });

    if (!student) {
      return NextResponse.json({ success: false, error: 'Siswa Bilal tidak ditemukan' }, { status: 404 });
    }

    if (isAdab) {
      const adabScoreStr = formData.get('adabScore') as string;
      const notes = formData.get('notes') as string;
      
      const scoreVal = parseInt(adabScoreStr, 10) || 0;
      
      const newEntry = await addPortfolio({
        title: 'Penilaian Adab & Karakter Rumah',
        subject: 'Karakter & Ibadah',
        notes: notes || 'Penilaian adab harian oleh Orang Tua di rumah.',
        fileUrl: '',
        studentId: student.id,
        studentName: student.nama,
        parentId: 'parent-id',
        date: new Date().toISOString().split('T')[0],
        adabScore: scoreVal
      });

      // Update their RPG XP as incentive
      await prisma.profile.update({
        where: { user_id: student.id },
        data: {
          rpg_xp: { increment: 15 }
        }
      });

      return NextResponse.json({ success: true, entry: newEntry });
    }

    // Otherwise, normal portfolio upload
    const title = formData.get('title') as string;
    const subject = formData.get('subject') as string;
    const notes = formData.get('notes') as string;
    const file = formData.get('file') as File;

    if (!title || !subject) {
      return NextResponse.json({ success: false, error: 'Judul dan Mata Pelajaran wajib diisi' }, { status: 400 });
    }

    let fileUrl = '';
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), 'public', 'submissions');
      await fs.mkdir(uploadDir, { recursive: true });

      const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const filepath = path.join(uploadDir, filename);
      await fs.writeFile(filepath, buffer);
      fileUrl = `/submissions/${filename}`;
    }

    const newPortfolio = await addPortfolio({
      title,
      subject,
      notes: notes || '',
      fileUrl,
      studentId: student.id,
      studentName: student.nama,
      parentId: 'parent-id',
      date: new Date().toISOString().split('T')[0]
    });

    return NextResponse.json({ success: true, portfolio: newPortfolio });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
